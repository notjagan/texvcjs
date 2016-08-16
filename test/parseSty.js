"use strict";

var assert = require("assert");
var parseSty = require("../lib/parseSty");
var fs = require("fs");
var path = require("path");

var returnCases = [
    {
        func: parseSty.findBracketSections,
        should: "find bracket sections in",
        input: [ "\\newcommand{\\test}{\\Te}[0]" ],
        output: [
            ["\\test", "{"],
            ["\\Te", "{"],
            ["0", "["]
        ]
    },
    {
        func: parseSty.findFirst,
        should: "find the first item in",
        input: [
            "\\newcommand\\DeclareRobustCommand", [ "\\newcommand", "\\DeclareRobustCommand" ], 0
        ],
        output: [ 0, "\\newcommand"]
    },
    {
        func: parseSty.findFirst,
        should: "find the first item in",
        input: [
            "\\newcommand\\DeclareRobustCommand", [ "\\newcommand", "\\DeclareRobustCommand" ], 2
        ],
        output: [ 11, "\\DeclareRobustCommand"]
    },
    {
        func: parseSty.bracketBalance,
        should: "find the bracket level for",
        input: [ "(( test ) [" ],
        output: 2
    },
    {
        func: parseSty.parseSty,
        should: "parse the .sty file",
        input: [ fs.readFileSync(path.join(__dirname, 'parseSty.sty'), 'utf8') ],
        output: {
            "\\testA": "\\TeA",
            "\\testB": "\\TeB",
            "\\testC": "\\TeC",
            "\\testD": "\\mbox{\\TeD}"
        }
    }
];

var inPlaceTests = [
    {
        func: parseSty.parseNewCommand,
        should: "parse the declaration ",
        input: [ "\\newcommand\\testA{\\TeA}" , "\\newcommand" ],
        array: { "\\testB": "\\TeB" },
        result: {
            "\\testB": "\\TeB",
            "\\testA": "\\TeA"
        }
    },
    {
        func: parseSty.parseNewCommand,
        should: "parse the declaration ",
        input: [ "\\renewcommand{\\testC}{\\mbox{\\TeC}}" , "\\renewcommand" ],
        array: {},
        result: { "\\testC": "\\mbox{\\TeC}" }
    },
    {
        func: parseSty.parseLine,
        should: "parse first declaration",
        input: [
            [
                "\\DeclareRobustCommand{\\test}{\\Te}",
                "\\ProvidesPackage{test}"
            ]
        ],
        array: {},
        result: { "\\test": "\\Te" }
    },
    {
        func: parseSty.parseLine,
        should: "parse first declaration",
        input: [
            [
                "\\newcommand{\\testD}{\\mbox{",
                "\t\\TeD}} % comment"
            ]
        ],
        array: { "\\testC": "\\TeC" },
        result: {
            "\\testC": "\\TeC",
            "\\testD": "\\mbox{\\TeD}"
        }
    }
];

describe('ParseSty', function() {
    returnCases.forEach(function(tc) {
        it('should ' + tc.should + JSON.stringify(tc.input).replace(/^/g, "\t"), function() {
            assert.deepEqual(tc.func.apply(this, tc.input), tc.output);
        });
    });
    inPlaceTests.forEach(function(tc) {
        it('should ' + tc.should + JSON.stringify(tc.input).replace(/^/g, "\t"), function() {
            tc.func.apply(this, tc.input.concat([tc.array]));
            assert.deepEqual(tc.array, tc.result);
        });
    });
    it('should throw an error for an invalid declaration', function() {
        assert.throws(function() {
            parseSty.newCommand("\\newcommand\\test\\test\\test", "\\newcommand", {});
        }, function(err) { return err instanceof Error; });
    });
});
