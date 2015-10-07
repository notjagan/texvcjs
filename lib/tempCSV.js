"use strict";

var all_functions = module.exports.all_functions = Object.create(null);
all_functions['\\begin'] = all_functions['\\end'] = true;

var arr2set = function(a) {
    var set = Object.create(null);
    a.forEach(function(v) {
        console.assert(!set[v], v);
        set[v] = all_functions[v] = true;
    });
    return set;
};