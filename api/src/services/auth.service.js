const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../config/prisma')

class ErreurMetier extends Error {
  constructor(message, statut) {
    super(message)
    this.statut = statut
  }
}

function signerToken(utilisateur) {
  return jwt.sign({ id: utilisateur.id, role: utilisateur.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

// RG-21 : l'email est l'identifiant unique du compte client.
async function inscrire({ email, motDePasse, prenom, nom, telephone }) {
  const existant = await prisma.utilisateur.findUnique({ where: { email } })
  if (existant) {
    throw new ErreurMetier('Un compte existe déjà avec cet e-mail.', 409)
  }

  const motDePasseHash = await bcrypt.hash(motDePasse, 10)

  let utilisateur
  try {
    utilisateur = await prisma.utilisateur.create({
      data: { email, motDePasseHash, prenom, nom, telephone },
    })
  } catch (erreur) {
    // Filet de sécurité si deux inscriptions concurrentes passent le contrôle findUnique
    // avant que l'une des deux n'écrive : la contrainte unique en base tranche.
    if (erreur.code === 'P2002') {
      throw new ErreurMetier('Un compte existe déjà avec cet e-mail.', 409)
    }
    throw erreur
  }

  return { token: signerToken(utilisateur) }
}

async function connecter({ email, motDePasse }) {
  const utilisateur = await prisma.utilisateur.findUnique({ where: { email } })
  if (!utilisateur) {
    throw new ErreurMetier('Identifiants invalides.', 401)
  }

  const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasseHash)
  if (!motDePasseValide) {
    throw new ErreurMetier('Identifiants invalides.', 401)
  }

  return { token: signerToken(utilisateur) }
}

module.exports = { inscrire, connecter, ErreurMetier }
