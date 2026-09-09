const { Router } = require('express')
const backofficeController = require('../controllers/backoffice.controller')
const fermetureController = require('../controllers/fermeture.controller')
const { verifierAuthentification, verifierRole } = require('../middlewares/auth.middleware')

const router = Router()

// RG-20 : tout ce routeur est réservé au restaurateur.
router.use(verifierAuthentification, verifierRole('RESTAURATEUR'))

router.get('/reservations', backofficeController.reservationsParDate)

router.get('/fermetures', fermetureController.lister)
router.get('/fermetures/impact', fermetureController.impact)
router.post('/fermetures', fermetureController.creer)
router.delete('/fermetures/:id', fermetureController.supprimer)

module.exports = router
