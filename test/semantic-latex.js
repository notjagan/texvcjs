"use strict";
var assert = require('assert');
var texvcjs = require('../');

var fs = require('fs');
var path = require('path');


describe('Run test for all semantic LaTeX commands:', function () {
    this.timeout(0);
    // read test cases
    var formulae = require('./semantic-latex.json');
    // create a mocha test case for each chunk
    formulae.forEach(function (testcase) {
        if (testcase.ignore !== true) {
            it(testcase.id+"$"+testcase.input+"$", function () {
                var result = texvcjs.check(testcase.input,{semanticlatex:true});
                assert.equal(result.output, testcase.texvcjs,
                    JSON.stringify({
                        id: testcase.id,
                        output: result.output,
                        expected: testcase.texvcjs
                    }, null, 2));
            });
        }
    });
});

describe('Run test for parsing output for semantic LaTeX commands:', function() {
    this.timeout(0);
    //read test cases
    var formulae = require('./semantic-latex.json');
    //create mocha test case for each chunk
    formulae.forEach(function (testcase) {
        if (testcase.ignore !== true) {
            it(testcase.id+"$"+testcase.input+"$", function () {
                var result1 = texvcjs.check(testcase.input,{semanticlatex:true});
                var result2 = texvcjs.check(result1.output,{semanticlatex:true});
                assert.equal(result2.output, testcase.texvcjs,
                    JSON.stringify({
                        id: testcase.id,
                        output: result2.output,
                        expected: testcase.texvcjs
                    }, null, 2));
            });
        }
    });
});
