// Useful AST methods.
// "contains_func": returns true iff the given AST contains a reference to
//                  the specified function(s).
"use strict";

var ast = require("./ast-copy");

// like Array#some, but returns the non-falsy value, rather than the
// boolean constant `true`.
var some = function(array, testfunc) {
    var i, b;
    for (i=0; i<array.length; i++) {
        b = testfunc(array[i], i, array);
        if (b) { return b; } // return the non-falsy value
    }
    return false;
};

// Matches a string against an string, array, or set target.
// Returns the matching value, or `false`.
var match = function(target, str) {
    if (Array.isArray(target)) {
        return some(target, function(t) { return match(t, str); });
    }
    if (typeof(target)==='string') {
        return target === str ? str : false;
    }
    return target[str] ? str : false;
};

// Check if any of the array of AST nodes contains `target`.
var arr_contains_func = function(array, target) {
    return some(array, function(t) { return t.contains_func(target); });
};

/**
 * RenderT nodes can contain function references only in a few specific
 * forms, which we test for here.
 */
ast.RenderT.prototype.tex_contains_func = function(target) {
    var t = this.tex_part(), m;
    // may have trailing '(', '[', '\\{' or " "
    t = t.replace(/(\(|\[|\\{| )$/, '');
    // special case #1: \\operatorname {someword}
    m = /^\\operatorname\{([^\\]*)\}$/.exec(t);
    if (m) {
        return match(target, '\\operatorname');
    }
    // special case #2: \\mbox{\\somefunc}
    m = /^\\mbox\{(\\.*)\}$/.exec(t);
    if (m) {
        return match(target, '\\mbox') || match(target, m[1]);
    }
    // special case #3: \\color, \\pagecolor, \\definecolor
    m = /^(\\(color|pagecolor|definecolor))/.exec(t);
    if (m) {
        return match(target, m[1]);
    }
    // special case #4: \\mathbb, \\mathrm
    m = /^(\\math..) \{[^\\]*\}$/.exec(t);
    if (m) {
        return match(target, m[1]);
    }
    // protect against using random strings as keys in target
    return t.charAt(0) === '\\' && match(target, t);
};

// This defines a function of one argument, which becomes the first argument
// in the visitor functions.  The subsequent arguments in the definition
// are the fields of that particular AST class.
//
// The `target` provided can be a string, array, or object (which is used
// as a hash table).  It returns true if any of the array elements or
// object keys names a function referenced in the AST.
ast.Tex.defineVisitor("contains_func", {
    HarmonicNumber1: function(target, f, l1) {
	    return match(target, f) || l1.contains_func(target);
    },
    StieltjesConstants1: function(target, f, l1) {
	    return match(target, f) || l1.contains_func(target);
    },
    GenGegenbauer1: function(target, f, l1, l2, l3, k1) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || l3.contains_func(target) || k1.contains_func(target);
    },
    GenHermite1: function(target, f, l1, l2, k1) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || k1.contains_func(target);
    },
    qHyperrWs4: function(target, f, l1, l2, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    Jacobi1: function(target, f, l1, l2, l3, k1) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || l3.contains_func(target) || k1.contains_func(target);
    },
    normJacobiR1: function(target, f, l1, l2, l3, k1) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || l3.contains_func(target) || k1.contains_func(target);
    },
    ctsqUltrae2: function(target, f, l1, k1, k2, k3) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target);
    },
    JacksonqBesselI2: function(target, f, l1, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    JacksonqBesselII2: function(target, f, l1, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    JacksonqBesselIII2: function(target, f, l1, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    qderiv1: function(target, f, l1, l2, k1) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || k1.contains_func(target);
    },
    f3: function(target, f, l1, k1) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target);
    },
    poly2: function(target, f, l1, l2, k1) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || k1.contains_func(target);
    },
    Sum2: function(target, f, l1, l2, l3, k1) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || l3.contains_func(target) || k1.contains_func(target);
    },
    Prod2: function(target, f, l1, l2, l3, k1) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || l3.contains_func(target) || k1.contains_func(target);
    },
    AntiDer2: function(target, f, k1, k2) {
	    return match(target, f) || k1.contains_func(target) || k2.contains_func(target);
    },
    Int2: function(target, f, l1, l2, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    qexpKLS3: function(target, f, l1, k1) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target);
    },
    qExpKLS3: function(target, f, l1, k1) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target);
    },
    qsinKLS3: function(target, f, l1, k1) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target);
    },
    qSinKLS3: function(target, f, l1, k1) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target);
    },
    qcosKLS3: function(target, f, l1, k1) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target);
    },
    qCosKLS3: function(target, f, l1, k1) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target);
    },
    Wilson3: function(target, f, l1, k1, k2, k3, k4, k5) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target) || k5.contains_func(target);
    },
    normWilsonWtilde3: function(target, f, l1, k1, k2, k3, k4, k5) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target) || k5.contains_func(target);
    },
    monicWilson3: function(target, f, l1, k1, k2, k3, k4, k5) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target) || k5.contains_func(target);
    },
    Racah3: function(target, f, l1, k1, k2, k3, k4, k5) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target) || k5.contains_func(target);
    },
    monicRacah3: function(target, f, l1, k1, k2, k3, k4, k5) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target) || k5.contains_func(target);
    },
    ctsdualHahn3: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    normctsdualHahnStilde3: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    monicctsdualHahn3: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    ctsHahn3: function(target, f, l1, k1, k2, k3, k4, k5) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target) || k5.contains_func(target);
    },
    normctsHahnptilde3: function(target, f, l1, k1, k2, k3, k4, k5) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target) || k5.contains_func(target);
    },
    monicctsHahn3: function(target, f, l1, k1, k2, k3, k4, k5) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target) || k5.contains_func(target);
    },
    Hahn3: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    monicHahn3: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    dualHahn3: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    monicdualHahn3: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    MeixnerPollaczek2: function(target, f, l1, l2, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    monicMeixnerPollaczek3: function(target, f, l1, l2, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    monicJacobi1: function(target, f, l1, l2, l3, k1) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || l3.contains_func(target) || k1.contains_func(target);
    },
    monicUltra1: function(target, f, l1, l2, k1) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || k1.contains_func(target);
    },
    Ultra1: function(target, f, l1, l2, k1) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || k1.contains_func(target);
    },
    ChebyT1: function(target, f, l1, k1) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target);
    },
    ChebyU1: function(target, f, l1, k1) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target);
    },
    monicChebyT1: function(target, f, l1, k1) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target);
    },
    monicChebyU1: function(target, f, l1, k1) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target);
    },
    monicLegendrePoly1: function(target, f, l1, k1) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target);
    },
    pseudoJacobi2: function(target, f, l1, k1, k2, k3) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target);
    },
    monicpseudoJacobi3: function(target, f, l1, k1, k2, k3) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target);
    },
    Meixner2: function(target, f, l1, k1, k2, k3) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target);
    },
    monicMeixner2: function(target, f, l1, k1, k2, k3) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target);
    },
    Krawtchouk2: function(target, f, l1, k1, k2, k3) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target);
    },
    monicKrawtchouk3: function(target, f, l1, k1, k2, k3) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target);
    },
    Laguerre1: function(target, f, l1, l2, k1) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || k1.contains_func(target);
    },
    monicLaguerre1: function(target, f, l1, l2, k1) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || k1.contains_func(target);
    },
    BesselPoly2: function(target, f, l1, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    monicBesselPoly3: function(target, f, l1, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    Hermite1: function(target, f, l1, k1) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target);
    },
    Charlier2: function(target, f, l1, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    monicCharlier3: function(target, f, l1, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    monicHermite1: function(target, f, l1, k1) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target);
    },
    AskeyWilson2: function(target, f, l1, k1, k2, k3, k4, k5, k6) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target) || k5.contains_func(target) || k6.contains_func(target);
    },
    normAskeyWilsonptilde3: function(target, f, l1, k1, k2, k3, k4, k5, k6) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target) || k5.contains_func(target) || k6.contains_func(target);
    },
    monicAskeyWilson3: function(target, f, l1, k1, k2, k3, k4, k5, k6) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target) || k5.contains_func(target) || k6.contains_func(target);
    },
    qRacah3: function(target, f, l1, k1, k2, k3, k4, k5, k6) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target) || k5.contains_func(target) || k6.contains_func(target);
    },
    monicqRacah3: function(target, f, l1, k1, k2, k3, k4, k5, k6) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target) || k5.contains_func(target) || k6.contains_func(target);
    },
    normctsdualqHahnptilde3: function(target, f, l1, k1, k2, k3, k4, k5) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target) || k5.contains_func(target);
    },
    ctsdualqHahn2: function(target, f, l1, k1, k2, k3, k4, k5) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target) || k5.contains_func(target);
    },
    monicctsdualqHahn3: function(target, f, l1, k1, k2, k3, k4, k5) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target) || k5.contains_func(target);
    },
    normctsqHahnptilde3: function(target, f, l1, k1, k2, k3, k4, k5, k6) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target) || k5.contains_func(target) || k6.contains_func(target);
    },
    ctsqHahn2: function(target, f, l1, k1, k2, k3, k4, k5, k6) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target) || k5.contains_func(target) || k6.contains_func(target);
    },
    monicctsqHahn3: function(target, f, l1, k1, k2, k3, k4, k5, k6) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target) || k5.contains_func(target) || k6.contains_func(target);
    },
    bigqJacobi2: function(target, f, l1, k1, k2, k3, k4, k5) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target) || k5.contains_func(target);
    },
    monicbigqJacobi3: function(target, f, l1, k1, k2, k3, k4, k5) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target) || k5.contains_func(target);
    },
    bigqJacobiIVparam2: function(target, f, l1, k1, k2, k3, k4, k5, k6) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target) || k5.contains_func(target) || k6.contains_func(target);
    },
    bigqLegendre2: function(target, f, l1, k1, k2, k3) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target);
    },
    monicbigqLegendre2: function(target, f, l1, k1, k2, k3) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target);
    },
    qHahn3: function(target, f, l1, k1, k2, k3, k4, k5) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target) || k5.contains_func(target);
    },
    monicqHahn3: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    dualqHahn3: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    monicdualqHahn3: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    AlSalamChihara3: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    qinvAlSalamChihara3: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    monicAlSalamChihara2: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    monicqinvAlSalamChihara3: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    qMeixnerPollaczek3: function(target, f, l1, k1, k2, k3) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target);
    },
    monicqMeixnerPollaczek3: function(target, f, l1, k1, k2, k3) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target);
    },
    normctsqJacobiPtilde2: function(target, f, l1, l2, l3, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || l3.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    ctsqJacobi2: function(target, f, l1, l2, l3, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || l3.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    monicctsqJacobi3: function(target, f, l1, l2, l3, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || l3.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    ctsqUltra2: function(target, f, l1, k1, k2, k3) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target);
    },
    monicctsqUltra3: function(target, f, l1, k1, k2, k3) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target);
    },
    ctsqLegendre2: function(target, f, l1, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    monicctsqLegendre3: function(target, f, l1, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    bigqLaguerre2: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    monicbigqLaguerre3: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    littleqJacobi2: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    moniclittleqJacobi3: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    littleqLegendre2: function(target, f, l1, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    moniclittleqLegendre3: function(target, f, l1, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    qMeixner3: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    monicqMeixner3: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    qtmqKrawtchouk3: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    monicqtmqKrawtchouk3: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    qKrawtchouk3: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    monicqKrawtchouk3: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    AffqKrawtchouk3: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    monicAffqKrawtchouk3: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    dualqKrawtchouk3: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    monicdualqKrawtchouk3: function(target, f, l1, k1, k2, k3, k4) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target);
    },
    ctsbigqHermite3: function(target, f, l1, k1, k2, k3) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target);
    },
    monicctsbigqHermite3: function(target, f, l1, k1, k2, k3) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target);
    },
    ctsqLaguerre3: function(target, f, l1, l2, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    monicctsqLaguerre3: function(target, f, l1, l2, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    littleqLaguerre3: function(target, f, l1, k1, k2, k3) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target);
    },
    moniclittleqLaguerre3: function(target, f, l1, k1, k2, k3) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target);
    },
    qLaguerre3: function(target, f, l1, l2, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    monicqLaguerre3: function(target, f, l1, l2, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    qBesselPoly3: function(target, f, l1, k1, k2, k3) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target);
    },
    monicqBesselPoly3: function(target, f, l1, k1, k2, k3) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target);
    },
    qCharlier3: function(target, f, l1, k1, k2, k3) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target);
    },
    monicqCharlier3: function(target, f, l1, k1, k2, k3) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target);
    },
    AlSalamCarlitzI3: function(target, f, l1, l2, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    monicAlSalamCarlitzI3: function(target, f, l1, l2, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    AlSalamCarlitzII3: function(target, f, l1, l2, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    monicAlSalamCarlitzII3: function(target, f, l1, l2, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    ctsqHermite3: function(target, f, l1, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    monicctsqHermite3: function(target, f, l1, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    StieltjesWigert3: function(target, f, l1, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    monicStieltjesWigert3: function(target, f, l1, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    discrqHermiteI3: function(target, f, l1, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    monicdiscrqHermiteI3: function(target, f, l1, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    discrqHermiteII3: function(target, f, l1, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    monicdiscrqHermiteII3: function(target, f, l1, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    ctsqJacobiRahman2: function(target, f, l1, l2, l3, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || l2.contains_func(target) || l3.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    ctsqLegendreRahman2: function(target, f, l1, k1, k2) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target);
    },
    pseudobigqJacobi2: function(target, f, l1, k1, k2, k3, k4, k5) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target) || k4.contains_func(target) || k5.contains_func(target);
    },
    GottliebLaguerre1: function(target, f, l1, k1) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target);
    },
    CiglerqChebyT2: function(target, f, l1, k1, k2, k3) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target);
    },
    CiglerqChebyU2: function(target, f, l1, k1, k2, k3) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target);
    },
    AlSalamIsmail2: function(target, f, l1, k1, k2, k3) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target);
    },
    ChebyV1: function(target, f, l1, k1) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target);
    },
    ChebyW1: function(target, f, l1, k1) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target);
    },
    NeumannFactor1: function(target, f, l1) {
	    return match(target, f) || l1.contains_func(target);
    },
    BesselPolyIIparam2: function(target, f, l1, k1, k2, k3) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target);
    },
    BesselPolyTheta2: function(target, f, l1, k1, k2, k3) {
	    return match(target, f) || l1.contains_func(target) || k1.contains_func(target) || k2.contains_func(target) || k3.contains_func(target);
    },
    Deriv2: function(target, f, k1, k2) {
	    return match(target, f) || k1.contains_func(target) || k2.contains_func(target);
    },
    DDeriv2: function(target, f, k1, k2) {
	    return match(target, f) || k1.contains_func(target) || k2.contains_func(target);
    },
    FourierTrans4: function(target, f, k1, k2) {
	    return match(target, f) || k1.contains_func(target) || k2.contains_func(target);
    },
    SpaceTestFunTempered2: function(target, f, k1) {
	    return match(target, f) || k1.contains_func(target);
    },
    FQ: function(target, base, down, up) {
        // base_down^up
        return base.contains_func(target) ||
            down.contains_func(target) || up.contains_func(target);
    },
    DQ: function(target, base, down) {
        // base_down
        return base.contains_func(target) || down.contains_func(target);
    },
    UQ: function(target, base, up) {
        // base^up
        return base.contains_func(target) || up.contains_func(target);
    },
    FQN: function(target, down, up) {
        // _down^up (no base)
        return down.contains_func(target) || up.contains_func(target);
    },
    DQN: function(target, down) {
        // _down (no base)
        return down.contains_func(target);
    },
    UQN: function(target, up) {
        // ^up (no base)
        return up.contains_func(target);
    },
    LITERAL: function(target, r) {
        // a TeX literal.  It may contain function invocations in
        // certain specific forms; see the tex_contains method above.
        return r.tex_contains_func(target);
    },
    PAREN1: function(target, f, a) {
        // {\f@{a}} (function of one argument, @ symbol indicates how to render the LaTeX)
        return match(target, f) || a.contains_func(target);
    },
    PAREN2: function(target, f, a) {
        // {\f@@{a}} (function of one argument, @ symbol indicates how to render LaTeX)
        return match(target, f) || a.contains_func(target);
    },
    QPOCH: function(target, a, b, c) {
        // \qPochhammer{a}{b}{c} (replaces (a;b)_c)
        return match(target, a) || a.contains_func(target) || b.contains_func(target);
    },
    POCH: function(target, a, b) {
        // \pochhammer{a}{b} (replaces (a)_b)
        return match(target, a) || a.contains_func(target);
    },
    FUN1: function(target, f, a) {
        // {\f{a}}  (function of one argument)
        return match(target, f) || a.contains_func(target);
    },
    FUN1nb: function(target, f, a) {
        // \f{a}  (function of one argument, "no braces" around outside)
        return match(target, f) || a.contains_func(target);
    },
    DECLh: function(target, f, _, a) {
        // {\rm a1 a2 a3 a4 ...}  where f is \rm, \it, \cal, or \bf
        return match(target, f) || arr_contains_func(a, target);
    },
    FUN2: function(target, f, a, b) {
        // {\f{a}{b}}  (function of two arguments)
        return match(target, f) ||
            a.contains_func(target) || b.contains_func(target);
    },
    FUN3: function(target, f, a, b, c) {
        // {\f{a}{b}{c}} (function of three arguments)
        return match(target,f) ||
            a.contains_func(target) || b.contains_func(target) || c.contains_func(target);
    },
    JACOBI: function(target, a, b, c, d) {
        // \Jacobi{a}{\b}{\c}@{d} (replaces P_a^{(b,c)}(d))
        return match(target, a) || a.contains_func(target) || b.contains_func(target) || c.contains_func(target) || d.contains_func(target);
    },
    LAGUERRE1: function(target, a, b) {
        // \Laguerre{a}@{b} (replaces L_a(b))
        return match(target, a) || a.contains_func(target) || b.contains_func(target);
    },
    LAGUERRE2: function(target, a, b, c) {
        // \Laguerre{a}[b]@{c} (replaces L_a^{b}(c))
        return match(target, a) || a.contains_func(target) || b.contains_func(target) || c.contains_func(target);
    },
    EJACOBI: function(target, a, b, c) {
        // \Jacobia@{b}{c} (replaces {\rm a}(b, c))
        return match(target, a) || b.contains_func(target) || c.contains_func(target);
    },
    FUN2nb: function(target, f, a, b) {
        // \f{a}{b}  (function of two arguments, "no braces" around outside)
        return match(target, f) ||
            a.contains_func(target) || b.contains_func(target);
    },
    FUN2sq: function(target, f, a, b) {
        // {\f[a]{b}}  (function of two arguments, first is optional)
        return match(target, f) ||
            a.contains_func(target) || b.contains_func(target);
    },
    CURLY: function(target, tl) {
        // { tl1 tl2 tl3 ... }
        return arr_contains_func(tl, target);
    },
    INFIX: function(target, s, ll, rl) {
        // { ll1 ll2 ... \s rl1 rl2 ... } (infix function)
        return match(target, s) ||
            arr_contains_func(ll, target) || arr_contains_func(rl, target);
    },
    BOX: function(target, box, s) {
        // \box{s} where box is \text, \mbox, \hbox, or \vbox
        //         and s is a string not containing special characters
        return match(target, box);
    },
    BIG: function(target, big, d) {
        // \big\d where big is \big, \Big, \bigg, \Bigg, \biggl, etc
        return match(target, big) || d.tex_contains_func(target);
    },
    MATRIX: function(target, t, m) {
        // \begin{env} .. & .. \\ .. & .. \\ .. & .. \end{env}
        // t is the environment name.
        // m is a doubly-nested array
        var expr_has = function(e) { return arr_contains_func(e, target); };
        var line_has = function(l) { return some(l, expr_has); };
        var matrix_has = function(m) { return some(m, line_has); };
        return match(target, '\\begin{'+t+'}') ||
            match(target, '\\end{'+t+'}') ||
            matrix_has(m);
    },
    LR: function(target, l, r, tl) {
        // \left\l tl1 tl2 tl3 ... \right\r  (a balanced pair of delimiters)
        return match(target, '\\left') || match(target, '\\right') ||
            l.tex_contains_func(target) || r.tex_contains_func(target) ||
            arr_contains_func(tl, target);
    }
}, 1);

// allow user to pass an unparsed TeX string, or a parsed AST (which will
// usually be an array of `ast.Tex`), or a low-level `ast.Tex` node.
module.exports.contains_func = function(t, target) {
    if (typeof(t) === 'string') {
        t = require('parser').parse(t);
    }
    if (Array.isArray(t)) {
        return arr_contains_func(t, target);
    }
    return t.contains_func(target);
};
