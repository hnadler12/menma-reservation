import { appel } from './api'

const CLE_TOKEN = 'menma_token'

function lireToken() {
  return localStorage.getItem(CLE_TOKEN)
}

function ecrireToken(token) {
  localStorage.setItem(CLE_TOKEN, token)
}

function effacerToken() {
  localStorage.removeItem(CLE_TOKEN)
}

// Décode le payload du JWT sans vérifier la signature (déjà faite côté serveur) —
// juste pour lire id/role et savoir si le token est expiré, côté affichage.
function decoderToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp && payload.exp * 1000 < Date.now()) return null
    return { id: payload.id, role: payload.role }
  } catch {
    return null
  }
}

async function inscrire({ email, motDePasse, prenom, nom, telephone }) {
  const { token } = await appel('/api/auth/inscription', {
    methode: 'POST',
    corps: { email, motDePasse, prenom, nom, telephone },
  })
  ecrireToken(token)
  return decoderToken(token)
}

async function connecter({ email, motDePasse }) {
  const { token } = await appel('/api/auth/connexion', {
    methode: 'POST',
    corps: { email, motDePasse },
  })
  ecrireToken(token)
  return decoderToken(token)
}

function deconnecter() {
  effacerToken()
}

function utilisateurCourant() {
  const token = lireToken()
  return token ? decoderToken(token) : null
}

export { inscrire, connecter, deconnecter, utilisateurCourant, lireToken }
