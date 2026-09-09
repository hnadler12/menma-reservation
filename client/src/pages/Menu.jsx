import styles from './Menu.module.css'

const CARTE = [
  {
    categorie: 'Ramens',
    plats: [
      { nom: 'Shoyu', description: 'Bouillon soja, porc chashu, œuf mariné, nori', prix: '14,50 €' },
      { nom: 'Miso', description: 'Bouillon miso, maïs, beurre, porc effiloché', prix: '15,00 €' },
      { nom: 'Tonkotsu', description: 'Bouillon d\'os de porc mijoté , chashu, champignon kikurage', prix: '16,50 €' },
      { nom: 'Ramen végétarien', description: 'Bouillon kombu-shiitake, tofu grillé, légumes de saison', prix: '14,00 €' },
    ],
  },
  {
    categorie: 'À partager',
    plats: [
      { nom: 'Gyozas', description: 'Raviolis vapeur-poêlés, porc et chou', prix: '7,50 €' },
      { nom: 'Edamame', description: 'Fèves de soja vapeur, fleur de sel', prix: '4,50 €' },
      { nom: 'Karaage', description: 'Poulet frit mariné au gingembre', prix: '8,00 €' },
    ],
  },
  {
    categorie: 'Boissons',
    plats: [
      { nom: 'Thé vert Sencha', description: '', prix: '3,50 €' },
      { nom: 'Bière Asahi', description: '33cl', prix: '4,50 €' },
      { nom: 'Ramune', description: 'Soda japonais, plusieurs parfums', prix: '4,00 €' },
    ],
  },
]

function Menu() {
  return (
    <div className={`container section ${styles.page}`}>
      <h1 className="section-title">La carte</h1>
      <p className="section-subtitle">
        Une carte courte, renouvelée selon la saison — comme il se doit pour un ramen fait maison.
      </p>

      {CARTE.map((section) => (
        <div key={section.categorie} className={styles.categorie}>
          <h2 className={styles.categorieTitre}>{section.categorie}</h2>
          {section.plats.map((plat) => (
            <div key={plat.nom} className={styles.plat}>
              <div>
                <p className={styles.platNom}>{plat.nom}</p>
                {plat.description && <p className={styles.platDescription}>{plat.description}</p>}
              </div>
              <span className={styles.platPrix}>{plat.prix}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default Menu
