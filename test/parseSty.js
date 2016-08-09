"use strict";

var assert = require("assert");
var parseSty = require("../lib/parseSty");
var fs = require("fs");
var path = require("path");

var testCases = [
    {
        input: "\\newcommand{\\test}{\\Te}[0]",
        output: [
            ["\\test", "{"],
            ["\\Te", "{"],
            ["0", "["]
        ],
        func: parseSty.findBracketSections
    },
    {
        input: fs.readFileSync(path.join(__dirname, 'parseSty.sty'), 'utf8'),
        output: {
            "\\testA": "\\TeA",
            "\\testB": "\\TeB",
            "\\testC": "\\TeC",
            "\\testD": "\\mbox{\\TeD}"
        },
        func: parseSty.parseSty
    }
];

describe('ParseSty', function() {
    testCases.forEach(function(tc) {
        it('should identify commands in \n' + tc.input.replace(/^/gm, '\t'), function() {
            assert.deepEqual(tc.func(tc.input), tc.output);
        });
    });
});
