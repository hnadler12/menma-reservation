const BASE_URL = import.meta.env.VITE_API_URL ?? ''

class ErreurApi extends Error {
  constructor(message, statut) {
    super(message)
    this.statut = statut
  }
}

async function appel(chemin, { methode = 'GET', corps, token } = {}) {
  const reponse = await fetch(`${BASE_URL}${chemin}`, {
    method: methode,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(corps !== undefined && { body: JSON.stringify(corps) }),
  })

  const corpsReponse = reponse.status === 204 ? null : await reponse.json()

  if (!reponse.ok) {
    throw new ErreurApi(corpsReponse?.erreur ?? 'Une erreur est survenue.', reponse.status)
  }

  return corpsReponse
}

export { appel, ErreurApi }
