import { createContext, useState } from 'react'
import * as authService from '../services/auth.service'

const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(() => authService.utilisateurCourant())

  async function seConnecter(identifiants) {
    const utilisateurConnecte = await authService.connecter(identifiants)
    setUtilisateur(utilisateurConnecte)
    return utilisateurConnecte
  }

  async function sInscrire(informations) {
    const utilisateurCree = await authService.inscrire(informations)
    setUtilisateur(utilisateurCree)
    return utilisateurCree
  }

  function seDeconnecter() {
    authService.deconnecter()
    setUtilisateur(null)
  }

  return (
    <AuthContext.Provider value={{ utilisateur, seConnecter, sInscrire, seDeconnecter }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }
