// Quick script to help fix stories from knobs to controls format
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const storiesDir = path.join(__dirname, '.storybook/stories')

// Read all story files
const storyFiles = fs.readdirSync(storiesDir).filter(file => file.endsWith('.stories.tsx'))

console.log(`Found ${storyFiles.length} story files`)

// For now, just list stories that need updating
storyFiles.forEach(file => {
  const filePath = path.join(storiesDir, file)
  const content = fs.readFileSync(filePath, 'utf8')
  
  if (content.includes('@storybook/addon-knobs')) {
    console.log(`Story needs updating: ${file}`)
  }
})