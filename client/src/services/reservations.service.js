import { appel } from './api'
import { lireToken } from './auth.service'

async function creerReservation({ date, creneauId, nombreConvives, note }) {
  return appel('/api/reservations', {
    methode: 'POST',
    corps: { date, creneauId, nombreConvives, note },
    token: lireToken(),
  })
}

async function listerMesReservations() {
  return appel('/api/reservations', { token: lireToken() })
}

async function modifierReservation(id, { date, creneauId, nombreConvives, note }) {
  return appel(`/api/reservations/${id}`, {
    methode: 'PATCH',
    corps: { date, creneauId, nombreConvives, note },
    token: lireToken(),
  })
}

async function annulerReservation(id) {
  return appel(`/api/reservations/${id}/annuler`, {
    methode: 'POST',
    token: lireToken(),
  })
}

export { creerReservation, listerMesReservations, modifierReservation, annulerReservation }
