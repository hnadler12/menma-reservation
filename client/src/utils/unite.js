// RG-01/RG-02 : une table est indivisible, le comptoir divisible — deux natures
// d'assise différentes que le client doit pouvoir distinguer d'un coup d'œil.
function libelleUnite(unite) {
  return unite.type === 'COMPTOIR' ? 'Place au comptoir' : unite.libelle
}

export { libelleUnite }
