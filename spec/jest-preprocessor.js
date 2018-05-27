const path = require("path");
const tsc = require("typescript");

const rootDir = path.resolve(__dirname);
const compilerOptions = tsc.convertCompilerOptionsFromJson(require("../tsconfig"), rootDir);

function process(src, path) {
	if (path.endsWith(".ts")) {
		let tsResult = tsc.transpile(src, compilerOptions, path, []);
		return tsResult;
	}

	return src;
}

module.exports.process = process;