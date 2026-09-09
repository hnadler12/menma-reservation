// Conserve la sélection en cours (date, créneau, convives) pendant l'inscription ou
// la connexion, pour ne pas faire recommencer la recherche au client (parcours 1,
// point d'attention UX de personas-user-stories.md).
const CLE = 'menma_reservation_en_cours'

function sauvegarder(selection) {
  sessionStorage.setItem(CLE, JSON.stringify(selection))
}

function lire() {
  const brut = sessionStorage.getItem(CLE)
  return brut ? JSON.parse(brut) : null
}

function effacer() {
  sessionStorage.removeItem(CLE)
}

export { sauvegarder, lire, effacer }
