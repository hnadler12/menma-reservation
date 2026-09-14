import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { ErreurApi } from '../services/api'
import styles from './Connexion.module.css'

function Connexion() {
  const { seConnecter } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', motDePasse: '' })
  const [erreur, setErreur] = useState(null)
  const [enCours, setEnCours] = useState(false)

  function handleChange(event) {
    setForm((f) => ({ ...f, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErreur(null)
    setEnCours(true)
    try {
      const utilisateurConnecte = await seConnecter(form)
      const destination =
        location.state?.depuis ?? (utilisateurConnecte.role === 'RESTAURATEUR' ? '/back-office' : '/espace-client')
      navigate(destination, { replace: true })
    } catch (e) {
      setErreur(e instanceof ErreurApi ? e.message : 'Connexion impossible.')
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div className={`container section ${styles.page}`}>
      <h1 className="section-title">Connexion</h1>

      <form className="formulaire" onSubmit={handleSubmit} noValidate>
        {erreur && <p className="message-erreur" role="alert">{erreur}</p>}

        <div className="champ">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="champ">
          <label htmlFor="motDePasse">Mot de passe</label>
          <input
            id="motDePasse"
            name="motDePasse"
            type="password"
            autoComplete="current-password"
            required
            value={form.motDePasse}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn" disabled={enCours}>
          {enCours ? 'Connexion…' : 'Se connecter'}
        </button>

        <p>
          Pas encore de compte ? <Link to="/inscription" state={location.state}>Créer un compte</Link>
        </p>
      </form>
    </div>
  )
}

export default Connexion
