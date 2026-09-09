import { formaterDateAffichage } from '../utils/date'
import styles from './RecapitulatifReservation.module.css'

const LIBELLES_PERIODE = { MIDI: 'Midi', SOIR: 'Soir' }

// Récapitulatif partagé entre la création (Reservation.jsx) et la modification
// (ModifierReservation.jsx) : même sélection, même geste de confirmation.
function RecapitulatifReservation({
  selection,
  note,
  onNoteChange,
  erreur,
  enCours,
  texteConfirmer,
  onConfirmer,
  onChanger,
}) {
  return (
    <div className={styles.recap}>
      <h2>Récapitulatif</h2>
      <div className={styles.recapLigne}>
        <span>Date</span>
        <span>{formaterDateAffichage(selection.date)}</span>
      </div>
      <div className={styles.recapLigne}>
        <span>Créneau</span>
        <span>
          {LIBELLES_PERIODE[selection.creneau.periode]} — {selection.creneau.heureDebut}
        </span>
      </div>
      <div className={styles.recapLigne}>
        <span>Convives</span>
        <span>{selection.convives}</span>
      </div>

      <div className="champ" style={{ marginTop: 'var(--espace-md)' }}>
        <label htmlFor="note">Note (allergie, occasion — optionnel)</label>
        <textarea id="note" rows="2" value={note} onChange={(e) => onNoteChange(e.target.value)} />
      </div>

      {erreur && <p className="message-erreur">{erreur}</p>}

      <div className={styles.recapActions}>
        <button type="button" className="btn" onClick={onConfirmer} disabled={enCours}>
          {enCours ? `${texteConfirmer}…` : texteConfirmer}
        </button>
        <button type="button" className="btn btn-secondaire" onClick={onChanger} disabled={enCours}>
          Changer de créneau
        </button>
      </div>
    </div>
  )
}

export default RecapitulatifReservation
