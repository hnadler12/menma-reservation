import { appel } from './api'
import { lireToken } from './auth.service'

// US-09/10 : vue des réservations d'une date, regroupées par créneau.
async function reservationsParDate(date) {
  return appel(`/api/backoffice/reservations?date=${date}`, { token: lireToken() })
}

// US-11 : fermetures exceptionnelles (RG-08).
async function listerFermetures() {
  return appel('/api/backoffice/fermetures', { token: lireToken() })
}

async function creerFermeture({ dateDebut, dateFin, motif }) {
  return appel('/api/backoffice/fermetures', {
    methode: 'POST',
    corps: { dateDebut, dateFin, motif },
    token: lireToken(),
  })
}

async function supprimerFermeture(id) {
  return appel(`/api/backoffice/fermetures/${id}`, { methode: 'DELETE', token: lireToken() })
}

// Prévisualisation avant confirmation : qui serait laissé sans nouvelle si cette
// fermeture était créée (RG-08 ne l'annule pas automatiquement).
async function impactFermeture({ dateDebut, dateFin }) {
  return appel(`/api/backoffice/fermetures/impact?dateDebut=${dateDebut}&dateFin=${dateFin}`, {
    token: lireToken(),
  })
}

export { reservationsParDate, listerFermetures, creerFermeture, supprimerFermeture, impactFermeture }
