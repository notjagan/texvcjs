"use strict";

module.exports.readCSV = function() {
    var fs = require('fs');
    var path = require('path');

    var filePathwrite = path.join(__dirname, 'tempCSV.js');
    var filePathread = path.join(__dirname, 'optionalFunctions.csv');
    var info = fs.readFileSync(filePathread, 'utf8', function(err, data) {
        if (err) {
            console.log(err);
        }
        console.log(data);
    });
    //var writeString = fs.readFileSync('./tempCSV.js', 'utf8', function(err, data) {
    //    if (err) throw err;
    //    console.log(data);
    //});
    var writeString = "\"use strict\";\n\n" +
                      "var all_functions = module.exports.all_functions = Object.create(null);\n" +
                      "all_functions['\\\\begin'] = all_functions['\\\\end'] = true;\n\n" +
                      "var arr2set = function(a) {\n" +
                      "    var set = Object.create(null);\n" +
                      "    a.forEach(function(v) {\n" +
                      "        console.assert(!set[v], v);\n" +
                      "        set[v] = all_functions[v] = true;\n" +
                      "    });\n    return set;\n};";
    info = info.split("\n");
    var c = 1;
    writeString = writeString + "\n\nmodule.exports." + info[0] + " = arr2set([\n";
    while (c < info.length - 1) {
        writeString = writeString + "    \"\\" + info[c] + "\",\n";
        c++;
    }
    writeString = writeString + "    \"\\" + info[c] + "\"\n]);";
    fs.writeFileSync(filePathwrite, writeString);
    fs.close;
};