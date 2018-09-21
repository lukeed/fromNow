const fs = require('fs');
const mkdir = require('mk-dirs');
const { resolve } = require('path');
const { minify } = require('uglify-js');
const pretty = require('pretty-bytes');
const sizer = require('gzip-size');
const pkg = require('./package');

let data = fs.readFileSync('src/index.js', 'utf8');

mkdir('dist').then(_ => {
	// Copy as is for ESM
	fs.writeFileSync(pkg.module, data);

	// Mutate imports for CJS
	data = data.replace(/export default/, 'module.exports =');
	fs.writeFileSync(pkg.main, data);

	// Uglify & print gzip size
	const { code } = minify(data);
	const int = sizer.sync(code);
	console.log(`> gzip size: ${pretty(int)}`);

	// Write UMD bundle
	const name = 'fromNow';
	let UMD = `!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):e.${name}=t()}(this,function(){`;
	UMD += code.replace(/module.exports=/, 'return ') + '});';
	fs.writeFileSync(pkg.unpkg, UMD);
});
