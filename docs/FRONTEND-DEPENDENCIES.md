# Frontend dependency policy

Runtime script and stylesheet URLs in root HTML pages are recorded in [frontend-dependencies.json](frontend-dependencies.json). Exact versions, existing SRI values and anonymous CORS are checked offline in CI. A new CDN resource or changed integrity requires an explicit manifest review. Google Fonts CSS is the only dynamic stylesheet exception; it cannot authorize scripts. Local runtime asset hashes use LF-normalized text bytes to remain stable across Git checkout line endings.

```powershell
python scripts/check_site.py
python scripts/check_dependencies.py
python -m unittest discover -s tests -p test_dependencies.py
```

This guard checks declared resources and local drift. It does not fetch external URLs in CI, recursively validate resources imported by CDN CSS, or certify the absence of vulnerabilities. Bootstrap 5.1.3, jQuery 3.6.0 and Slick 1.9.0 are retained where used; exact-version advisory lookup found no reviewed advisory for those selected versions on 2026-10-28. Browser and integration coverage remain separate from these static checks.

## Rich-text editor

The local bundle uses Tiptap core and StarterKit 3.32.0 (MIT), built with esbuild 0.28.2. The bundle header points to the complete [runtime package license notices](EDITOR-LICENSES.txt). Three real editor fields are initialized; settings.html has no editor field and no editor script. Plain textarea remains the fallback when the local bundle is unavailable. Form inputs are static examples without a persistence endpoint.

The toolbar supports formatting, lists, undo/redo and explicit http/https/mailto links. Automatic linking, link-on-paste and link navigation are disabled. Unsupported schemes and control-character URLs are rejected. Initial textarea content becomes schema text, not arbitrary HTML. Pasted content is processed through the editor schema; this is not a server-side sanitizer or an upload feature.

```powershell
npm ci --ignore-scripts --no-fund
npm audit --audit-level=low
npm test
npm run build:editor
```

Node.js 24 is used in CI. The checked-in bundle can be previewed without npm. Rebuild the bundle after source/lockfile changes, review generated notices, and intentionally update the local asset hash in frontend-dependencies.json. CI rejects a non-reproducible generated bundle. Quill 2.0.3 was not introduced because GHSA-v3m3-f69x-jf25 has no patched release listed.

Sources: [Tiptap vanilla JavaScript setup](https://tiptap.dev/docs/editor/getting-started/install/vanilla-javascript), [MIT license](https://github.com/ueberdosis/tiptap/blob/main/LICENSE.md), [Quill advisory](https://github.com/advisories/GHSA-v3m3-f69x-jf25). Package and transitive audit results are recorded separately from browser verification.
