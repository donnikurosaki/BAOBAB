import mongoose from 'mongoose'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { createRequire } from 'module'
import { connectDB } from '../config/database.js'
import Country from '../models/Country.js'
import logger from '../utils/logger.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../../..')
const require = createRequire(import.meta.url)

// Importer les 54 pays depuis les données du frontend (TypeScript → ESM via esbuild)
const esbuild = require(path.join(rootDir, 'node_modules', 'esbuild'))
const tsFile = path.join(rootDir, 'src', 'data', 'allAfricanCountries.ts')
const tempFile = path.join(__dirname, '.countries-data.mjs')

esbuild.buildSync({
  entryPoints: [tsFile],
  bundle: true,
  format: 'esm',
  outfile: tempFile,
  logLevel: 'silent',
})

const { allAfricanCountries } = await import(pathToFileURL(tempFile).href)
fs.rmSync(tempFile)

const seedCountries = async () => {
  try {
    await connectDB()
    logger.info(`🌍 Début du seed des pays africains (${allAfricanCountries.length} pays)...`)

    let created = 0
    let updated = 0

    for (const c of allAfricanCountries) {
      const doc = {
        id: c.id,
        name: c.name,
        nameFr: c.nameFr,
        capital: c.capital,
        population: c.population || '',
        area: c.area || '',
        languages: c.languages || [],
        currency: c.currency || '',
        description: c.description || '',
        culture: c.culture || '',
        color: c.color || '#8E44AD',
        center: { x: c.center?.[0] ?? 0, y: c.center?.[1] ?? 0 },
        rites: c.rites || [],
        customs: c.customs || [],
        foods: c.foods || [],
        traditions: c.traditions || [],
        festivals: c.festivals || [],
        arts: c.arts || [],
      }

      const existing = await Country.findOne({ id: c.id })
      if (existing) {
        await Country.updateOne({ id: c.id }, doc)
        updated++
      } else {
        await Country.create(doc)
        created++
        logger.info(`✅ Créé: ${c.nameFr}`)
      }
    }

    logger.info(`✨ Migration terminée: ${created} créés, ${updated} mis à jour`)
    process.exit(0)
  } catch (error) {
    logger.error('❌ Erreur lors du seed des pays', { message: error.message, stack: error.stack })
    process.exit(1)
  }
}

seedCountries()
