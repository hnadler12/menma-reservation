const authService = require('../services/auth.service')

async function inscription(req, res) {
  const { email, motDePasse, prenom, nom, telephone } = req.body

  if (!email || !motDePasse || !prenom || !nom) {
    return res.status(400).json({ erreur: 'Email, mot de passe, prénom et nom sont requis.' })
  }

  try {
    const resultat = await authService.inscrire({ email, motDePasse, prenom, nom, telephone })
    return res.status(201).json(resultat)
  } catch (erreur) {
    if (erreur instanceof authService.ErreurMetier) {
      return res.status(erreur.statut).json({ erreur: erreur.message })
    }
    console.error(erreur)
    return res.status(500).json({ erreur: 'Erreur interne.' })
  }
}

async function connexion(req, res) {
  const { email, motDePasse } = req.body

  if (!email || !motDePasse) {
    return res.status(400).json({ erreur: 'Email et mot de passe sont requis.' })
  }

  try {
    const resultat = await authService.connecter({ email, motDePasse })
    return res.status(200).json(resultat)
  } catch (erreur) {
    if (erreur instanceof authService.ErreurMetier) {
      return res.status(erreur.statut).json({ erreur: erreur.message })
    }
    console.error(erreur)
    return res.status(500).json({ erreur: 'Erreur interne.' })
  }
}

module.exports = { inscription, connexion }
