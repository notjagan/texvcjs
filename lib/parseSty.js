"use strict";

var balanced = require("balanced-match");

var declarationCommands = ["\\newcommand",
                           "\\renewcommand",
                           "\\DeclareRobustCommand",
                           "\\defSpecFun"];

var findBracketSections = module.exports.findBracketSections = function(string, sections) {
    if (typeof sections === "undefined") {
        sections = [];
    }
    var bracket = balanced("[", "]", string);
    var brace = balanced("{", "}", string);
    if (typeof brace !== "undefined" && (typeof brace !== undefined || brace.start < bracket.start)) {
        sections.push([brace.body, "{"]);
        return findBracketSections(brace.post, sections);
    }
    else if (typeof bracket !== "undefined") {
        sections.push([bracket.body, "["]);
        return findBracketSections(bracket.post, sections);
    }
    return sections;
};

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

function parseNewCommand(definition, command, cmds) {
    definition = definition.substring(command.length);
    var sections = findBracketSections(definition);
    switch (sections.length) {
        case 0:
            var commands = definition.match(/\\[a-zA-Z]+/g);
            cmds[commands[0]] = commands[1];
            break;
        case 1:
            var cmd = definition.replace(new RegExp(sections[0][0].replace(/\\/g, "\\\\"), 'g'), "").match(/\\[a-zA-Z]+/)[0];
            if (definition.indexOf(cmd) === 0) {
                cmds[cmd] = sections[0][0];
            }
            else {
                cmds[sections[0][0]] = cmd;
            }
            break;
        case 2:
            if (sections[0][1] !== "[") {
                cmds[sections[0][0]] = sections[1][0];
            }
            break;
        default:
            throw "Invalid new command declaration.";
    }
}

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

module.exports.parseSty = function(inp, cmds) {
    if (typeof cmds === "undefined") {
        cmds = {};
    }
    inp = inp.replace(/\n+/g, "\n").replace(/^\n|\n^/g, "");
    var lines = inp.split("\n");
    var lineno = 0;
    while (lineno < lines.length) {
        lineno += parseLine(lines.slice(lineno), cmds);
    }
    return cmds;
};
