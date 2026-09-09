const disponibiliteService = require('../services/disponibilite.service')

const FORMAT_DATE = /^\d{4}-\d{2}-\d{2}$/

async function rechercher(req, res) {
  const { date, convives } = req.query

  if (!date || !FORMAT_DATE.test(date)) {
    return res.status(400).json({ erreur: 'Le paramètre date est requis, au format AAAA-MM-JJ.' })
  }

  const nombreConvives = Number(convives)
  if (!convives || !Number.isInteger(nombreConvives) || nombreConvives < 1) {
    return res.status(400).json({ erreur: 'Le paramètre convives est requis et doit être un entier positif.' })
  }

  try {
    const resultat = await disponibiliteService.rechercherDisponibilites({
      date: new Date(date),
      convives: nombreConvives,
    })
    return res.status(200).json(resultat)
  } catch (erreur) {
    console.error(erreur)
    return res.status(500).json({ erreur: 'Erreur interne.' })
  }
}

module.exports = { rechercher }
