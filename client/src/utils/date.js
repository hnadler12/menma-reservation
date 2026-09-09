// Affichage humain d'une date calendaire (reçue en "AAAA-MM-JJ" ou en ISO complet
// depuis l'API) — jour/mois/année, convention belge/française.
function formaterDateAffichage(date) {
  const instant = new Date(`${date.slice(0, 10)}T00:00:00Z`)
  return instant.toLocaleDateString('fr-BE', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' })
}

export { formaterDateAffichage }
