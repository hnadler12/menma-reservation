const { Router } = require('express')
const reservationController = require('../controllers/reservation.controller')
const { verifierAuthentification } = require('../middlewares/auth.middleware')

const router = Router()

router.get('/', verifierAuthentification, reservationController.lister)
router.post('/', verifierAuthentification, reservationController.creer)
router.patch('/:id', verifierAuthentification, reservationController.modifier)
router.post('/:id/annuler', verifierAuthentification, reservationController.annuler)

module.exports = router
