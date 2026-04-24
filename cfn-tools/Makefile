GOROOT := $(shell go env GOROOT)
WASM_EXEC := $(GOROOT)/lib/wasm/wasm_exec.js

.PHONY: build wasm copy-runtime serve clean

build: wasm copy-runtime

wasm:
	cd wasm && GOOS=js GOARCH=wasm go build \
		-ldflags="-s -w" \
		-o ../static/assets/main.wasm .

copy-runtime:
	cp "$(WASM_EXEC)" static/assets/wasm_exec.js

serve:
	cd static && python3 -m http.server 8080

clean:
	rm -f static/assets/main.wasm static/assets/wasm_exec.js
