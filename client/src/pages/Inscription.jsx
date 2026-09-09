import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { ErreurApi } from '../services/api'

const FORM_INITIAL = { email: '', motDePasse: '', prenom: '', nom: '', telephone: '' }

function Inscription() {
  const { sInscrire } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destination = location.state?.depuis ?? '/espace-client'

  const [form, setForm] = useState(FORM_INITIAL)
  const [erreur, setErreur] = useState(null)
  const [enCours, setEnCours] = useState(false)

  function handleChange(event) {
    setForm((f) => ({ ...f, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErreur(null)

    if (form.motDePasse.length < 6) {
      setErreur('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    setEnCours(true)
    try {
      await sInscrire(form)
      navigate(destination, { replace: true })
    } catch (e) {
      setErreur(e instanceof ErreurApi ? e.message : 'Inscription impossible.')
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div className="container section">
      <h1 className="section-title">Créer un compte</h1>
      <p className="section-subtitle">
        Un compte permet de suivre, modifier et annuler vos réservations en ligne.
      </p>

      <form className="formulaire" onSubmit={handleSubmit} noValidate>
        {erreur && <p className="message-erreur" role="alert">{erreur}</p>}

        <div className="champ">
          <label htmlFor="prenom">Prénom</label>
          <input id="prenom" name="prenom" type="text" required value={form.prenom} onChange={handleChange} />
        </div>

        <div className="champ">
          <label htmlFor="nom">Nom</label>
          <input id="nom" name="nom" type="text" required value={form.nom} onChange={handleChange} />
        </div>

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
          <label htmlFor="telephone">Téléphone (optionnel)</label>
          <input id="telephone" name="telephone" type="tel" value={form.telephone} onChange={handleChange} />
        </div>

        <div className="champ">
          <label htmlFor="motDePasse">Mot de passe</label>
          <input
            id="motDePasse"
            name="motDePasse"
            type="password"
            autoComplete="new-password"
            required
            value={form.motDePasse}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn" disabled={enCours}>
          {enCours ? 'Création…' : 'Créer mon compte'}
        </button>

        <p>
          Déjà un compte ? <Link to="/connexion" state={location.state}>Se connecter</Link>
        </p>
      </form>
    </div>
  )
}

export default Inscription
