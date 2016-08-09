"use strict";

var starts = ["\\newcommand",
              "\\renewcommand",
              "\\DeclareRobustCommand",
              "\\defSpecFun"];

function findBracketSections(string) {
    return string.match(/\{[^\{\}]*?(([^\}]*)\}+)*?[^\{\}]*?\}|\[[^\[\]]*?(([^\]]*)\]+)*?[^\[\]]*?\]/g).map(function(s) {
        return [s.substring(1, s.length - 1), s.charAt(0)];
    });
}

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
    if (sections.length === 0) {
        var commands = definition.match(/\\[a-zA-Z]+/g);
        cmds[commands[0]] = commands[1];
    }
    else if (sections.length === 1) {
        var cmd = definition.replace(new RegExp(sections[0][0].replace(/\\/g, "\\\\"), 'g'), "").match(/\\[a-zA-Z]+/)[0];
        if (definition.indexOf(cmd) === 0) {
            cmds[cmd] = sections[0][0];
        }
        else {
            cmds[sections[0][0]] = cmd;
        }
    }
    else if (sections.length === 2) {
        if (sections[0][1] !== "[") {
            cmds[sections[0][0]] = sections[1][0];
        }
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
    var command = findFirst(line, starts, 0);
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

module.exports = function(inp, cmds) {
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
