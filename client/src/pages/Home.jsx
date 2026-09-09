import { Link } from 'react-router-dom'
import styles from './Home.module.css'

function Home() {
  return (
    <div>
      <section className={styles.hero}>
        <div className="container">
          <h1>Ramen japonais, au cœur de Bruxelles</h1>
          <p className="section-subtitle">
            Bouillons mijotés, nouilles faites maison. Réservez votre table
            ou votre place au comptoir en quelques secondes.
          </p>
          <div className={styles.actions}>
            <Link to="/reservation" className="btn">
              Réserver une table
            </Link>
            <Link to="/menu" className="btn btn-secondaire">
              Voir la carte
            </Link>
          </div>
        </div>
      </section>

      <section className="container">
        <div className={styles.infos}>
          <div className={styles.carte}>
            <h3 className={styles.carteTitre}>Horaires</h3>
            <p>Midi : 12h00 et 13h30</p>
            <p>Soir : 19h00 et 21h00</p>
            <p>Ouvert 7j/7</p>
          </div>
          <div className={styles.carte}>
            <h3 className={styles.carteTitre}>La salle</h3>
            <p>Tables de 2, 4 et 6 personnes</p>
            <p>Comptoir ouvert, jusqu'à 3 convives</p>
          </div>
          <div className={styles.carte}>
            <h3 className={styles.carteTitre}>Réservation</h3>
            <p>Confirmation immédiate</p>
            <p>Modifiable en ligne jusqu'à 2h avant</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
