// Package readline provides a stub for WASM environments.
package readline

import (
	"errors"
	"io"
	"os"
)

const CharBell = 7

// Stdout is a no-op writer stub.
var Stdout = struct {
	io.Writer
	io.Closer
}{os.Stdout, io.NopCloser(nil).(io.Closer)}

// Config holds readline configuration.
type Config struct {
	Prompt string
}

// Instance is a readline instance stub.
type Instance struct{}

// NewEx creates a new readline instance (stub always returns error in WASM).
func NewEx(cfg *Config) (*Instance, error) {
	return nil, errors.New("readline not available in WASM")
}

// Readline reads a line of input (stub, never called in WASM).
func (i *Instance) Readline() (string, error) {
	return "", errors.New("readline not available in WASM")
}
