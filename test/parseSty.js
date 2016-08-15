"use strict";

var assert = require("assert");
var parseSty = require("../lib/parseSty");
var fs = require("fs");
var path = require("path");

var testCases = [
    {
        func: parseSty.findBracketSections,
        input: [ "\\newcommand{\\test}{\\Te}[0]" ],
        output: [
            ["\\test", "{"],
            ["\\Te", "{"],
            ["0", "["]
        ]
    },
    {
        func: parseSty.findFirst,
        input: [
            "\\newcommand\\DeclareRobustCommand", [ "\\newcommand", "\\DeclareRobustCommand" ], 0
        ],
        output: [ 0, "\\newcommand"]
    },
    {
        func: parseSty.findFirst,
        input: [
            "\\newcommand\\DeclareRobustCommand", [ "\\newcommand", "\\DeclareRobustCommand" ], 2
        ],
        output: [ 11, "\\DeclareRobustCommand"]
    },
    {
        func: parseSty.bracketBalance,
        input: [ "(( test ) [" ],
        output: 2
    },
    {
        func: parseSty.parseSty,
        input: [ fs.readFileSync(path.join(__dirname, 'parseSty.sty'), 'utf8') ],
        output: {
            "\\testA": "\\TeA",
            "\\testB": "\\TeB",
            "\\testC": "\\TeC",
            "\\testD": "\\mbox{\\TeD}"
        }
    }
];

describe('ParseSty', function() {
    testCases.forEach(function(tc) {
        it(JSON.stringify(tc.input).replace(/^/g, "\t"), function() {
            assert.deepEqual(tc.func.apply(this, tc.input), tc.output);
        });
    });
});
