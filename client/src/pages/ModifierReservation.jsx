import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import SelecteurCreneaux from '../components/SelecteurCreneaux'
import RecapitulatifReservation from '../components/RecapitulatifReservation'
import { listerMesReservations, modifierReservation } from '../services/reservations.service'
import { ErreurApi } from '../services/api'
import { libelleUnite } from '../utils/unite'

function ModifierReservation() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const reservationDepuisNavigation = location.state?.reservation ?? null
  const [reservationOrigine, setReservationOrigine] = useState(reservationDepuisNavigation)
  const [chargement, setChargement] = useState(!reservationDepuisNavigation)
  const [erreurChargement, setErreurChargement] = useState(null)

  const [selection, setSelection] = useState(null)
  const [note, setNote] = useState(reservationDepuisNavigation?.note ?? '')
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState(null)
  const [reservationModifiee, setReservationModifiee] = useState(null)

  // Arrivée directe sur l'URL (rechargement de page) : pas de state de navigation,
  // on retrouve la réservation dans la liste (pas de GET /:id dédié côté API).
  useEffect(() => {
    if (reservationDepuisNavigation) return
    listerMesReservations()
      .then((liste) => {
        const trouvee = liste.find((r) => r.id === id)
        if (!trouvee) {
          setErreurChargement('Réservation introuvable.')
          return
        }
        setReservationOrigine(trouvee)
        setNote(trouvee.note ?? '')
      })
      .catch(() => setErreurChargement('Impossible de charger cette réservation.'))
      .finally(() => setChargement(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- volontairement figé sur l'id de la page
  }, [id])

  async function handleConfirmer() {
    setEnCours(true)
    setErreur(null)
    try {
      const misAJour = await modifierReservation(id, {
        date: selection.date,
        creneauId: selection.creneau.id,
        nombreConvives: selection.convives,
        note: note || undefined,
      })
      setReservationModifiee(misAJour)
    } catch (e) {
      setErreur(e instanceof ErreurApi ? e.message : 'La modification a échoué.')
    } finally {
      setEnCours(false)
    }
  }

  if (chargement) {
    return (
      <div className="container section">
        <p>Chargement…</p>
      </div>
    )
  }

  if (erreurChargement) {
    return (
      <div className="container section">
        <p className="message-erreur">{erreurChargement}</p>
      </div>
    )
  }

  if (reservationModifiee) {
    return (
      <div className="container section" style={{ textAlign: 'center' }}>
        <h1>Réservation modifiée</h1>
        <p className="message-succes">
          {libelleUnite(reservationModifiee.unite)} — votre réservation a bien été mise à jour.
        </p>
        <button type="button" className="btn" onClick={() => navigate('/espace-client')}>
          Retour à mes réservations
        </button>
      </div>
    )
  }

  return (
    <div className="container section">
      <h1 className="section-title">Modifier ma réservation</h1>
      <p className="section-subtitle">
        Le créneau d'origine reste inchangé tant que la modification n'est pas confirmée (RG-17) : en
        cas d'échec, votre réservation actuelle est conservée telle quelle.
      </p>

      {!selection && (
        <SelecteurCreneaux
          valeursInitiales={{
            date: reservationOrigine.service.date.slice(0, 10),
            convives: reservationOrigine.nombreConvives,
          }}
          onSelection={setSelection}
        />
      )}

      {selection && (
        <RecapitulatifReservation
          selection={selection}
          note={note}
          onNoteChange={setNote}
          erreur={erreur}
          enCours={enCours}
          texteConfirmer="Confirmer la modification"
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

export default ModifierReservation
