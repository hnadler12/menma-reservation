const prisma = require('../config/prisma')
const regles = require('./regles.service')

// Une unité est-elle en mesure d'accueillir ce groupe sur ce service ?
// `client` est soit le prisma partagé (lecture simple pour la recherche), soit une
// transaction `tx` (lecture sous verrou pour la création — voir reservation.service.js).
// `excluerReservationId` : lors d'une modification, ignore la réservation en cours de
// remplacement dans le calcul d'occupation — sinon elle entrerait en concurrence avec
// elle-même (CLAUDE.md, règle de travail n°3).
async function uniteDisponible(client, unite, convives, service, { excluerReservationId } = {}) {
  if (!unite.divisible) {
    // RG-01 : table indivisible, attribuée entièrement.
    if (unite.capacite < convives) return false
    if (!service) return true
    const occupee = await client.reservation.findFirst({
      where: {
        uniteId: unite.id,
        serviceId: service.id,
        statut: 'CONFIRMEE',
        ...(excluerReservationId && { id: { not: excluerReservationId } }),
      },
    })
    return !occupee
  }

  // RG-02, RG-04 : comptoir divisible, 1 à 3 convives par réservation.
  if (convives < unite.tailleMin || (unite.tailleMax && convives > unite.tailleMax)) {
    return false
  }
  if (!service) return unite.capacite >= convives

  const reservations = await client.reservation.findMany({
    where: {
      uniteId: unite.id,
      serviceId: service.id,
      statut: 'CONFIRMEE',
      ...(excluerReservationId && { id: { not: excluerReservationId } }),
    },
    select: { nombreConvives: true },
  })
  const placesOccupees = reservations.reduce((total, r) => total + r.nombreConvives, 0)
  return unite.capacite - placesOccupees >= convives
}

// US-04 : les créneaux réellement disponibles pour une date et un nombre de convives.
async function rechercherDisponibilites({ date, convives }) {
  if (regles.groupeTropGrand(convives)) {
    const creneaux = await prisma.creneau.findMany({
      where: { actif: true },
      orderBy: [{ periode: 'asc' }, { position: 'asc' }],
    })
    return {
      groupeTropGrand: true,
      creneaux: creneaux.map((c) => ({ ...c, disponible: false })),
    }
  }

  if (await regles.dateFermee(date)) {
    const creneaux = await prisma.creneau.findMany({
      where: { actif: true },
      orderBy: [{ periode: 'asc' }, { position: 'asc' }],
    })
    return {
      ferme: true,
      creneaux: creneaux.map((c) => ({ ...c, disponible: false })),
    }
  }

  const [creneaux, unites] = await Promise.all([
    prisma.creneau.findMany({ where: { actif: true }, orderBy: [{ periode: 'asc' }, { position: 'asc' }] }),
    prisma.unite.findMany({ where: { actif: true } }),
  ])

  const resultat = []
  for (const creneau of creneaux) {
    // RG-06 : chaque créneau est indépendant, pas de calcul de chevauchement.
    const service = await prisma.service.findUnique({
      where: { date_creneauId: { date, creneauId: creneau.id } },
    })

    let disponible = false
    for (const unite of unites) {
      if (await uniteDisponible(prisma, unite, convives, service)) {
        disponible = true
        break
      }
    }

    resultat.push({ ...creneau, disponible })
  }

  return { ferme: false, groupeTropGrand: false, creneaux: resultat }
}

module.exports = { rechercherDisponibilites, uniteDisponible }
