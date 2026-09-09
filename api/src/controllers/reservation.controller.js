const reservationService = require('../services/reservation.service')
const { ErreurMetier } = require('../services/auth.service')

const FORMAT_DATE = /^\d{4}-\d{2}-\d{2}$/

function gererErreur(res, erreur) {
  if (erreur instanceof ErreurMetier) {
    return res.status(erreur.statut).json({ erreur: erreur.message })
  }
  console.error(erreur)
  return res.status(500).json({ erreur: 'Erreur interne.' })
}

// Valide le corps commun à la création et à la modification. Retourne le message
// d'erreur à renvoyer, ou `null` si tout est valide.
function validerCorpsReservation({ date, creneauId, nombreConvives }) {
  if (!date || !FORMAT_DATE.test(date)) {
    return 'Le champ date est requis, au format AAAA-MM-JJ.'
  }
  if (!creneauId) {
    return 'Le champ creneauId est requis.'
  }
  if (!Number.isInteger(Number(nombreConvives)) || Number(nombreConvives) < 1) {
    return 'Le champ nombreConvives doit être un entier positif.'
  }
  return null
}

async function creer(req, res) {
  const erreurValidation = validerCorpsReservation(req.body)
  if (erreurValidation) {
    return res.status(400).json({ erreur: erreurValidation })
  }
  const { date, creneauId, nombreConvives, note } = req.body

  try {
    const reservation = await reservationService.creerReservation({
      utilisateurId: req.utilisateur.id,
      date: new Date(date),
      creneauId,
      nombreConvives: Number(nombreConvives),
      note,
    })
    return res.status(201).json(reservation)
  } catch (erreur) {
    return gererErreur(res, erreur)
  }
}

async function lister(req, res) {
  try {
    const reservations = await reservationService.listerMesReservations(req.utilisateur.id)
    return res.status(200).json(reservations)
  } catch (erreur) {
    return gererErreur(res, erreur)
  }
}

async function modifier(req, res) {
  const erreurValidation = validerCorpsReservation(req.body)
  if (erreurValidation) {
    return res.status(400).json({ erreur: erreurValidation })
  }
  const { date, creneauId, nombreConvives, note } = req.body

  try {
    const reservation = await reservationService.modifierReservation({
      utilisateurId: req.utilisateur.id,
      reservationId: req.params.id,
      date: new Date(date),
      creneauId,
      nombreConvives: Number(nombreConvives),
      note,
    })
    return res.status(200).json(reservation)
  } catch (erreur) {
    return gererErreur(res, erreur)
  }
}

async function annuler(req, res) {
  try {
    const reservation = await reservationService.annulerReservation({
      utilisateurId: req.utilisateur.id,
      reservationId: req.params.id,
    })
    return res.status(200).json(reservation)
  } catch (erreur) {
    return gererErreur(res, erreur)
  }
}

module.exports = { creer, lister, modifier, annuler }
