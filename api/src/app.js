const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/auth.routes')
const disponibilitesRoutes = require('./routes/disponibilites.routes')
const reservationRoutes = require('./routes/reservation.routes')
const backofficeRoutes = require('./routes/backoffice.routes')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/disponibilites', disponibilitesRoutes)
app.use('/api/reservations', reservationRoutes)
app.use('/api/backoffice', backofficeRoutes)

module.exports = app
