module cfn-tools/wasm

go 1.26.2

require github.com/aws-cloudformation/rain v1.24.4

require (
	github.com/chzyer/readline v1.5.1 // indirect
	github.com/gookit/color v1.6.0 // indirect
	github.com/nathan-fiscaletti/consolesize-go v0.0.0-20260406063853-3bac975de715 // indirect
	github.com/xo/terminfo v0.0.0-20220910002029-abceb7e1c41e // indirect
	golang.org/x/sys v0.43.0 // indirect
	golang.org/x/term v0.42.0 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
)

replace (
	github.com/chzyer/readline => ./stubs/readline
	github.com/nathan-fiscaletti/consolesize-go => ./stubs/consolesize-go
)
