"use strict";

var json = require('../package.json');

module.exports = {
    name: json.name, // package name
    version: json.version // version # for this package
};

var tu = require('./texutil');
console.log("texutil loaded");
var Parser = require('./parser-copy');
console.log("parser loaded");
var render = module.exports.render = require('./render-copy');
console.log("render loaded");

module.exports.ast = require('./ast-copy');
console.log(module.exports.ast.hi);
module.exports.parse = Parser.parse.bind(Parser);
module.exports.SyntaxError = Parser.SyntaxError;

var astutil = require('./astutil-copy');
console.log("astutil loaded");
var contains_func = module.exports.contains_func = astutil.contains_func;

var check = module.exports.check = function(input, options) {
    /* status is one character:
     *  + : success! result is in 'output'
     *  E : Lexer exception raised
     *  F : TeX function not recognized
     *  S : Parsing error
     *  - : Generic/Default failure code. Might be an invalid argument,
     *      output file already exist, a problem with an external
     *      command ...
     */
    try {
        if( typeof options === "undefined" ){
            options = {};
            options.usemathrm = false;
            options.usmhchem = false;
            options.semanticlatex = false;
        }
        // allow user to pass a parsed AST as input, as well as a string
        if (typeof(input)==='string') {
            input = Parser.parse(input, {usemathrm:options.usemathrm, semanticlatex:options.semanticlatex});
        }
        console.log("hi");
        console.log(input);
        var output = render(input);
        console.log(output);
        var result = { status: '+', output: output };
        ['ams', 'cancel', 'color', 'euro', 'teubner', 'mhchem'].forEach(function(pkg) {
            pkg = pkg + '_required';
            result[pkg] = astutil.contains_func(input, tu[pkg]);
        });
        if (!options.usemhchem){
            if (result.mhchem_required){
                return {
                    status: 'C', details: "mhchem package required."
                };
            }
        }
        return result;
    } catch (e) {
        console.log(e);
        if (options && options.debug) {
            throw e;
        }
        if (e instanceof Parser.SyntaxError) {
            if (e.message === 'Illegal TeX function') {
                return {
                    status: 'F', details: e.found,
                    offset: e.offset, line: e.line, column: e.column
                };
            }
            return {
                status: 'S', details: e.toString(),
                offset: e.offset, line: e.line, column: e.column
            };
        }
        return { status: '-', details: e.toString() };
    }
};
