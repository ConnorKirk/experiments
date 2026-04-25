# Experiments

Browser-based tools and demos. Everything runs client-side — no backend required.

## Tools

### [CloudFormation Tools](cfn-tools/)

Powered by [rain](https://github.com/aws-cloudformation/rain) compiled to WebAssembly.

| Tool | Description |
|------|-------------|
| **Format** | Re-format a template with canonical element ordering |
| **Convert to JSON** | Convert a YAML template to JSON |
| **Convert to YAML** | Convert a JSON template to YAML |
| **Validate** | Check a template is syntactically valid and well-formed |
| **Diff** | Show structural differences between two templates |
| **Dependency Tree** | Show dependencies between Parameters, Resources, and Outputs |

Paste or upload a template and results appear instantly in the browser — nothing is sent to a server.

## Development

See [CLAUDE.md](CLAUDE.md) for how to add new experiments or tools.
