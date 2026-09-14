import { useEffect, useState } from 'react'
import { reservationsParDate } from '../services/backoffice.service'
import { libelleUnite } from '../utils/unite'
import styles from './BackOfficeReservations.module.css'

const LIBELLES_PERIODE = { MIDI: 'Midi', SOIR: 'Soir' }
const LIBELLES_STATUT = {
  CONFIRMEE: 'Confirmée',
  ANNULEE: 'Annulée',
  HONOREE: 'Honorée',
  ABSENTE: 'Absence',
}

function dateDuJour() {
  return new Date().toISOString().slice(0, 10)
}

function decaler(date, jours) {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + jours)
  return d.toISOString().slice(0, 10)
}

// US-09/10 : ce que le restaurateur consulte en début de service (parcours 3,
// personas-user-stories.md) — la liste du jour, groupée par créneau, total de
// couverts en tête. RG-20 impose déjà le rôle côté API ; ici on affiche juste le résultat.
function BackOfficeReservations() {
  const [date, setDate] = useState(dateDuJour())
  const [donnees, setDonnees] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    let annule = false
    reservationsParDate(date)
      .then((data) => {
        if (annule) return
        setDonnees(data)
        setErreur(null)
      })
      .catch(() => {
        if (!annule) setErreur('Impossible de charger les réservations de cette date.')
      })
      .finally(() => {
        if (!annule) setChargement(false)
      })
    return () => {
      annule = true
    }
  }, [date])

  function changerDate(nouvelleDate) {
    setChargement(true)
    setDate(nouvelleDate)
  }

  return (
    <div className={`container section ${styles.page}`}>
      <h1 className="section-title">Réservations du jour</h1>

      <div className={styles.barreDate}>
        <button type="button" className={styles.boutonJour} onClick={() => changerDate(decaler(date, -1))}>
          ‹
        </button>
        <input type="date" value={date} onChange={(e) => changerDate(e.target.value)} />
        <button type="button" className={styles.boutonJour} onClick={() => changerDate(decaler(date, 1))}>
          ›
        </button>
      </div>

      {chargement && <p className="section-subtitle">Chargement…</p>}
      {erreur && <p className="message-erreur">{erreur}</p>}

      {!chargement && !erreur && donnees && (
        <>
          {donnees.ferme && <p className={styles.bandeauFerme}>Établissement fermé ce jour-là.</p>}

          {donnees.creneaux.map((creneau) => (
            <div key={creneau.id} className={styles.service}>
              <div className={styles.serviceEntete}>
                <span className={styles.serviceTitre}>
                  {LIBELLES_PERIODE[creneau.periode]} — {creneau.heureDebut}
                </span>
                <span className={styles.serviceTotal}>{creneau.totalCouverts} couvert{creneau.totalCouverts > 1 ? 's' : ''}</span>
              </div>

              {creneau.reservations.length === 0 && <p className={styles.vide}>Aucune réservation.</p>}

              {creneau.reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className={`${styles.ligneReservation} ${reservation.statut !== 'CONFIRMEE' ? styles.ligneAnnulee : ''}`}
                >
                  <div className={styles.ligneHaut}>
                    <span>
                      {reservation.utilisateur.prenom} {reservation.utilisateur.nom}
                    </span>
                    <span>{reservation.nombreConvives} pers.</span>
                  </div>
                  <span className={styles.ligneDetails}>
                    {libelleUnite(reservation.unite)} — {LIBELLES_STATUT[reservation.statut]}
                    {reservation.utilisateur.telephone && ` — ${reservation.utilisateur.telephone}`}
                    {reservation.note && ` — ${reservation.note}`}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export default BackOfficeReservations
