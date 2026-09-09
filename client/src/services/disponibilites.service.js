import { appel } from './api'

// US-04 : les créneaux réellement disponibles pour une date et un nombre de convives.
async function rechercherDisponibilites({ date, convives }) {
  return appel(`/api/disponibilites?date=${date}&convives=${convives}`)
}

export { rechercherDisponibilites }
