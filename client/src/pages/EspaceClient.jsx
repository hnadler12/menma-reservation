import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listerMesReservations, annulerReservation } from '../services/reservations.service'
import { ErreurApi } from '../services/api'
import { libelleUnite } from '../utils/unite'
import { formaterDateAffichage } from '../utils/date'
import styles from './EspaceClient.module.css'

const LIBELLES_PERIODE = { MIDI: 'Midi', SOIR: 'Soir' }
const LIBELLES_STATUT = {
  CONFIRMEE: 'Confirmée',
  ANNULEE: 'Annulée',
  HONOREE: 'Honorée',
  ABSENTE: 'Absence',
}
const DELAI_MIN_HEURES = 2 // RG-16 — indicatif : le serveur est seul juge (CLAUDE.md)

function instantReservation(reservation) {
  const [heures, minutes] = reservation.service.creneau.heureDebut.split(':').map(Number)
  const instant = new Date(reservation.service.date)
  instant.setHours(heures, minutes, 0, 0)
  return instant
}

function peutEncoreAgir(reservation) {
  if (reservation.statut !== 'CONFIRMEE') return false
  const limite = instantReservation(reservation).getTime() - DELAI_MIN_HEURES * 60 * 60 * 1000
  return Date.now() < limite
}

function CarteReservation({ reservation, onAnnulee }) {
  const [confirmationVisible, setConfirmationVisible] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState(null)

  async function confirmerAnnulation() {
    setEnCours(true)
    setErreur(null)
    try {
      const misAJour = await annulerReservation(reservation.id)
      onAnnulee(misAJour)
    } catch (e) {
      setErreur(e instanceof ErreurApi ? e.message : "L'annulation a échoué.")
      setConfirmationVisible(false)
    } finally {
      setEnCours(false)
    }
  }

  const modifiable = peutEncoreAgir(reservation)

  return (
    <div className={styles.carte}>
      <div className={styles.ligneHaut}>
        <span className={styles.dateHeure}>
          {formaterDateAffichage(reservation.service.date)} — {LIBELLES_PERIODE[reservation.service.creneau.periode]}{' '}
          {reservation.service.creneau.heureDebut}
        </span>
        <span className={`${styles.statut} ${reservation.statut === 'CONFIRMEE' ? styles.statutConfirmee : ''} ${reservation.statut === 'ANNULEE' ? styles.statutAnnulee : ''}`}>
          {LIBELLES_STATUT[reservation.statut]}
        </span>
      </div>
      <p className={styles.details}>
        {reservation.nombreConvives} convive{reservation.nombreConvives > 1 ? 's' : ''} — {libelleUnite(reservation.unite)}
        {reservation.note && ` — ${reservation.note}`}
      </p>
      <p className={styles.details}>Référence {reservation.reference}</p>

      {erreur && <p className="message-erreur">{erreur}</p>}

      {modifiable && !confirmationVisible && (
        <div className={styles.actions}>
          <Link
            to={`/espace-client/${reservation.id}/modifier`}
            state={{ reservation }}
            className="btn btn-secondaire"
          >
            Modifier
          </Link>
          <button type="button" className="btn-texte" onClick={() => setConfirmationVisible(true)}>
            Annuler
          </button>
        </div>
      )}

      {modifiable && confirmationVisible && (
        <div className={styles.confirmationAnnulation}>
          <span>Confirmer l'annulation ?</span>
          <button type="button" className="btn" onClick={confirmerAnnulation} disabled={enCours}>
            {enCours ? 'Annulation…' : 'Oui, annuler'}
          </button>
          <button type="button" className="btn-texte" onClick={() => setConfirmationVisible(false)} disabled={enCours}>
            Non
          </button>
        </div>
      )}

      {reservation.statut === 'CONFIRMEE' && !modifiable && (
        <p className={styles.details}>
          Modification/annulation impossible à moins de 2h du créneau — contactez le restaurant.
        </p>
      )}
    </div>
  )
}

function EspaceClient() {
  const [reservations, setReservations] = useState(null)
  const [erreur, setErreur] = useState(null)
  // Instantané pris une fois au montage : cet écran n'a pas besoin de re-trancher
  // "à venir vs passé" à chaque render, juste d'un repère stable.
  const [maintenant] = useState(() => Date.now())

  useEffect(() => {
    listerMesReservations()
      .then(setReservations)
      .catch(() => setErreur('Impossible de charger vos réservations.'))
  }, [])

  function remplacerReservation(misAJour) {
    setReservations((liste) => liste.map((r) => (r.id === misAJour.id ? { ...r, ...misAJour } : r)))
  }

  if (erreur) {
    return (
      <div className={`container section ${styles.page}`}>
        <p className="message-erreur">{erreur}</p>
      </div>
    )
  }

  if (!reservations) {
    return (
      <div className={`container section ${styles.page}`}>
        <p>Chargement…</p>
      </div>
    )
  }

  const aVenir = reservations
    .filter((r) => instantReservation(r).getTime() >= maintenant)
    .sort((a, b) => instantReservation(a) - instantReservation(b))
  const passees = reservations
    .filter((r) => instantReservation(r).getTime() < maintenant)
    .sort((a, b) => instantReservation(b) - instantReservation(a))

  return (
    <div className={`container section ${styles.page}`}>
      <h1 className="section-title">Mes réservations</h1>

      {reservations.length === 0 && (
        <p className="section-subtitle">
          Vous n'avez pas encore de réservation. <Link to="/reservation">Réservez une table</Link>.
        </p>
      )}

      {aVenir.length > 0 && (
        <div className={styles.groupe}>
          <h2 className={styles.groupeTitre}>À venir</h2>
          {aVenir.map((r) => (
            <CarteReservation key={r.id} reservation={r} onAnnulee={remplacerReservation} />
          ))}
        </div>
      )}

      {passees.length > 0 && (
        <div className={styles.groupe}>
          <h2 className={styles.groupeTitre}>Passées</h2>
          {passees.map((r) => (
            <CarteReservation key={r.id} reservation={r} onAnnulee={remplacerReservation} />
          ))}
        </div>
      )}
    </div>
  )
}

export default EspaceClient
