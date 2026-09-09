import { useEffect, useState } from 'react'
import { rechercherDisponibilites } from '../services/disponibilites.service'
import styles from './SelecteurCreneaux.module.css'

const LIBELLES_PERIODE = { MIDI: 'Midi', SOIR: 'Soir' }

function formaterDate(date) {
  return date.toISOString().slice(0, 10)
}

function dateDuJour() {
  return formaterDate(new Date())
}

function dateMaximum() {
  const date = new Date()
  date.setDate(date.getDate() + 30) // RG-14 : fenêtre de 30 jours — indicatif, le serveur tranche
  return formaterDate(date)
}

// Recherche de disponibilité (US-04) + sélection d'un créneau (RG-10 implicite : on
// affiche seulement disponible/complet, l'attribution de l'unité se fait au serveur).
// Réutilisé par la création (Reservation.jsx) et la modification (ModifierReservation.jsx).
function SelecteurCreneaux({ valeursInitiales, onSelection }) {
  const [date, setDate] = useState(valeursInitiales?.date ?? dateDuJour())
  const [convives, setConvives] = useState(valeursInitiales?.convives ?? 2)
  const [creneauSelectionneId, setCreneauSelectionneId] = useState(null)
  const [resultat, setResultat] = useState(null)
  const [chargement, setChargement] = useState(true) // la recherche initiale part dès le montage
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    if (!date || !convives || convives < 1) return

    let annule = false

    rechercherDisponibilites({ date, convives })
      .then((data) => {
        if (annule) return
        setResultat(data)
        setErreur(null)
      })
      .catch(() => {
        if (!annule) setErreur('Impossible de vérifier les disponibilités pour le moment.')
      })
      .finally(() => {
        if (!annule) setChargement(false)
      })

    return () => {
      annule = true
    }
  }, [date, convives])

  // Le passage à "en chargement" est déclenché par le geste de l'utilisateur (gestionnaire
  // d'événement), pas par l'effet lui-même — c'est l'effet qui le referme, une fois la
  // réponse arrivée.
  function handleDateChange(event) {
    setChargement(true)
    setDate(event.target.value)
  }

  function handleConvivesChange(event) {
    setChargement(true)
    setConvives(event.target.value)
  }

  function selectionnerCreneau(creneau) {
    setCreneauSelectionneId(creneau.id)
    onSelection({ date, convives: Number(convives), creneau })
  }

  return (
    <div>
      <div className={styles.recherche}>
        <div className="champ">
          <label htmlFor="date-recherche">Date</label>
          <input
            id="date-recherche"
            type="date"
            min={dateDuJour()}
            max={dateMaximum()}
            value={date}
            onChange={handleDateChange}
          />
        </div>
        <div className="champ">
          <label htmlFor="convives-recherche">Convives</label>
          <input
            id="convives-recherche"
            type="number"
            min="1"
            value={convives}
            onChange={handleConvivesChange}
          />
        </div>
      </div>

      {chargement && <p className={styles.messageEtat}>Recherche des créneaux disponibles…</p>}
      {erreur && <p className="message-erreur">{erreur}</p>}

      {!chargement && !erreur && resultat?.groupeTropGrand && (
        <p className={styles.messageEtat}>
          Au-delà de 6 personnes, merci de nous contacter directement pour organiser votre venue.
        </p>
      )}

      {!chargement && !erreur && resultat?.ferme && (
        <p className={styles.messageEtat}>L'établissement est fermé à cette date.</p>
      )}

      {!chargement && !erreur && resultat && !resultat.groupeTropGrand && !resultat.ferme && (
        <div className={styles.grille}>
          {['MIDI', 'SOIR'].map((periode) => (
            <div key={periode} style={{ display: 'contents' }}>
              <p className={styles.periode}>{LIBELLES_PERIODE[periode]}</p>
              {resultat.creneaux
                .filter((c) => c.periode === periode)
                .map((creneau) => (
                  <button
                    key={creneau.id}
                    type="button"
                    className={`${styles.creneau} ${creneauSelectionneId === creneau.id ? styles.creneauSelectionne : ''}`}
                    disabled={!creneau.disponible}
                    onClick={() => selectionnerCreneau(creneau)}
                  >
                    {creneau.heureDebut}
                    {!creneau.disponible && ' — complet'}
                  </button>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SelecteurCreneaux
