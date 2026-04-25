# CloudFormation Tools

Browser-based CloudFormation template tools powered by [rain](https://github.com/aws-cloudformation/rain) compiled to WebAssembly. Paste or upload a template and results appear instantly — nothing is sent to a server.

## Tools

| Tool | Description |
|------|-------------|
| **Format** | Re-format a template with canonical element ordering |
| **Convert to JSON** | Convert a YAML template to JSON |
| **Convert to YAML** | Convert a JSON template to YAML |
| **Validate** | Check a template is syntactically valid and well-formed |
| **Diff** | Show structural differences between two templates |
| **Dependency Tree** | Show dependencies between Parameters, Resources, and Outputs |

## Development

```bash
cd cfn-tools
make build   # compile WASM + copy wasm_exec.js
make serve   # local dev server on :8080
```

The compiled `main.wasm` is committed to `static/assets/` so the site works without a build step.
