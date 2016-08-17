"use strict";

var balanced = require("balanced-match");

var declarationCommands = ["\\newcommand",
                           "\\renewcommand",
                           "\\DeclareRobustCommand",
                           "\\defSpecFun"];
/**
 * Returns a two dimensional array, where each element contains the body of a bracket section and the type of bracket
 * that surrounds it. Makes use of the npm balanced-match module.
 * E.g.: [ [ "in brackets", "[" ], [ "in braces", "{" ] ]
 *
 * @param {string} string - The string to parse.
 * @param {Array[]=[]} sections - The bracket sections that have already been parsed.
 * @returns {Array[]} An array of bracket sections, each containing a body and the type of bracket.
 */
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

/**
 * Finds the first occurrence in the provided string of the earliest occurring item in the given array, starting from
 * a specified index. Returns both the index of occurrence and the relevant item of subs (returns -1 and the first item
 * if none of the provided substrings can be found).
 *
 * @param {string} search - The string to search.
 * @param {string[]} substrings - All items to search for.
 * @param {number} start - The index to start searching at.
 * @returns {Array} The index of the first matching item and the item itself as an array.
 */
var findFirst = module.exports.findFirst = function(search, substrings, start) {
    var min = -1;
    var index;
    var first = substrings[0];
    for (var i in substrings) {
        index = search.indexOf(substrings[i], start);
        if ((index !== -1) && (index < min || min === -1)) {
            min = index;
            first = substrings[i];
        }
        if (min === 0) {
            break;
        }
    }
    return [min, first];
};

/**
 * Parses a command declaration of form \newcommand (or \renewcommand) followed by a command and its replacement. If the
 * declaration is valid, an association is added in cmds between the command string and its replacement. Otherwise, an
 * error is thrown stating that the declaration is invalid and also providing the declaration in question.
 *
 * @param {string} declaration - The replacement declaration.
 * @param {string} command - The command used to call the declaration (\newcommand or \renewcommand).
 * @param {Object} cmds - An associative array between commands and their respective replacements.
 */
var parseNewCommand = module.exports.parseNewCommand = function(declaration, command, cmds) {
    // Creates a variable for the declaration without either \newcommand or \renewcommand.
    var definition = declaration.substring(command.length);
    var sections = findBracketSections(definition);
    switch (sections.length) {
        // \newcommand\command\replacement
        case 0:
            // /\\[a-zA-Z]+/ depends on the alphabetic restrictions on a LaTeX command name.
            var commands = definition.match(/\\[a-zA-Z]+/g);
            cmds[commands[0]] = commands[1];
            break;
        case 1:
            // Finds a command preceded directly by an end bracket.
            var replacement = definition.match(/\}\\[a-zA-Z]+/);
            // \newcommand{\command}\replacement: if such a command exists
            if (replacement !== null) {
                cmds[sections[0][0]] = replacement[0].substring(1);
            }
            // \newcommand\command{\replacement}: if there is no command preceded by an end bracket
            else {
                // It instead matches a command followed a start bracket.
                var cmd = definition.match(/\\[a-zA-Z]+(?=\{)/);
                cmds[cmd[0]] = sections[0][0];
            }
            break;
        case 2:
            // \newcommand{\command}{\replacement}
            if (sections[0][1] !== "[") {
                cmds[sections[0][0]] = sections[1][0];
            }
            break;
        default:
            throw new Error("Invalid new command declaration " + declaration + ".");
    }
};

/**
 * Finds the net level of brackets, braces, parentheses.
 * ([]) -> 0, [[] -> 1, }} -> -2, etc.
 *
 * @param {string} string - The string to find the balance of.
 * @returns {number} The net level of brackets in the string.
 */
var bracketBalance = module.exports.bracketBalance = function(string) {
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
};

/**
 * Parses the first command declaration of the lines provided. Takes the lines of .sty from the point to start parsing
 * forward. This is due to some declarations taking multiple lines. Since the number of lines used by parsing a single
 * declaration is indeterminate, the function returns the number of lines used for the parsing the first declaration.
 *
 * @param {string[]} lines - The lines of the .sty, starting with the first to be parsed.
 * @param {Object} cmds - An associative array between commands and their respective replacements.
 * @returns {number} The number of lines used in parsing the declaration.
 */
var parseLine = module.exports.parseLine = function(lines, cmds) {
    // Removes comments from the line.
    var line = lines[0].match(/([^\\%]|\\.|^)+/g)[0].trim();
    var offset = 1;
    var command = findFirst(line, declarationCommands, 0);
    var balance = bracketBalance(line);
    while (offset < lines.length && (balance !== 0 || lines[offset].charAt(0) !== "\\")) {
        lines[offset] = lines[offset].match(/([^\\%]|\\.|^)+/g)[0].trim();
        balance += bracketBalance(lines[offset]);
        line += lines[offset];
        offset++;
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
    return offset;
};

/**
 * Parses the entirety of a .sty file, returning the associative array of command replacements it finds in declarations.
 *
 * @param {string} inp - A .sty file's text.
 * @param {Object={}} cmds - An associative array between commands and their respective replacements.
 * @returns {Object} An associative array between commands and their respective replacements.
 */
module.exports.parseSty = function(inp, cmds) {
    if (!cmds) {
        cmds = {};
    }
    // Removes repeating newlines and trailing whitespace.
    inp = inp.replace(/(\r?\n)+/g, "\n").trim();
    var lines = inp.split("\n");
    var lineno = 0;
    while (lineno < lines.length) {
        lineno += parseLine(lines.slice(lineno), cmds);
    }
    return cmds;
};
