// Calculs temporels pour RG-14 (fenêtre de réservation) et RG-15 (délai minimal
// avant le créneau). Le restaurant est à Bruxelles ; le serveur (Render) tourne en
// général en UTC. Comparer directement l'heure du serveur à "12:00" ferait dériver
// RG-15 d'une à deux heures selon la saison — on convertit donc explicitement via
// Intl, qui connaît les dates de bascule heure d'été/hiver européennes.

function decalageBruxellesEnHeures(instantApproximatif) {
  const formatteur = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Brussels',
    timeZoneName: 'shortOffset',
  })
  const partie = formatteur.formatToParts(instantApproximatif).find((p) => p.type === 'timeZoneName')
  // "GMT+1" (hiver) ou "GMT+2" (été)
  return Number(partie.value.replace('GMT', ''))
}

// La date calendaire du jour, telle que vue à Bruxelles, sous forme de Date à minuit
// UTC — même convention que `Service.date` (@db.Date), pour rester comparable.
function aujourdHuiBruxelles() {
  const formatteur = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels' })
  const [annee, mois, jour] = formatteur.format(new Date()).split('-').map(Number)
  return new Date(Date.UTC(annee, mois - 1, jour))
}

// L'instant UTC exact correspondant à `heureDebut` (ex. "19:00"), heure de Bruxelles,
// pour le jour calendaire `date` (Date à minuit UTC, cf. modele-de-donnees.md §3).
function instantCreneau(date, heureDebut) {
  const [heures, minutes] = heureDebut.split(':').map(Number)
  // Midi UTC ce jour-là : loin de toute bascule DST (qui a lieu vers 1-3h), fiable
  // pour déterminer le décalage Bruxelles applicable à ce jour précis.
  const midiApproximatif = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12))
  const decalage = decalageBruxellesEnHeures(midiApproximatif)
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), heures - decalage, minutes),
  )
}

module.exports = { aujourdHuiBruxelles, instantCreneau }
