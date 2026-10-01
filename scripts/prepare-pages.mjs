import { copyFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

copyFileSync('LICENSE', 'dist/LICENSE.txt')
writeFileSync('dist/.nojekyll', '')
execFileSync('git', ['-c', `safe.directory=${process.cwd().replaceAll('\\', '/')}`, 'archive', '--format=zip', '--output=dist/source.zip', 'HEAD'])
console.log('Web editor, license and corresponding source prepared in dist/')
