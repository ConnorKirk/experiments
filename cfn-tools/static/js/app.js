const TOOLS = [
  {
    id: 'format',
    label: 'Format',
    description: 'Re-format a CloudFormation template with canonical element ordering.',
    inputs: ['template'],
    options: [{ id: 'unsorted', label: 'Preserve key order', type: 'checkbox' }],
    run(inputs, opts) {
      return RainWasm.callTool('rainFormat', inputs.template, { unsorted: !!opts.unsorted });
    },
  },
  {
    id: 'convert-json',
    label: 'Convert to JSON',
    description: 'Convert a YAML CloudFormation template to JSON.',
    inputs: ['template'],
    run(inputs) {
      return RainWasm.callTool('rainConvert', inputs.template, 'json');
    },
  },
  {
    id: 'convert-yaml',
    label: 'Convert to YAML',
    description: 'Convert a JSON CloudFormation template to YAML.',
    inputs: ['template'],
    run(inputs) {
      return RainWasm.callTool('rainConvert', inputs.template, 'yaml');
    },
  },
  {
    id: 'validate',
    label: 'Validate',
    description: 'Check if a template is syntactically valid and well-formed.',
    inputs: ['template'],
    run(inputs) {
      return RainWasm.callTool('rainValidate', inputs.template);
    },
  },
  {
    id: 'diff',
    label: 'Diff',
    description: 'Show structural differences between two CloudFormation templates.',
    inputs: ['templateA', 'templateB'],
    options: [{ id: 'long', label: 'Show unchanged elements', type: 'checkbox' }],
    run(inputs, opts) {
      return RainWasm.callTool('rainDiff', inputs.templateA, inputs.templateB, { long: !!opts.long });
    },
  },
  {
    id: 'tree',
    label: 'Dependency Tree',
    description: 'Show dependencies between Parameters, Resources, and Outputs.',
    inputs: ['template'],
    run(inputs) {
      return RainWasm.callTool('rainTree', inputs.template);
    },
  },
];

let activeTool = TOOLS[0];

function $(id) { return document.getElementById(id); }

function buildToolNav() {
  const nav = $('tool-list');
  TOOLS.forEach(tool => {
    const btn = document.createElement('button');
    btn.className = 'tool-btn' + (tool === activeTool ? ' active' : '');
    btn.dataset.toolId = tool.id;
    btn.textContent = tool.label;
    btn.addEventListener('click', () => selectTool(tool));
    nav.appendChild(btn);
  });
}

function selectTool(tool) {
  activeTool = tool;

  // Update nav active state
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.toolId === tool.id);
  });

  // Update header
  $('tool-title').textContent = tool.label;
  $('tool-description').textContent = tool.description;

  // Show/hide second input
  const needsTwo = tool.inputs.includes('templateB');
  $('input-templateB').classList.toggle('hidden', !needsTwo);
  $('input-template').querySelector('label span').textContent =
    needsTwo ? 'Template A' : 'CloudFormation Template';

  // Render options
  const optsContainer = $('tool-options');
  optsContainer.innerHTML = '';
  (tool.options || []).forEach(opt => {
    const label = document.createElement('label');
    label.className = 'option-label';
    const cb = document.createElement('input');
    cb.type = opt.type;
    cb.id = 'opt-' + opt.id;
    label.appendChild(cb);
    label.appendChild(document.createTextNode(' ' + opt.label));
    optsContainer.appendChild(label);
  });

  // Clear output
  $('output-section').classList.add('hidden');
  $('error-banner').classList.add('hidden');
}

function getOptions() {
  const opts = {};
  (activeTool.options || []).forEach(opt => {
    const el = $('opt-' + opt.id);
    if (el) opts[opt.id] = el.type === 'checkbox' ? el.checked : el.value;
  });
  return opts;
}

function runTool() {
  const inputs = {
    template: $('textarea-template').value.trim(),
    templateA: $('textarea-template').value.trim(),
    templateB: $('textarea-templateB').value.trim(),
  };

  const required = activeTool.inputs.includes('templateB')
    ? [inputs.templateA, inputs.templateB]
    : [inputs.template];

  if (required.some(v => !v)) {
    showError('Please provide all required template inputs.');
    return;
  }

  let result;
  try {
    result = activeTool.run(inputs, getOptions());
  } catch (e) {
    showError(e.message);
    return;
  }

  if (result.error) {
    showError(result.error);
  } else {
    showOutput(result.output);
  }
}

function showOutput(text) {
  $('error-banner').classList.add('hidden');
  $('output-code').textContent = text;
  $('output-section').classList.remove('hidden');
}

function showError(msg) {
  $('error-banner').textContent = msg;
  $('error-banner').classList.remove('hidden');
  $('output-code').textContent = '';
  $('output-section').classList.remove('hidden');
}

function setupFileUpload(inputId, textareaId) {
  const btn = $(inputId + '-upload-btn');
  const fileInput = $(inputId + '-file');
  const textarea = $(textareaId);

  btn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => { textarea.value = e.target.result; };
    reader.readAsText(file);
    fileInput.value = '';
  });
}

function setupCopyButton() {
  $('copy-btn').addEventListener('click', () => {
    const text = $('output-code').textContent;
    navigator.clipboard.writeText(text).then(() => {
      const btn = $('copy-btn');
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildToolNav();
  selectTool(activeTool);

  $('run-btn').addEventListener('click', runTool);
  setupFileUpload('template', 'textarea-template');
  setupFileUpload('templateB', 'textarea-templateB');
  setupCopyButton();

  RainWasm.onReady(() => {
    $('wasm-status').textContent = 'Ready';
    $('wasm-status').className = 'status-ready';
    $('run-btn').disabled = false;
  });

  RainWasm.init('assets/main.wasm').catch(err => {
    $('wasm-status').textContent = 'Failed to load: ' + err.message;
    $('wasm-status').className = 'status-error';
  });
});
