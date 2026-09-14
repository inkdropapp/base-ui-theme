import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import less from 'less'
import postcss from 'postcss'
import cssnano from 'cssnano'

const ENTRY = 'src/semantic.less'
const OUTPUT = 'styles/theme.css'

const source = await readFile(ENTRY, 'utf8')
const { css } = await less.render(source, { filename: path.resolve(ENTRY) })

const { css: minified } = await postcss([
  cssnano({ preset: ['default', { discardComments: { removeAll: true } }] })
]).process(css, { from: undefined })

await mkdir(path.dirname(OUTPUT), { recursive: true })
await writeFile(OUTPUT, minified)

const kb = n => `${(n / 1024).toFixed(0)} KB`
console.log(`${OUTPUT}  ${kb(minified.length)}  (from ${kb(css.length)})`)
