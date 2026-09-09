const { Prisma } = require('@prisma/client')
const prisma = require('../config/prisma')
const regles = require('./regles.service')
const horaire = require('./horaire.service')
const { uniteDisponible } = require('./disponibilite.service')
const { ErreurMetier } = require('./auth.service')

const FENETRE_MAX_JOURS = 30 // RG-14
const DELAI_MIN_HEURES = 2 // RG-15
const MAX_RESERVATIONS_ACTIVES = 3 // RG-24

const TRANSACTION_READ_COMMITTED = {
  // Sous REPEATABLE READ (isolation par défaut de MySQL/TiDB), une transaction fige
  // un instantané dès sa première lecture : seule la ligne explicitement relue avec
  // FOR UPDATE serait rafraîchie, pas les lectures normales qui suivent (ici, les
  // réservations existantes). READ COMMITTED garantit que chaque lecture de cette
  // transaction voit l'état validé le plus récent, y compris après avoir attendu le verrou.
  isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
}

function genererReference() {
  // Référence courte, communicable par téléphone (modele-de-donnees.md §3).
  return `MENMA-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`
}

// RG-10 : parmi les unités disponibles, la plus petite capacité suffisante.
// Les tables sont essayées avant le comptoir (CLAUDE.md — "Logique de disponibilité").
function trierParPriorite(unites) {
  const tables = unites.filter((u) => !u.divisible).sort((a, b) => a.capacite - b.capacite)
  const comptoirs = unites.filter((u) => u.divisible).sort((a, b) => a.capacite - b.capacite)
  return [...tables, ...comptoirs]
}

// RG-14, RG-08, RG-15, RG-03 : recevabilité d'une date/créneau/nombre de convives —
// que ce soit pour une création, ou pour la nouvelle cible d'une modification (RG-17
// traite une modification comme une nouvelle recherche, soumise aux mêmes règles).
async function validerNouvelleOccupation(date, creneau, nombreConvives) {
  const aujourdHui = horaire.aujourdHuiBruxelles()
  const limiteFenetre = new Date(aujourdHui)
  limiteFenetre.setUTCDate(limiteFenetre.getUTCDate() + FENETRE_MAX_JOURS)
  if (date < aujourdHui || date > limiteFenetre) {
    throw new ErreurMetier('La date doit être comprise entre aujourd’hui et 30 jours à l’avance.', 422)
  }

  if (await regles.dateFermee(date)) {
    throw new ErreurMetier("L'établissement est fermé à cette date.", 422)
  }

  const instantCreneau = horaire.instantCreneau(date, creneau.heureDebut)
  const limiteDelai = new Date(instantCreneau.getTime() - DELAI_MIN_HEURES * 60 * 60 * 1000)
  if (new Date() > limiteDelai) {
    throw new ErreurMetier('Trop tard pour réserver ce créneau (moins de 2h avant).', 422)
  }

  if (regles.groupeTropGrand(nombreConvives)) {
    throw new ErreurMetier('Ce groupe dépasse la capacité maximale en salle (6 personnes).', 422)
  }
}

// RG-23 : une seule réservation active de ce client sur ce service précis.
// `excluerReservationId` : lors d'une modification, la réservation qu'on est en train
// de remplacer ne doit pas se compter comme un doublon contre elle-même.
async function verifierPasDeDoublon(utilisateurId, date, creneauId, excluerReservationId) {
  const serviceExistant = await prisma.service.findUnique({ where: { date_creneauId: { date, creneauId } } })
  if (!serviceExistant) return

  const doublon = await prisma.reservation.findFirst({
    where: {
      utilisateurId,
      serviceId: serviceExistant.id,
      statut: 'CONFIRMEE',
      ...(excluerReservationId && { id: { not: excluerReservationId } }),
    },
  })
  if (doublon) {
    throw new ErreurMetier('Vous avez déjà une réservation sur ce créneau.', 409)
  }
}

// RG-24 : maximum 3 réservations actives simultanément, tous services confondus.
// `excluerReservationId` : lors d'une modification, la réservation remplacée ne
// s'ajoute pas au total, elle est reconduite.
async function verifierQuota(utilisateurId, excluerReservationId) {
  const nombreActives = await prisma.reservation.count({
    where: {
      utilisateurId,
      statut: 'CONFIRMEE',
      ...(excluerReservationId && { id: { not: excluerReservationId } }),
    },
  })
  if (nombreActives >= MAX_RESERVATIONS_ACTIVES) {
    throw new ErreurMetier('Vous avez atteint la limite de 3 réservations actives.', 409)
  }
}

// RG-09, RG-10, RG-11 : trouve ou crée la ligne Service, la verrouille, et sélectionne
// la plus petite unité suffisante — cœur transactionnel partagé par la création et la
// modification. Lève une erreur métier 409 si le service est complet ; dans ce cas la
// transaction n'a rien écrit (RG-17 : la réservation d'origine reste intacte).
async function trouverEtVerrouillerUnite(tx, { date, creneauId, nombreConvives, excluerReservationId }) {
  // Trouver ou créer le Service (créé à la demande, cf. modele-de-donnees.md §2.2).
  // La contrainte unique (date, creneauId) protège contre un doublon si deux
  // premières réservations concurrentes arrivent en même temps : l'INSERT qui perd
  // la course reçoit une erreur P2002 ci-dessous, une fois l'INSERT gagnant validé.
  let service = await tx.service.findUnique({ where: { date_creneauId: { date, creneauId } } })
  if (!service) {
    try {
      service = await tx.service.create({ data: { date, creneauId } })
    } catch (erreur) {
      if (erreur.code !== 'P2002') throw erreur
      service = await tx.service.findUniqueOrThrow({ where: { date_creneauId: { date, creneauId } } })
    }
  }

  // RG-11 : verrou en écriture sur la ligne Service. Toute autre transaction qui
  // tente ce même SELECT ... FOR UPDATE sur cette ligne attend ici jusqu'à ce que la
  // nôtre valide ou échoue.
  await tx.$queryRaw`SELECT id FROM services WHERE id = ${service.id} FOR UPDATE`

  // Lecture des réservations actives, sous verrou : l'état est garanti à jour.
  const unites = await tx.unite.findMany({ where: { actif: true } })
  const unitesTriees = trierParPriorite(unites)

  let uniteChoisie = null
  for (const unite of unitesTriees) {
    if (await uniteDisponible(tx, unite, nombreConvives, service, { excluerReservationId })) {
      uniteChoisie = unite
      break
    }
  }

  if (!uniteChoisie) {
    throw new ErreurMetier('Ce créneau est complet pour ce nombre de convives.', 409)
  }

  return { service, uniteChoisie }
}

// US-05 : création d'une réservation. Reprend l'ordre de docs/arbre-decision-reservation.svg :
// les contrôles simples d'abord (RG-14, RG-08, RG-15, RG-03, RG-23, RG-24), la
// transaction (RG-09, RG-10, RG-11) en dernier, une fois la demande jugée recevable.
async function creerReservation({ utilisateurId, date, creneauId, nombreConvives, note }) {
  const creneau = await prisma.creneau.findUnique({ where: { id: creneauId } })
  if (!creneau || !creneau.actif) {
    throw new ErreurMetier('Créneau introuvable.', 404)
  }

  await validerNouvelleOccupation(date, creneau, nombreConvives)
  await verifierPasDeDoublon(utilisateurId, date, creneauId)
  await verifierQuota(utilisateurId)

  return prisma.$transaction(async (tx) => {
    const { service, uniteChoisie } = await trouverEtVerrouillerUnite(tx, { date, creneauId, nombreConvives })

    // RG-09 : confirmation automatique, aucune validation manuelle.
    // `include: unite` : le client doit savoir s'il a une table ou une place au comptoir.
    return tx.reservation.create({
      data: {
        reference: genererReference(),
        utilisateurId,
        serviceId: service.id,
        uniteId: uniteChoisie.id,
        nombreConvives,
        note,
        statut: 'CONFIRMEE',
      },
      include: { unite: true },
    })
    // La validation de la transaction ici libère le verrou.
  }, TRANSACTION_READ_COMMITTED)
}

// US-06 : liste des réservations du client, passées et à venir (le front distingue
// par comparaison de date — aucun filtre nécessaire côté serveur).
async function listerMesReservations(utilisateurId) {
  return prisma.reservation.findMany({
    where: { utilisateurId },
    include: { service: { include: { creneau: true } }, unite: true },
    orderBy: [{ service: { date: 'desc' } }, { service: { creneau: { position: 'asc' } } }],
  })
}

async function chargerReservationDuClient(utilisateurId, reservationId) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { service: { include: { creneau: true } } },
  })
  // RG-19 : une réservation inexistante ou appartenant à un autre client renvoie la
  // même erreur — ne pas révéler l'existence de la réservation d'un tiers.
  if (!reservation || reservation.utilisateurId !== utilisateurId) {
    throw new ErreurMetier('Réservation introuvable.', 404)
  }
  if (reservation.statut !== 'CONFIRMEE') {
    throw new ErreurMetier('Cette réservation ne peut plus être modifiée.', 409)
  }
  return reservation
}

function verifierDelaiModification(reservation) {
  // RG-16 : même délai que RG-15, calculé sur le créneau ACTUEL de la réservation.
  const instantCreneauActuel = horaire.instantCreneau(reservation.service.date, reservation.service.creneau.heureDebut)
  const limiteDelai = new Date(instantCreneauActuel.getTime() - DELAI_MIN_HEURES * 60 * 60 * 1000)
  if (new Date() > limiteDelai) {
    throw new ErreurMetier('Trop tard pour modifier cette réservation (moins de 2h avant) — contactez le restaurant.', 422)
  }
}

// US-07 : RG-17 — une modification est une nouvelle recherche de disponibilité pour
// les nouveaux paramètres. Si elle échoue, aucune écriture n'a eu lieu : la
// réservation d'origine reste intacte par construction (elle n'est mise à jour
// qu'après confirmation, dans la même transaction que la sélection de l'unité).
async function modifierReservation({ utilisateurId, reservationId, date, creneauId, nombreConvives, note }) {
  const reservation = await chargerReservationDuClient(utilisateurId, reservationId)
  verifierDelaiModification(reservation)

  const creneau = await prisma.creneau.findUnique({ where: { id: creneauId } })
  if (!creneau || !creneau.actif) {
    throw new ErreurMetier('Créneau introuvable.', 404)
  }

  await validerNouvelleOccupation(date, creneau, nombreConvives)
  // Le client ne change parfois que le nombre de convives sur le même créneau : sa
  // propre réservation est exclue de ces deux contrôles, sinon elle se compterait
  // comme son propre doublon / son propre quota.
  await verifierPasDeDoublon(utilisateurId, date, creneauId, reservationId)
  await verifierQuota(utilisateurId, reservationId)

  return prisma.$transaction(async (tx) => {
    const { service, uniteChoisie } = await trouverEtVerrouillerUnite(tx, {
      date,
      creneauId,
      nombreConvives,
      excluerReservationId: reservationId,
    })

    // Mise à jour en place : même id, même référence — c'est la même réservation,
    // pas une annulation suivie d'une recréation.
    return tx.reservation.update({
      where: { id: reservationId },
      data: { serviceId: service.id, uniteId: uniteChoisie.id, nombreConvives, note },
      include: { unite: true },
    })
  }, TRANSACTION_READ_COMMITTED)
}

// US-09, US-10 : vue du restaurateur pour une date, regroupée par créneau, avec le
// total de couverts par créneau (RG-20 : le contrôle d'accès se fait au niveau route,
// via verifierRole — cette fonction n'a pas à re-vérifier le rôle).
async function listerReservationsParDate(date) {
  const [ferme, creneaux, reservations] = await Promise.all([
    regles.dateFermee(date),
    prisma.creneau.findMany({ where: { actif: true }, orderBy: [{ periode: 'asc' }, { position: 'asc' }] }),
    prisma.reservation.findMany({
      where: { service: { date } },
      include: {
        service: { include: { creneau: true } },
        unite: true,
        utilisateur: { select: { prenom: true, nom: true, telephone: true, email: true } },
      },
    }),
  ])

  const parCreneau = creneaux.map((creneau) => {
    const reservationsDuCreneau = reservations.filter((r) => r.service.creneauId === creneau.id)
    const totalCouverts = reservationsDuCreneau
      .filter((r) => r.statut === 'CONFIRMEE')
      .reduce((total, r) => total + r.nombreConvives, 0)
    return { ...creneau, totalCouverts, reservations: reservationsDuCreneau }
  })

  return { ferme, creneaux: parCreneau }
}

// US-08 : annulation. RG-16 (délai de 2h), RG-19 (propriété).
async function annulerReservation({ utilisateurId, reservationId }) {
  const reservation = await chargerReservationDuClient(utilisateurId, reservationId)
  verifierDelaiModification(reservation)

  return prisma.reservation.update({
    where: { id: reservationId },
    data: { statut: 'ANNULEE', annuleLe: new Date() },
  })
}

module.exports = {
  creerReservation,
  listerMesReservations,
  modifierReservation,
  annulerReservation,
  listerReservationsParDate,
}
