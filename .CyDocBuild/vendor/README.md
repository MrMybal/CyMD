# CyDoc build dependency

CyDoc 0.1.0, revision 6ddf9a582defb2f11fbb3f992afef6f98dcadc93,
from https://github.com/MrMybal/CyDoc. The upstream version number is unchanged;
the archive pins this newer revision. License: MIT, preserved in the archive.

Obtain the private checkout through authenticated Git, run npm ci and npm pack,
then run python .CyDocBuild/vendor-cydoc.py upstream.tgz .CyDocBuild/vendor/cydoc-0.1.0.tgz.
Install the resulting local archive with npm install --save-dev
./.CyDocBuild/vendor/cydoc-0.1.0.tgz. Do not install a namesake registry package.

The archive retains the upstream compiler, reader and image module unchanged.
Only its file list and package metadata are narrowed. Demo generators,
AI guides, integration examples and unused media modules are excluded.
The application ships only the generated Documentation tree, not this toolchain.
