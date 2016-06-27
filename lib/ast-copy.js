// AST type declarations
"use strict";

console.log("hello");

module.exports.hello = "hi";

var typecheck = module.exports.typecheck = function(val, type, self) {
    switch (type) {
    case 'string':
        return typeof(val) === type;
    case 'self':
        return self && self.contains(val);
    }
    if (Array.isArray(type)) {
        return Array.isArray(val) && val.every(function(elem) {
            return typecheck(elem, type[0], self);
        });
    }
    return type.contains(val);
};
var type2str = function(type) {
    if (typeof(type) === 'string') {
        return type;
    }
    if (Array.isArray(type)) {
        return '[' + type2str(type[0]) + ']';
    }
    return type.name;
};

// "Enum" helper
// vaguely based on:
// https://github.com/rauschma/enums/blob/master/enums.js
var Enum = function(name, fields, proto) {
    proto = proto || {};
    // Non-enumerable properties 'name' and 'prototype'
    Object.defineProperty(this, 'name', { value: name });
    Object.defineProperty(this, 'prototype', { value: proto });
    Object.keys(fields).forEach(function(fname) {
        var args = fields[fname].args || [];
        var self = this;
        this[fname] = function EnumField() {
            if (!(this instanceof EnumField)) {
                var o = Object.create(EnumField.prototype);
                o.constructor = EnumField;
                EnumField.apply(o, arguments);
                return o;
            }
            this.name = fname;
            console.assert(arguments.length === args.length,
                           "Wrong # of args for " + name + "." + fname);
            for (var i=0; i<args.length; i++) {
                console.assert(typecheck(arguments[i], args[i], self),
                              "Argument " + i + " of " + name + "." + fname +
                               " should be " + type2str(args[i]));
                this[i] = arguments[i];
            }
            this.length = args.length;
        };
        this[fname].prototype = Object.create(proto);
        this[fname].prototype.toString = function() {
            var stringify = function(type, val) {
                if (type==='string') {
                    return JSON.stringify(val);
                } else if (Array.isArray(type)) {
                    return '[' + val.map(function(v) {
                        return stringify(type[0], v);
                    }).join(',') + ']';
                }
                return val.toString();
            };
            return fname + '(' + args.map(function(type, i) {
                return stringify(type, this[i]);
            }.bind(this)).join(',') + ')';
        };
    }.bind(this));
};
Enum.prototype.contains = function(sym) {
    return sym.name && this.hasOwnProperty(sym.name) &&
        sym instanceof this[sym.name];
};
Enum.prototype.defineVisitor = function(visitorName, o, numArgs) {
    var self = this;
    numArgs = numArgs || 0;
    console.assert(Object.keys(o).length === Object.keys(self).length,
        "Missing cases in " + self.name + ". Expected:\n" +
        Object.keys(self).sort() + " but got: \n" +
        Object.keys(o).sort());
    Object.keys(o).forEach(function(fname) {
        self[fname].prototype[visitorName] = function() {
            var args = [];
            for (var i=0; i<numArgs; i++) { args.push(arguments[i]); }
            args.push.apply(args, this);
            return o[fname].apply(this, args);
        };
    });
};

// Actual AST starts here.

var FontForce = module.exports.FontForce = new Enum( 'FontForce', {
    IT: {},
    RM: {}
});

var FontClass = module.exports.FontClass = new Enum( 'FontClass', {
    IT:  {}, /* IT default, may be forced to be RM */
    RM:  {}, /* RM default, may be forced to be IT */
    UF:  {}, /* not affected by IT/RM setting */
    RTI: {}, /* RM - any, IT - not available in HTML */
    UFH: {} /* in TeX UF, in HTML RM */
});

var MathClass = module.exports.MathClass = new Enum( 'MathClass', {
    MN: {},
    MI: {},
    MO: {}
});

var RenderT = module.exports.RenderT = new Enum( 'RenderT', {
    HTMLABLEC:    { args: [ FontClass, 'string', 'string' ] },
    HTMLABLEM:    { args: [ FontClass, 'string', 'string' ] },
    HTMLABLE:     { args: [ FontClass, 'string', 'string' ] },
    MHTMLABLEC:   { args: [ FontClass, 'string', 'string', MathClass, 'string' ] },
    HTMLABLE_BIG: { args: [ 'string', 'string' ] },
    TEX_ONLY:     { args: ['string'] }
}/*, {
    // demonstration of doing dispatch on the enumerated type with a
    // switch statement.  it turns out to be more self-documenting if we
    // use Enum.defineVisitor() for this instead (see render.js)
    tex_part: function() {
        switch(this.constructor) {
        case RenderT.HTMLABLE:
        case RenderT.HTMLABLEM:
        case RenderT.HTMLABLEC:
        case RenderT.MHTMLABLEC:
            return this[1];
        case RenderT.HTMLABLE_BIG:
        case RenderT.TEX_ONLY:
            return this[0];
        }
    }
}*/);

var Tex = module.exports.Tex = new Enum( 'Tex', {
    HarmonicNumber1: { args: [ 'string', 'self'] },
    StieltjesConstants1: { args: [ 'string', 'self'] },
    GenGegenbauer1: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    GenHermite1: { args: [ 'string', 'self', 'self', 'self'] },
    qHyperrWs4: { args: [ 'string', 'self', 'self', 'self', 'self', 'self', 'self'] },
    Jacobi1: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    normJacobiR1: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    ctsqUltrae2: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    JacksonqBesselI2: { args: [ 'string', 'self', 'self', 'self'] },
    JacksonqBesselII2: { args: [ 'string', 'self', 'self', 'self'] },
    JacksonqBesselIII2: { args: [ 'string', 'self', 'self', 'self'] },
    qderiv1: { args: [ 'string', 'self', 'self', 'self'] },
    f3: { args: [ 'string', 'self', 'self'] },
    poly2: { args: [ 'string', 'self', 'self', 'self'] },
    Sum2: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    Prod2: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    AntiDer2: { args: [ 'string', 'self', 'self'] },
    Int2: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    qexpKLS3: { args: [ 'string', 'self', 'self'] },
    qExpKLS3: { args: [ 'string', 'self', 'self'] },
    qsinKLS3: { args: [ 'string', 'self', 'self'] },
    qSinKLS3: { args: [ 'string', 'self', 'self'] },
    qcosKLS3: { args: [ 'string', 'self', 'self'] },
    qCosKLS3: { args: [ 'string', 'self', 'self'] },
    Wilson3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self', 'self'] },
    normWilsonWtilde3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self', 'self'] },
    monicWilson3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self', 'self'] },
    Racah3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self', 'self'] },
    monicRacah3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self', 'self'] },
    ctsdualHahn3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    normctsdualHahnStilde3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    monicctsdualHahn3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    ctsHahn3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self', 'self'] },
    normctsHahnptilde3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self', 'self'] },
    monicctsHahn3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self', 'self'] },
    Hahn3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    monicHahn3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    dualHahn3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    monicdualHahn3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    MeixnerPollaczek2: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    monicMeixnerPollaczek3: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    monicJacobi1: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    monicUltra1: { args: [ 'string', 'self', 'self', 'self'] },
    Ultra1: { args: [ 'string', 'self', 'self', 'self'] },
    ChebyT1: { args: [ 'string', 'self', 'self'] },
    ChebyU1: { args: [ 'string', 'self', 'self'] },
    monicChebyT1: { args: [ 'string', 'self', 'self'] },
    monicChebyU1: { args: [ 'string', 'self', 'self'] },
    monicLegendrePoly1: { args: [ 'string', 'self', 'self'] },
    pseudoJacobi2: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    monicpseudoJacobi3: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    Meixner2: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    monicMeixner2: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    Krawtchouk2: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    monicKrawtchouk3: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    Laguerre1: { args: [ 'string', 'self', 'self', 'self'] },
    monicLaguerre1: { args: [ 'string', 'self', 'self', 'self'] },
    BesselPoly2: { args: [ 'string', 'self', 'self', 'self'] },
    monicBesselPoly3: { args: [ 'string', 'self', 'self', 'self'] },
    Hermite1: { args: [ 'string', 'self', 'self'] },
    Charlier2: { args: [ 'string', 'self', 'self', 'self'] },
    monicCharlier3: { args: [ 'string', 'self', 'self', 'self'] },
    monicHermite1: { args: [ 'string', 'self', 'self'] },
    AskeyWilson2: { args: [ 'string', 'self', 'self', 'self', 'self', 'self', 'self', 'self'] },
    normAskeyWilsonptilde3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self', 'self', 'self'] },
    monicAskeyWilson3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self', 'self', 'self'] },
    qRacah3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self', 'self', 'self'] },
    monicqRacah3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self', 'self', 'self'] },
    normctsdualqHahnptilde3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self', 'self'] },
    ctsdualqHahn2: { args: [ 'string', 'self', 'self', 'self', 'self', 'self', 'self'] },
    monicctsdualqHahn3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self', 'self'] },
    normctsqHahnptilde3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self', 'self', 'self'] },
    ctsqHahn2: { args: [ 'string', 'self', 'self', 'self', 'self', 'self', 'self', 'self'] },
    monicctsqHahn3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self', 'self', 'self'] },
    bigqJacobi2: { args: [ 'string', 'self', 'self', 'self', 'self', 'self', 'self'] },
    monicbigqJacobi3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self', 'self'] },
    bigqJacobiIVparam2: { args: [ 'string', 'self', 'self', 'self', 'self', 'self', 'self', 'self'] },
    bigqLegendre2: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    monicbigqLegendre2: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    qHahn3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self', 'self'] },
    monicqHahn3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    dualqHahn3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    monicdualqHahn3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    AlSalamChihara3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    qinvAlSalamChihara3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    monicAlSalamChihara2: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    monicqinvAlSalamChihara3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    qMeixnerPollaczek3: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    monicqMeixnerPollaczek3: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    normctsqJacobiPtilde2: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    ctsqJacobi2: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    monicctsqJacobi3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    ctsqUltra2: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    monicctsqUltra3: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    ctsqLegendre2: { args: [ 'string', 'self', 'self', 'self'] },
    monicctsqLegendre3: { args: [ 'string', 'self', 'self', 'self'] },
    bigqLaguerre2: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    monicbigqLaguerre3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    littleqJacobi2: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    moniclittleqJacobi3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    littleqLegendre2: { args: [ 'string', 'self', 'self', 'self'] },
    moniclittleqLegendre3: { args: [ 'string', 'self', 'self', 'self'] },
    qMeixner3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    monicqMeixner3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    qtmqKrawtchouk3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    monicqtmqKrawtchouk3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    qKrawtchouk3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    monicqKrawtchouk3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    AffqKrawtchouk3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    monicAffqKrawtchouk3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    dualqKrawtchouk3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    monicdualqKrawtchouk3: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    ctsbigqHermite3: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    monicctsbigqHermite3: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    ctsqLaguerre3: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    monicctsqLaguerre3: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    littleqLaguerre3: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    moniclittleqLaguerre3: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    qLaguerre3: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    monicqLaguerre3: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    qBesselPoly3: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    monicqBesselPoly3: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    qCharlier3: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    monicqCharlier3: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    AlSalamCarlitzI3: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    monicAlSalamCarlitzI3: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    AlSalamCarlitzII3: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    monicAlSalamCarlitzII3: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    ctsqHermite3: { args: [ 'string', 'self', 'self', 'self'] },
    monicctsqHermite3: { args: [ 'string', 'self', 'self', 'self'] },
    StieltjesWigert3: { args: [ 'string', 'self', 'self', 'self'] },
    monicStieltjesWigert3: { args: [ 'string', 'self', 'self', 'self'] },
    discrqHermiteI3: { args: [ 'string', 'self', 'self', 'self'] },
    monicdiscrqHermiteI3: { args: [ 'string', 'self', 'self', 'self'] },
    discrqHermiteII3: { args: [ 'string', 'self', 'self', 'self'] },
    monicdiscrqHermiteII3: { args: [ 'string', 'self', 'self', 'self'] },
    ctsqJacobiRahman2: { args: [ 'string', 'self', 'self', 'self', 'self', 'self'] },
    ctsqLegendreRahman2: { args: [ 'string', 'self', 'self', 'self'] },
    pseudobigqJacobi2: { args: [ 'string', 'self', 'self', 'self', 'self', 'self', 'self'] },
    GottliebLaguerre1: { args: [ 'string', 'self', 'self'] },
    CiglerqChebyT2: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    CiglerqChebyU2: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    AlSalamIsmail2: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    ChebyV1: { args: [ 'string', 'self', 'self'] },
    ChebyW1: { args: [ 'string', 'self', 'self'] },
    NeumannFactor1: { args: [ 'string', 'self'] },
    BesselPolyIIparam2: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    BesselPolyTheta2: { args: [ 'string', 'self', 'self', 'self', 'self'] },
    Deriv2: { args: [ 'string', 'self', 'self'] },
    DDeriv2: { args: [ 'string', 'self', 'self'] },
    FourierTrans4: { args: [ 'string', 'self', 'self'] },
    SpaceTestFunTempered2: { args: [ 'string', 'self'] },
    LITERAL: { args: [ RenderT ] }, // contents
    CURLY:   { args: [ ['self'] ] }, // expr
    FQ:      { args: [ 'self', 'self', 'self' ] }, // base, down, up
    DQ:      { args: [ 'self', 'self' ] }, // base, down
    UQ:      { args: [ 'self', 'self' ] }, // base, up
    FQN:     { args: [ 'self', 'self' ] }, // down, up (no base)
    DQN:     { args: [ 'self' ] }, // down (no base)
    UQN:     { args: [ 'self' ] }, // up (no base)
    LR:      { args: [ RenderT, RenderT, [ 'self' ] ] }, // left, right, expr
    BOX:     { args: [ 'string', 'string' ] }, // name, contents
    BIG:     { args: [ 'string', RenderT ] }, // name, contents
    PAREN1:  { args: [ 'string', 'self' ] },
    PAREN2:  { args: [ 'string', 'self'] },
    QPOCH:   { args: [ 'self', 'self', 'self'] },
    POCH:    { args: [ 'self', 'self']},
    FUN1:    { args: [ 'string', 'self' ] }, // name, expr
    FUN1nb:  { args: [ 'string', 'self' ] }, // name, expr
    FUN2:    { args: [ 'string', 'self', 'self' ] },
    FUN2nb:  { args: [ 'string', 'self', 'self' ] },
    INFIX:   { args: [ 'string', ['self'], ['self'] ] },
    FUN2sq:  { args: [ 'string', 'self', 'self' ] },
    FUN3:    { args: [ 'string', 'self', 'self', 'self'] },
    MATRIX:  { args: [ 'string', [ [ [ 'self' ] ] ] ] },
    DECLh:   { args: [ 'string', FontForce, [ 'self' ] ] },
    JACOBI:  { args: [ 'self', 'self', 'self', 'self']},
    LAGUERRE1: { args:['self', 'self']},
    LAGUERRE2: { args:['self', 'self', 'self']},
    EJACOBI: { args: [ 'string', 'self', 'self']}
});

// Linked List of Tex, useful for efficient "append to head" operations.
var nil = {};
var LList = module.exports.LList = function LList(head, tail) {
    if (!(this instanceof LList)) {
        return new LList(head, tail);
    }
    if (head === nil && tail === nil) { return; /* empty list singleton */ }
    if (!tail) { tail = LList.EMPTY; }
    console.assert(typecheck(head, Tex));
    console.assert(tail instanceof LList);
    this.head = head;
    this.tail = tail;
};
LList.EMPTY = new LList(nil, nil);
LList.prototype.toArray = function() {
    console.assert(this instanceof LList, "not a LList");
    var arr = [];
    for (var l = this ; l !== LList.EMPTY; l = l.tail) {
        arr.push(l.head);
    }
    return arr;
};
