"use strict";

var balanced = require("balanced-match");

var declarationCommands = ["\\newcommand",
                           "\\renewcommand",
                           "\\DeclareRobustCommand",
                           "\\defSpecFun"];

// Returns a two dimensional array, where each element contains the body of a bracket section and the type of bracket
// that surrounds it. Makes use of the npm balanced-match module.
// E.g.: [ [ "in brackets", "[" ], [ "in braces", "{" ] ]
var findBracketSections = module.exports.findBracketSections = function(string, sections) {
    if (!sections) {
        sections = [];
    }
    var bracket = balanced("[", "]", string);
    var brace = balanced("{", "}", string);
    if (brace && (!bracket || brace.start < bracket.start)) {
        sections.push([brace.body, "{"]);
        return findBracketSections(brace.post, sections);
    }
    else if (bracket) {
        sections.push([bracket.body, "["]);
        return findBracketSections(bracket.post, sections);
    }
    return sections;
};

// Finds the first occurrence in the provided string of the earliest occurring item in the given array, starting from
// a specified index. Returns both the index of occurrence and the relevant item of subs (returns -1 and the first item
// if none of the provided substrings can be found).
function findFirst(string, subs, start) {
    var min = -1;
    var index;
    var first = subs[0];
    for (var i = 0; i < subs.length; i++) {
        index = string.indexOf(subs[i], start);
        if ((index !== -1) && (index < min || min === -1)) {
            min = index;
            first = subs[i];
        }
    }
    return [min, first];
}

// Parses \newcommand .. ..
function parseNewCommand(definition, command, cmds) {
    definition = definition.substring(command.length);
    var sections = findBracketSections(definition);
    switch (sections.length) {
        // \newcommand\command1\command2
        case 0:
            var commands = definition.match(/\\[a-zA-Z]+/g);
            cmds[commands[0]] = commands[1];
            break;
        case 1:
            var cmd = definition.replace(new RegExp(sections[0][0].replace(/\\/g, "\\\\"), 'g'), "").match(/\\[a-zA-Z]+/)[0];
            // \newcommand\command1{\command2}
            if (definition.indexOf(cmd) === 0) {
                cmds[cmd] = sections[0][0];
            }
            // \newcommand{\command1}\command2
            else {
                cmds[sections[0][0]] = cmd;
            }
            break;
        case 2:
            // \newcommand{\command1}{\command2}
            if (sections[0][1] !== "[") {
                cmds[sections[0][0]] = sections[1][0];
            }
            break;
        default:
            throw "Invalid new command declaration.";
    }
}

// Finds the net level of brackets, braces, parentheses.
// ([]) -> 0, [[] -> 1, }} -> -2, etc.
function bracketBalance(string) {
    var balance = 0;
    var open = ["(", "[", "{"];
    for (var index in open) {
        balance += string.split(open[index]).length - 1;
    }
    var close = [")", "]", "}"];
    for (index in close) {
        balance -= string.split(close[index]).length - 1;
    }
    return balance;
}

// Parses the first command declaration of the lines provided.
function parseLine(lines, cmds) {
    var line = lines[0].match(/([^\\%]|\\.|^)+/g)[0].trim();
    var offset = 0;
    var command = findFirst(line, declarationCommands, 0);
    var balance = bracketBalance(line);
    while (balance !== 0 || (offset + 1 < lines.length && lines[offset + 1].charAt(0) !== "\\")) {
        offset++;
        balance += bracketBalance(lines[offset]);
        line += lines[offset];
    }
    line = line.replace(/\s/g, "");
    if (command[0] !== -1) {
        command = command[1];
        if (command === "\\newcommand" || command === "\\renewcommand") {
            parseNewCommand(line, command, cmds);
        }
        else if (command === "\\DeclareRobustCommand") {
            var sections = findBracketSections(line);
            if (sections[0][0] !== undefined && sections[1][0] !== undefined) {
                cmds[sections[0][0]] = sections[1][0];
            }
        }
    }
    return offset + 1;
}

// Parses the entirety of a .sty file, returning the associative array of command replacements it finds in declarations.
module.exports.parseSty = function(inp, cmds) {
    if (!cmds) {
        cmds = {};
    }
    inp = inp.replace(/(\r\n)+|\n+/g, "\n").replace(/^\n|\n^/g, "");
    var lines = inp.split("\n");
    var lineno = 0;
    while (lineno < lines.length) {
        lineno += parseLine(lines.slice(lineno), cmds);
    }
    return cmds;
};
