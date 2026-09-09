const reservationService = require('../services/reservation.service')

const FORMAT_DATE = /^\d{4}-\d{2}-\d{2}$/

async function reservationsParDate(req, res) {
  const { date } = req.query
  if (!date || !FORMAT_DATE.test(date)) {
    return res.status(400).json({ erreur: 'Le paramètre date est requis, au format AAAA-MM-JJ.' })
  }

  try {
    const resultat = await reservationService.listerReservationsParDate(new Date(date))
    return res.status(200).json(resultat)
  } catch (erreur) {
    console.error(erreur)
    return res.status(500).json({ erreur: 'Erreur interne.' })
  }
}

module.exports = { reservationsParDate }
