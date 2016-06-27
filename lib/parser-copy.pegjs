/** PEGjs lexer/parser */
{
  var ast = require('./ast-copy');
  var tu = require('./texutil');

  var sq_close_ri = ast.RenderT.HTMLABLEC(ast.FontClass.UFH(), "]", "]");

  var lst2arr = function(l) {
    var arr = [];
    while (l !== null) {
      arr.push(l.head);
      l = l.tail;
    }
    return arr;
  };
}
// first rule is the start production.
start
  = _ t:tex_expr
    { console.assert(t instanceof ast.LList); return t.toArray(); }

// the PEG grammar doesn't automatically ignore whitespace when tokenizing.
// so we add `_` productions in appropriate places to eat whitespace.
// Lexer rules (which are capitalized) are expected to always eat
// *trailing* whitespace.  Leading whitespace is taken care of in the `start`
// rule above.
_
  = [ \t\n\r]*

space
  = "\\,"
  / "\\;"
  / "\\ "
  / "\!"
  / "\\>"
  / "\\:"
  / "\\enspace"
  / "\\quad"
  / "\\qquad"
  / "\\thinspace"
  / "\\thinmuskip"
  / "\\medmuskip"
  / "\\thickmuskip"
  / "\\kern" _ num _
  / "\\hskip" _ num _
  / "\\hspace" _ "{" _ num _ "}" _
  / "~"
  / "\\ "
  / "\\hfill"
  / "\\hfil"
  / "\\hphantom" _ "{" _ lit _ "}" _
  / [ \t\n\r]

/////////////////////////////////////////////////////////////
// PARSER
//----------------------------------------------------------

tex_expr
  = e:expr EOF
    { return e; }
  / e1:ne_expr name:FUN_INFIX e2:ne_expr EOF
    { return ast.LList(ast.Tex.INFIX(name, e1.toArray(), e2.toArray())); }
  / e1:ne_expr f:FUN_INFIXh e2:ne_expr EOF
    { return ast.LList(ast.Tex.INFIXh(f[0], f[1], e1.toArray(), e2.toArray()));}

expr
  = ne_expr
  / ""
    { return ast.LList.EMPTY; }

ne_expr
  = h:lit_aq t:expr
    { return ast.LList(h, t); }
  / h:litsq_aq t:expr
    { return ast.LList(h, t); }
  / d:DECLh e:expr
    { return ast.LList(ast.Tex.DECLh(d[0], d[1], e.toArray())); }
litsq_aq
  = litsq_fq
  / litsq_dq
  / litsq_uq
  / litsq_zq
litsq_fq
  = l1:litsq_dq SUP l2:lit
    { return ast.Tex.FQ(l1[0], l1[1], l2); }
  / l1:litsq_uq SUB l2:lit
    { return ast.Tex.FQ(l1[0], l2, l1[1]); }
litsq_uq
  = base:litsq_zq SUP upi:lit
    { return ast.Tex.UQ(base, upi); }
litsq_dq
  = base:litsq_zq SUB downi:lit
    { return ast.Tex.DQ(base, downi); }
litsq_zq
  = SQ_CLOSE
    { return ast.Tex.LITERAL(sq_close_ri); }
expr_nosqc
  = l:lit_aq e:expr_nosqc
    { return ast.LList(l, e); }
  / "" /* */
    { return ast.LList.EMPTY; }
lit_aq
  = lit_fq
  / lit_dq
  / lit_uq
  / lit_dqn
  / lit_uqn
  / lit

lit_fq
  = l1:lit_dq SUP l2:lit
    { return ast.Tex.FQ(l1[0], l1[1], l2); }
  / l1:lit_uq SUB l2:lit
    { return ast.Tex.FQ(l1[0], l2, l1[1]); }
  / l1:lit_dqn SUP l2:lit
    { return ast.Tex.FQN(l1[0], l2); }

lit_uq
  = base:lit SUP upi:lit
    { return ast.Tex.UQ(base, upi); }
lit_dq
  = base:lit SUB downi:lit
    { return ast.Tex.DQ(base, downi); }
lit_uqn
  = SUP l:lit
    { return ast.Tex.UQN(l); }
lit_dqn
  = SUB l:lit
    { return ast.Tex.DQN(l); }


left
  = LEFT d:DELIMITER
    { return d; }
  / LEFT SQ_CLOSE
    { return sq_close_ri; }
right
  = RIGHT d:DELIMITER
    { return d; }
  / RIGHT SQ_CLOSE
    { return sq_close_ri; }
lit
  =
    f:PAREN atsymbol atsymbol l:lit &{ return options.semanticlatex; }
    { return ast.Tex.PAREN2(f, l); }
  / f:PAREN atsymbol l:lit &{ return options.semanticlatex; }
    { return ast.Tex.PAREN1(f, l); }
  / "P_" l:lit "^" "{"* _ PAREN_OPEN _ l2:lit _ "," _ l3:lit _ PAREN_CLOSE _ "}"* l4:litparen1 &{ return options.semanticlatex; }
    { return ast.Tex.JACOBI(l, l2, l3, l4); }
  / "L_" l:lit "^" l2:litparen1 l3:litparen1 &{ return options.semanticlatex; }
    { return ast.Tex.LAGUERRE2(l, l2, l3); }
  / "L_" l:lit l2:litparen1 &{ return options.semanticlatex; }
    { return ast.Tex.LAGUERRE1(l, l2); }
  / PAREN_OPEN l:lit ";" l2:lit PAREN_CLOSE "_" l3:lit &{ return options.semanticlatex; }
    { return ast.Tex.QPOCH(l, l2, l3); }
  / l1:litparen1 "_" l2:lit &{ return options.semanticlatex; }
    { return ast.Tex.POCH(l1, l2); }
  / f:PAREN l:litparen1  &{ return options.semanticlatex; }
    { return ast.Tex.PAREN1(f, l); } //must be before LITERAL!!
  / name:PAREN l:lit   &{ return options.semanticlatex; }
    { return ast.Tex.PAREN2(name, l); }
  / "{" _ "\\rm" _ e:EJACOBI _ "}" _ PAREN_OPEN _ l1:lit _ "," _ l2:lit _ PAREN_CLOSE &{ return options.semanticlatex; }
    { return ast.Tex.EJACOBI(e, l1, l2); }
  / r:LITERAL                   { return ast.Tex.LITERAL(r); }
  // quasi-literal; this is from Texutil.find(...) but the result is not
  // guaranteed to be Tex.LITERAL(RenderT...)
  / f:generic_func &{ return tu.other_literals3[f]; } _ // from Texutil.find(...)
   {
     var ast = peg$parse(tu.other_literals3[f]);
     console.assert(Array.isArray(ast) && ast.length === 1);
     return ast[0];
   }
  / r:DELIMITER                 { return ast.Tex.LITERAL(r); }
  / b:BIG r:DELIMITER           { return ast.Tex.BIG(b, r); }
  / b:BIG SQ_CLOSE              { return ast.Tex.BIG(b, sq_close_ri); }
  / l:left e:expr r:right       { return ast.Tex.LR(l, r, e.toArray()); }
  / name:FUN_AR1opt e:expr_nosqc SQ_CLOSE l:lit /* must be before FUN_AR1 */
    { return ast.Tex.FUN2sq(name, ast.Tex.CURLY(e.toArray()), l); }
  / name:FUN_AR1 l:lit          { return ast.Tex.FUN1(name, l); }
  / name:FUN_AR1nb l:lit        { return ast.Tex.FUN1nb(name, l); }
  / name:FUN_AR2 l1:lit l2:lit  { return ast.Tex.FUN2(name, l1, l2); }
  / name:FUN_AR2nb l1:lit l2:lit { return ast.Tex.FUN2nb(name, l1, l2); }
  / name:FUN_AR3 l1:lit l2:lit l3:lit { return ast.Tex.FUN3(name, l1, l2, l3); }
  / f:JACOBI l1:lit l2:lit l3:lit atsymbol l4:lit &{ return options.semanticlatex; } { return ast.Tex.JACOBI(l1, l2, l3, l4); }
  / f:LAGUERRE l1:lit atsymbol l2:lit &{ return options.semanticlatex; } { return ast.Tex.LAGUERRE1(l1 ,l2); }
  / f:LAGUERRE l1:lit "[" l2:lit "]" atsymbol l3:lit &{ return options.semanticlatex; } { return ast.Tex.LAGUERRE2(l1, l2, l3); }
  / "\\Jacobi" e:EJACOBI atsymbol l1:lit l2:lit &{ return options.semanticlatex; } { return ast.Tex.EJACOBI(e, l1, l2); }
  / BOX
  / CURLY_OPEN e:expr CURLY_CLOSE
    { return ast.Tex.CURLY(e.toArray()); }
  / CURLY_OPEN e1:ne_expr name:FUN_INFIX e2:ne_expr CURLY_CLOSE
    { return ast.Tex.INFIX(name, e1.toArray(), e2.toArray()); }
  / CURLY_OPEN e1:ne_expr f:FUN_INFIXh e2:ne_expr CURLY_CLOSE
    { return ast.Tex.INFIXh(f[0], f[1], e1.toArray(), e2.toArray()); }
  / BEGIN_MATRIX   m:(array/matrix) END_MATRIX
    { return ast.Tex.MATRIX("matrix", lst2arr(m)); }
  / BEGIN_PMATRIX  m:(array/matrix) END_PMATRIX
    { return ast.Tex.MATRIX("pmatrix", lst2arr(m)); }
  / BEGIN_BMATRIX  m:(array/matrix) END_BMATRIX
    { return ast.Tex.MATRIX("bmatrix", lst2arr(m)); }
  / BEGIN_BBMATRIX m:(array/matrix) END_BBMATRIX
    { return ast.Tex.MATRIX("Bmatrix", lst2arr(m)); }
  / BEGIN_VMATRIX  m:(array/matrix) END_VMATRIX
    { return ast.Tex.MATRIX("vmatrix", lst2arr(m)); }
  / BEGIN_VVMATRIX m:(array/matrix) END_VVMATRIX
    { return ast.Tex.MATRIX("Vmatrix", lst2arr(m)); }
  / BEGIN_ARRAY    opt_pos m:array END_ARRAY
    { return ast.Tex.MATRIX("array", lst2arr(m)); }
  / BEGIN_ALIGN    opt_pos m:matrix END_ALIGN
    { return ast.Tex.MATRIX("aligned", lst2arr(m)); }
  / BEGIN_ALIGNED  opt_pos m:matrix END_ALIGNED // parse what we emit
    { return ast.Tex.MATRIX("aligned", lst2arr(m)); }
  / BEGIN_ALIGNAT  m:alignat END_ALIGNAT
    { return ast.Tex.MATRIX("alignedat", lst2arr(m)); }
  / BEGIN_ALIGNEDAT m:alignat END_ALIGNEDAT // parse what we emit
    { return ast.Tex.MATRIX("alignedat", lst2arr(m)); }
  / BEGIN_SMALLMATRIX m:(array/matrix) END_SMALLMATRIX
    { return ast.Tex.MATRIX("smallmatrix", lst2arr(m)); }
  / BEGIN_CASES    m:matrix END_CASES
    { return ast.Tex.MATRIX("cases", lst2arr(m)); }
  / "\\begin{" alpha+ "}" /* better error messages for unknown environments */
    { throw new peg$SyntaxError("Illegal TeX function", [], text(), location()); }
  / f:generic_func &{ return !tu.all_functions[f]; }
    { throw new peg$SyntaxError("Illegal TeX function", [], f, location()); }
  / name:"\HarmonicNumber" l1:lit  { return ast.Tex.HarmonicNumber1(name, l1); }
  / name:"\StieltjesConstants" l1:lit  { return ast.Tex.StieltjesConstants1(name, l1); }
  / name:"\GenGegenbauer" l1:lit l2:lit l3:lit k1:lit  { return ast.Tex.GenGegenbauer1(name, l1, l2, l3, k1); }
  / name:"\GenHermite" l1:lit l2:lit k1:lit  { return ast.Tex.GenHermite1(name, l1, l2, k1); }
  / name:"\qHyperrWs" l1:lit l2:lit atsymbol atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.qHyperrWs4(name, l1, l2, k1, k2, k3, k4); }
  / name:"\Jacobi" l1:lit l2:lit l3:lit k1:lit  { return ast.Tex.Jacobi1(name, l1, l2, l3, k1); }
  / name:"\normJacobiR" l1:lit l2:lit l3:lit k1:lit  { return ast.Tex.normJacobiR1(name, l1, l2, l3, k1); }
  / name:"\ctsqUltrae" l1:lit atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.ctsqUltrae2(name, l1, k1, k2, k3); }
  / name:"\JacksonqBesselI" l1:lit atsymbol k1:lit k2:lit  { return ast.Tex.JacksonqBesselI2(name, l1, k1, k2); }
  / name:"\JacksonqBesselII" l1:lit atsymbol k1:lit k2:lit  { return ast.Tex.JacksonqBesselII2(name, l1, k1, k2); }
  / name:"\JacksonqBesselIII" l1:lit atsymbol k1:lit k2:lit  { return ast.Tex.JacksonqBesselIII2(name, l1, k1, k2); }
  / name:"\qderiv" l1:lit l2:lit k1:lit  { return ast.Tex.qderiv1(name, l1, l2, k1); }
  / name:"\f" l1:lit atsymbol atsymbol k1:lit  { return ast.Tex.f3(name, l1, k1); }
  / name:"\poly" l1:lit l2:lit atsymbol k1:lit  { return ast.Tex.poly2(name, l1, l2, k1); }
  / name:"\Sum" l1:lit l2:lit l3:lit atsymbol k1:lit  { return ast.Tex.Sum2(name, l1, l2, l3, k1); }
  / name:"\Prod" l1:lit l2:lit l3:lit atsymbol k1:lit  { return ast.Tex.Prod2(name, l1, l2, l3, k1); }
  / name:"\AntiDer" atsymbol k1:lit k2:lit  { return ast.Tex.AntiDer2(name, k1, k2); }
  / name:"\Int" l1:lit l2:lit atsymbol k1:lit k2:lit  { return ast.Tex.Int2(name, l1, l2, k1, k2); }
  / name:"\qexpKLS" l1:lit atsymbol atsymbol k1:lit  { return ast.Tex.qexpKLS3(name, l1, k1); }
  / name:"\qExpKLS" l1:lit atsymbol atsymbol k1:lit  { return ast.Tex.qExpKLS3(name, l1, k1); }
  / name:"\qsinKLS" l1:lit atsymbol atsymbol k1:lit  { return ast.Tex.qsinKLS3(name, l1, k1); }
  / name:"\qSinKLS" l1:lit atsymbol atsymbol k1:lit  { return ast.Tex.qSinKLS3(name, l1, k1); }
  / name:"\qcosKLS" l1:lit atsymbol atsymbol k1:lit  { return ast.Tex.qcosKLS3(name, l1, k1); }
  / name:"\qCosKLS" l1:lit atsymbol atsymbol k1:lit  { return ast.Tex.qCosKLS3(name, l1, k1); }
  / name:"\Wilson" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.Wilson3(name, l1, k1, k2, k3, k4, k5); }
  / name:"\normWilsonWtilde" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.normWilsonWtilde3(name, l1, k1, k2, k3, k4, k5); }
  / name:"\monicWilson" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.monicWilson3(name, l1, k1, k2, k3, k4, k5); }
  / name:"\Racah" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.Racah3(name, l1, k1, k2, k3, k4, k5); }
  / name:"\monicRacah" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.monicRacah3(name, l1, k1, k2, k3, k4, k5); }
  / name:"\ctsdualHahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.ctsdualHahn3(name, l1, k1, k2, k3, k4); }
  / name:"\normctsdualHahnStilde" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.normctsdualHahnStilde3(name, l1, k1, k2, k3, k4); }
  / name:"\monicctsdualHahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.monicctsdualHahn3(name, l1, k1, k2, k3, k4); }
  / name:"\ctsHahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.ctsHahn3(name, l1, k1, k2, k3, k4, k5); }
  / name:"\normctsHahnptilde" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.normctsHahnptilde3(name, l1, k1, k2, k3, k4, k5); }
  / name:"\monicctsHahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.monicctsHahn3(name, l1, k1, k2, k3, k4, k5); }
  / name:"\Hahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.Hahn3(name, l1, k1, k2, k3, k4); }
  / name:"\monicHahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.monicHahn3(name, l1, k1, k2, k3, k4); }
  / name:"\dualHahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.dualHahn3(name, l1, k1, k2, k3, k4); }
  / name:"\monicdualHahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.monicdualHahn3(name, l1, k1, k2, k3, k4); }
  / name:"\MeixnerPollaczek" l1:lit l2:lit atsymbol k1:lit k2:lit  { return ast.Tex.MeixnerPollaczek2(name, l1, l2, k1, k2); }
  / name:"\monicMeixnerPollaczek" l1:lit l2:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.monicMeixnerPollaczek3(name, l1, l2, k1, k2); }
  / name:"\monicJacobi" l1:lit l2:lit l3:lit k1:lit  { return ast.Tex.monicJacobi1(name, l1, l2, l3, k1); }
  / name:"\monicUltra" l1:lit l2:lit k1:lit  { return ast.Tex.monicUltra1(name, l1, l2, k1); }
  / name:"\Ultra" l1:lit l2:lit k1:lit  { return ast.Tex.Ultra1(name, l1, l2, k1); }
  / name:"\ChebyT" l1:lit k1:lit  { return ast.Tex.ChebyT1(name, l1, k1); }
  / name:"\ChebyU" l1:lit k1:lit  { return ast.Tex.ChebyU1(name, l1, k1); }
  / name:"\monicChebyT" l1:lit k1:lit  { return ast.Tex.monicChebyT1(name, l1, k1); }
  / name:"\monicChebyU" l1:lit k1:lit  { return ast.Tex.monicChebyU1(name, l1, k1); }
  / name:"\monicLegendrePoly" l1:lit k1:lit  { return ast.Tex.monicLegendrePoly1(name, l1, k1); }
  / name:"\pseudoJacobi" l1:lit atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.pseudoJacobi2(name, l1, k1, k2, k3); }
  / name:"\monicpseudoJacobi" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.monicpseudoJacobi3(name, l1, k1, k2, k3); }
  / name:"\Meixner" l1:lit atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.Meixner2(name, l1, k1, k2, k3); }
  / name:"\monicMeixner" l1:lit atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.monicMeixner2(name, l1, k1, k2, k3); }
  / name:"\Krawtchouk" l1:lit atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.Krawtchouk2(name, l1, k1, k2, k3); }
  / name:"\monicKrawtchouk" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.monicKrawtchouk3(name, l1, k1, k2, k3); }
  / name:"\Laguerre" l1:lit l2:lit k1:lit  { return ast.Tex.Laguerre1(name, l1, l2, k1); }
  / name:"\monicLaguerre" l1:lit l2:lit k1:lit  { return ast.Tex.monicLaguerre1(name, l1, l2, k1); }
  / name:"\BesselPoly" l1:lit atsymbol k1:lit k2:lit  { return ast.Tex.BesselPoly2(name, l1, k1, k2); }
  / name:"\monicBesselPoly" l1:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.monicBesselPoly3(name, l1, k1, k2); }
  / name:"\Hermite" l1:lit k1:lit  { return ast.Tex.Hermite1(name, l1, k1); }
  / name:"\Charlier" l1:lit atsymbol k1:lit k2:lit  { return ast.Tex.Charlier2(name, l1, k1, k2); }
  / name:"\monicCharlier" l1:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.monicCharlier3(name, l1, k1, k2); }
  / name:"\monicHermite" l1:lit k1:lit  { return ast.Tex.monicHermite1(name, l1, k1); }
  / name:"\AskeyWilson" l1:lit atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit k6:lit  { return ast.Tex.AskeyWilson2(name, l1, k1, k2, k3, k4, k5, k6); }
  / name:"\normAskeyWilsonptilde" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit k6:lit  { return ast.Tex.normAskeyWilsonptilde3(name, l1, k1, k2, k3, k4, k5, k6); }
  / name:"\monicAskeyWilson" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit k6:lit  { return ast.Tex.monicAskeyWilson3(name, l1, k1, k2, k3, k4, k5, k6); }
  / name:"\qRacah" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit k6:lit  { return ast.Tex.qRacah3(name, l1, k1, k2, k3, k4, k5, k6); }
  / name:"\monicqRacah" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit k6:lit  { return ast.Tex.monicqRacah3(name, l1, k1, k2, k3, k4, k5, k6); }
  / name:"\normctsdualqHahnptilde" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.normctsdualqHahnptilde3(name, l1, k1, k2, k3, k4, k5); }
  / name:"\ctsdualqHahn" l1:lit atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.ctsdualqHahn2(name, l1, k1, k2, k3, k4, k5); }
  / name:"\monicctsdualqHahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.monicctsdualqHahn3(name, l1, k1, k2, k3, k4, k5); }
  / name:"\normctsqHahnptilde" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit k6:lit  { return ast.Tex.normctsqHahnptilde3(name, l1, k1, k2, k3, k4, k5, k6); }
  / name:"\ctsqHahn" l1:lit atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit k6:lit  { return ast.Tex.ctsqHahn2(name, l1, k1, k2, k3, k4, k5, k6); }
  / name:"\monicctsqHahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit k6:lit  { return ast.Tex.monicctsqHahn3(name, l1, k1, k2, k3, k4, k5, k6); }
  / name:"\bigqJacobi" l1:lit atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.bigqJacobi2(name, l1, k1, k2, k3, k4, k5); }
  / name:"\monicbigqJacobi" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.monicbigqJacobi3(name, l1, k1, k2, k3, k4, k5); }
  / name:"\bigqJacobiIVparam" l1:lit atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit k6:lit  { return ast.Tex.bigqJacobiIVparam2(name, l1, k1, k2, k3, k4, k5, k6); }
  / name:"\bigqLegendre" l1:lit atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.bigqLegendre2(name, l1, k1, k2, k3); }
  / name:"\monicbigqLegendre" l1:lit atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.monicbigqLegendre2(name, l1, k1, k2, k3); }
  / name:"\qHahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.qHahn3(name, l1, k1, k2, k3, k4, k5); }
  / name:"\monicqHahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.monicqHahn3(name, l1, k1, k2, k3, k4); }
  / name:"\dualqHahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.dualqHahn3(name, l1, k1, k2, k3, k4); }
  / name:"\monicdualqHahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.monicdualqHahn3(name, l1, k1, k2, k3, k4); }
  / name:"\AlSalamChihara" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.AlSalamChihara3(name, l1, k1, k2, k3, k4); }
  / name:"\qinvAlSalamChihara" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.qinvAlSalamChihara3(name, l1, k1, k2, k3, k4); }
  / name:"\monicAlSalamChihara" l1:lit atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.monicAlSalamChihara2(name, l1, k1, k2, k3, k4); }
  / name:"\monicqinvAlSalamChihara" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.monicqinvAlSalamChihara3(name, l1, k1, k2, k3, k4); }
  / name:"\qMeixnerPollaczek" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.qMeixnerPollaczek3(name, l1, k1, k2, k3); }
  / name:"\monicqMeixnerPollaczek" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.monicqMeixnerPollaczek3(name, l1, k1, k2, k3); }
  / name:"\normctsqJacobiPtilde" l1:lit l2:lit l3:lit atsymbol k1:lit k2:lit  { return ast.Tex.normctsqJacobiPtilde2(name, l1, l2, l3, k1, k2); }
  / name:"\ctsqJacobi" l1:lit l2:lit l3:lit atsymbol k1:lit k2:lit  { return ast.Tex.ctsqJacobi2(name, l1, l2, l3, k1, k2); }
  / name:"\monicctsqJacobi" l1:lit l2:lit l3:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.monicctsqJacobi3(name, l1, l2, l3, k1, k2); }
  / name:"\ctsqUltra" l1:lit atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.ctsqUltra2(name, l1, k1, k2, k3); }
  / name:"\monicctsqUltra" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.monicctsqUltra3(name, l1, k1, k2, k3); }
  / name:"\ctsqLegendre" l1:lit atsymbol k1:lit k2:lit  { return ast.Tex.ctsqLegendre2(name, l1, k1, k2); }
  / name:"\monicctsqLegendre" l1:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.monicctsqLegendre3(name, l1, k1, k2); }
  / name:"\bigqLaguerre" l1:lit atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.bigqLaguerre2(name, l1, k1, k2, k3, k4); }
  / name:"\monicbigqLaguerre" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.monicbigqLaguerre3(name, l1, k1, k2, k3, k4); }
  / name:"\littleqJacobi" l1:lit atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.littleqJacobi2(name, l1, k1, k2, k3, k4); }
  / name:"\moniclittleqJacobi" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.moniclittleqJacobi3(name, l1, k1, k2, k3, k4); }
  / name:"\littleqLegendre" l1:lit atsymbol k1:lit k2:lit  { return ast.Tex.littleqLegendre2(name, l1, k1, k2); }
  / name:"\moniclittleqLegendre" l1:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.moniclittleqLegendre3(name, l1, k1, k2); }
  / name:"\qMeixner" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.qMeixner3(name, l1, k1, k2, k3, k4); }
  / name:"\monicqMeixner" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.monicqMeixner3(name, l1, k1, k2, k3, k4); }
  / name:"\qtmqKrawtchouk" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.qtmqKrawtchouk3(name, l1, k1, k2, k3, k4); }
  / name:"\monicqtmqKrawtchouk" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.monicqtmqKrawtchouk3(name, l1, k1, k2, k3, k4); }
  / name:"\qKrawtchouk" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.qKrawtchouk3(name, l1, k1, k2, k3, k4); }
  / name:"\monicqKrawtchouk" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.monicqKrawtchouk3(name, l1, k1, k2, k3, k4); }
  / name:"\AffqKrawtchouk" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.AffqKrawtchouk3(name, l1, k1, k2, k3, k4); }
  / name:"\monicAffqKrawtchouk" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.monicAffqKrawtchouk3(name, l1, k1, k2, k3, k4); }
  / name:"\dualqKrawtchouk" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.dualqKrawtchouk3(name, l1, k1, k2, k3, k4); }
  / name:"\monicdualqKrawtchouk" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.monicdualqKrawtchouk3(name, l1, k1, k2, k3, k4); }
  / name:"\ctsbigqHermite" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.ctsbigqHermite3(name, l1, k1, k2, k3); }
  / name:"\monicctsbigqHermite" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.monicctsbigqHermite3(name, l1, k1, k2, k3); }
  / name:"\ctsqLaguerre" l1:lit l2:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.ctsqLaguerre3(name, l1, l2, k1, k2); }
  / name:"\monicctsqLaguerre" l1:lit l2:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.monicctsqLaguerre3(name, l1, l2, k1, k2); }
  / name:"\littleqLaguerre" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.littleqLaguerre3(name, l1, k1, k2, k3); }
  / name:"\moniclittleqLaguerre" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.moniclittleqLaguerre3(name, l1, k1, k2, k3); }
  / name:"\qLaguerre" l1:lit l2:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.qLaguerre3(name, l1, l2, k1, k2); }
  / name:"\monicqLaguerre" l1:lit l2:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.monicqLaguerre3(name, l1, l2, k1, k2); }
  / name:"\qBesselPoly" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.qBesselPoly3(name, l1, k1, k2, k3); }
  / name:"\monicqBesselPoly" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.monicqBesselPoly3(name, l1, k1, k2, k3); }
  / name:"\qCharlier" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.qCharlier3(name, l1, k1, k2, k3); }
  / name:"\monicqCharlier" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.monicqCharlier3(name, l1, k1, k2, k3); }
  / name:"\AlSalamCarlitzI" l1:lit l2:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.AlSalamCarlitzI3(name, l1, l2, k1, k2); }
  / name:"\monicAlSalamCarlitzI" l1:lit l2:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.monicAlSalamCarlitzI3(name, l1, l2, k1, k2); }
  / name:"\AlSalamCarlitzII" l1:lit l2:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.AlSalamCarlitzII3(name, l1, l2, k1, k2); }
  / name:"\monicAlSalamCarlitzII" l1:lit l2:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.monicAlSalamCarlitzII3(name, l1, l2, k1, k2); }
  / name:"\ctsqHermite" l1:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.ctsqHermite3(name, l1, k1, k2); }
  / name:"\monicctsqHermite" l1:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.monicctsqHermite3(name, l1, k1, k2); }
  / name:"\StieltjesWigert" l1:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.StieltjesWigert3(name, l1, k1, k2); }
  / name:"\monicStieltjesWigert" l1:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.monicStieltjesWigert3(name, l1, k1, k2); }
  / name:"\discrqHermiteI" l1:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.discrqHermiteI3(name, l1, k1, k2); }
  / name:"\monicdiscrqHermiteI" l1:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.monicdiscrqHermiteI3(name, l1, k1, k2); }
  / name:"\discrqHermiteII" l1:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.discrqHermiteII3(name, l1, k1, k2); }
  / name:"\monicdiscrqHermiteII" l1:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.monicdiscrqHermiteII3(name, l1, k1, k2); }
  / name:"\ctsqJacobiRahman" l1:lit l2:lit l3:lit atsymbol k1:lit k2:lit  { return ast.Tex.ctsqJacobiRahman2(name, l1, l2, l3, k1, k2); }
  / name:"\ctsqLegendreRahman" l1:lit atsymbol k1:lit k2:lit  { return ast.Tex.ctsqLegendreRahman2(name, l1, k1, k2); }
  / name:"\pseudobigqJacobi" l1:lit atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.pseudobigqJacobi2(name, l1, k1, k2, k3, k4, k5); }
  / name:"\GottliebLaguerre" l1:lit k1:lit  { return ast.Tex.GottliebLaguerre1(name, l1, k1); }
  / name:"\CiglerqChebyT" l1:lit atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.CiglerqChebyT2(name, l1, k1, k2, k3); }
  / name:"\CiglerqChebyU" l1:lit atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.CiglerqChebyU2(name, l1, k1, k2, k3); }
  / name:"\AlSalamIsmail" l1:lit atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.AlSalamIsmail2(name, l1, k1, k2, k3); }
  / name:"\ChebyV" l1:lit k1:lit  { return ast.Tex.ChebyV1(name, l1, k1); }
  / name:"\ChebyW" l1:lit k1:lit  { return ast.Tex.ChebyW1(name, l1, k1); }
  / name:"\NeumannFactor" l1:lit  { return ast.Tex.NeumannFactor1(name, l1); }
  / name:"\BesselPolyIIparam" l1:lit atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.BesselPolyIIparam2(name, l1, k1, k2, k3); }
  / name:"\BesselPolyTheta" l1:lit atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.BesselPolyTheta2(name, l1, k1, k2, k3); }
  / name:"\Deriv" atsymbol k1:lit k2:lit  { return ast.Tex.Deriv2(name, k1, k2); }
  / name:"\DDeriv" atsymbol k1:lit k2:lit  { return ast.Tex.DDeriv2(name, k1, k2); }
  / name:"\FourierTrans" atsymbol atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.FourierTrans4(name, k1, k2); }
  / name:"\SpaceTestFunTempered" atsymbol k1:lit  { return ast.Tex.SpaceTestFunTempered2(name, k1); }

litstuff = //basically lit without DELIMITER or LITERAL as an option (replaced by LITERALPART at the end), needed because they interrupt the parsing of commands in PAREN.
    f:PAREN atsymbol atsymbol l:lit   &{ return options.semanticlatex; }
    { return ast.Tex.PAREN2(f, l); }
  / f:PAREN atsymbol l:lit &{ return options.semanticlatex; }
    { return ast.Tex.PAREN1(f, l); }
  / "P_" l:lit "^" "{"* _ PAREN_OPEN _ l2:lit _ "," _ l3:lit _ PAREN_CLOSE _ "}"* l4:litparen1 &{ return options.semanticlatex; }
    { return ast.Tex.JACOBI(l, l2, l3, l4); }
  / "L_" l:lit "^" l2:litparen1 l3:litparen1 &{ return options.semanticlatex; }
    { return ast.Tex.LAGUERRE2(l, l2, l3); }
  / "L_" l:lit l2:litparen1 &{ return options.semanticlatex; }
    { return ast.Tex.LAGUERRE1(l, l2); }
  / PAREN_OPEN l:lit ";" l2:lit PAREN_CLOSE "_" l3:lit &{ return options.semanticlatex; }
    { return ast.Tex.QPOCH(l, l2, l3); }
  / l1:litparen1 "_" l2:lit   &{ return options.semanticlatex; }
    { return ast.Tex.POCH(l1, l2); }
  / f:PAREN l:litparen1  &{ return options.semanticlatex; }
    { return ast.Tex.PAREN1(f, l); } //must be before LITERAL!!
  / name:PAREN l:lit      &{ return options.semanticlatex; }
    { return ast.Tex.PAREN2(name, l); }
  / "{" _ "\\rm" _ e:EJACOBI _ "}" _ PAREN_OPEN _ l1:lit _ "," _ l2:lit _ PAREN_CLOSE &{ return options.semanticlatex; }
    { return ast.Tex.EJACOBI(e, l1, l2); }
  / b:BIG r:DELIMITER           { return ast.Tex.BIG(b, r); }
  / b:BIG SQ_CLOSE              { return ast.Tex.BIG(b, sq_close_ri); }
  / l:left e:expr r:right       { return ast.Tex.LR(l, r, e.toArray()); }
  / name:FUN_AR1opt e:expr_nosqc SQ_CLOSE l:lit /* must be before FUN_AR1 */
    { return ast.Tex.FUN2sq(name, ast.Tex.CURLY(e.toArray()), l); }
  / name:FUN_AR1 l:lit          { return ast.Tex.FUN1(name, l); }
  / name:FUN_AR1nb l:lit        { return ast.Tex.FUN1nb(name, l); }
  / f:FUN_AR1hl l:lit           { return ast.Tex.FUN1hl(f[0], f[1], l); }
  / f:FUN_AR1hf l:lit           { return ast.Tex.FUN1hf(f[0], f[1], l); }
  / name:FUN_AR2 l1:lit l2:lit  { return ast.Tex.FUN2(name, l1, l2); }
  / name:FUN_AR2nb l1:lit l2:lit { return ast.Tex.FUN2nb(name, l1, l2); }
  / f:FUN_AR2h l1:lit l2:lit    { return ast.Tex.FUN2h(f[0], f[1], l1, l2); }
  / name:FUN_AR3 l1:lit l2:lit l3:lit &{ return options.semanticlatex; } { return ast.Tex.FUN3(name, l1, l2, l3); }
  / f:JACOBI l1:lit l2:lit l3:lit atsymbol l4:lit &{ return options.semanticlatex; } { return ast.Tex.JACOBI(l1, l2, l3, l4); }
  / f:LAGUERRE l1:lit atsymbol l2:lit &{ return options.semanticlatex; } { return ast.Tex.LAGUERRE1(l1 ,l2); }
  / f:LAGUERRE l1:lit "[" l2:lit "]" atsymbol l3:lit &{ return options.semanticlatex; } { return ast.Tex.LAGUERRE2(l1, l2, l3); }
  / "\\Jacobi" e:EJACOBI atsymbol l1:lit l2:lit &{ return options.semanticlatex; } { return ast.Tex.EJACOBI(e, l1, l2); }
  / BOX
  / CURLY_OPEN e:expr CURLY_CLOSE
    { return ast.Tex.CURLY(e.toArray()); }
  / CURLY_OPEN e1:ne_expr name:FUN_INFIX e2:ne_expr CURLY_CLOSE
    { return ast.Tex.INFIX(name, e1.toArray(), e2.toArray()); }
  / CURLY_OPEN e1:ne_expr f:FUN_INFIXh e2:ne_expr CURLY_CLOSE
    { return ast.Tex.INFIXh(f[0], f[1], e1.toArray(), e2.toArray()); }
  / BEGIN_MATRIX   m:(array/matrix) END_MATRIX
    { return ast.Tex.MATRIX("matrix", lst2arr(m)); }
  / BEGIN_PMATRIX  m:(array/matrix) END_PMATRIX
    { return ast.Tex.MATRIX("pmatrix", lst2arr(m)); }
  / BEGIN_BMATRIX  m:(array/matrix) END_BMATRIX
    { return ast.Tex.MATRIX("bmatrix", lst2arr(m)); }
  / BEGIN_BBMATRIX m:(array/matrix) END_BBMATRIX
    { return ast.Tex.MATRIX("Bmatrix", lst2arr(m)); }
  / BEGIN_VMATRIX  m:(array/matrix) END_VMATRIX
    { return ast.Tex.MATRIX("vmatrix", lst2arr(m)); }
  / BEGIN_VVMATRIX m:(array/matrix) END_VVMATRIX
    { return ast.Tex.MATRIX("Vmatrix", lst2arr(m)); }
  / BEGIN_ARRAY    opt_pos m:array END_ARRAY
    { return ast.Tex.MATRIX("array", lst2arr(m)); }
  / BEGIN_ALIGN    opt_pos m:matrix END_ALIGN
    { return ast.Tex.MATRIX("aligned", lst2arr(m)); }
  / BEGIN_ALIGNED  opt_pos m:matrix END_ALIGNED // parse what we emit
    { return ast.Tex.MATRIX("aligned", lst2arr(m)); }
  / BEGIN_ALIGNAT  m:alignat END_ALIGNAT
    { return ast.Tex.MATRIX("alignedat", lst2arr(m)); }
  / BEGIN_ALIGNEDAT m:alignat END_ALIGNEDAT // parse what we emit
    { return ast.Tex.MATRIX("alignedat", lst2arr(m)); }
  / BEGIN_SMALLMATRIX m:(array/matrix) END_SMALLMATRIX
    { return ast.Tex.MATRIX("smallmatrix", lst2arr(m)); }
  / BEGIN_CASES    m:matrix END_CASES
    { return ast.Tex.MATRIX("cases", lst2arr(m)); }
  / "\\begin{" alpha+ "}" /* better error messages for unknown environments */
    { throw new peg$SyntaxError("Illegal TeX function", [], text(), location()); }
  / f:generic_func &{ return !tu.all_functions[f]; }
    { throw new peg$SyntaxError("Illegal TeX function", [], text(), location()); }
  / l:LITERALPART { return ast.Tex.LITERAL(l); }
  / name:"\HarmonicNumber" l1:lit  { return ast.Tex.HarmonicNumber1(name, l1); }
  / name:"\StieltjesConstants" l1:lit  { return ast.Tex.StieltjesConstants1(name, l1); }
  / name:"\GenGegenbauer" l1:lit l2:lit l3:lit k1:lit  { return ast.Tex.GenGegenbauer1(name, l1, l2, l3, k1); }
  / name:"\GenHermite" l1:lit l2:lit k1:lit  { return ast.Tex.GenHermite1(name, l1, l2, k1); }
  / name:"\qHyperrWs" l1:lit l2:lit atsymbol atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.qHyperrWs4(name, l1, l2, k1, k2, k3, k4); }
  / name:"\Jacobi" l1:lit l2:lit l3:lit k1:lit  { return ast.Tex.Jacobi1(name, l1, l2, l3, k1); }
  / name:"\normJacobiR" l1:lit l2:lit l3:lit k1:lit  { return ast.Tex.normJacobiR1(name, l1, l2, l3, k1); }
  / name:"\ctsqUltrae" l1:lit atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.ctsqUltrae2(name, l1, k1, k2, k3); }
  / name:"\JacksonqBesselI" l1:lit atsymbol k1:lit k2:lit  { return ast.Tex.JacksonqBesselI2(name, l1, k1, k2); }
  / name:"\JacksonqBesselII" l1:lit atsymbol k1:lit k2:lit  { return ast.Tex.JacksonqBesselII2(name, l1, k1, k2); }
  / name:"\JacksonqBesselIII" l1:lit atsymbol k1:lit k2:lit  { return ast.Tex.JacksonqBesselIII2(name, l1, k1, k2); }
  / name:"\qderiv" l1:lit l2:lit k1:lit  { return ast.Tex.qderiv1(name, l1, l2, k1); }
  / name:"\f" l1:lit atsymbol atsymbol k1:lit  { return ast.Tex.f3(name, l1, k1); }
  / name:"\poly" l1:lit l2:lit atsymbol k1:lit  { return ast.Tex.poly2(name, l1, l2, k1); }
  / name:"\Sum" l1:lit l2:lit l3:lit atsymbol k1:lit  { return ast.Tex.Sum2(name, l1, l2, l3, k1); }
  / name:"\Prod" l1:lit l2:lit l3:lit atsymbol k1:lit  { return ast.Tex.Prod2(name, l1, l2, l3, k1); }
  / name:"\AntiDer" atsymbol k1:lit k2:lit  { return ast.Tex.AntiDer2(name, k1, k2); }
  / name:"\Int" l1:lit l2:lit atsymbol k1:lit k2:lit  { return ast.Tex.Int2(name, l1, l2, k1, k2); }
  / name:"\qexpKLS" l1:lit atsymbol atsymbol k1:lit  { return ast.Tex.qexpKLS3(name, l1, k1); }
  / name:"\qExpKLS" l1:lit atsymbol atsymbol k1:lit  { return ast.Tex.qExpKLS3(name, l1, k1); }
  / name:"\qsinKLS" l1:lit atsymbol atsymbol k1:lit  { return ast.Tex.qsinKLS3(name, l1, k1); }
  / name:"\qSinKLS" l1:lit atsymbol atsymbol k1:lit  { return ast.Tex.qSinKLS3(name, l1, k1); }
  / name:"\qcosKLS" l1:lit atsymbol atsymbol k1:lit  { return ast.Tex.qcosKLS3(name, l1, k1); }
  / name:"\qCosKLS" l1:lit atsymbol atsymbol k1:lit  { return ast.Tex.qCosKLS3(name, l1, k1); }
  / name:"\Wilson" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.Wilson3(name, l1, k1, k2, k3, k4, k5); }
  / name:"\normWilsonWtilde" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.normWilsonWtilde3(name, l1, k1, k2, k3, k4, k5); }
  / name:"\monicWilson" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.monicWilson3(name, l1, k1, k2, k3, k4, k5); }
  / name:"\Racah" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.Racah3(name, l1, k1, k2, k3, k4, k5); }
  / name:"\monicRacah" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.monicRacah3(name, l1, k1, k2, k3, k4, k5); }
  / name:"\ctsdualHahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.ctsdualHahn3(name, l1, k1, k2, k3, k4); }
  / name:"\normctsdualHahnStilde" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.normctsdualHahnStilde3(name, l1, k1, k2, k3, k4); }
  / name:"\monicctsdualHahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.monicctsdualHahn3(name, l1, k1, k2, k3, k4); }
  / name:"\ctsHahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.ctsHahn3(name, l1, k1, k2, k3, k4, k5); }
  / name:"\normctsHahnptilde" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.normctsHahnptilde3(name, l1, k1, k2, k3, k4, k5); }
  / name:"\monicctsHahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.monicctsHahn3(name, l1, k1, k2, k3, k4, k5); }
  / name:"\Hahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.Hahn3(name, l1, k1, k2, k3, k4); }
  / name:"\monicHahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.monicHahn3(name, l1, k1, k2, k3, k4); }
  / name:"\dualHahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.dualHahn3(name, l1, k1, k2, k3, k4); }
  / name:"\monicdualHahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.monicdualHahn3(name, l1, k1, k2, k3, k4); }
  / name:"\MeixnerPollaczek" l1:lit l2:lit atsymbol k1:lit k2:lit  { return ast.Tex.MeixnerPollaczek2(name, l1, l2, k1, k2); }
  / name:"\monicMeixnerPollaczek" l1:lit l2:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.monicMeixnerPollaczek3(name, l1, l2, k1, k2); }
  / name:"\monicJacobi" l1:lit l2:lit l3:lit k1:lit  { return ast.Tex.monicJacobi1(name, l1, l2, l3, k1); }
  / name:"\monicUltra" l1:lit l2:lit k1:lit  { return ast.Tex.monicUltra1(name, l1, l2, k1); }
  / name:"\Ultra" l1:lit l2:lit k1:lit  { return ast.Tex.Ultra1(name, l1, l2, k1); }
  / name:"\ChebyT" l1:lit k1:lit  { return ast.Tex.ChebyT1(name, l1, k1); }
  / name:"\ChebyU" l1:lit k1:lit  { return ast.Tex.ChebyU1(name, l1, k1); }
  / name:"\monicChebyT" l1:lit k1:lit  { return ast.Tex.monicChebyT1(name, l1, k1); }
  / name:"\monicChebyU" l1:lit k1:lit  { return ast.Tex.monicChebyU1(name, l1, k1); }
  / name:"\monicLegendrePoly" l1:lit k1:lit  { return ast.Tex.monicLegendrePoly1(name, l1, k1); }
  / name:"\pseudoJacobi" l1:lit atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.pseudoJacobi2(name, l1, k1, k2, k3); }
  / name:"\monicpseudoJacobi" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.monicpseudoJacobi3(name, l1, k1, k2, k3); }
  / name:"\Meixner" l1:lit atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.Meixner2(name, l1, k1, k2, k3); }
  / name:"\monicMeixner" l1:lit atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.monicMeixner2(name, l1, k1, k2, k3); }
  / name:"\Krawtchouk" l1:lit atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.Krawtchouk2(name, l1, k1, k2, k3); }
  / name:"\monicKrawtchouk" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.monicKrawtchouk3(name, l1, k1, k2, k3); }
  / name:"\Laguerre" l1:lit l2:lit k1:lit  { return ast.Tex.Laguerre1(name, l1, l2, k1); }
  / name:"\monicLaguerre" l1:lit l2:lit k1:lit  { return ast.Tex.monicLaguerre1(name, l1, l2, k1); }
  / name:"\BesselPoly" l1:lit atsymbol k1:lit k2:lit  { return ast.Tex.BesselPoly2(name, l1, k1, k2); }
  / name:"\monicBesselPoly" l1:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.monicBesselPoly3(name, l1, k1, k2); }
  / name:"\Hermite" l1:lit k1:lit  { return ast.Tex.Hermite1(name, l1, k1); }
  / name:"\Charlier" l1:lit atsymbol k1:lit k2:lit  { return ast.Tex.Charlier2(name, l1, k1, k2); }
  / name:"\monicCharlier" l1:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.monicCharlier3(name, l1, k1, k2); }
  / name:"\monicHermite" l1:lit k1:lit  { return ast.Tex.monicHermite1(name, l1, k1); }
  / name:"\AskeyWilson" l1:lit atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit k6:lit  { return ast.Tex.AskeyWilson2(name, l1, k1, k2, k3, k4, k5, k6); }
  / name:"\normAskeyWilsonptilde" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit k6:lit  { return ast.Tex.normAskeyWilsonptilde3(name, l1, k1, k2, k3, k4, k5, k6); }
  / name:"\monicAskeyWilson" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit k6:lit  { return ast.Tex.monicAskeyWilson3(name, l1, k1, k2, k3, k4, k5, k6); }
  / name:"\qRacah" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit k6:lit  { return ast.Tex.qRacah3(name, l1, k1, k2, k3, k4, k5, k6); }
  / name:"\monicqRacah" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit k6:lit  { return ast.Tex.monicqRacah3(name, l1, k1, k2, k3, k4, k5, k6); }
  / name:"\normctsdualqHahnptilde" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.normctsdualqHahnptilde3(name, l1, k1, k2, k3, k4, k5); }
  / name:"\ctsdualqHahn" l1:lit atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.ctsdualqHahn2(name, l1, k1, k2, k3, k4, k5); }
  / name:"\monicctsdualqHahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.monicctsdualqHahn3(name, l1, k1, k2, k3, k4, k5); }
  / name:"\normctsqHahnptilde" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit k6:lit  { return ast.Tex.normctsqHahnptilde3(name, l1, k1, k2, k3, k4, k5, k6); }
  / name:"\ctsqHahn" l1:lit atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit k6:lit  { return ast.Tex.ctsqHahn2(name, l1, k1, k2, k3, k4, k5, k6); }
  / name:"\monicctsqHahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit k6:lit  { return ast.Tex.monicctsqHahn3(name, l1, k1, k2, k3, k4, k5, k6); }
  / name:"\bigqJacobi" l1:lit atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.bigqJacobi2(name, l1, k1, k2, k3, k4, k5); }
  / name:"\monicbigqJacobi" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.monicbigqJacobi3(name, l1, k1, k2, k3, k4, k5); }
  / name:"\bigqJacobiIVparam" l1:lit atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit k6:lit  { return ast.Tex.bigqJacobiIVparam2(name, l1, k1, k2, k3, k4, k5, k6); }
  / name:"\bigqLegendre" l1:lit atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.bigqLegendre2(name, l1, k1, k2, k3); }
  / name:"\monicbigqLegendre" l1:lit atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.monicbigqLegendre2(name, l1, k1, k2, k3); }
  / name:"\qHahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.qHahn3(name, l1, k1, k2, k3, k4, k5); }
  / name:"\monicqHahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.monicqHahn3(name, l1, k1, k2, k3, k4); }
  / name:"\dualqHahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.dualqHahn3(name, l1, k1, k2, k3, k4); }
  / name:"\monicdualqHahn" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.monicdualqHahn3(name, l1, k1, k2, k3, k4); }
  / name:"\AlSalamChihara" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.AlSalamChihara3(name, l1, k1, k2, k3, k4); }
  / name:"\qinvAlSalamChihara" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.qinvAlSalamChihara3(name, l1, k1, k2, k3, k4); }
  / name:"\monicAlSalamChihara" l1:lit atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.monicAlSalamChihara2(name, l1, k1, k2, k3, k4); }
  / name:"\monicqinvAlSalamChihara" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.monicqinvAlSalamChihara3(name, l1, k1, k2, k3, k4); }
  / name:"\qMeixnerPollaczek" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.qMeixnerPollaczek3(name, l1, k1, k2, k3); }
  / name:"\monicqMeixnerPollaczek" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.monicqMeixnerPollaczek3(name, l1, k1, k2, k3); }
  / name:"\normctsqJacobiPtilde" l1:lit l2:lit l3:lit atsymbol k1:lit k2:lit  { return ast.Tex.normctsqJacobiPtilde2(name, l1, l2, l3, k1, k2); }
  / name:"\ctsqJacobi" l1:lit l2:lit l3:lit atsymbol k1:lit k2:lit  { return ast.Tex.ctsqJacobi2(name, l1, l2, l3, k1, k2); }
  / name:"\monicctsqJacobi" l1:lit l2:lit l3:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.monicctsqJacobi3(name, l1, l2, l3, k1, k2); }
  / name:"\ctsqUltra" l1:lit atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.ctsqUltra2(name, l1, k1, k2, k3); }
  / name:"\monicctsqUltra" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.monicctsqUltra3(name, l1, k1, k2, k3); }
  / name:"\ctsqLegendre" l1:lit atsymbol k1:lit k2:lit  { return ast.Tex.ctsqLegendre2(name, l1, k1, k2); }
  / name:"\monicctsqLegendre" l1:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.monicctsqLegendre3(name, l1, k1, k2); }
  / name:"\bigqLaguerre" l1:lit atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.bigqLaguerre2(name, l1, k1, k2, k3, k4); }
  / name:"\monicbigqLaguerre" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.monicbigqLaguerre3(name, l1, k1, k2, k3, k4); }
  / name:"\littleqJacobi" l1:lit atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.littleqJacobi2(name, l1, k1, k2, k3, k4); }
  / name:"\moniclittleqJacobi" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.moniclittleqJacobi3(name, l1, k1, k2, k3, k4); }
  / name:"\littleqLegendre" l1:lit atsymbol k1:lit k2:lit  { return ast.Tex.littleqLegendre2(name, l1, k1, k2); }
  / name:"\moniclittleqLegendre" l1:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.moniclittleqLegendre3(name, l1, k1, k2); }
  / name:"\qMeixner" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.qMeixner3(name, l1, k1, k2, k3, k4); }
  / name:"\monicqMeixner" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.monicqMeixner3(name, l1, k1, k2, k3, k4); }
  / name:"\qtmqKrawtchouk" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.qtmqKrawtchouk3(name, l1, k1, k2, k3, k4); }
  / name:"\monicqtmqKrawtchouk" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.monicqtmqKrawtchouk3(name, l1, k1, k2, k3, k4); }
  / name:"\qKrawtchouk" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.qKrawtchouk3(name, l1, k1, k2, k3, k4); }
  / name:"\monicqKrawtchouk" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.monicqKrawtchouk3(name, l1, k1, k2, k3, k4); }
  / name:"\AffqKrawtchouk" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.AffqKrawtchouk3(name, l1, k1, k2, k3, k4); }
  / name:"\monicAffqKrawtchouk" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.monicAffqKrawtchouk3(name, l1, k1, k2, k3, k4); }
  / name:"\dualqKrawtchouk" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.dualqKrawtchouk3(name, l1, k1, k2, k3, k4); }
  / name:"\monicdualqKrawtchouk" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit k4:lit  { return ast.Tex.monicdualqKrawtchouk3(name, l1, k1, k2, k3, k4); }
  / name:"\ctsbigqHermite" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.ctsbigqHermite3(name, l1, k1, k2, k3); }
  / name:"\monicctsbigqHermite" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.monicctsbigqHermite3(name, l1, k1, k2, k3); }
  / name:"\ctsqLaguerre" l1:lit l2:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.ctsqLaguerre3(name, l1, l2, k1, k2); }
  / name:"\monicctsqLaguerre" l1:lit l2:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.monicctsqLaguerre3(name, l1, l2, k1, k2); }
  / name:"\littleqLaguerre" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.littleqLaguerre3(name, l1, k1, k2, k3); }
  / name:"\moniclittleqLaguerre" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.moniclittleqLaguerre3(name, l1, k1, k2, k3); }
  / name:"\qLaguerre" l1:lit l2:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.qLaguerre3(name, l1, l2, k1, k2); }
  / name:"\monicqLaguerre" l1:lit l2:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.monicqLaguerre3(name, l1, l2, k1, k2); }
  / name:"\qBesselPoly" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.qBesselPoly3(name, l1, k1, k2, k3); }
  / name:"\monicqBesselPoly" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.monicqBesselPoly3(name, l1, k1, k2, k3); }
  / name:"\qCharlier" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.qCharlier3(name, l1, k1, k2, k3); }
  / name:"\monicqCharlier" l1:lit atsymbol atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.monicqCharlier3(name, l1, k1, k2, k3); }
  / name:"\AlSalamCarlitzI" l1:lit l2:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.AlSalamCarlitzI3(name, l1, l2, k1, k2); }
  / name:"\monicAlSalamCarlitzI" l1:lit l2:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.monicAlSalamCarlitzI3(name, l1, l2, k1, k2); }
  / name:"\AlSalamCarlitzII" l1:lit l2:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.AlSalamCarlitzII3(name, l1, l2, k1, k2); }
  / name:"\monicAlSalamCarlitzII" l1:lit l2:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.monicAlSalamCarlitzII3(name, l1, l2, k1, k2); }
  / name:"\ctsqHermite" l1:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.ctsqHermite3(name, l1, k1, k2); }
  / name:"\monicctsqHermite" l1:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.monicctsqHermite3(name, l1, k1, k2); }
  / name:"\StieltjesWigert" l1:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.StieltjesWigert3(name, l1, k1, k2); }
  / name:"\monicStieltjesWigert" l1:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.monicStieltjesWigert3(name, l1, k1, k2); }
  / name:"\discrqHermiteI" l1:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.discrqHermiteI3(name, l1, k1, k2); }
  / name:"\monicdiscrqHermiteI" l1:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.monicdiscrqHermiteI3(name, l1, k1, k2); }
  / name:"\discrqHermiteII" l1:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.discrqHermiteII3(name, l1, k1, k2); }
  / name:"\monicdiscrqHermiteII" l1:lit atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.monicdiscrqHermiteII3(name, l1, k1, k2); }
  / name:"\ctsqJacobiRahman" l1:lit l2:lit l3:lit atsymbol k1:lit k2:lit  { return ast.Tex.ctsqJacobiRahman2(name, l1, l2, l3, k1, k2); }
  / name:"\ctsqLegendreRahman" l1:lit atsymbol k1:lit k2:lit  { return ast.Tex.ctsqLegendreRahman2(name, l1, k1, k2); }
  / name:"\pseudobigqJacobi" l1:lit atsymbol k1:lit k2:lit k3:lit k4:lit k5:lit  { return ast.Tex.pseudobigqJacobi2(name, l1, k1, k2, k3, k4, k5); }
  / name:"\GottliebLaguerre" l1:lit k1:lit  { return ast.Tex.GottliebLaguerre1(name, l1, k1); }
  / name:"\CiglerqChebyT" l1:lit atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.CiglerqChebyT2(name, l1, k1, k2, k3); }
  / name:"\CiglerqChebyU" l1:lit atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.CiglerqChebyU2(name, l1, k1, k2, k3); }
  / name:"\AlSalamIsmail" l1:lit atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.AlSalamIsmail2(name, l1, k1, k2, k3); }
  / name:"\ChebyV" l1:lit k1:lit  { return ast.Tex.ChebyV1(name, l1, k1); }
  / name:"\ChebyW" l1:lit k1:lit  { return ast.Tex.ChebyW1(name, l1, k1); }
  / name:"\NeumannFactor" l1:lit  { return ast.Tex.NeumannFactor1(name, l1); }
  / name:"\BesselPolyIIparam" l1:lit atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.BesselPolyIIparam2(name, l1, k1, k2, k3); }
  / name:"\BesselPolyTheta" l1:lit atsymbol k1:lit k2:lit k3:lit  { return ast.Tex.BesselPolyTheta2(name, l1, k1, k2, k3); }
  / name:"\Deriv" atsymbol k1:lit k2:lit  { return ast.Tex.Deriv2(name, k1, k2); }
  / name:"\DDeriv" atsymbol k1:lit k2:lit  { return ast.Tex.DDeriv2(name, k1, k2); }
  / name:"\FourierTrans" atsymbol atsymbol atsymbol k1:lit k2:lit  { return ast.Tex.FourierTrans4(name, k1, k2); }
  / name:"\SpaceTestFunTempered" atsymbol k1:lit  { return ast.Tex.SpaceTestFunTempered2(name, k1); }

litparen1
  =
    "{" _ l:litparen1 _ "}" { return l; }
  / l:litparen { return l; }
litparen
  =
    PAREN_OPEN _ l:litplus _ PAREN_CLOSE { return l;}
litplus
  =
    l:litstuff { return l; }
  / r:LITERAL+ {
    var c = 0;
    var str = "";
    str = r.join("");
    while (c < r.join("").length) { //this code removes all the unneeded text and combines it together into one string.
        if (str.indexOf("TEX_ONLY(\"") >= 0) {
            str = str.replace("TEX_ONLY(\"", "");
        }
        if (str.indexOf("\")") >= 0) {
            str = str.replace("\")", "");
        }
        c = c + 1;
    }
    return ast.Tex.LITERAL(ast.RenderT.TEX_ONLY(str)); }
  / "" { return ast.Tex.LITERAL(ast.RenderT.TEX_ONLY("")); }

// "array" requires mandatory column specification
array
  = cs:column_spec m:matrix
    { m.head[0].unshift(cs); return m; }

// "alignat" requires mandatory # of columns
alignat
  = as:alignat_spec m:matrix
    { m.head[0].unshift(as); return m; }

// "matrix" does not require column specification
matrix
  = l:line_start tail:( NEXT_ROW m:matrix { return m; } )?
    { return { head: lst2arr(l), tail: tail }; }
line_start
  = f:HLINE l:line_start
    { l.head.unshift(ast.Tex.LITERAL(ast.RenderT.TEX_ONLY(f + " "))); return l;}
  / line
line
  = e:expr tail:( NEXT_CELL l:line { return l; } )?
    { return { head: e.toArray(), tail: tail }; }

column_spec
  = CURLY_OPEN cs:(one_col+ { return text(); }) CURLY_CLOSE
    { return ast.Tex.CURLY([ast.Tex.LITERAL(ast.RenderT.TEX_ONLY(cs))]); }

one_col
  = [lrc] _
  / "p" CURLY_OPEN boxchars+ CURLY_CLOSE
  / "*" CURLY_OPEN [0-9]+ _ CURLY_CLOSE
     ( one_col
     / CURLY_OPEN one_col+ CURLY_CLOSE
     )
  / "||" _
  / "|" _
  / "@" _ CURLY_OPEN boxchars+ CURLY_CLOSE

alignat_spec
  = CURLY_OPEN num:([0-9]+ { return text(); }) _ CURLY_CLOSE
    { return ast.Tex.CURLY([ast.Tex.LITERAL(ast.RenderT.TEX_ONLY(num))]); }

opt_pos
  = "[" _ [tcb] _ "]" _
  / "" /* empty */

/////////////////////////////////////////////////////////////
// LEXER
//----------------------------------------------------------
//space =           [ \t\n\r]
alpha =           [a-zA-Z]
literal_id =      [a-zA-Z]
literal_mn =      [0-9]
literal_uf_lt =   [,:;?!\']
delimiter_uf_lt = [().]
literal_uf_op =   [-+*=]
delimiter_uf_op = [\/|]
num =
      "-"? [0-9]* "." [0-9]+ _ spce?
    / "-"? [0-9]+ "."? _ spce?
spce = "pt" / "pc" / "in" / "cm" / "bp" / "mm" / "dd" / "cc" / "sp" / "ex" / "em" / "mu" / "px"
atsymbol = [@]
boxchars // match only valid UTF-16 sequences
 = [-0-9a-zA-Z+*,=():\/;?.!\'` \x80-\ud7ff\ue000-\uffff]
 / l:[\ud800-\udbff] h:[\udc00-\udfff] { return text(); }
//aboxchars = [-0-9a-zA-Z+*,=():\/;?.!\'` ]

BOX
 = b:generic_func &{ return tu.box_functions[b]; } _ "{" cs:boxchars+ "}" _
   { return ast.Tex.BOX(b, cs.join('')); }

// returns a RenderT
LITERAL
 = c:( literal_id / literal_mn / literal_uf_lt / "-" / literal_uf_op ) _
   { return ast.RenderT.TEX_ONLY(c); }
 / f:generic_func &{ return tu.latex_function_names[f]; } _
   c:( "(" / "[" / "\\{" / "" { return " ";}) _
   { return ast.RenderT.TEX_ONLY(f + c); }
 / f:generic_func &{ return tu.mediawiki_function_names[f]; } _
   c:( "(" / "[" / "\\{" / "" { return "";}) _
   { return ast.RenderT.TEX_ONLY("\\operatorname{" + f.slice(1) + "}" + c); }
 / f:generic_func &{ return tu.other_literals1[f]; } _ // from Texutil.find(...)
   { return ast.RenderT.TEX_ONLY(f + " "); }
 / f:generic_func &{ return options.usemathrm && tu.other_literals2[f]; } _ // from Texutil.find(...)
   { return ast.RenderT.TEX_ONLY("\\mathrm{" + f + "} "); }
 / mathrm:generic_func &{ return options.usemathrm && mathrm === "\\mathrm"; } _
   "{" f:generic_func &{ return options.usemathrm && tu.other_literals2[f]; } _ "}" _
   /* make sure we can parse what we emit */
   { return options.usemathrm && ast.RenderT.TEX_ONLY("\\mathrm{" + f + "} "); }
 / f:generic_func &{ return tu.other_literals2[f]; } _ // from Texutil.find(...)
   { return ast.RenderT.TEX_ONLY("\\mbox{" + f + "} "); }
 / mbox:generic_func &{ return mbox === "\\mbox"; } _
   "{" f:generic_func &{ return tu.other_literals2[f]; } _ "}" _
 /* make sure we can parse what we emit */
  { return ast.RenderT.TEX_ONLY("\\mbox{" + f + "} "); }
 / f:(COLOR / DEFINECOLOR)
   { return ast.RenderT.TEX_ONLY(f); }
 / "\\" c:[, ;!_#%$&] _
   { return ast.RenderT.TEX_ONLY("\\" + c); }
 / c:[><~] _
   { return ast.RenderT.TEX_ONLY(c); }
 / c:[%$] _
   { return ast.RenderT.TEX_ONLY("\\" + c); /* escape dangerous chars */}

LITERALPART //LITERAL without the first option to prevent interruption of parsing
 =
   f:generic_func &{ return tu.latex_function_names[f]; } _
   c:( "(" / "[" / "\\{" / "" { return " ";}) _
   { return ast.RenderT.TEX_ONLY(f + c); }
 / f:generic_func &{ return tu.mediawiki_function_names[f]; } _
   c:( "(" / "[" / "\\{" / ""{ return "";}) _
   { return ast.RenderT.TEX_ONLY("\\operatorname{" + f.slice(1) + "}" + c); }
 / f:generic_func &{ return tu.other_literals1[f]; } _ // from Texutil.find(...)
   { return ast.RenderT.TEX_ONLY(f + " "); }
 / f:generic_func &{ return tu.other_literals2[f]; } _ // from Texutil.find(...)
   { return ast.RenderT.TEX_ONLY("\\mbox{" + f + "} "); }
 / mbox:generic_func &{ return mbox === "\\mbox"; } _
   "{" f:generic_func &{ return tu.other_literals2[f]; } _ "}" _
   /* make sure we can parse what we emit */
   { return ast.RenderT.TEX_ONLY("\\mbox{" + f + "} "); }
 / f:generic_func &{ return tu.other_literals3[f]; } _ // from Texutil.find(...)
   { return ast.RenderT.TEX_ONLY(tu.other_literals3[f] + " "); }
 / f:(COLOR / DEFINECOLOR)
   { return ast.RenderT.TEX_ONLY(f); }
 / "\\" c:[, ;!_#%$&] _
   { return ast.RenderT.TEX_ONLY("\\" + c); }
 / c:[><~] _
   { return ast.RenderT.TEX_ONLY(c); }
 / c:[%$] _
   { return ast.RenderT.TEX_ONLY("\\" + c); /* escape dangerous chars */}

// returns a RenderT
DELIMITER
 = c:( delimiter_uf_lt / delimiter_uf_op / "[" ) _
   { return ast.RenderT.TEX_ONLY(c); }
 / "\\" c:[{}|] _
   { return ast.RenderT.TEX_ONLY("\\" + c); }
 / f:generic_func &{ return tu.other_delimiters1[f]; } _ // from Texutil.find()
   { return ast.RenderT.TEX_ONLY(f + " "); }
 / f:generic_func &{ return tu.other_delimiters2[f]; } _ // from Texutil.find()
   { var p = peg$parse(tu.other_delimiters2[f]);
     console.assert(Array.isArray(p) && p.length === 1);
     console.assert(p[0].constructor === ast.Tex.LITERAL);
     console.assert(p[0][0].constructor === ast.RenderT.TEX_ONLY);
     return p[0][0];
   }
 / c:atsymbol _ //temporary workaround until @ symbol is properly implemented (bypasses syntax error in test cases)
   { return ast.RenderT.TEX_ONLY(""); }

FUN_AR1nb
 = f:generic_func &{ return tu.fun_ar1nb[f]; } space* { return f; }

FUN_AR1opt
 = f:generic_func &{ return tu.fun_ar1opt[f]; } space* "[" space* { return f; }

NEXT_CELL
 = "&" _

NEXT_ROW
 = "\\\\" _

BEGIN
 = "\\begin" _
END
 = "\\end" _

BEGIN_MATRIX
 = BEGIN "{matrix}" _
END_MATRIX
 = END "{matrix}" _
BEGIN_PMATRIX
 = BEGIN "{pmatrix}" _
END_PMATRIX
 = END "{pmatrix}" _
BEGIN_BMATRIX
 = BEGIN "{bmatrix}" _
END_BMATRIX
 = END "{bmatrix}" _
BEGIN_BBMATRIX
 = BEGIN "{Bmatrix}" _
END_BBMATRIX
 = END "{Bmatrix}" _
BEGIN_VMATRIX
 = BEGIN "{vmatrix}" _
END_VMATRIX
 = END "{vmatrix}" _
BEGIN_VVMATRIX
 = BEGIN "{Vmatrix}" _
END_VVMATRIX
 = END "{Vmatrix}" _
BEGIN_ARRAY
 = BEGIN "{array}" _
END_ARRAY
 = END "{array}" _
BEGIN_ALIGN
 = BEGIN "{align}" _
END_ALIGN
 = END "{align}" _
BEGIN_ALIGNED
 = BEGIN "{aligned}" _
END_ALIGNED
 = END "{aligned}" _
BEGIN_ALIGNAT
 = BEGIN "{alignat}" _
END_ALIGNAT
 = END "{alignat}" _
BEGIN_ALIGNEDAT
 = BEGIN "{alignedat}" _
END_ALIGNEDAT
 = END "{alignedat}" _
BEGIN_SMALLMATRIX
 = BEGIN "{smallmatrix}" _
END_SMALLMATRIX
 = END "{smallmatrix}" _
BEGIN_CASES
 = BEGIN "{cases}" _
END_CASES
 = END "{cases}" _

SQ_CLOSE
 =  "]" _
CURLY_OPEN
 = "{" _
CURLY_CLOSE
 = "}" _
PAREN_OPEN
 = "(" _ / "\\big(" _ / "\\Big(" _ / "\\bigg(" _ / "\\Bigg(" _
 / "\\bigl(" _ / "\\Bigl(" _ / "\\bigg1(" _ / "\\Biggl(" _ / "\\left(" _
PAREN_CLOSE
 = ")" _ / "\\big)" _ / "\\Big)" _ / "\\bigg)" _ / "\\Bigg)" _
 / "\\bigr)" _ / "\\Bigr)" _ / "\\biggr)" _ / "\\Biggr)" _ / "\\right)"
SUP
 = "^" _
SUB
 = "_" _

// This is from Texutil.find in texvc
generic_func
 = "\\" alpha+ { return text(); }

BIG
 = f:generic_func &{ return tu.big_literals[f]; } _
   { return f; }

PAREN
 = f:generic_func &{ return tu.paren[f]; } space* { return f; }

FUN_AR1
 = f:generic_func &{ return tu.fun_ar1[f]; } space*
   { return f; }
 / f:generic_func &{ return tu.other_fun_ar1[f]; } space*
   { return tu.other_fun_ar1[f]; }

FUN_AR2
 = f:generic_func &{ return tu.fun_ar2[f]; } space*
   { return f; }

FUN_AR3
 = f:generic_func &{ return tu.fun_ar3[f]; } space*
   { return f; }

FUN_INFIX
 = f:generic_func &{ return tu.fun_infix[f]; } _
   { return f; }

JACOBI
 = f:generic_func &{ return tu.jacobi[f]; } space* { return f; }

LAGUERRE
 = f:generic_func &{ return tu.laguerre[f]; } space* { return f; }

EJACOBI
 = "sn"
 / "cn"
 / "dn"

DECLh
 = f:generic_func &{ return tu.declh_function[f]; } _
   { return ast.Tex.DECLh(f, ast.FontForce.RM(), []); /*see bug 54818*/ }

FUN_AR2nb
 = f:generic_func &{ return tu.fun_ar2nb[f]; } space*
   { return f; }

LEFT
 = f:generic_func &{ return tu.left_function[f]; } _

RIGHT
 = f:generic_func &{ return tu.right_function[f]; } _

HLINE
 = f:generic_func &{ return tu.hline_function[f]; } _
   { return f; }

COLOR
 = f:generic_func &{ return tu.color_function[f]; } _ cs:COLOR_SPEC
   { return f + cs; }

DEFINECOLOR
 = f:generic_func &{ return tu.definecolor_function[f]; } _
   "{" _ name:alpha+ _ "}" _ "{" _
     a:( "named"i _ "}" _ cs:COLOR_SPEC_NAMED { return "{named}" + cs; }
       / "gray"i  _ "}" _ cs:COLOR_SPEC_GRAY  { return "{gray}" + cs; }
       / "rgb"    _ "}" _ cs:COLOR_SPEC_rgb   { return "{rgb}" + cs; }
       // Note that we actually convert RGB format to rgb format here.
       / "RGB"    _ "}" _ cs:COLOR_SPEC_RGB   { return "{rgb}" + cs; }
       / "cmyk"i  _ "}" _ cs:COLOR_SPEC_CMYK  { return "{cmyk}" + cs; } )
   { return f + "{" + name.join('') + "}" + a; }

COLOR_SPEC
 = COLOR_SPEC_NAMED
 / "[" _ "named"i _ "]" _ cs:COLOR_SPEC_NAMED
   { return "[named]" + cs; }
 / "[" _ "gray"i _ "]" _ cs:COLOR_SPEC_GRAY
   { return "[gray]" + cs; }
 / "[" _ "rgb"  _ "]" _ cs:COLOR_SPEC_rgb
   { return "[rgb]" + cs; }
 / "[" _ "RGB"  _ "]" _ cs:COLOR_SPEC_RGB
   // Note that we actually convert RGB format to rgb format here.
   { return "[rgb]" + cs; }
 / "[" _ "cmyk"i _ "]" _ cs:COLOR_SPEC_CMYK
   { return "[cmyk]" + cs; }

COLOR_SPEC_NAMED
 = "{" _ name:alpha+ _ "}" _
   { return "{" + name.join('') + "}"; }
COLOR_SPEC_GRAY
 = "{" _ k:CNUM + "}"
   { return "{"+k+"}"; }
COLOR_SPEC_rgb
 = "{" _ r:CNUM "," _ g:CNUM "," _ b:CNUM "}" _
   { return "{"+r+","+g+","+b+"}"; }
COLOR_SPEC_RGB
 = "{" _ r:CNUM255 "," _ g:CNUM255 "," _ b:CNUM255 "}" _
   // Note that we normalize the values to [0,1] here.
   { return "{"+r+","+g+","+b+"}"; }
COLOR_SPEC_CMYK
 = "{" _ c:CNUM "," _ m:CNUM "," _ y:CNUM "," _ k:CNUM "}" _
   { return "{"+c+","+m+","+y+","+k+"}"; }

// An integer in [0, 255] => normalize it to [0,1]
CNUM255
 = n:$( "0" / ([1-9] ([0-9] [0-9]?)? ) ) &{ return parseInt(n, 10) <= 255; } _
   { return n / 255; }

// A floating-point number in [0, 1]
CNUM
 = n:$( "0"? "." [0-9]+ ) _
   { return n; }
 / n:$( [01] "."? ) _
   { return n; }

// Missing lexer tokens!
FUN_INFIXh = impossible
FUN_AR1hl = impossible
FUN_AR1hf = impossible
FUN_AR2h = impossible
impossible = & { return false; }

// End of file
EOF = & { return peg$currPos === input.length; }
