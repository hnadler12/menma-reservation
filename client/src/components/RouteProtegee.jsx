import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

// Front = confort seulement (CLAUDE.md) : l'API rejette de toute façon tout appel
// non authentifié ou hors-rôle (RG-20), ce composant évite juste d'afficher un
// écran vide ou une erreur 401/403 brute.
function RouteProtegee({ children, roleRequis }) {
  const { utilisateur } = useAuth()
  const location = useLocation()

  if (!utilisateur) {
    return <Navigate to="/connexion" state={{ depuis: location.pathname }} replace />
  }

  if (roleRequis && utilisateur.role !== roleRequis) {
    return <Navigate to="/" replace />
  }

  return children
}

export default RouteProtegee
