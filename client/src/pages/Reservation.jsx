import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import SelecteurCreneaux from '../components/SelecteurCreneaux'
import RecapitulatifReservation from '../components/RecapitulatifReservation'
import { creerReservation } from '../services/reservations.service'
import { ErreurApi } from '../services/api'
import * as reservationEnCours from '../services/reservationEnCours'
import { libelleUnite } from '../utils/unite'
import styles from './Reservation.module.css'

// Retour d'inscription/connexion avec une sélection en attente (parcours 1) : lue une
// seule fois, à l'initialisation du composant — un utilisateur déjà connu à ce moment
// (le contexte d'auth est résolu de façon synchrone au montage) n'a pas besoin d'un effet.
function selectionInitiale(utilisateur) {
  if (!utilisateur) return null
  const enAttente = reservationEnCours.lire()
  if (enAttente) reservationEnCours.effacer()
  return enAttente
}

function Reservation() {
  const { utilisateur } = useAuth()
  const navigate = useNavigate()

  const [selection, setSelection] = useState(() => selectionInitiale(utilisateur))
  const [note, setNote] = useState('')
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState(null)
  const [reservationConfirmee, setReservationConfirmee] = useState(null)

  function handleSelection(sel) {
    if (!utilisateur) {
      reservationEnCours.sauvegarder(sel)
      navigate('/connexion', { state: { depuis: '/reservation' } })
      return
    }
    setErreur(null)
    setSelection(sel)
  }

  async function handleConfirmer() {
    setEnCours(true)
    setErreur(null)
    try {
      const reservation = await creerReservation({
        date: selection.date,
        creneauId: selection.creneau.id,
        nombreConvives: selection.convives,
        note: note || undefined,
      })
      setReservationConfirmee(reservation)
    } catch (e) {
      setErreur(e instanceof ErreurApi ? e.message : 'La réservation a échoué.')
    } finally {
      setEnCours(false)
    }
  }

  if (reservationConfirmee) {
    return (
      <div className={`container section ${styles.page}`}>
        <div className={styles.confirmation}>
          <h1>Réservation confirmée</h1>
          <p className="message-succes">
            {libelleUnite(reservationConfirmee.unite)} — référence {reservationConfirmee.reference} — à
            conserver pour toute question.
          </p>
          <button type="button" className="btn" onClick={() => navigate('/espace-client')}>
            Voir mes réservations
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`container section ${styles.page}`}>
      <h1 className="section-title">Réserver une table</h1>

      {!selection && (
        <>
          <p className="section-subtitle">
            Choisissez une date et le nombre de convives pour voir les créneaux disponibles.
          </p>
          <SelecteurCreneaux onSelection={handleSelection} />
        </>
      )}

      {selection && (
        <RecapitulatifReservation
          selection={selection}
          note={note}
          onNoteChange={setNote}
          erreur={erreur}
          enCours={enCours}
          texteConfirmer="Confirmer la réservation"
          onConfirmer={handleConfirmer}
          onChanger={() => {
            setSelection(null)
            setErreur(null)
          }}
        />
      )}
    </div>
  )
}

export default Reservation
