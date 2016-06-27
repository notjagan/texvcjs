// Render an AST.
"use strict";

var ast = require('./ast-copy');

ast.RenderT.defineVisitor("tex_part", {
    HTMLABLE: function(_,t,_2) { return t; },
    HTMLABLEM: function(_,t,_2) { return t; },
    HTMLABLEC: function(_,t,_2) { return t; },
    MHTMLABLEC: function(_,t,_2,_3,_4) { return t; },
    HTMLABLE_BIG: function(t,_) { return t; },
    TEX_ONLY: function(t) { return t; }
});


var render = module.exports = function render(e) {
    if (Array.isArray(e)) {
        return e.map(render).join('');
    }
    return e.render_tex();
};

var curlies = function(t) {
    switch (t.constructor) {
    // constructs which are surrounded by curlies
    case ast.Tex.CURLY:
    case ast.Tex.MATRIX:
        return t.render_tex();
    case String:
        break;
    default:
        t = t.render_tex();
    }
    return "{" + t + "}";
};

var render_curlies = function(a) {
    if (a.length === 1) {
        return curlies(a[0]);
    }
    return curlies(render(a));
};

ast.Tex.defineVisitor("render_tex", {
    HarmonicNumber1: function(l1) {
	    return "H_{" + l1 + "}";
    },
    StieltjesConstants1: function(l1) {
	    return "\\gamma_{" + l1 + "}";
    },
    GenGegenbauer1: function(l1, l2, l3, k1) {
	    return "S^{(" + l1 + "," + l2 + ")}_{" + l3 + "}";
    },
    GenHermite1: function(l1, l2, k1) {
	    return "H\\ifx." + l1 + ".\\else^{#1}\\fi_{" + l2 + "}";
    },
    qHyperrWs4: function(l1, l2, k1, k2, k3, k4) {
	    return "{{}_{" + l1 + "}W_{" + l2 + "}}" + "\\!\\left(" + k3 + "," + k4 + "\\right)";
    },
    Jacobi1: function(l1, l2, l3, k1) {
	    return "P^{(" + l1 + "," + l2 + ")}_{" + l3 + "}";
    },
    normJacobiR1: function(l1, l2, l3, k1) {
	    return "R^{(" + l1 + "," + l2 + ")}_{" + l3 + "}";
    },
    ctsqUltrae2: function(l1, k1, k2, k3) {
	    return "C_{" + l1 + "}" + "{\\!\\left[" + k1 + ";" + k2 + "\\,|\\," + k3 + "\\right]}";
    },
    JacksonqBesselI2: function(l1, k1, k2) {
	    return "J^{(1)}_{" + l1 + "}" + "\\!\\left(" + k1 + ";" + k2 + "\\right)";
    },
    JacksonqBesselII2: function(l1, k1, k2) {
	    return "J^{(2)}_{" + l1 + "}" + "\\!\\left(" + k1 + ";" + k2 + "\\right)";
    },
    JacksonqBesselIII2: function(l1, k1, k2) {
	    return "J^{(3)}_{" + l1 + "}" + "\\!\\left(" + k1 + ";" + k2 + "\\right)";
    },
    qderiv1: function(l1, l2, k1) {
	    return "\\mathcal{D}\\ifx." + l1 + ".\\else^{#1}\\fi_{" + l2 + "}";
    },
    f3: function(l1, k1) {
	    return "{" + l1 + "}" + "" + k1 + "";
    },
    poly2: function(l1, l2, k1) {
	    return "{" + l1 + "}_{" + l2 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    Sum2: function(l1, l2, l3, k1) {
	    return "\\sum_{" + l1 + "=" + l2 + "}^{" + l3 + "}" + "" + k1 + "";
    },
    Prod2: function(l1, l2, l3, k1) {
	    return "\\prod_{" + l1 + "=" + l2 + "}^{" + l3 + "}" + "" + k1 + "";
    },
    AntiDer2: function(k1, k2) {
	    return "\\int" + "" + k2 + "\\,{\\mathrm d}" + k1 + "";
    },
    Int2: function(l1, l2, k1, k2) {
	    return "\\int_{" + l1 + "}^{" + l2 + "}" + "{" + k2 + "}\\,{\\mathrm d}" + k1 + "";
    },
    qexpKLS3: function(l1, k1) {
	    return "\\mathrm{e}_{" + l1 + "}" + "" + k1 + "";
    },
    qExpKLS3: function(l1, k1) {
	    return "\\mathrm{E}_{" + l1 + "}" + "" + k1 + "";
    },
    qsinKLS3: function(l1, k1) {
	    return "\\mathrm{sin}_{" + l1 + "}" + "" + k1 + "";
    },
    qSinKLS3: function(l1, k1) {
	    return "\\mathrm{Sin}_{" + l1 + "}" + "" + k1 + "";
    },
    qcosKLS3: function(l1, k1) {
	    return "\\mathrm{cos}_{" + l1 + "}" + "" + k1 + "";
    },
    qCosKLS3: function(l1, k1) {
	    return "\\mathrm{Cos}_{" + l1 + "}" + "" + k1 + "";
    },
    Wilson3: function(l1, k1, k2, k3, k4, k5) {
	    return "W_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    normWilsonWtilde3: function(l1, k1, k2, k3, k4, k5) {
	    return "{\\tilde W}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicWilson3: function(l1, k1, k2, k3, k4, k5) {
	    return "{\\widehat W}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    Racah3: function(l1, k1, k2, k3, k4, k5) {
	    return "R_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicRacah3: function(l1, k1, k2, k3, k4, k5) {
	    return "{\\widehat R}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    ctsdualHahn3: function(l1, k1, k2, k3, k4) {
	    return "S_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    normctsdualHahnStilde3: function(l1, k1, k2, k3, k4) {
	    return "{\\tilde S}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicctsdualHahn3: function(l1, k1, k2, k3, k4) {
	    return "{\\widehat S}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    ctsHahn3: function(l1, k1, k2, k3, k4, k5) {
	    return "p_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    normctsHahnptilde3: function(l1, k1, k2, k3, k4, k5) {
	    return "{\\tilde p}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicctsHahn3: function(l1, k1, k2, k3, k4, k5) {
	    return "{\\widehat p}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    Hahn3: function(l1, k1, k2, k3, k4) {
	    return "Q_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicHahn3: function(l1, k1, k2, k3, k4) {
	    return "{\\widehat Q}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    dualHahn3: function(l1, k1, k2, k3, k4) {
	    return "R_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicdualHahn3: function(l1, k1, k2, k3, k4) {
	    return "{\\widehat R}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    MeixnerPollaczek2: function(l1, l2, k1, k2) {
	    return "P^{(" + l1 + ")}_{" + l2 + "}" + "\\!\\left(" + k1 + ";" + k2 + "\\right)";
    },
    monicMeixnerPollaczek3: function(l1, l2, k1, k2) {
	    return "{\\widehat P}^{(" + l1 + ")}_{" + l2 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicJacobi1: function(l1, l2, l3, k1) {
	    return "{\\widehat P}^{(" + l1 + "," + l2 + ")}_{" + l3 + "}";
    },
    monicUltra1: function(l1, l2, k1) {
	    return "{\\widehat C}^{" + l1 + "}_{" + l2 + "}";
    },
    Ultra1: function(l1, l2, k1) {
	    return "C^{" + l1 + "}_{" + l2 + "}";
    },
    ChebyT1: function(l1, k1) {
	    return "T_{" + l1 + "}";
    },
    ChebyU1: function(l1, k1) {
	    return "U_{" + l1 + "}";
    },
    monicChebyT1: function(l1, k1) {
	    return "{\\widehat T}_{" + l1 + "}";
    },
    monicChebyU1: function(l1, k1) {
	    return "{\\widehat U}_{" + l1 + "}";
    },
    monicLegendrePoly1: function(l1, k1) {
	    return "{\\widehat P}_{" + l1 + "}";
    },
    pseudoJacobi2: function(l1, k1, k2, k3) {
	    return "P_{" + l1 + "}" + "\\!\\left(" + k1 + ";" + k2 + "," + k3 + "\\right)";
    },
    monicpseudoJacobi3: function(l1, k1, k2, k3) {
	    return "{\\widehat P}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    Meixner2: function(l1, k1, k2, k3) {
	    return "M_{" + l1 + "}" + "\\!\\left(" + k1 + ";" + k2 + "," + k3 + "\\right)";
    },
    monicMeixner2: function(l1, k1, k2, k3) {
	    return "{\\widehat M}_{" + l1 + "}" + "\\!\\left(" + k1 + ";" + k2 + "," + k3 + "\\right)";
    },
    Krawtchouk2: function(l1, k1, k2, k3) {
	    return "K_{" + l1 + "}" + "\\!\\left(" + k1 + ";" + k2 + "," + k3 + "\\right)";
    },
    monicKrawtchouk3: function(l1, k1, k2, k3) {
	    return "{\\widehat K}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    Laguerre1: function(l1, l2, k1) {
	    return "L\\ifx." + l1 + ".\\else^{#1}\\fi_{" + l2 + "}";
    },
    monicLaguerre1: function(l1, l2, k1) {
	    return "{\\widehat L}\\ifx." + l1 + ".\\else^{(#1)}\\fi_{" + l2 + "}";
    },
    BesselPoly2: function(l1, k1, k2) {
	    return "y_{" + l1 + "}" + "\\!\\left(" + k1 + ";" + k2 + "\\right)";
    },
    monicBesselPoly3: function(l1, k1, k2) {
	    return "{\\widehat y}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    Hermite1: function(l1, k1) {
	    return "H_{" + l1 + "}";
    },
    Charlier2: function(l1, k1, k2) {
	    return "C_{" + l1 + "}" + "\\!\\left(" + k1 + ";" + k2 + "\\right)";
    },
    monicCharlier3: function(l1, k1, k2) {
	    return "{\\widehat C}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicHermite1: function(l1, k1) {
	    return "{\\widehat H}_{" + l1 + "}";
    },
    AskeyWilson2: function(l1, k1, k2, k3, k4, k5, k6) {
	    return "p_{" + l1 + "}" + "\\!\\left(" + k1 + ";" + k2 + "," + k3 + "," + k4 + "," + k5 + "\\,|\\," + k6 + "\\right)";
    },
    normAskeyWilsonptilde3: function(l1, k1, k2, k3, k4, k5, k6) {
	    return "{\\tilde p}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicAskeyWilson3: function(l1, k1, k2, k3, k4, k5, k6) {
	    return "{\\widehat p}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    qRacah3: function(l1, k1, k2, k3, k4, k5, k6) {
	    return "R_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicqRacah3: function(l1, k1, k2, k3, k4, k5, k6) {
	    return "{\\widehat R}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    normctsdualqHahnptilde3: function(l1, k1, k2, k3, k4, k5) {
	    return "{\\tilde p}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    ctsdualqHahn2: function(l1, k1, k2, k3, k4, k5) {
	    return "p_{" + l1 + "}" + "\\!\\left(" + k1 + ";" + k2 + "," + k3 + "," + k4 + "|" + k5 + "\\right)";
    },
    monicctsdualqHahn3: function(l1, k1, k2, k3, k4, k5) {
	    return "{\\widehat p}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    normctsqHahnptilde3: function(l1, k1, k2, k3, k4, k5, k6) {
	    return "{\\tilde p}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    ctsqHahn2: function(l1, k1, k2, k3, k4, k5, k6) {
	    return "p_{" + l1 + "}" + "\\!\\left(" + k1 + ";" + k2 + "," + k3 + "," + k4 + "," + k5 + ";" + k6 + "\\right)";
    },
    monicctsqHahn3: function(l1, k1, k2, k3, k4, k5, k6) {
	    return "{\\widehat p}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    bigqJacobi2: function(l1, k1, k2, k3, k4, k5) {
	    return "P_{" + l1 + "}" + "\\!\\left(" + k1 + ";" + k2 + "," + k3 + "," + k4 + ";" + k5 + "\\right)";
    },
    monicbigqJacobi3: function(l1, k1, k2, k3, k4, k5) {
	    return "{\\widehat P}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    bigqJacobiIVparam2: function(l1, k1, k2, k3, k4, k5, k6) {
	    return "P_{" + l1 + "}" + "\\!\\left(" + k1 + ";" + k2 + "," + k3 + "," + k4 + "," + k5 + ";" + k6 + "\\right)";
    },
    bigqLegendre2: function(l1, k1, k2, k3) {
	    return "P_{" + l1 + "}" + "\\!\\left(" + k1 + ";" + k2 + ";" + k3 + "\\right)";
    },
    monicbigqLegendre2: function(l1, k1, k2, k3) {
	    return "{\\widehat P}_{" + l1 + "}" + "\\!\\left(" + k1 + ";" + k2 + ";" + k3 + "\\right)";
    },
    qHahn3: function(l1, k1, k2, k3, k4, k5) {
	    return "Q_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicqHahn3: function(l1, k1, k2, k3, k4) {
	    return "{\\widehat Q}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    dualqHahn3: function(l1, k1, k2, k3, k4) {
	    return "R_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicdualqHahn3: function(l1, k1, k2, k3, k4) {
	    return "{\\widehat R}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    AlSalamChihara3: function(l1, k1, k2, k3, k4) {
	    return "Q_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    qinvAlSalamChihara3: function(l1, k1, k2, k3, k4) {
	    return "Q_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicAlSalamChihara2: function(l1, k1, k2, k3, k4) {
	    return "{\\widehat Q}_{" + l1 + "}" + "\\!\\left(" + k1 + ";" + k2 + "," + k3 + "\\,|\\," + k4 + "\\right)";
    },
    monicqinvAlSalamChihara3: function(l1, k1, k2, k3, k4) {
	    return "{\\widehat Q}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    qMeixnerPollaczek3: function(l1, k1, k2, k3) {
	    return "P_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicqMeixnerPollaczek3: function(l1, k1, k2, k3) {
	    return "{\\widehat P}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    normctsqJacobiPtilde2: function(l1, l2, l3, k1, k2) {
	    return "{\\tilde P}^{(" + l1 + "," + l2 + ")}_{" + l3 + "}" + "\\!\\left(" + k1 + "|" + k2 + "\\right)";
    },
    ctsqJacobi2: function(l1, l2, l3, k1, k2) {
	    return "P^{(" + l1 + "," + l2 + ")}_{" + l3 + "}" + "\\!\\left(" + k1 + "|" + k2 + "\\right)";
    },
    monicctsqJacobi3: function(l1, l2, l3, k1, k2) {
	    return "{\\widehat P}^{(" + l1 + "," + l2 + ")}_{" + l3 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    ctsqUltra2: function(l1, k1, k2, k3) {
	    return "C_{" + l1 + "}" + "\\!\\left(" + k1 + ";" + k2 + "\\,|\\," + k3 + "\\right)";
    },
    monicctsqUltra3: function(l1, k1, k2, k3) {
	    return "{\\widehat C}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    ctsqLegendre2: function(l1, k1, k2) {
	    return "P_{" + l1 + "}" + "\\!\\left(" + k1 + "|" + k2 + "\\right)";
    },
    monicctsqLegendre3: function(l1, k1, k2) {
	    return "{\\widehat P}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    bigqLaguerre2: function(l1, k1, k2, k3, k4) {
	    return "P_{" + l1 + "}" + "\\!\\left(" + k1 + ";" + k2 + "," + k3 + ";" + k4 + "\\right)";
    },
    monicbigqLaguerre3: function(l1, k1, k2, k3, k4) {
	    return "{\\widehat P}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    littleqJacobi2: function(l1, k1, k2, k3, k4) {
	    return "p_{" + l1 + "}" + "\\!\\left(" + k1 + ";" + k2 + "," + k3 + ";" + k4 + "\\right)";
    },
    moniclittleqJacobi3: function(l1, k1, k2, k3, k4) {
	    return "{\\widehat p}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    littleqLegendre2: function(l1, k1, k2) {
	    return "p_{" + l1 + "}" + "\\!\\left(" + k1 + "|" + k2 + "\\right)";
    },
    moniclittleqLegendre3: function(l1, k1, k2) {
	    return "{\\widehat p}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    qMeixner3: function(l1, k1, k2, k3, k4) {
	    return "M_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicqMeixner3: function(l1, k1, k2, k3, k4) {
	    return "{\\widehat M}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    qtmqKrawtchouk3: function(l1, k1, k2, k3, k4) {
	    return "K^{\\mathrm{qtm}}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicqtmqKrawtchouk3: function(l1, k1, k2, k3, k4) {
	    return "{\\widehat K^{\\mathrm{qtm}}}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    qKrawtchouk3: function(l1, k1, k2, k3, k4) {
	    return "K_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicqKrawtchouk3: function(l1, k1, k2, k3, k4) {
	    return "{\\widehat K}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    AffqKrawtchouk3: function(l1, k1, k2, k3, k4) {
	    return "K^{\\mathrm{Aff}}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicAffqKrawtchouk3: function(l1, k1, k2, k3, k4) {
	    return "\\widehat{K}^{\\mathrm{Aff}}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    dualqKrawtchouk3: function(l1, k1, k2, k3, k4) {
	    return "K_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicdualqKrawtchouk3: function(l1, k1, k2, k3, k4) {
	    return "{\\widehat K}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    ctsbigqHermite3: function(l1, k1, k2, k3) {
	    return "H_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicctsbigqHermite3: function(l1, k1, k2, k3) {
	    return "{\\widehat H}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    ctsqLaguerre3: function(l1, l2, k1, k2) {
	    return "P^{(" + l1 + ")}_{" + l2 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicctsqLaguerre3: function(l1, l2, k1, k2) {
	    return "{\\widehat P}^{(" + l1 + ")}_{" + l2 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    littleqLaguerre3: function(l1, k1, k2, k3) {
	    return "p_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    moniclittleqLaguerre3: function(l1, k1, k2, k3) {
	    return "{\\widehat p}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    qLaguerre3: function(l1, l2, k1, k2) {
	    return "L\\ifx." + l1 + ".\\else^{(" + k1 + ")}\\fi_{" + l2 + "}" + "\\!\\left(#1\\right)";
    },
    monicqLaguerre3: function(l1, l2, k1, k2) {
	    return "{\\widehat L}\\ifx." + l1 + ".\\else^{(" + k1 + ")}\\fi_{" + l2 + "}" + "\\!\\left(#1\\right)";
    },
    qBesselPoly3: function(l1, k1, k2, k3) {
	    return "y_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicqBesselPoly3: function(l1, k1, k2, k3) {
	    return "{\\widehat y}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    qCharlier3: function(l1, k1, k2, k3) {
	    return "C_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicqCharlier3: function(l1, k1, k2, k3) {
	    return "{\\widehat C}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    AlSalamCarlitzI3: function(l1, l2, k1, k2) {
	    return "U^{(" + l1 + ")}_{" + l2 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicAlSalamCarlitzI3: function(l1, l2, k1, k2) {
	    return "{\\widehat U}^{(" + l1 + ")}_{" + l2 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    AlSalamCarlitzII3: function(l1, l2, k1, k2) {
	    return "V^{(" + l1 + ")}_{" + l2 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicAlSalamCarlitzII3: function(l1, l2, k1, k2) {
	    return "{\\widehat V}^{(" + l1 + ")}_{" + l2 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    ctsqHermite3: function(l1, k1, k2) {
	    return "H_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicctsqHermite3: function(l1, k1, k2) {
	    return "{\\widehat H}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    StieltjesWigert3: function(l1, k1, k2) {
	    return "S_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicStieltjesWigert3: function(l1, k1, k2) {
	    return "{\\widehat S}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    discrqHermiteI3: function(l1, k1, k2) {
	    return "h_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicdiscrqHermiteI3: function(l1, k1, k2) {
	    return "{\\widehat h}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    discrqHermiteII3: function(l1, k1, k2) {
	    return "\\tilde{h}_{" + l1 + "}" + "\\!\\left(" + k1 + "\\right)";
    },
    monicdiscrqHermiteII3: function(l1, k1, k2) {
	    return "{\\widehat{\\tilde{h}}_{" + l1 + "}}" + "\\!\\left(" + k1 + "\\right)";
    },
    ctsqJacobiRahman2: function(l1, l2, l3, k1, k2) {
	    return "P^{(" + l1 + "," + l2 + ")}_{" + l3 + "}" + "\\!\\left(" + k1 + ";" + k2 + "\\right)";
    },
    ctsqLegendreRahman2: function(l1, k1, k2) {
	    return "P_{" + l1 + "}" + "\\!\\left(" + k1 + ";" + k2 + "\\right)";
    },
    pseudobigqJacobi2: function(l1, k1, k2, k3, k4, k5) {
	    return "P_{" + l1 + "}" + "\\!\\left(" + k1 + ";" + k2 + "," + k3 + "," + k4 + ";" + k5 + "\\right)";
    },
    GottliebLaguerre1: function(l1, k1) {
	    return "l_{" + l1 + "}";
    },
    CiglerqChebyT2: function(l1, k1, k2, k3) {
	    return "T_{" + l1 + "}" + "\\!\\left(" + k1 + "," + k2 + "," + k3 + "\\right)";
    },
    CiglerqChebyU2: function(l1, k1, k2, k3) {
	    return "U_{" + l1 + "}" + "\\!\\left(" + k1 + "," + k2 + "," + k3 + "\\right)";
    },
    AlSalamIsmail2: function(l1, k1, k2, k3) {
	    return "U_{" + l1 + "}" + "\\!\\left(" + k1 + ";" + k2 + "," + k3 + "\\right)";
    },
    ChebyV1: function(l1, k1) {
	    return "V_{" + l1 + "}";
    },
    ChebyW1: function(l1, k1) {
	    return "W_{" + l1 + "}";
    },
    NeumannFactor1: function(l1) {
	    return "\\epsilon_{" + l1 + "}";
    },
    BesselPolyIIparam2: function(l1, k1, k2, k3) {
	    return "y_{" + l1 + "}" + "\\!\\left(" + k1 + ";" + k2 + "," + k3 + "\\right)";
    },
    BesselPolyTheta2: function(l1, k1, k2, k3) {
	    return "\\theta_{" + l1 + "}" + "\\!\\left(" + k1 + ";" + k2 + "," + k3 + "\\right)";
    },
    Deriv2: function(k1, k2) {
	    return "" + "\\!" + k1 + "'\\!\\left(" + k2 + "\\right)";
    },
    DDeriv2: function(k1, k2) {
	    return "" + "\\!\\frac{\\mathrm{d}}{\\mathrm{d}" + k1 + "}(" + k2 + ")";
    },
    FourierTrans4: function(k1, k2) {
	    return "\\mathscr{F}" + "\\left\\{" + k1 + "\\right\\}";
    },
    SpaceTestFunTempered2: function(k1) {
	    return "\\mathscr{T}" + "\\left(" + k1 + "\\right)";
    },
    FQ: function(base, down, up) {
        return base.render_tex() + "_" + curlies(down) + "^" + curlies(up);
    },
    DQ: function(base, down) {
        return base.render_tex() + "_" + curlies(down);
    },
    UQ: function(base, up) {
        return base.render_tex() + "^" + curlies(up);
    },
    FQN: function(down, up) {
        return "_" + curlies(down) + "^" + curlies(up);
    },
    DQN: function(down) {
        return "_" + curlies(down);
    },
    UQN: function(up) {
        return "^" + curlies(up);
    },
    JACOBI: function(a, b, c, d) {
        return "\\Jacobi" + curlies(a) + curlies(b) + curlies(c) + "@" + curlies(d);
    },
    LAGUERRE1: function(a, b) {
        return "\\Laguerre" + curlies(a) + "@" + curlies(b);
    },
    LAGUERRE2: function(a, b, c) {
        return "\\Laguerre" + curlies(a) + "[" + b.render_tex() + "]" + "@" + curlies(c);
    },
    EJACOBI: function(a, b, c) {
        return "\\Jacobi" + a + "@" + curlies(b) + curlies(c);
    },
    LITERAL: function(r) {
        return r.tex_part();
    },
    PAREN1: function(f, a) {
        return f + "@" + curlies(a);
    },
    PAREN2: function(f, a) {
        return f + "@@" + curlies(a);
    },
    QPOCH: function(a, b, c) {
        return "\\qPochhammer" + curlies(a) + curlies(b) + curlies(c);
    },
    POCH: function(a, b) {
        return "\\pochhammer" + curlies(a) + curlies(b);
    },
    FUN1: function(f, a) {
        return f + curlies(a);
    },
    FUN1nb: function(f, a) {
        return f + curlies(a);
    },
    DECLh: function(f, _, a) {
        return f + render_curlies(a);
    },
    FUN2: function(f, a, b) {
        return f + curlies(a) + curlies(b);
    },
    FUN2nb: function(f, a, b) {
        return f + curlies(a) + curlies(b);
    },
    FUN2sq: function(f, a, b) {
        return f + "[" + a.render_tex() + "]" + curlies(b);
    },
    FUN3: function(f, a, b, c) {
        return f + curlies(a) + curlies(b) + curlies(c);
    },
    CURLY: function(tl) {
        return render_curlies(tl);
    },
    INFIX: function(s, ll, rl) {
        return curlies(render(ll) + " " + s + " " + render(rl));
    },
    BOX: function(bt, s) {
        return bt + curlies(s);
    },
    BIG: function(bt, d) {
        return bt + " " + d.tex_part();
    },
    MATRIX: function(t, m) {
        var render_line = function(l) { return l.map(render).join('&'); };
        var render_matrix = function(m) { return m.map(render_line).join('\\\\'); };
        return curlies("\\begin{"+t+"}" + render_matrix(m) + "\\end{"+t+"}");
    },
    LR: function(l, r, tl) {
        return "\\left" + l.tex_part() + render(tl) + "\\right" + r.tex_part();
    }
});
