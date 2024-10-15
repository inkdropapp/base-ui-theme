import postcss, { Rule } from 'postcss'
import fs from 'fs'
import path from 'path'

const pathToThemeCSS = path.resolve(__dirname, '..', 'styles', 'theme.css')
const themeCSS = fs.readFileSync(pathToThemeCSS)

const variables = new Set()
const root = postcss.parse(themeCSS, { from: pathToThemeCSS })
root.walkDecls(/^--/, node => {
  if (node.parent && node.parent.type === 'rule') {
    const parent = node.parent as Rule
    if (parent.selector === ':root') {
      variables.add(node.prop)
    }
  }
})

const pathToOutput = path.join(__dirname, '..', 'lib', 'variable-names.json')
fs.writeFileSync(pathToOutput, JSON.stringify(Array.from(variables), null, 2))
