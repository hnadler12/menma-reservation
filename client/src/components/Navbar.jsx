import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import logo from '../assets/logo.jpg'
import menma from '../assets/Menma.png'
import styles from './Navbar.module.css'

function Navbar() {
  const [ouvert, setOuvert] = useState(false)
  const { utilisateur, seDeconnecter } = useAuth()
  const estRestaurateur = utilisateur?.role === 'RESTAURATEUR'

  function lienClasse({ isActive }) {
    return isActive ? styles.lienActif : undefined
  }

  function fermerMenu() {
    setOuvert(false)
  }

  return (
    <header className={styles.navbar}>
      <div className={`container ${styles.interieur}`}>
        <NavLink to={estRestaurateur ? '/back-office' : '/'} className={styles.logo} onClick={fermerMenu}>
          <img src={logo} alt="Menma" className={styles.logoImage} />
        </NavLink>

        {!ouvert && <img src={menma} alt="" className={styles.milieu} />}

        <button
          type="button"
          className={styles.boutonMenu}
          aria-expanded={ouvert}
          aria-label="Ouvrir le menu"
          onClick={() => setOuvert((v) => !v)}
        >
          {ouvert ? '✕' : '☰'}
        </button>

        <nav className={`${styles.liens} ${ouvert ? styles.ouvert : ''}`}>
          {estRestaurateur ? (
            <>
              <NavLink to="/back-office" end className={lienClasse} onClick={fermerMenu}>
                Réservations
              </NavLink>
              <NavLink to="/back-office/fermetures" className={lienClasse} onClick={fermerMenu}>
                Fermetures
              </NavLink>
              <NavLink to="/reservation" className={lienClasse} onClick={fermerMenu}>
                Réserver
              </NavLink>
              <button type="button" className="btn-texte" onClick={seDeconnecter}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <NavLink to="/" end className={lienClasse} onClick={fermerMenu}>
                Accueil
              </NavLink>
              <NavLink to="/menu" className={lienClasse} onClick={fermerMenu}>
                Menu
              </NavLink>
              <NavLink to="/contact" className={lienClasse} onClick={fermerMenu}>
                Contact
              </NavLink>
              <NavLink to="/reservation" className={lienClasse} onClick={fermerMenu}>
                Réserver
              </NavLink>
              {utilisateur ? (
                <>
                  <NavLink to="/espace-client" className={lienClasse} onClick={fermerMenu}>
                    Mon espace
                  </NavLink>
                  <button type="button" className="btn-texte" onClick={seDeconnecter}>
                    Déconnexion
                  </button>
                </>
              ) : (
                <NavLink to="/connexion" className={lienClasse} onClick={fermerMenu}>
                  Connexion
                </NavLink>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
