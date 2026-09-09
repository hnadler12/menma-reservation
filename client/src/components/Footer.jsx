import styles from './Footer.module.css'

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.interieur}`}>
        <p className={styles.titre}>Menma</p>
        <p>Ramen japonais — Bruxelles</p>
        <p>Ouvert 7j/7 — Midi : 12h00 / 13h30 — Soir : 19h00 / 21h00</p>
      </div>
    </footer>
  )
}

export default Footer
