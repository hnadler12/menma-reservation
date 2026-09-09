const jwt = require('jsonwebtoken')

function verifierAuthentification(req, res, next) {
  const entete = req.headers.authorization
  if (!entete || !entete.startsWith('Bearer ')) {
    return res.status(401).json({ erreur: 'Authentification requise.' })
  }

  const token = entete.slice('Bearer '.length)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.utilisateur = { id: payload.id, role: payload.role }
    return next()
  } catch {
    return res.status(401).json({ erreur: 'Jeton invalide ou expiré.' })
  }
}

// RG-20 : à poser après verifierAuthentification, qui a déjà rempli req.utilisateur.
function verifierRole(...rolesAutorises) {
  return (req, res, next) => {
    if (!rolesAutorises.includes(req.utilisateur.role)) {
      return res.status(403).json({ erreur: 'Accès réservé.' })
    }
    return next()
  }
}

module.exports = { verifierAuthentification, verifierRole }
