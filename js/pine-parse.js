/* Amatu Chart — Pine Script lexer + parser (v4–v6 syntax) -> AST */
(function () {
'use strict';
const P = (typeof window !== 'undefined' ? window : globalThis).AC_PARSE = {};
class PineError extends Error { constructor(msg, line, col) { super(msg); this.line = line; this.col = col; } }
P.PineError = PineError;

const KW = new Set(['if', 'else', 'for', 'while', 'switch', 'var', 'varip', 'and', 'or', 'not', 'true', 'false', 'import', 'export', 'type', 'method', 'enum', 'break', 'continue', 'to', 'by', 'in', 'as', 'na_']);
const OPS = ['<=', '>=', '==', '!=', ':=', '+=', '-=', '*=', '/=', '%=', '=>', '<', '>', '=', '+', '-', '*', '/', '%', '?', ':', '(', ')', '[', ']', ',', '.', ';'];

/* ---------- lexer: logical lines with indentation ---------- */
function stripComment(s) {
  let q = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; }
    else if (c === '"' || c === "'") q = c;
    else if (c === '/' && s[i + 1] === '/') return s.slice(0, i);
  }
  return s;
}
function lex(src) {
  const meta = { version: 5 };
  const lines = src.replace(/\r\n?/g, '\n').replace(/ /g, ' ').replace(/^﻿/, '').split('\n');
  const toks = [];
  let depth = 0, indents = [0], prevOp = false, lineHasTok = false;
  const contOp = new Set(['+', '-', '*', '/', '%', '?', ':', ',', '<', '>', '<=', '>=', '==', '!=', 'and', 'or', 'not', '=', ':=', '(', '[', '+=', '-=', '*=', '/=', '%=', '.']);
  let started = false;
  let blockType = [];
  for (let ln = 0; ln < lines.length; ln++) {
    const raw0 = lines[ln];
    const vm = /^\s*\/\/\s*@version\s*=\s*(\d+)/.exec(raw0);
    if (vm) meta.version = +vm[1];
    let s = stripComment(raw0);
    if (!s.trim()) continue;
    let ind = 0, p = 0;
    while (p < s.length && (s[p] === ' ' || s[p] === '\t')) { ind += s[p] === '\t' ? 4 : 1; p++; }
    let cont = false;
    if (started) {
      if (depth > 0) cont = true;
      else if (ind % 4 !== 0 && ind > 0) cont = true;
      else if (prevOp) cont = true;
      else {
        /* a following line which starts with an operator is also a continuation */
        const rest = s.slice(p);
        if (/^(\?|:(?!=)|and\b|or\b|\*|\/|%|<=|>=|==|!=|<|>)/.test(rest) && ind > indents[indents.length - 1]) cont = true;
        else if (/^[+\-]\s/.test(rest) && ind > indents[indents.length - 1]) cont = true;
      }
    }
    if (!cont) {
      if (started) toks.push({ t: 'nl', line: ln });
      const top = indents[indents.length - 1];
      if (ind > top) { indents.push(ind); toks.push({ t: 'indent', line: ln + 1 }); }
      else while (ind < indents[indents.length - 1]) { indents.pop(); toks.push({ t: 'dedent', line: ln + 1 }); }
      started = true;
    }
    /* tokens */
    while (p < s.length) {
      const c = s[p], col = p + 1, line = ln + 1;
      if (c === ' ' || c === '\t') { p++; continue; }
      let m;
      if ((m = /^#[0-9a-fA-F]{8}|^#[0-9a-fA-F]{6}/.exec(s.slice(p)))) { toks.push({ t: 'color', v: m[0], line, col }); p += m[0].length; continue; }
      if ((m = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(s.slice(p))) && !(c === '.' && !/\d/.test(s[p + 1] || ''))) {
        toks.push({ t: 'num', v: parseFloat(m[0]), int: !/[.eE]/.test(m[0]), line, col }); p += m[0].length; continue;
      }
      if (c === '"' || c === "'") {
        let j = p + 1, out = '';
        while (j < s.length && s[j] !== c) {
          if (s[j] === '\\') { const n = s[j + 1]; out += n === 'n' ? '\n' : n === 't' ? '\t' : n === undefined ? '' : n; j += 2; } else out += s[j++];
        }
        if (j >= s.length) throw new PineError('Teks belum ditutup tanda kutip', line, col);
        toks.push({ t: 'str', v: out, line, col }); p = j + 1; continue;
      }
      if ((m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(s.slice(p)))) {
        toks.push({ t: KW.has(m[0]) ? 'kw' : 'id', v: m[0], line, col }); p += m[0].length; continue;
      }
      const op = OPS.find(o => s.startsWith(o, p));
      if (!op) throw new PineError('Karakter tidak dikenal: ' + c, line, col);
      if (op === '(' || op === '[') depth++;
      if (op === ')' || op === ']') depth = Math.max(0, depth - 1);
      toks.push({ t: 'op', v: op, line, col }); p += op.length;
    }
    const last = toks[toks.length - 1];
    prevOp = !!last && (last.t === 'op' || last.t === 'kw') && contOp.has(last.v) && !(last.v === '=>');
  }
  toks.push({ t: 'nl' });
  while (indents.length > 1) { indents.pop(); toks.push({ t: 'dedent' }); }
  toks.push({ t: 'eof', line: lines.length });
  return { toks, meta };
}

/* ---------- parser ---------- */
const TYPE_WORDS = new Set(['int', 'float', 'bool', 'color', 'string', 'line', 'label', 'box', 'table', 'linefill', 'polyline', 'array', 'matrix', 'map', 'const', 'simple', 'series', 'input', 'chart', 'volume_row', 'footprint']);
const QUAL = new Set(['const', 'simple', 'series', 'input']);
function parse(src) {
  const { toks, meta } = lex(src);
  let i = 0;
  const udts = new Set();
  for (let k = 0; k < toks.length - 1; k++) if (toks[k].t === 'kw' && (toks[k].v === 'type' || toks[k].v === 'enum') && toks[k + 1].t === 'id') udts.add(toks[k + 1].v);
  const peek = (k = 0) => toks[i + k] || toks[toks.length - 1];
  const next = () => toks[i++];
  const isOp = (v, k = 0) => peek(k).t === 'op' && peek(k).v === v;
  const isKw = (v, k = 0) => peek(k).t === 'kw' && peek(k).v === v;
  const fail = (msg, tk) => { tk = tk || peek(); throw new PineError(msg, tk.line, tk.col); };
  const desc = tk => tk.t === 'nl' ? 'akhir baris' : tk.t === 'eof' ? 'akhir script' : tk.t === 'indent' ? 'indentasi' : tk.t === 'dedent' ? 'akhir blok' : '"' + tk.v + '"';
  const eat = v => { if (!isOp(v)) fail('Diharapkan "' + v + '" tetapi ada ' + desc(peek())); return next(); };
  const eatId = () => { const tk = peek(); if (tk.t !== 'id' && !(tk.t === 'kw' && (tk.v === 'type' || tk.v === 'method' || tk.v === 'enum' || tk.v === 'to' || tk.v === 'by' || tk.v === 'in' || tk.v === 'as' || tk.v === 'export' || tk.v === 'import'))) fail('Diharapkan nama tetapi ada ' + desc(tk)); return next().v; };
  const skipNl = () => { while (peek().t === 'nl') i++; };

  /* try to read a type annotation; returns type string or null (restores position) */
  function tryType() {
    const save = i;
    let any = false, ty = null;
    while (peek().t === 'id' && QUAL.has(peek().v) && (peek(1).t === 'id' || (peek(1).t === 'op' && (peek(1).v === '<')))) { if (peek(1).t !== 'id') break; next(); any = true; }
    if (peek().t !== 'id') { if (!any) { i = save; return null; } i = save; return null; }
    let name = peek().v;
    const known = TYPE_WORDS.has(name) || udts.has(name);
    /* also accept lib.Type and unknown Type when followed by an identifier */
    let save2 = i;
    next();
    while (isOp('.') && peek(1).t === 'id') { next(); name += '.' + next().v; }
    if (isOp('<')) {
      if (!known) { i = save; return null; }
      let d = 0; let str = '';
      do {
        const tk = next();
        if (tk.t === 'op' && tk.v === '<') d++;
        else if (tk.t === 'op' && tk.v === '>') d--;
        else if (!(tk.t === 'id' || (tk.t === 'op' && (tk.v === ',' || tk.v === '.' || tk.v === '[' || tk.v === ']')))) { i = save; return null; }
        str += tk.v;
        if (tk.t === 'eof') { i = save; return null; }
      } while (d > 0);
      name += str;
    }
    if (isOp('[') && isOp(']', 1)) { next(); next(); name = 'array<' + name + '>'; }
    const tk = peek();
    const okNext = tk.t === 'id' || (tk.t === 'kw' && ['type', 'method', 'enum', 'to', 'by', 'in', 'as'].includes(tk.v) && peek(1).t === 'op');
    if (!okNext || (!known && !any && !/\./.test(name) && !udts.has(name))) {
      if (!(okNext && peek(1) && (isOp('=', 1) || isOp(',', 1) || isOp(')', 1)))) { i = save; return null; }
    }
    ty = name;
    return ty;
  }

  function block() {
    /* after '=>' / if-condition: either same-line expression or an indented block */
    if (peek().t === 'nl') {
      skipNl();
      if (peek().t !== 'indent') fail('Blok kosong atau indentasi salah (harus 4 spasi)');
      next();
      const body = [];
      while (peek().t !== 'dedent' && peek().t !== 'eof') { if (peek().t === 'nl') { next(); continue; } body.push(...statement()); }
      if (peek().t === 'dedent') next();
      return body;
    }
    const st = statement();
    return st;
  }
  function endLine() {
    if (isOp(',')) { next(); return true; }
    if (peek().t === 'nl') { next(); return false; }
    if (peek().t === 'eof' || peek().t === 'dedent') return false;
    /* end of nested block already consumed newline */
    const prev = toks[i - 1];
    if (prev && (prev.t === 'dedent' || prev.t === 'nl')) return false;
    fail('Tidak menyangka ' + desc(peek()));
  }
  /* returns array of statements (comma separated statements on one line) */
  function statement() {
    const out = [];
    for (;;) {
      const s = simpleStatement();
      out.push(s);
      if (!endLine()) break;
    }
    return out;
  }
  function params() {
    eat('(');
    const ps = [];
    while (!isOp(')')) {
      const line = peek().line;
      let ty = tryType();
      const name = eatId();
      let def = null;
      if (isOp('=')) { next(); def = expr(); }
      ps.push({ name, ty, def, line });
      if (isOp(',')) next(); else break;
    }
    eat(')');
    return ps;
  }
  /* lookahead: id ( ... ) => */
  function isFuncDecl(k = 0) {
    if (peek(k).t !== 'id' || !isOp('(', k + 1)) return false;
    let d = 0, j = i + k + 1;
    for (; j < toks.length; j++) {
      const tk = toks[j];
      if (tk.t === 'op' && (tk.v === '(' || tk.v === '[')) d++;
      else if (tk.t === 'op' && (tk.v === ')' || tk.v === ']')) { d--; if (d === 0) break; }
      else if (tk.t === 'nl' || tk.t === 'eof') return false;
    }
    const nx = toks[j + 1];
    return !!nx && nx.t === 'op' && nx.v === '=>';
  }
  function simpleStatement() {
    const tk = peek(), line = tk.line, col = tk.col;
    const N = (type, o) => Object.assign({ type, line, col }, o);
    if (tk.t === 'indent') fail('Indentasi tidak terduga');
    if (tk.t === 'kw') {
      if (tk.v === 'import') { next(); let path = ''; while (peek().t !== 'nl' && !isKw('as') && peek().t !== 'eof') path += next().v; let as = null; if (isKw('as')) { next(); as = eatId(); } return N('Import', { path, as }); }
      if (tk.v === 'export') { next(); return simpleStatement(); }
      if (tk.v === 'type' && peek(1).t === 'id') return typeDecl(N);
      if (tk.v === 'enum' && peek(1).t === 'id') return enumDecl(N);
      if (tk.v === 'method' && peek(1).t === 'id') { next(); const name = eatId(); const ps = params(); eat('=>'); return N('Func', { name, params: ps, body: block(), method: true }); }
      if (tk.v === 'break') { next(); return N('Break', {}); }
      if (tk.v === 'continue') { next(); return N('Continue', {}); }
      if (tk.v === 'var' || tk.v === 'varip') {
        next();
        const ty = tryType(); const name = eatId(); eat('=');
        return N('Var', { name, ty, mode: tk.v, init: exprOrBlock() });
      }
      if (tk.v === 'if' || tk.v === 'for' || tk.v === 'while' || tk.v === 'switch') return N('Expr', { expr: structure() });
    }
    if (isOp('[')) {
      /* tuple destructuring? */
      const save = i;
      next();
      const names = [];
      let ok = true;
      for (;;) { if (peek().t !== 'id') { ok = false; break; } names.push(next().v); if (isOp(',')) { next(); continue; } break; }
      if (ok && isOp(']') && (isOp('=', 1))) { next(); next(); return N('Tuple', { names, init: exprOrBlock() }); }
      i = save;
    }
    if (tk.t === 'id' || tk.t === 'kw') {
      if (isFuncDecl()) { const name = eatId(); const ps = params(); eat('=>'); return N('Func', { name, params: ps, body: block() }); }
      /* typed declaration */
      const save = i;
      const ty = tryType();
      if (ty) {
        if ((peek().t === 'id' || peek().t === 'kw') && isOp('=', 1)) { const name = eatId(); next(); return N('Var', { name, ty, mode: '', init: exprOrBlock() }); }
        i = save;
      }
      if (tk.t === 'id' && isOp('=', 1)) { const name = eatId(); next(); return N('Var', { name, ty: null, mode: '', init: exprOrBlock() }); }
    }
    const e = expr();
    if (peek().t === 'op' && [':=', '+=', '-=', '*=', '/=', '%='].includes(peek().v)) {
      const op = next().v;
      return N('Assign', { target: e, op, value: exprOrBlock() });
    }
    if (isOp('=') && e.type === 'Member') { next(); return N('Assign', { target: e, op: ':=', value: exprOrBlock() }); }
    return N('Expr', { expr: e });
  }
  function typeDecl(N) {
    next(); const name = eatId(); skipNl();
    const fields = [];
    if (peek().t === 'indent') {
      next();
      while (peek().t !== 'dedent' && peek().t !== 'eof') {
        if (peek().t === 'nl') { next(); continue; }
        if (isKw('varip') || isKw('var')) next();
        const ty = tryType(); const f = eatId(); let def = null;
        if (isOp('=')) { next(); def = expr(); }
        fields.push({ name: f, ty, def });
        if (peek().t === 'nl') next();
      }
      if (peek().t === 'dedent') next();
    }
    return N('Type', { name, fields });
  }
  function enumDecl(N) {
    next(); const name = eatId(); skipNl();
    const fields = [];
    if (peek().t === 'indent') {
      next();
      while (peek().t !== 'dedent' && peek().t !== 'eof') {
        if (peek().t === 'nl') { next(); continue; }
        const f = eatId(); let title = f;
        if (isOp('=')) { next(); title = expr().v; }
        fields.push({ name: f, title });
        if (peek().t === 'nl') next();
      }
      if (peek().t === 'dedent') next();
    }
    return N('Enum', { name, fields });
  }
  function exprOrBlock() { return isKw('if') || isKw('for') || isKw('while') || isKw('switch') ? structure() : expr(); }
  function structure() {
    const tk = next(), N = (type, o) => Object.assign({ type, line: tk.line, col: tk.col }, o);
    if (tk.v === 'if') {
      const cond = expr(); const then = block(); let els = null;
      const save = i;
      skipNl();
      if (isKw('else')) { next(); if (isKw('if')) { els = [{ type: 'Expr', expr: structure(), line: peek().line }]; } else els = block(); }
      else i = save;
      return N('If', { cond, then, els });
    }
    if (tk.v === 'while') { const cond = expr(); return N('While', { cond, body: block() }); }
    if (tk.v === 'for') {
      if (isOp('[')) { next(); const a = eatId(); eat(','); const b = eatId(); eat(']'); if (!isKw('in')) fail('Diharapkan "in"'); next(); const it = expr(); return N('ForIn', { idx: a, name: b, it, body: block() }); }
      const name = eatId();
      if (isKw('in')) { next(); const it = expr(); return N('ForIn', { idx: null, name, it, body: block() }); }
      eat('='); const from = expr(); if (!isKw('to')) fail('Diharapkan "to"'); next(); const to = expr(); let by = null;
      if (isKw('by')) { next(); by = expr(); }
      return N('For', { name, from, to, by, body: block() });
    }
    if (tk.v === 'switch') {
      let subj = null;
      if (peek().t !== 'nl') subj = expr();
      skipNl();
      if (peek().t !== 'indent') fail('Switch tanpa cabang');
      next();
      const cases = [];
      while (peek().t !== 'dedent' && peek().t !== 'eof') {
        if (peek().t === 'nl') { next(); continue; }
        let test = null;
        if (!isOp('=>')) test = expr();
        eat('=>');
        cases.push({ test, body: block() });
      }
      if (peek().t === 'dedent') next();
      return N('Switch', { subj, cases });
    }
  }
  /* ---------- expressions ---------- */
  function expr() { return ternary(); }
  function ternary() {
    const c = or();
    if (isOp('?')) {
      const tk = next();
      const a = isKw('if') || isKw('switch') ? structure() : ternary(); eat(':'); const b = isKw('if') || isKw('switch') ? structure() : ternary();
      return { type: 'Ternary', c, a, b, line: tk.line };
    }
    return c;
  }
  function bin(sub, ops) {
    return function () {
      let l = sub();
      while ((peek().t === 'op' || peek().t === 'kw') && ops.includes(peek().v)) { const tk = next(); const r = sub(); l = { type: 'Bin', op: tk.v, l, r, line: tk.line, col: tk.col }; }
      return l;
    };
  }
  const mul = bin(unary, ['*', '/', '%']);
  const add = bin(mul, ['+', '-']);
  const rel = bin(add, ['<', '>', '<=', '>=']);
  const eq = bin(rel, ['==', '!=']);
  const and = bin(eq, ['and']);
  const or = bin(and, ['or']);
  function unary() {
    if (isOp('-') || isOp('+')) { const tk = next(); return { type: 'Un', op: tk.v, e: unary(), line: tk.line }; }
    if (isKw('not')) { const tk = next(); return { type: 'Un', op: 'not', e: unary(), line: tk.line }; }
    return postfix();
  }
  function args() {
    eat('(');
    const pos = [], named = {};
    while (!isOp(')')) {
      if ((peek().t === 'id' || peek().t === 'kw') && isOp('=', 1)) { const n = next().v; next(); named[n] = exprOrBlock(); }
      else pos.push(exprOrBlock());
      if (isOp(',')) next(); else break;
    }
    eat(')');
    return { pos, named };
  }
  function tryGeneric() {
    /* <type,...> directly followed by '(' */
    if (!isOp('<')) return null;
    let d = 0, j = i, str = '';
    for (; j < toks.length; j++) {
      const tk = toks[j];
      if (tk.t === 'op' && tk.v === '<') d++;
      else if (tk.t === 'op' && tk.v === '>') { d--; if (d === 0) break; }
      else if (!(tk.t === 'id' || (tk.t === 'op' && (tk.v === ',' || tk.v === '.' || tk.v === '[' || tk.v === ']')))) return null;
      if (d === 1 && !(tk.t === 'op' && tk.v === '<')) str += tk.v;
    }
    const nx = toks[j + 1];
    if (nx && nx.t === 'op' && nx.v === '(') { i = j + 1; return str || 'x'; }
    return null;
  }
  function postfix() {
    let e = primary();
    for (;;) {
      if (isOp('.') && (peek(1).t === 'id' || peek(1).t === 'kw')) { const tk = next(); const name = next().v; e = { type: 'Member', obj: e, name, line: tk.line, col: tk.col }; continue; }
      if (isOp('(')) { const tk = peek(); const a = args(); e = { type: 'Call', fn: e, args: a, line: tk.line, col: tk.col }; continue; }
      if (isOp('[') ) { const tk = next(); const idx = expr(); eat(']'); e = { type: 'Hist', e, idx, line: tk.line, col: tk.col }; continue; }
      if (isOp('<') && (e.type === 'Member' || e.type === 'Id')) {
        const g = tryGeneric();
        if (g) { const tk = peek(); const a = args(); e = { type: 'Call', fn: e, args: a, generic: g, line: tk.line, col: tk.col }; continue; }
      }
      return e;
    }
  }
  function primary() {
    const tk = peek();
    const N = (type, o) => Object.assign({ type, line: tk.line, col: tk.col }, o);
    if (tk.t === 'num') { next(); return N('Num', { v: tk.v, int: tk.int }); }
    if (tk.t === 'str') { next(); return N('Str', { v: tk.v }); }
    if (tk.t === 'color') { next(); return N('Color', { v: tk.v }); }
    if (tk.t === 'kw' && (tk.v === 'true' || tk.v === 'false')) { next(); return N('Bool', { v: tk.v === 'true' }); }
    if (tk.t === 'kw' && (tk.v === 'if' || tk.v === 'switch' || tk.v === 'for' || tk.v === 'while')) return structure();
    if (tk.t === 'id') { next(); return N('Id', { name: tk.v }); }
    if (tk.t === 'kw' && ['type', 'method', 'enum', 'to', 'by', 'in', 'as', 'export', 'import'].includes(tk.v)) { next(); return N('Id', { name: tk.v }); }
    if (isOp('(')) { next(); const e = exprOrBlock(); eat(')'); return e.type === 'Bin' || e.type === 'Ternary' ? Object.assign({ paren: true }, e) : e; }
    if (isOp('[')) { next(); const items = []; while (!isOp(']')) { items.push(expr()); if (isOp(',')) next(); else break; } eat(']'); return N('TupleLit', { items }); }
    fail('Tidak menyangka ' + desc(tk));
  }

  const body = [];
  while (peek().t !== 'eof') {
    if (peek().t === 'nl') { next(); continue; }
    if (peek().t === 'indent') fail('Indentasi tidak terduga');
    if (peek().t === 'dedent') { next(); continue; }
    body.push(...statement());
  }
  return { body, meta, udts };
}
P.parse = parse;
P.lex = lex;
})();
