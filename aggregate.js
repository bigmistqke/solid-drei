import fs from 'fs'
import path from 'path'
import { parse } from 'comment-parser'

function extractJSDoc(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const comments = parse(content, { spacing: 'preserve' })
  return comments.map(comment => ({
    filePath,
    comment,
  }))
}

function extractCommentsFromDirectory(dir) {
  const files = fs.readdirSync(dir).filter(v => v.endsWith('.tsx') || v.endsWith('.ts'))
  let comments = []
  files.forEach(file => {
    const filePath = path.join(dir, file)
    comments = comments.concat(extractJSDoc(filePath))
  })
  return comments
}

function aggregateComments(comments, outputPath) {
  const aggregatedContent = comments
    .map((entry, index) => {
      return `/* File: ${entry.filePath} \nComment Index: ${index} */\n${JSON.stringify(
        entry.comment.source,
      )}\n`
    })
    .join('\n')

  fs.writeFileSync(outputPath, aggregatedContent, 'utf8')
}

const dir = './src/core'
const outputPath = './aggregated_comments.jsdoc'
const comments = extractCommentsFromDirectory(dir)
aggregateComments(comments, outputPath)
