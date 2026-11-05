# CyDoc build dependency

CyDoc 0.1.0 is pinned as a local npm archive, built from commit
774f2a7eabf7dd181a98ffc5add115b580b67f42 of the private
https://github.com/MrMybal/CyDoc repository. License: MIT (included in the archive
and copied into the generated help).

To update: use authenticated Git to obtain a checkout, run npm ci and npm pack,
run python scripts/vendor-cydoc.py /path/to/upstream.tgz vendor/cydoc-0.1.0.tgz,
then npm install --save-dev ./vendor/cydoc-0.1.0.tgz.
Rebuild and test the manual before distributing it. Do not install a package with
the same name from the npm registry.

The archive is used only at build time. Desktop packages include the generated
reader and the image module; they do not include the CyDoc development checkout,
its demo site, Three.js or the other optional readers.

The vendored archive contains only the compiler, core reader and image module
needed by CyMD. Upstream code and the MIT license are unchanged. Package metadata
is narrowed to the included exports. Demo generators, integration examples,
AI guides and unused media modules are excluded. GitHub Actions can therefore
regenerate the manual without credentials for the private upstream repository.
