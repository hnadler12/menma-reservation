require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// Jamais de mot de passe en dur dans un fichier versionné : à définir dans .env
// (local) ou dans les variables d'environnement de l'hébergeur avant de seeder.
const MOT_DE_PASSE_RESTAURATEUR = process.env.SEED_MOT_DE_PASSE_RESTAURATEUR
if (!MOT_DE_PASSE_RESTAURATEUR) {
  throw new Error('SEED_MOT_DE_PASSE_RESTAURATEUR doit être défini (voir .env) avant de lancer le seed.')
}

const unites = [
  { libelle: 'Table 1', type: 'TABLE', capacite: 2, divisible: false, tailleMin: 1, tailleMax: null },
  { libelle: 'Table 2', type: 'TABLE', capacite: 2, divisible: false, tailleMin: 1, tailleMax: null },
  { libelle: 'Table 3', type: 'TABLE', capacite: 2, divisible: false, tailleMin: 1, tailleMax: null },
  { libelle: 'Table 4', type: 'TABLE', capacite: 2, divisible: false, tailleMin: 1, tailleMax: null },
  { libelle: 'Table 5', type: 'TABLE', capacite: 2, divisible: false, tailleMin: 1, tailleMax: null },
  { libelle: 'Table 6', type: 'TABLE', capacite: 4, divisible: false, tailleMin: 1, tailleMax: null },
  { libelle: 'Table 7', type: 'TABLE', capacite: 4, divisible: false, tailleMin: 1, tailleMax: null },
  { libelle: 'Table 8', type: 'TABLE', capacite: 4, divisible: false, tailleMin: 1, tailleMax: null },
  { libelle: 'Table 9', type: 'TABLE', capacite: 4, divisible: false, tailleMin: 1, tailleMax: null },
  { libelle: 'Table 10', type: 'TABLE', capacite: 6, divisible: false, tailleMin: 1, tailleMax: null },
  // RG-04 : le comptoir n'accepte que 1 à 3 convives par réservation
  { libelle: 'Comptoir', type: 'COMPTOIR', capacite: 8, divisible: true, tailleMin: 1, tailleMax: 3 },
]

const creneaux = [
  { periode: 'MIDI', heureDebut: '12:00', position: 1 },
  { periode: 'MIDI', heureDebut: '13:30', position: 2 },
  { periode: 'SOIR', heureDebut: '19:00', position: 1 },
  { periode: 'SOIR', heureDebut: '21:00', position: 2 },
]

async function main() {
  // Purge dans l'ordre inverse des dépendances pour pouvoir relancer le seed sans doublons.
  await prisma.reservation.deleteMany()
  await prisma.service.deleteMany()
  await prisma.fermeture.deleteMany()
  await prisma.unite.deleteMany()
  await prisma.creneau.deleteMany()
  await prisma.utilisateur.deleteMany({ where: { role: 'RESTAURATEUR' } })

  await prisma.unite.createMany({ data: unites })
  await prisma.creneau.createMany({ data: creneaux })

  const motDePasseHash = await bcrypt.hash(MOT_DE_PASSE_RESTAURATEUR, 10)
  await prisma.utilisateur.create({
    data: {
      email: 'restaurateur@menma.be',
      motDePasseHash,
      prenom: 'Mitsu',
      nom: 'Restaurateur',
      role: 'RESTAURATEUR',
    },
  })

  console.log('Seed terminé : 11 unités, 4 créneaux, 1 compte restaurateur.')
}

main()
  .catch((erreur) => {
    console.error(erreur)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
