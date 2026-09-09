const prisma = require('../config/prisma')

// Contrôles partagés entre la recherche de disponibilité (US-04) et la création
// de réservation (US-05) : une règle métier ne doit être vérifiée qu'à un seul
// endroit, sinon un appel direct à l'API pourrait contourner ce que l'interface
// filtre déjà.

const CAPACITE_MAX_GROUPE = 6 // RG-03 : capacité de la plus grande unité (table de 6)

function groupeTropGrand(convives) {
  return convives > CAPACITE_MAX_GROUPE
}

// RG-08 : une fermeture exceptionnelle bloque tous les créneaux de la période couverte.
async function dateFermee(date) {
  const fermeture = await prisma.fermeture.findFirst({
    where: { dateDebut: { lte: date }, dateFin: { gte: date } },
  })
  return Boolean(fermeture)
}

module.exports = { CAPACITE_MAX_GROUPE, groupeTropGrand, dateFermee }
