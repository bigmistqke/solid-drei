import fs from 'fs'
import path from 'path'
import { parse } from 'comment-parser'

function parseAggregatedFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  const comments = []
  let currentComment = { filePath: '', index: -1, source: '' }

  lines.forEach(line => {
    const fileMatch = line.match(/\/\* File: (.+) \nComment Index: (\d+) \*\//)
    if (fileMatch) {
      if (currentComment.index !== -1) {
        comments.push(currentComment)
      }
      currentComment = {
        filePath: fileMatch[1],
        index: parseInt(fileMatch[2]),
        source: '',
      }
    } else {
      currentComment.source += `${line}\n`
    }
  })

  if (currentComment.index !== -1) {
    comments.push(currentComment)
  }

  return comments
}

function updateSourceFiles(comments) {
  const files = {}

  comments.forEach(comment => {
    if (!files[comment.filePath]) {
      files[comment.filePath] = fs.readFileSync(comment.filePath, 'utf8')
    }

    const content = files[comment.filePath]
    const parsedComments = commentParser(content, { spacing: 'preserve' })
    parsedComments[comment.index] = commentParser.parse(comment.source)[0]

    files[comment.filePath] = commentParser.stringify(parsedComments, { spacing: 'preserve' })
  })

  Object.keys(files).forEach(filePath => {
    fs.writeFileSync(filePath, files[filePath], 'utf8')
  })
}

const aggregatedFilePath = './aggregated_comments.jsdoc'
const updatedComments = parseAggregatedFile(aggregatedFilePath)
updateSourceFiles(updatedComments)
