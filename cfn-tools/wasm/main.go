//go:build js && wasm

package main

import (
	"syscall/js"

	"github.com/aws-cloudformation/rain/cft/diff"
	"github.com/aws-cloudformation/rain/cft/format"
	"github.com/aws-cloudformation/rain/cft/graph"
	"github.com/aws-cloudformation/rain/cft/parse"
)

func main() {
	js.Global().Set("rainFormat", js.FuncOf(formatTemplate))
	js.Global().Set("rainConvert", js.FuncOf(convertTemplate))
	js.Global().Set("rainDiff", js.FuncOf(diffTemplates))
	js.Global().Set("rainTree", js.FuncOf(treeTemplate))
	js.Global().Set("rainValidate", js.FuncOf(validateTemplate))

	select {}
}

func formatTemplate(this js.Value, args []js.Value) any {
	if len(args) < 1 {
		return resultError("expected template string argument")
	}
	input := args[0].String()
	unsorted := len(args) > 1 && args[1].Truthy() && args[1].Get("unsorted").Bool()

	t, err := parse.String(input)
	if err != nil {
		return resultError("parse error: " + err.Error())
	}
	out := format.String(t, format.Options{JSON: false, Unsorted: unsorted})
	return resultOK(out)
}

func convertTemplate(this js.Value, args []js.Value) any {
	if len(args) < 1 {
		return resultError("expected template string argument")
	}
	t, err := parse.String(args[0].String())
	if err != nil {
		return resultError(err.Error())
	}
	toJSON := len(args) > 1 && args[1].String() == "json"
	out := format.String(t, format.Options{JSON: toJSON})
	return resultOK(out)
}

func diffTemplates(this js.Value, args []js.Value) any {
	if len(args) < 2 {
		return resultError("expected two template strings")
	}
	a, err := parse.String(args[0].String())
	if err != nil {
		return resultError("template A parse error: " + err.Error())
	}
	b, err := parse.String(args[1].String())
	if err != nil {
		return resultError("template B parse error: " + err.Error())
	}
	long := len(args) > 2 && args[2].Truthy() && args[2].Get("long").Bool()
	d := diff.New(a, b)
	return resultOK(d.Format(long))
}

func treeTemplate(this js.Value, args []js.Value) any {
	if len(args) < 1 {
		return resultError("expected template string argument")
	}
	t, err := parse.String(args[0].String())
	if err != nil {
		return resultError(err.Error())
	}
	g := graph.New(t)
	return resultOK(g.String())
}

func validateTemplate(this js.Value, args []js.Value) any {
	if len(args) < 1 {
		return resultError("expected template string argument")
	}
	input := args[0].String()
	t, err := parse.String(input)
	if err != nil {
		return resultError("Invalid template: " + err.Error())
	}
	formatted := format.CftToYaml(t)
	if verifyErr := parse.Verify(t, formatted); verifyErr != nil {
		return resultError("Verification failed: " + verifyErr.Error())
	}
	return resultOK("Template is valid and well-formed")
}

func resultOK(output string) map[string]any {
	return map[string]any{"output": output, "error": ""}
}

func resultError(msg string) map[string]any {
	return map[string]any{"output": "", "error": msg}
}
