import { useEffect, useState } from 'react'
import {
  listerFermetures,
  creerFermeture,
  supprimerFermeture,
  impactFermeture,
} from '../services/backoffice.service'
import { ErreurApi } from '../services/api'
import { formaterDateAffichage } from '../utils/date'
import { libelleUnite } from '../utils/unite'
import styles from './BackOfficeFermetures.module.css'

const LIBELLES_PERIODE = { MIDI: 'Midi', SOIR: 'Soir' }

function formaterPeriode(fermeture) {
  const debut = formaterDateAffichage(fermeture.dateDebut)
  const fin = formaterDateAffichage(fermeture.dateFin)
  return debut === fin ? debut : `${debut} → ${fin}`
}

function LigneFermeture({ fermeture, onSupprimee }) {
  const [confirmationVisible, setConfirmationVisible] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState(null)

  async function confirmerSuppression() {
    setEnCours(true)
    setErreur(null)
    try {
      await supprimerFermeture(fermeture.id)
      onSupprimee(fermeture.id)
    } catch (e) {
      setErreur(e instanceof ErreurApi ? e.message : 'Suppression impossible.')
      setConfirmationVisible(false)
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div className={styles.ligne}>
      <div>
        <p className={styles.periode}>{formaterPeriode(fermeture)}</p>
        {fermeture.motif && <p className={styles.motif}>{fermeture.motif}</p>}
        {erreur && <p className="message-erreur">{erreur}</p>}
      </div>

      {!confirmationVisible && (
        <button type="button" className="btn-texte" onClick={() => setConfirmationVisible(true)}>
          Supprimer
        </button>
      )}

      {confirmationVisible && (
        <div className={styles.confirmationSuppression}>
          <button type="button" className="btn" onClick={confirmerSuppression} disabled={enCours}>
            {enCours ? 'Suppression…' : 'Confirmer'}
          </button>
          <button type="button" className="btn-texte" onClick={() => setConfirmationVisible(false)} disabled={enCours}>
            Annuler
          </button>
        </div>
      )}
    </div>
  )
}

function pretePourImpact(form) {
  return Boolean(form.dateDebut && form.dateFin && form.dateDebut <= form.dateFin)
}

const FORM_INITIAL = { dateDebut: '', dateFin: '', motif: '' }

// US-11, RG-08 : congés, privatisation, jour férié.
function BackOfficeFermetures() {
  const [fermetures, setFermetures] = useState(null)
  const [erreurListe, setErreurListe] = useState(null)
  const [form, setForm] = useState(FORM_INITIAL)
  const [erreurForm, setErreurForm] = useState(null)
  const [enCours, setEnCours] = useState(false)

  // Impact prévisualisé avant confirmation : quelles réservations déjà confirmées
  // tomberaient dans la période (RG-08 ne les annule pas automatiquement — demande
  // explicite : le restaurateur doit voir l'impact avant de créer la fermeture).
  const [impact, setImpact] = useState(null)
  const [chargementImpact, setChargementImpact] = useState(false)
  const [erreurImpact, setErreurImpact] = useState(null)

  useEffect(() => {
    listerFermetures()
      .then(setFermetures)
      .catch(() => setErreurListe('Impossible de charger les fermetures.'))
  }, [])

  useEffect(() => {
    if (!form.dateDebut || !form.dateFin || form.dateDebut > form.dateFin) return

    let annule = false
    impactFermeture({ dateDebut: form.dateDebut, dateFin: form.dateFin })
      .then((data) => {
        if (annule) return
        setImpact(data)
        setErreurImpact(null)
      })
      .catch(() => {
        if (!annule) setErreurImpact("Impossible de vérifier l'impact de cette période.")
      })
      .finally(() => {
        if (!annule) setChargementImpact(false)
      })

    return () => {
      annule = true
    }
  }, [form.dateDebut, form.dateFin])

  function handleChange(event) {
    const { name, value } = event.target
    const prochainForm = { ...form, [name]: value }
    setForm(prochainForm)

    if (name === 'dateDebut' || name === 'dateFin') {
      setImpact(null)
      setErreurImpact(null)
      setChargementImpact(pretePourImpact(prochainForm))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErreurForm(null)

    if (form.dateDebut > form.dateFin) {
      setErreurForm('La date de fin doit être postérieure ou égale à la date de début.')
      return
    }

    setEnCours(true)
    try {
      const fermeture = await creerFermeture(form)
      setFermetures((liste) => [...liste, fermeture].sort((a, b) => a.dateDebut.localeCompare(b.dateDebut)))
      setForm(FORM_INITIAL)
      setImpact(null)
    } catch (e) {
      setErreurForm(e instanceof ErreurApi ? e.message : 'La création a échoué.')
    } finally {
      setEnCours(false)
    }
  }

  function retirerDeLaListe(id) {
    setFermetures((liste) => liste.filter((f) => f.id !== id))
  }

  return (
    <div className="container section">
      <h1 className="section-title">Fermetures exceptionnelles</h1>
      <p className="section-subtitle">
        Congés, privatisation, jour férié — toutes les réservations sont bloquées sur la période.
      </p>

      <form className={styles.formulaire} onSubmit={handleSubmit} noValidate>
        {erreurForm && <p className="message-erreur">{erreurForm}</p>}

        <div className={styles.champsDates}>
          <div className="champ">
            <label htmlFor="dateDebut">Du</label>
            <input
              id="dateDebut"
              name="dateDebut"
              type="date"
              required
              value={form.dateDebut}
              onChange={handleChange}
            />
          </div>
          <div className="champ">
            <label htmlFor="dateFin">Au</label>
            <input id="dateFin" name="dateFin" type="date" required value={form.dateFin} onChange={handleChange} />
          </div>
        </div>

        {chargementImpact && <p className={styles.motif}>Vérification des réservations existantes…</p>}
        {erreurImpact && <p className="message-erreur">{erreurImpact}</p>}

        {!chargementImpact && impact && impact.length === 0 && (
          <p className={styles.motif}>Aucune réservation existante sur cette période.</p>
        )}

        {!chargementImpact && impact && impact.length > 0 && (
          <div className={styles.impact}>
            <p className="message-erreur">
              {impact.length} réservation{impact.length > 1 ? 's' : ''} déjà confirmée
              {impact.length > 1 ? 's' : ''} sur cette période — elle{impact.length > 1 ? 's ne seront' : ' ne sera'}{' '}
              pas annulée{impact.length > 1 ? 's' : ''} automatiquement, à contacter directement :
            </p>
            {impact.map((reservation) => (
              <p key={reservation.id} className={styles.motif}>
                {formaterDateAffichage(reservation.service.date)} — {LIBELLES_PERIODE[reservation.service.creneau.periode]}{' '}
                {reservation.service.creneau.heureDebut} — {reservation.utilisateur.prenom}{' '}
                {reservation.utilisateur.nom}
                {reservation.utilisateur.telephone && ` (${reservation.utilisateur.telephone})`} —{' '}
                {reservation.nombreConvives} pers. — {libelleUnite(reservation.unite)}
              </p>
            ))}
          </div>
        )}

        <div className="champ">
          <label htmlFor="motif">Motif (optionnel)</label>
          <input id="motif" name="motif" type="text" value={form.motif} onChange={handleChange} />
        </div>

        <button type="submit" className="btn" disabled={enCours}>
          {enCours ? 'Création…' : 'Ajouter la fermeture'}
        </button>
      </form>

      {erreurListe && <p className="message-erreur">{erreurListe}</p>}

      {fermetures && (
        <div className={styles.liste}>
          {fermetures.length === 0 && <p className="section-subtitle">Aucune fermeture programmée.</p>}
          {fermetures.map((fermeture) => (
            <LigneFermeture key={fermeture.id} fermeture={fermeture} onSupprimee={retirerDeLaListe} />
          ))}
        </div>
      )}
    </div>
  )
}

export default BackOfficeFermetures
