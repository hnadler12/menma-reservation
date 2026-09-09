import { Link } from 'react-router-dom'

function PageIntrouvable() {
  return (
    <div className="container section" style={{ textAlign: 'center' }}>
      <h1>Page introuvable</h1>
      <p className="section-subtitle">Cette page n'existe pas ou plus.</p>
      <Link to="/" className="btn">
        Retour à l'accueil
      </Link>
    </div>
  )
}

export default PageIntrouvable
