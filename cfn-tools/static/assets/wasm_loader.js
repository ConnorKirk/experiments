const RainWasm = (() => {
  let ready = false;
  const readyCallbacks = [];
  const errorCallbacks = [];

  async function init(wasmPath = 'assets/main.wasm') {
    const go = new Go();

    let result;
    if (typeof WebAssembly.instantiateStreaming === 'function') {
      result = await WebAssembly.instantiateStreaming(fetch(wasmPath), go.importObject);
    } else {
      const resp = await fetch(wasmPath);
      const bytes = await resp.arrayBuffer();
      result = await WebAssembly.instantiate(bytes, go.importObject);
    }

    go.run(result.instance);

    // Wait one tick for Go's main() to register global functions
    await new Promise(resolve => setTimeout(resolve, 0));

    ready = true;
    readyCallbacks.forEach(cb => cb());
  }

  function onReady(cb) {
    if (ready) cb();
    else readyCallbacks.push(cb);
  }

  function callTool(fnName, ...args) {
    if (!ready) throw new Error('WASM not initialized');
    if (typeof window[fnName] !== 'function') {
      throw new Error(`WASM function ${fnName} not available`);
    }
    return window[fnName](...args);
  }

  return { init, onReady, callTool };
})();
