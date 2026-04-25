# Experiments

A collection of browser-based tools and demos, hosted on GitHub Pages.

## Structure

```
experiments/
├── site/                        # Landing page (experiments hub)
│   ├── index.html
│   └── css/style.css
├── cfn-tools/                   # CloudFormation Tools (rain WASM)
│   ├── wasm/                    # Go WASM source
│   │   ├── main.go
│   │   ├── go.mod
│   │   └── stubs/               # WASM-compatible stubs for terminal deps
│   ├── static/                  # Deployable static site
│   │   ├── index.html
│   │   ├── css/style.css
│   │   ├── js/app.js
│   │   └── assets/              # wasm_exec.js + main.wasm (committed)
│   └── Makefile                 # `make build` recompiles WASM
└── .github/workflows/pages.yml  # Assembles + deploys to GitHub Pages
```

## How GitHub Pages works

The workflow (`.github/workflows/pages.yml`) runs on push to `main` and:
1. Copies `site/` to the root of the deployed site
2. Copies each tool's `static/` directory to a matching subdirectory
3. Deploys via `actions/deploy-pages`

Pages source must be set to **GitHub Actions** in the repo settings.

## Adding a new experiment

### 1. Create the experiment folder

```
my-tool/
├── static/
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
└── README.md          # optional
```

The `static/` directory must be self-contained — all asset paths should be relative.

### 2. Add it to the Pages workflow

In `.github/workflows/pages.yml`, add a copy step inside the `Assemble site` run block:

```yaml
- name: Assemble site
  run: |
    mkdir -p _site/cfn-tools
    cp -r site/. _site/
    cp -r cfn-tools/static/. _site/cfn-tools/
    mkdir -p _site/my-tool          # add this
    cp -r my-tool/static/. _site/my-tool/  # and this
```

### 3. Add a card to the landing page

In `site/index.html`, add a card inside the `<section class="grid">`:

```html
<a class="card" href="my-tool/">
  <div class="card-icon">&#128736;</div>
  <div class="card-body">
    <h2>My Tool</h2>
    <p>One sentence description of what it does.</p>
    <ul class="card-tags">
      <li>Tag</li>
    </ul>
  </div>
  <div class="card-arrow">&#8594;</div>
</a>
```

## Adding a new tool to cfn-tools

Tools are defined in `cfn-tools/static/js/app.js` in the `TOOLS` array. Each entry needs:

```js
{
  id: 'my-tool',
  label: 'My Tool',
  description: 'One sentence shown in the toolbar.',
  inputs: ['template'],        // or ['templateA', 'templateB'] for diff-style
  options: [                   // optional
    { id: 'myFlag', label: 'Some option', type: 'checkbox' },
  ],
  run(inputs, opts) {
    return RainWasm.callTool('rainMyFunction', inputs.template, opts);
  },
},
```

To expose a new Go function, add it to `cfn-tools/wasm/main.go`, register it in `main()`, then run `make build` from `cfn-tools/`.

## Rebuilding the WASM binary

```bash
cd cfn-tools
make build   # compiles wasm + copies wasm_exec.js
make serve   # local dev server on :8080
```

The compiled `main.wasm` and `wasm_exec.js` are committed to `cfn-tools/static/assets/` so the site deploys without a build step in CI.
