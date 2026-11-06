import { copyFileSync, writeFileSync, cpSync, mkdirSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve, relative } from 'node:path'

// Keep the existing editor and its AGPL source offer alongside the complete manual.
const output = resolve('output/pages')
if (relative(process.cwd(), output).replaceAll('\\', '/') !== 'output/pages') throw new Error('Invalid Pages output')
rmSync(output, { recursive: true, force: true })
mkdirSync(output, { recursive: true })
for (const name of ['index.html', 'logo.png', 'assets', 'Documentation', 'help', 'CyMD-help.zip']) {
  cpSync(`dist/${name}`, `${output}/${name}`, { recursive: true })
}
copyFileSync('LICENSE', `${output}/LICENSE.txt`)
writeFileSync(`${output}/.nojekyll`, '')
execFileSync('git', ['-c', `safe.directory=${process.cwd().replaceAll('\\', '/')}`, 'archive', '--format=zip', `--output=${output}/source.zip`, 'HEAD'])
console.log('Web editor, complete manual and corresponding source prepared in output/pages/')
