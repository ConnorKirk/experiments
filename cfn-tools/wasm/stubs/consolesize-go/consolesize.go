package consolesize

// GetConsoleSize returns 0, 0 in WASM environments (no terminal).
func GetConsoleSize() (int, int) {
	return 0, 0
}
