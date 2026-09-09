const prisma = require('../config/prisma')
const { ErreurMetier } = require('./auth.service')

// US-11, RG-08 : le restaurateur bloque des dates (congés, privatisation, jour férié).
async function creerFermeture({ dateDebut, dateFin, motif }) {
  if (dateDebut > dateFin) {
    throw new ErreurMetier('La date de fin doit être postérieure ou égale à la date de début.', 422)
  }
  return prisma.fermeture.create({ data: { dateDebut, dateFin, motif } })
}

async function listerFermetures() {
  return prisma.fermeture.findMany({ orderBy: { dateDebut: 'asc' } })
}

// Prévisualisation : les réservations déjà confirmées qu'une fermeture sur cette
// période laisserait en l'état (RG-08 ne bloque que les *nouvelles* réservations —
// rien n'est annulé automatiquement, faute de système d'e-mail pour prévenir le
// client). Le restaurateur voit l'impact avant de confirmer, pas après.
async function listerReservationsImpactees({ dateDebut, dateFin }) {
  if (dateDebut > dateFin) {
    throw new ErreurMetier('La date de fin doit être postérieure ou égale à la date de début.', 422)
  }
  return prisma.reservation.findMany({
    where: { statut: 'CONFIRMEE', service: { date: { gte: dateDebut, lte: dateFin } } },
    include: {
      service: { include: { creneau: true } },
      unite: true,
      utilisateur: { select: { prenom: true, nom: true, telephone: true, email: true } },
    },
    orderBy: [{ service: { date: 'asc' } }, { service: { creneau: { position: 'asc' } } }],
  })
}

async function supprimerFermeture(id) {
  const fermeture = await prisma.fermeture.findUnique({ where: { id } })
  if (!fermeture) {
    throw new ErreurMetier('Fermeture introuvable.', 404)
  }
  await prisma.fermeture.delete({ where: { id } })
}

module.exports = { creerFermeture, listerFermetures, supprimerFermeture, listerReservationsImpactees }
