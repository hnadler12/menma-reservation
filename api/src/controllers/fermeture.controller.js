const fermetureService = require('../services/fermeture.service')
const { ErreurMetier } = require('../services/auth.service')

const FORMAT_DATE = /^\d{4}-\d{2}-\d{2}$/

function gererErreur(res, erreur) {
  if (erreur instanceof ErreurMetier) {
    return res.status(erreur.statut).json({ erreur: erreur.message })
  }
  console.error(erreur)
  return res.status(500).json({ erreur: 'Erreur interne.' })
}

function validerPeriode(dateDebut, dateFin) {
  if (!dateDebut || !FORMAT_DATE.test(dateDebut) || !dateFin || !FORMAT_DATE.test(dateFin)) {
    return 'dateDebut et dateFin sont requis, au format AAAA-MM-JJ.'
  }
  return null
}

async function creer(req, res) {
  const { dateDebut, dateFin, motif } = req.body
  const erreurValidation = validerPeriode(dateDebut, dateFin)
  if (erreurValidation) {
    return res.status(400).json({ erreur: erreurValidation })
  }

  try {
    const fermeture = await fermetureService.creerFermeture({
      dateDebut: new Date(dateDebut),
      dateFin: new Date(dateFin),
      motif,
    })
    return res.status(201).json(fermeture)
  } catch (erreur) {
    return gererErreur(res, erreur)
  }
}

async function lister(req, res) {
  try {
    const fermetures = await fermetureService.listerFermetures()
    return res.status(200).json(fermetures)
  } catch (erreur) {
    return gererErreur(res, erreur)
  }
}

async function supprimer(req, res) {
  try {
    await fermetureService.supprimerFermeture(req.params.id)
    return res.status(204).send()
  } catch (erreur) {
    return gererErreur(res, erreur)
  }
}

// Prévisualisation de l'impact avant confirmation (demande explicite : le restaurateur
// doit voir qui est concerné avant de créer la fermeture, pas seulement après).
async function impact(req, res) {
  const { dateDebut, dateFin } = req.query
  const erreurValidation = validerPeriode(dateDebut, dateFin)
  if (erreurValidation) {
    return res.status(400).json({ erreur: erreurValidation })
  }

  try {
    const reservations = await fermetureService.listerReservationsImpactees({
      dateDebut: new Date(dateDebut),
      dateFin: new Date(dateFin),
    })
    return res.status(200).json(reservations)
  } catch (erreur) {
    return gererErreur(res, erreur)
  }
}

module.exports = { creer, lister, supprimer, impact }
