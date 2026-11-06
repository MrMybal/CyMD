"""Reduce an upstream npm pack archive to the files used by CyMD's manual.
Usage: python scripts/vendor-cydoc.py input.tgz vendor/cydoc-0.1.0.tgz
Upstream sources and licenses are copied unchanged; only package metadata is narrowed.
"""
import io
import json
import tarfile
import sys

source, destination = sys.argv[1:]
tools = {'cli', 'build', 'compiler', 'content', 'diagrams', 'blueprint',
         'extract', 'source-index', 'api-import', 'reports', 'pack-mesh', 'doc-ai', 'export-layout'}
web = {'boot.mjs', 'overview.mjs', 'reader.html'}

def keep(name):
    path = name.removeprefix('package/')
    return (
        path in {'LICENSE', 'package.json', 'src/viewer.css'}
        or (path.startswith('dist/') and path.count('/') == 1)
        or path in {'dist/modules/image.js', 'dist/modules/image.d.ts',
                    'dist/modules/shared.js', 'dist/modules/shared.d.ts'}
        or (path.startswith('tools/') and path[6:].removesuffix('.mjs') in tools)
        or (path.startswith('web/') and path[4:] in web)
    )

with tarfile.open(source, 'r:gz') as original, tarfile.open(destination, 'w:gz') as reduced:
    for entry in original:
        if not entry.isfile() or not keep(entry.name):
            continue
        data = original.extractfile(entry).read()
        if entry.name == 'package/package.json':
            pkg = json.loads(data)
            for key in ['devDependencies', 'peerDependencies', 'peerDependenciesMeta', 'scripts']:
                pkg.pop(key, None)
            pkg['files'] = ['dist', 'src/viewer.css', 'web', 'tools', 'LICENSE']
            pkg['exports'] = {key: value for key, value in pkg['exports'].items()
                              if not key.startswith('./modules/') or key == './modules/image'}
            data = (json.dumps(pkg, indent=2) + '\n').encode()
        entry.size = len(data)
        entry.uid = entry.gid = entry.mtime = 0
        entry.uname = entry.gname = ''
        reduced.addfile(entry, io.BytesIO(data))
print('Prepared minimal CyDoc build dependency:', destination)
