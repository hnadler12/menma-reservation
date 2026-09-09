import styles from './Contact.module.css'

function Contact() {
  return (
    <div className={`container section ${styles.page}`}>
      <h1 className="section-title">Contact</h1>
      <p className="section-subtitle">
        Une question, un empêchement de dernière minute (moins de 2h avant votre créneau) ?
        Appelez-nous directement.
      </p>

      <div className={styles.grille}>
        <div className={styles.bloc}>
          <h2 className={styles.blocTitre}>Adresse</h2>
          <p>Menma</p>
          <p>Rue du cocotier 12, 1000 Bruxelles</p>
        </div>
        <div className={styles.bloc}>
          <h2 className={styles.blocTitre}>Nous joindre</h2>
          <p>Téléphone : 02 55 23 45 67</p>
          <p>E-mail : contact@menma.be</p>
        </div>
      </div>
    </div>
  )
}

export default Contact
