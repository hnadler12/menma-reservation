const { Router } = require('express')
const disponibilitesController = require('../controllers/disponibilites.controller')

const router = Router()

router.get('/', disponibilitesController.rechercher)

module.exports = router
