/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const G = globalThis, le = G.ShadowRoot && (G.ShadyCSS === void 0 || G.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, he = Symbol(), fe = /* @__PURE__ */ new WeakMap();
let Oe = class {
  constructor(e, s, i) {
    if (this._$cssResult$ = !0, i !== he) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (le && e === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (e = fe.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && fe.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Ue = (t) => new Oe(typeof t == "string" ? t : t + "", void 0, he), L = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((i, a, r) => i + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(a) + t[r + 1], t[0]);
  return new Oe(s, t, he);
}, Ie = (t, e) => {
  if (le) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const i = document.createElement("style"), a = G.litNonce;
    a !== void 0 && i.setAttribute("nonce", a), i.textContent = s.cssText, t.appendChild(i);
  }
}, ve = le ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const i of e.cssRules) s += i.cssText;
  return Ue(s);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: We, defineProperty: Fe, getOwnPropertyDescriptor: qe, getOwnPropertyNames: Le, getOwnPropertySymbols: Ve, getPrototypeOf: Ke } = Object, X = globalThis, be = X.trustedTypes, Ze = be ? be.emptyScript : "", Ge = X.reactiveElementPolyfillSupport, U = (t, e) => t, J = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? Ze : null;
      break;
    case Object:
    case Array:
      t = t == null ? t : JSON.stringify(t);
  }
  return t;
}, fromAttribute(t, e) {
  let s = t;
  switch (e) {
    case Boolean:
      s = t !== null;
      break;
    case Number:
      s = t === null ? null : Number(t);
      break;
    case Object:
    case Array:
      try {
        s = JSON.parse(t);
      } catch {
        s = null;
      }
  }
  return s;
} }, de = (t, e) => !We(t, e), ye = { attribute: !0, type: String, converter: J, reflect: !1, useDefault: !1, hasChanged: de };
Symbol.metadata ??= Symbol("metadata"), X.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let H = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = ye) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const i = Symbol(), a = this.getPropertyDescriptor(e, i, s);
      a !== void 0 && Fe(this.prototype, e, a);
    }
  }
  static getPropertyDescriptor(e, s, i) {
    const { get: a, set: r } = qe(this.prototype, e) ?? { get() {
      return this[s];
    }, set(n) {
      this[s] = n;
    } };
    return { get: a, set(n) {
      const d = a?.call(this);
      r?.call(this, n), this.requestUpdate(e, d, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? ye;
  }
  static _$Ei() {
    if (this.hasOwnProperty(U("elementProperties"))) return;
    const e = Ke(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(U("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(U("properties"))) {
      const s = this.properties, i = [...Le(s), ...Ve(s)];
      for (const a of i) this.createProperty(a, s[a]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const s = litPropertyMetadata.get(e);
      if (s !== void 0) for (const [i, a] of s) this.elementProperties.set(i, a);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, i] of this.elementProperties) {
      const a = this._$Eu(s, i);
      a !== void 0 && this._$Eh.set(a, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const s = [];
    if (Array.isArray(e)) {
      const i = new Set(e.flat(1 / 0).reverse());
      for (const a of i) s.unshift(ve(a));
    } else e !== void 0 && s.push(ve(e));
    return s;
  }
  static _$Eu(e, s) {
    const i = s.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
  }
  addController(e) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
  }
  removeController(e) {
    this._$EO?.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), s = this.constructor.elementProperties;
    for (const i of s.keys()) this.hasOwnProperty(i) && (e.set(i, this[i]), delete this[i]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Ie(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, s, i) {
    this._$AK(e, i);
  }
  _$ET(e, s) {
    const i = this.constructor.elementProperties.get(e), a = this.constructor._$Eu(e, i);
    if (a !== void 0 && i.reflect === !0) {
      const r = (i.converter?.toAttribute !== void 0 ? i.converter : J).toAttribute(s, i.type);
      this._$Em = e, r == null ? this.removeAttribute(a) : this.setAttribute(a, r), this._$Em = null;
    }
  }
  _$AK(e, s) {
    const i = this.constructor, a = i._$Eh.get(e);
    if (a !== void 0 && this._$Em !== a) {
      const r = i.getPropertyOptions(a), n = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : J;
      this._$Em = a;
      const d = n.fromAttribute(s, r.type);
      this[a] = d ?? this._$Ej?.get(a) ?? d, this._$Em = null;
    }
  }
  requestUpdate(e, s, i, a = !1, r) {
    if (e !== void 0) {
      const n = this.constructor;
      if (a === !1 && (r = this[e]), i ??= n.getPropertyOptions(e), !((i.hasChanged ?? de)(r, s) || i.useDefault && i.reflect && r === this._$Ej?.get(e) && !this.hasAttribute(n._$Eu(e, i)))) return;
      this.C(e, s, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, s, { useDefault: i, reflect: a, wrapped: r }, n) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, n ?? s ?? this[e]), r !== !0 || n !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (s = void 0), this._$AL.set(e, s)), a === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (s) {
      Promise.reject(s);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [a, r] of this._$Ep) this[a] = r;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [a, r] of i) {
        const { wrapped: n } = r, d = this[a];
        n !== !0 || this._$AL.has(a) || d === void 0 || this.C(a, void 0, r, d);
      }
    }
    let e = !1;
    const s = this._$AL;
    try {
      e = this.shouldUpdate(s), e ? (this.willUpdate(s), this._$EO?.forEach((i) => i.hostUpdate?.()), this.update(s)) : this._$EM();
    } catch (i) {
      throw e = !1, this._$EM(), i;
    }
    e && this._$AE(s);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    this._$EO?.forEach((s) => s.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq &&= this._$Eq.forEach((s) => this._$ET(s, this[s])), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
H.elementStyles = [], H.shadowRootOptions = { mode: "open" }, H[U("elementProperties")] = /* @__PURE__ */ new Map(), H[U("finalized")] = /* @__PURE__ */ new Map(), Ge?.({ ReactiveElement: H }), (X.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ce = globalThis, $e = (t) => t, Q = ce.trustedTypes, _e = Q ? Q.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, Pe = "$lit$", E = `lit$${Math.random().toFixed(9).slice(2)}$`, Me = "?" + E, Ye = `<${Me}>`, N = document, I = () => N.createComment(""), W = (t) => t === null || typeof t != "object" && typeof t != "function", pe = Array.isArray, Je = (t) => pe(t) || typeof t?.[Symbol.iterator] == "function", re = `[ 	
\f\r]`, j = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, xe = /-->/g, we = />/g, O = RegExp(`>|${re}(?:([^\\s"'>=/]+)(${re}*=${re}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ke = /'/g, Se = /"/g, Ne = /^(?:script|style|textarea|title)$/i, Re = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), h = Re(1), P = Re(2), T = Symbol.for("lit-noChange"), p = Symbol.for("lit-nothing"), Ae = /* @__PURE__ */ new WeakMap(), M = N.createTreeWalker(N, 129);
function He(t, e) {
  if (!pe(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return _e !== void 0 ? _e.createHTML(e) : e;
}
const Qe = (t, e) => {
  const s = t.length - 1, i = [];
  let a, r = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", n = j;
  for (let d = 0; d < s; d++) {
    const l = t[d];
    let f, v, m = -1, $ = 0;
    for (; $ < l.length && (n.lastIndex = $, v = n.exec(l), v !== null); ) $ = n.lastIndex, n === j ? v[1] === "!--" ? n = xe : v[1] !== void 0 ? n = we : v[2] !== void 0 ? (Ne.test(v[2]) && (a = RegExp("</" + v[2], "g")), n = O) : v[3] !== void 0 && (n = O) : n === O ? v[0] === ">" ? (n = a ?? j, m = -1) : v[1] === void 0 ? m = -2 : (m = n.lastIndex - v[2].length, f = v[1], n = v[3] === void 0 ? O : v[3] === '"' ? Se : ke) : n === Se || n === ke ? n = O : n === xe || n === we ? n = j : (n = O, a = void 0);
    const c = n === O && t[d + 1].startsWith("/>") ? " " : "";
    r += n === j ? l + Ye : m >= 0 ? (i.push(f), l.slice(0, m) + Pe + l.slice(m) + E + c) : l + E + (m === -2 ? d : c);
  }
  return [He(t, r + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class F {
  constructor({ strings: e, _$litType$: s }, i) {
    let a;
    this.parts = [];
    let r = 0, n = 0;
    const d = e.length - 1, l = this.parts, [f, v] = Qe(e, s);
    if (this.el = F.createElement(f, i), M.currentNode = this.el.content, s === 2 || s === 3) {
      const m = this.el.content.firstChild;
      m.replaceWith(...m.childNodes);
    }
    for (; (a = M.nextNode()) !== null && l.length < d; ) {
      if (a.nodeType === 1) {
        if (a.hasAttributes()) for (const m of a.getAttributeNames()) if (m.endsWith(Pe)) {
          const $ = v[n++], c = a.getAttribute(m).split(E), y = /([.?@])?(.*)/.exec($);
          l.push({ type: 1, index: r, name: y[2], strings: c, ctor: y[1] === "." ? et : y[1] === "?" ? tt : y[1] === "@" ? st : ee }), a.removeAttribute(m);
        } else m.startsWith(E) && (l.push({ type: 6, index: r }), a.removeAttribute(m));
        if (Ne.test(a.tagName)) {
          const m = a.textContent.split(E), $ = m.length - 1;
          if ($ > 0) {
            a.textContent = Q ? Q.emptyScript : "";
            for (let c = 0; c < $; c++) a.append(m[c], I()), M.nextNode(), l.push({ type: 2, index: ++r });
            a.append(m[$], I());
          }
        }
      } else if (a.nodeType === 8) if (a.data === Me) l.push({ type: 2, index: r });
      else {
        let m = -1;
        for (; (m = a.data.indexOf(E, m + 1)) !== -1; ) l.push({ type: 7, index: r }), m += E.length - 1;
      }
      r++;
    }
  }
  static createElement(e, s) {
    const i = N.createElement("template");
    return i.innerHTML = e, i;
  }
}
function D(t, e, s = t, i) {
  if (e === T) return e;
  let a = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const r = W(e) ? void 0 : e._$litDirective$;
  return a?.constructor !== r && (a?._$AO?.(!1), r === void 0 ? a = void 0 : (a = new r(t), a._$AT(t, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = a : s._$Cl = a), a !== void 0 && (e = D(t, a._$AS(t, e.values), a, i)), e;
}
class Xe {
  constructor(e, s) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = s;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: s }, parts: i } = this._$AD, a = (e?.creationScope ?? N).importNode(s, !0);
    M.currentNode = a;
    let r = M.nextNode(), n = 0, d = 0, l = i[0];
    for (; l !== void 0; ) {
      if (n === l.index) {
        let f;
        l.type === 2 ? f = new V(r, r.nextSibling, this, e) : l.type === 1 ? f = new l.ctor(r, l.name, l.strings, this, e) : l.type === 6 && (f = new it(r, this, e)), this._$AV.push(f), l = i[++d];
      }
      n !== l?.index && (r = M.nextNode(), n++);
    }
    return M.currentNode = N, a;
  }
  p(e) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, s), s += i.strings.length - 2) : i._$AI(e[s])), s++;
  }
}
class V {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, s, i, a) {
    this.type = 2, this._$AH = p, this._$AN = void 0, this._$AA = e, this._$AB = s, this._$AM = i, this.options = a, this._$Cv = a?.isConnected ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const s = this._$AM;
    return s !== void 0 && e?.nodeType === 11 && (e = s.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, s = this) {
    e = D(this, e, s), W(e) ? e === p || e == null || e === "" ? (this._$AH !== p && this._$AR(), this._$AH = p) : e !== this._$AH && e !== T && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Je(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== p && W(this._$AH) ? this._$AA.nextSibling.data = e : this.T(N.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: s, _$litType$: i } = e, a = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = F.createElement(He(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === a) this._$AH.p(s);
    else {
      const r = new Xe(a, this), n = r.u(this.options);
      r.p(s), this.T(n), this._$AH = r;
    }
  }
  _$AC(e) {
    let s = Ae.get(e.strings);
    return s === void 0 && Ae.set(e.strings, s = new F(e)), s;
  }
  k(e) {
    pe(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, a = 0;
    for (const r of e) a === s.length ? s.push(i = new V(this.O(I()), this.O(I()), this, this.options)) : i = s[a], i._$AI(r), a++;
    a < s.length && (this._$AR(i && i._$AB.nextSibling, a), s.length = a);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); e !== this._$AB; ) {
      const i = $e(e).nextSibling;
      $e(e).remove(), e = i;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
let ee = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, s, i, a, r) {
    this.type = 1, this._$AH = p, this._$AN = void 0, this.element = e, this.name = s, this._$AM = a, this.options = r, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = p;
  }
  _$AI(e, s = this, i, a) {
    const r = this.strings;
    let n = !1;
    if (r === void 0) e = D(this, e, s, 0), n = !W(e) || e !== this._$AH && e !== T, n && (this._$AH = e);
    else {
      const d = e;
      let l, f;
      for (e = r[0], l = 0; l < r.length - 1; l++) f = D(this, d[i + l], s, l), f === T && (f = this._$AH[l]), n ||= !W(f) || f !== this._$AH[l], f === p ? e = p : e !== p && (e += (f ?? "") + r[l + 1]), this._$AH[l] = f;
    }
    n && !a && this.j(e);
  }
  j(e) {
    e === p ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
};
class et extends ee {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === p ? void 0 : e;
  }
}
class tt extends ee {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== p);
  }
}
class st extends ee {
  constructor(e, s, i, a, r) {
    super(e, s, i, a, r), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = D(this, e, s, 0) ?? p) === T) return;
    const i = this._$AH, a = e === p && i !== p || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, r = e !== p && (i === p || a);
    a && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class it {
  constructor(e, s, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    D(this, e);
  }
}
const at = ce.litHtmlPolyfillSupport;
at?.(F, V), (ce.litHtmlVersions ??= []).push("3.3.3");
const rt = (t, e, s) => {
  const i = s?.renderBefore ?? e;
  let a = i._$litPart$;
  if (a === void 0) {
    const r = s?.renderBefore ?? null;
    i._$litPart$ = a = new V(e.insertBefore(I(), r), r, void 0, s ?? {});
  }
  return a._$AI(t), a;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ue = globalThis;
class z extends H {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = rt(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return T;
  }
}
z._$litElement$ = !0, z.finalized = !0, ue.litElementHydrateSupport?.({ LitElement: z });
const nt = ue.litElementPolyfillSupport;
nt?.({ LitElement: z });
(ue.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const te = (t) => (e, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ot = { attribute: !0, type: String, converter: J, reflect: !1, hasChanged: de }, lt = (t = ot, e, s) => {
  const { kind: i, metadata: a } = s;
  let r = globalThis.litPropertyMetadata.get(a);
  if (r === void 0 && globalThis.litPropertyMetadata.set(a, r = /* @__PURE__ */ new Map()), i === "setter" && ((t = Object.create(t)).wrapped = !0), r.set(s.name, t), i === "accessor") {
    const { name: n } = s;
    return { set(d) {
      const l = e.get.call(this);
      e.set.call(this, d), this.requestUpdate(n, l, t, !0, d);
    }, init(d) {
      return d !== void 0 && this.C(n, void 0, t, d), d;
    } };
  }
  if (i === "setter") {
    const { name: n } = s;
    return function(d) {
      const l = this[n];
      e.call(this, d), this.requestUpdate(n, l, t, !0, d);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function x(t) {
  return (e, s) => typeof s == "object" ? lt(t, e, s) : ((i, a, r) => {
    const n = a.hasOwnProperty(r);
    return a.constructor.createProperty(r, i), n ? Object.getOwnPropertyDescriptor(a, r) : void 0;
  })(t, e, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function w(t) {
  return x({ ...t, state: !0, attribute: !1 });
}
function se(t) {
  return (t?.locale?.language ?? t?.language ?? "sv").toLowerCase().startsWith("en") ? "en" : "sv";
}
const ht = {
  sv: {
    auto: "Auto",
    home: "Hemma",
    away: "Borta",
    boost: "Boost",
    mode: "Driftläge",
    settings: "Inställningar",
    room: "Rumstemperatur",
    outside: "Utetemperatur",
    presence: "Närvaro",
    unknown: "Okänd",
    measured: "Mätt",
    estimated: "Uppskattad",
    incomplete: "Ofullständig",
    missing: "Saknas",
    today: "Idag",
    yesterday: "Igår",
    week: "Denna vecka",
    month: "Denna månad",
    energy: "Energiförbrukning (uppvärmning)",
    cost: "Förbrukning & kostnad",
    savings: "Besparing (automatisering)",
    quick: "Snabbinställningar",
    baseline: "Baslinje & jämförelse",
    target: "Mål",
    powerNow: "Förbrukning just nu",
    todayShort: "Idag",
    systemStatus: "Systemstatus",
    online: "Online",
    offline: "Offline",
    updated: "Senast uppdaterad",
    before: "Före",
    after: "Efter",
    noData: "Ingen data ännu",
    perDay: "kWh/dygn",
    radiator: "Gnosjö element (Shelly)",
    heatpump: "Mitsubishi luft/luft",
    heating: "Värmer",
    idle: "Av",
    startBaseline: "Starta baslinje",
    stopBaseline: "Avsluta baslinje",
    baselineHint: "Baslinjen registrerar förbrukning innan automationen aktiveras.",
    noBaseline: "Ingen baslinje registrerad ännu.",
    partialHeatpump: "Värmepumpens el mäts inte – endast elementets besparing visas.",
    options: "Alla inställningar",
    general: "Allmänt",
    temperatures: "Temperaturer",
    schedule: "Schema",
    price: "Elpris-optimering",
    energyMetering: "Energimätning",
    advanced: "Avancerat",
    dryRun: "Torrkörning",
    dryRunOn: "Torrkörning – inga kommandon skickas",
    faults: "Fel",
    noFaults: "Inga fel",
    lastDecision: "Senaste beslut",
    close: "Stäng",
    roomTarget: "Mål hemma",
    awayTarget: "Mål borta",
    onBelow: "Element PÅ under",
    offAbove: "Element AV över",
    save: "Spara",
    confirm: "Bekräfta",
    cancel: "Avbryt",
    manualOverride: "Manuell överstyrning i 30 minuter",
    noEntities: "Integationen är inte konfigurerad.",
    demo: "Demodata"
  },
  en: {
    auto: "Auto",
    home: "Home",
    away: "Away",
    boost: "Boost",
    mode: "Mode",
    settings: "Settings",
    room: "Room temperature",
    outside: "Outside temperature",
    presence: "Presence",
    unknown: "Unknown",
    measured: "Measured",
    estimated: "Estimated",
    incomplete: "Incomplete",
    missing: "Missing",
    today: "Today",
    yesterday: "Yesterday",
    week: "This week",
    month: "This month",
    energy: "Heating energy",
    cost: "Consumption & cost",
    savings: "Savings (automation)",
    quick: "Quick settings",
    baseline: "Baseline & comparison",
    target: "target",
    powerNow: "Power now",
    todayShort: "Today",
    systemStatus: "System status",
    online: "Online",
    offline: "Offline",
    updated: "Last updated",
    before: "Before",
    after: "After",
    noData: "No data yet",
    perDay: "kWh/day",
    radiator: "Gnosjö radiator (Shelly)",
    heatpump: "Mitsubishi air/air",
    heating: "Heating",
    idle: "Off",
    startBaseline: "Start baseline",
    stopBaseline: "Stop baseline",
    baselineHint: "The baseline records consumption before automation is enabled.",
    noBaseline: "No baseline recorded yet.",
    partialHeatpump: "Heat pump electricity is not measured – radiator savings only.",
    options: "All settings",
    general: "General",
    temperatures: "Temperatures",
    schedule: "Schedule",
    price: "Price optimisation",
    energyMetering: "Energy metering",
    advanced: "Advanced",
    dryRun: "Dry run",
    dryRunOn: "Dry run – no commands are sent",
    faults: "Faults",
    noFaults: "No faults",
    lastDecision: "Last decision",
    close: "Close",
    roomTarget: "Home target",
    awayTarget: "Away target",
    onBelow: "Radiator on below",
    offAbove: "Radiator off above",
    save: "Save",
    confirm: "Confirm",
    cancel: "Cancel",
    manualOverride: "Manual override for 30 minutes",
    noEntities: "The integration is not configured.",
    demo: "Demo data"
  }
};
function o(t, e) {
  return ht[se(t)][e];
}
function ie(t) {
  return se(t) === "en" ? "en-SE" : "sv-SE";
}
function u(t, e, s = 1) {
  return e == null || Number.isNaN(e) ? "–" : new Intl.NumberFormat(ie(t), {
    minimumFractionDigits: s,
    maximumFractionDigits: s
  }).format(e);
}
function dt(t, e) {
  return e == null || Number.isNaN(e) ? "–" : new Intl.NumberFormat(ie(t), {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(e);
}
function Te(t, e) {
  if (!e)
    return "–";
  const s = new Date(e);
  return Number.isNaN(s.getTime()) ? "–" : new Intl.DateTimeFormat(ie(t), {
    hour: "2-digit",
    minute: "2-digit"
  }).format(s);
}
function Ee(t, e) {
  const s = /* @__PURE__ */ new Date(`${e}T12:00:00`);
  return Number.isNaN(s.getTime()) ? e : new Intl.DateTimeFormat(ie(t), {
    day: "numeric",
    month: "short"
  }).format(s);
}
const ct = {
  auto: { sv: "Auto", en: "Auto" },
  home: { sv: "Hemma", en: "Home" },
  away: { sv: "Borta", en: "Away" },
  comfort: { sv: "Komfort", en: "Comfort" },
  eco: { sv: "Eco", en: "Eco" },
  boost: { sv: "Boost", en: "Boost" },
  manual: { sv: "Manuell", en: "Manual" },
  disabled: { sv: "Avstängd", en: "Disabled" }
};
function De(t, e) {
  if (!e)
    return "–";
  const s = ct[e];
  return s ? se(t) === "en" ? s.en : s.sv : e;
}
const ze = {
  automation_disabled: {
    sv: "Automationen är avstängd.",
    en: "Automation is disabled."
  },
  manual_mode_no_action: {
    sv: "Manuellt läge – styrenheten rör ingenting.",
    en: "Manual mode – the controller does nothing."
  },
  temperature_below_on_threshold: {
    sv: "Rumstemperaturen ligger under PÅ-tröskeln.",
    en: "Room temperature is below the ON threshold."
  },
  temperature_above_off_threshold: {
    sv: "Rumstemperaturen har nått AV-tröskeln.",
    en: "Room temperature reached the OFF threshold."
  },
  within_hysteresis_band: {
    sv: "Inom hysteresbandet – inget byte behövs.",
    en: "Inside the hysteresis band – no change needed."
  },
  minimum_safety_temperature: {
    sv: "Under lägsta säkerhetstemperatur – elementet tvingas PÅ.",
    en: "Below the minimum safety temperature – radiator forced ON."
  },
  away: {
    sv: "Borta-läge – elementet hålls avstängt.",
    en: "Away mode – radiator kept off."
  },
  backup_heating_for_missing_heatpump: {
    sv: "Värmepumpen är otillgänglig – elementet används som reservvärme.",
    en: "Heat pump unavailable – radiator used as backup heating."
  },
  radiator_unavailable: {
    sv: "Elementet svarar inte – inga kommandon skickas.",
    en: "Radiator is unavailable – no commands sent."
  },
  fallback_temperature_hold: {
    sv: "Ingen giltig temperatur – elementet lämnas oförändrat.",
    en: "No valid temperature – radiator left unchanged."
  },
  fallback_temperature_on: {
    sv: "Ingen giltig temperatur – felläge håller elementet PÅ.",
    en: "No valid temperature – fallback keeps the radiator ON."
  },
  fallback_temperature_off: {
    sv: "Ingen giltig temperatur – felläge håller elementet AV.",
    en: "No valid temperature – fallback keeps the radiator OFF."
  },
  price_optimisation_off: {
    sv: "Prisoptimering är avstängd.",
    en: "Price optimisation is off."
  },
  no_price_available: {
    sv: "Inget elpris tillgängligt.",
    en: "No electricity price available."
  },
  cheap_price_but_nobody_home: {
    sv: "Billigt pris, men ingen är hemma – ingen förvärmning.",
    en: "Cheap price, but nobody is home – no preheating."
  },
  preheat_cheap_price: {
    sv: "Billigt pris – börvärdet höjs försiktigt.",
    en: "Cheap price – setpoint raised slightly."
  },
  setback_blocked_by_comfort_floor: {
    sv: "Dyrt pris, men komfortgolvet stoppar sänkningen.",
    en: "Expensive price, but the comfort floor blocks the setback."
  },
  setback_expensive_price: {
    sv: "Dyrt pris – börvärdet sänks inom komfortgränsen.",
    en: "Expensive price – setpoint lowered within the comfort limit."
  },
  price_within_normal_range: {
    sv: "Priset ligger inom normalt intervall.",
    en: "Price is within the normal range."
  }
};
function oe(t, e) {
  if (!e)
    return "–";
  const s = e.replace(/_(already_in_state|blocked_by_min_runtime)$/, ""), i = ze[e] ?? ze[s];
  return i ? se(t) === "en" ? i.en : i.sv : e.replaceAll("_", " ");
}
function Y(t, e) {
  switch (e) {
    case "home":
      return o(t, "home");
    case "away":
      return o(t, "away");
    default:
      return o(t, "unknown");
  }
}
const je = L`
  :host {
    --shc-bg: var(--primary-background-color, #f5f8fc);
    --shc-card: var(--card-background-color, #ffffff);
    --shc-border: var(--divider-color, #e4eaf2);
    --shc-text: var(--primary-text-color, #0f172a);
    --shc-muted: var(--secondary-text-color, #5a6b84);
    --shc-blue: var(--primary-color, #1e6fe8);
    --shc-blue-soft: color-mix(in srgb, var(--shc-blue) 12%, transparent);
    --shc-green: #16a34a;
    --shc-green-soft: color-mix(in srgb, #16a34a 12%, transparent);
    --shc-orange: #f59e0b;
    --shc-violet: #8b5cf6;
    --shc-red: #dc2626;
    --shc-radius: 16px;
    --shc-shadow: 0 1px 2px rgb(15 23 42 / 6%), 0 8px 24px rgb(15 23 42 / 4%);
    display: block;
    color: var(--shc-text);
    font-family: var(
      --paper-font-common-base_-_font-family,
      system-ui,
      -apple-system,
      "Segoe UI",
      Roboto,
      sans-serif
    );
  }

  .card {
    background: var(--shc-card);
    border: 1px solid var(--shc-border);
    border-radius: var(--shc-radius);
    box-shadow: var(--shc-shadow);
    padding: 18px 20px;
    box-sizing: border-box;
    min-width: 0;
  }

  .card h2,
  .card h3 {
    margin: 0;
    font-size: 17px;
    font-weight: 650;
    letter-spacing: -0.01em;
  }

  .label {
    color: var(--shc-muted);
    font-size: 13px;
    font-weight: 500;
  }

  .value {
    font-size: 30px;
    font-weight: 680;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }

  .value.small {
    font-size: 20px;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .spread {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 999px;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 600;
    background: var(--shc-blue-soft);
    color: var(--shc-blue);
  }

  .pill.ok {
    background: var(--shc-green-soft);
    color: var(--shc-green);
  }

  .pill.warn {
    background: color-mix(in srgb, var(--shc-orange) 16%, transparent);
    color: #b45309;
  }

  .pill.bad {
    background: color-mix(in srgb, var(--shc-red) 14%, transparent);
    color: var(--shc-red);
  }

  .quality {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-radius: 6px;
    padding: 2px 6px;
    border: 1px solid var(--shc-border);
    color: var(--shc-muted);
  }

  .quality.measured {
    color: var(--shc-green);
    border-color: color-mix(in srgb, var(--shc-green) 35%, transparent);
  }

  .quality.estimated {
    color: #b45309;
    border-color: color-mix(in srgb, var(--shc-orange) 40%, transparent);
  }

  .quality.incomplete,
  .quality.missing {
    color: var(--shc-red);
    border-color: color-mix(in srgb, var(--shc-red) 30%, transparent);
  }

  button {
    font: inherit;
    cursor: pointer;
    border-radius: 12px;
    border: 1px solid var(--shc-border);
    background: var(--shc-card);
    color: var(--shc-text);
    padding: 10px 14px;
    transition: background 120ms ease, border-color 120ms ease;
  }

  button:hover {
    border-color: color-mix(in srgb, var(--shc-blue) 45%, var(--shc-border));
  }

  button:focus-visible {
    outline: 2px solid var(--shc-blue);
    outline-offset: 2px;
  }

  button.primary {
    background: var(--shc-blue);
    border-color: var(--shc-blue);
    color: #fff;
  }

  button.active {
    background: var(--shc-blue);
    border-color: var(--shc-blue);
    color: #fff;
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .muted {
    color: var(--shc-muted);
    font-size: 13px;
  }

  .empty {
    color: var(--shc-muted);
    font-size: 14px;
    padding: 12px 0;
  }

  .bar-track {
    position: relative;
    height: 8px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--shc-muted) 18%, transparent);
    overflow: hidden;
  }

  .bar-fill {
    position: absolute;
    inset: 0 auto 0 0;
    border-radius: 999px;
    background: var(--shc-blue);
  }

  .grid-gap {
    gap: 14px;
  }

  @media (max-width: 720px) {
    .value {
      font-size: 25px;
    }
    .card {
      padding: 14px 16px;
    }
  }
`, pt = L`
  .chart-wrap {
    position: relative;
    width: 100%;
  }
  svg {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
  }
  .axis-label {
    fill: var(--shc-muted);
    font-size: 10px;
    font-family: inherit;
  }
  .grid-line {
    stroke: var(--shc-border);
    stroke-width: 1;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 10px;
    font-size: 12px;
    color: var(--shc-muted);
  }
  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .swatch {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    display: inline-block;
  }
  .tooltip {
    position: absolute;
    pointer-events: none;
    background: var(--shc-card);
    border: 1px solid var(--shc-border);
    border-radius: 10px;
    box-shadow: var(--shc-shadow);
    padding: 8px 10px;
    font-size: 12px;
    line-height: 1.4;
    white-space: nowrap;
    transform: translate(-50%, -120%);
    z-index: 5;
  }
`;
var ut = Object.defineProperty, mt = Object.getOwnPropertyDescriptor, C = (t, e, s, i) => {
  for (var a = i > 1 ? void 0 : i ? mt(e, s) : e, r = t.length - 1, n; r >= 0; r--)
    (n = t[r]) && (a = (i ? n(e, s, a) : n(a)) || a);
  return i && a && ut(e, s, a), a;
};
const B = 520, ne = 236, b = { top: 14, right: 38, bottom: 30, left: 34 };
let S = class extends z {
  constructor() {
    super(...arguments), this.heatpump = [], this.radiator = [], this.outside = [], this.loading = !1, this.days = 7, this.hovered = null;
  }
  columns() {
    const t = /* @__PURE__ */ new Map();
    for (const e of this.heatpump)
      t.set(e.date, {
        date: e.date,
        heatpump: e.kwh,
        radiator: null,
        complete: e.complete
      });
    for (const e of this.radiator) {
      const s = t.get(e.date);
      s ? (s.radiator = e.kwh, s.complete = s.complete && e.complete) : t.set(e.date, {
        date: e.date,
        heatpump: null,
        radiator: e.kwh,
        complete: e.complete
      });
    }
    return [...t.values()].sort((e, s) => e.date.localeCompare(s.date)).slice(-this.days);
  }
  maxEnergy(t) {
    const e = t.map(
      (s) => (s.heatpump ?? 0) + (s.radiator ?? 0)
    );
    return Math.max(1, Math.ceil(Math.max(...e, 0)));
  }
  render() {
    const t = this.columns();
    if (!t.length)
      return h`<div class="empty">
        ${this.loading ? "…" : o(this.hass, "noData")}
      </div>`;
    const e = B - b.left - b.right, s = ne - b.top - b.bottom, i = this.maxEnergy(t), a = e / t.length, r = Math.min(30, a * 0.56), n = this.outside.map((c) => c.y).filter(Number.isFinite), d = n.length ? Math.min(...n) : 0, l = n.length ? Math.max(...n) : 1, f = Math.max(1, l - d), v = (c) => b.top + s - (c - d) / f * s, m = this.buildTempPath(t, v, b.left, a), $ = [0, 0.25, 0.5, 0.75, 1];
    return h`
      <div class="chart-wrap">
        <svg viewBox="0 0 ${B} ${ne}" role="img" aria-label=${o(this.hass, "energy")}>
          ${$.map((c) => {
      const y = b.top + s * c, A = i * (1 - c);
      return P`
              <line class="grid-line" x1=${b.left} y1=${y} x2=${B - b.right} y2=${y} />
              <text class="axis-label" x=${b.left - 6} y=${y + 3} text-anchor="end">
                ${u(this.hass, A, 0)}
              </text>
            `;
    })}
          <text class="axis-label" x=${b.left - 6} y=${b.top - 4} text-anchor="end">
            kWh
          </text>
          <text
            class="axis-label"
            x=${B - b.right + 6}
            y=${b.top - 4}
            text-anchor="start"
          >
            °C
          </text>

          ${t.map((c, y) => {
      const A = b.left + y * a + a / 2 - r / 2, g = c.heatpump ?? 0, Be = c.radiator ?? 0, Z = g / i * s, ae = Be / i * s, ge = b.top + s;
      return P`
              <g
                @mouseenter=${() => {
        this.hovered = y;
      }}
                @mouseleave=${() => {
        this.hovered = null;
      }}
              >
                <rect
                  x=${A - a * 0.22}
                  y=${b.top}
                  width=${a}
                  height=${s}
                  fill="transparent"
                />
                ${Z > 0 ? P`<rect x=${A} y=${ge - Z} width=${r} height=${Z}
                        rx="4" fill="var(--shc-blue)" opacity="0.92" />` : p}
                ${ae > 0 ? P`<rect x=${A} y=${ge - Z - ae} width=${r}
                        height=${ae} rx="4" fill="var(--shc-orange)" opacity="0.95" />` : p}
                ${c.complete ? p : P`<title>${o(this.hass, "incomplete")}</title>`}
              </g>
              <text
                class="axis-label"
                x=${b.left + y * a + a / 2}
                y=${ne - 10}
                text-anchor="middle"
              >
                ${Ee(this.hass, c.date)}
              </text>
            `;
    })}

          ${m ? P`<path d=${m} fill="none" stroke="var(--shc-violet)"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />` : p}
          ${this.outside.slice(Math.max(0, this.outside.length - t.length)).map((c, y) => {
      const A = b.left + y * a + a / 2;
      return P`<circle cx=${A} cy=${v(c.y)} r="3"
                fill="var(--shc-card)" stroke="var(--shc-violet)" stroke-width="2" />`;
    })}
        </svg>

        ${this.hovered !== null && t[this.hovered] ? h`<div
                class="tooltip"
                style="left: ${(b.left + this.hovered * a + a / 2) / B * 100}%; top: 0;"
              >
                <strong>${Ee(this.hass, t[this.hovered].date)}</strong
                ><br />
                Mitsubishi: ${u(this.hass, t[this.hovered].heatpump, 2)} kWh<br />
                Gnosjö: ${u(this.hass, t[this.hovered].radiator, 2)} kWh<br />
                ${this.outside[this.hovered] ? `Ute: ${u(this.hass, this.outside[this.hovered].y, 1)} °C` : ""}
              </div>` : p}
      </div>

      <div class="legend">
        <span><i class="swatch" style="background: var(--shc-blue)"></i>Mitsubishi (kWh)</span>
        <span><i class="swatch" style="background: var(--shc-orange)"></i>Gnosjö (kWh)</span>
        <span><i class="swatch" style="background: var(--shc-violet)"></i
          >${o(this.hass, "outside")} (°C)</span>
      </div>
    `;
  }
  buildTempPath(t, e, s, i) {
    if (this.outside.length < 2)
      return null;
    const a = Math.max(0, this.outside.length - t.length);
    return this.outside.slice(a, a + t.length).map((r, n) => {
      const d = s + n * i + i / 2, l = e(r.y);
      return `${n === 0 ? "M" : "L"}${d.toFixed(1)},${l.toFixed(1)}`;
    }).join(" ");
  }
};
S.styles = [pt];
C([
  x({ attribute: !1 })
], S.prototype, "hass", 2);
C([
  x({ attribute: !1 })
], S.prototype, "heatpump", 2);
C([
  x({ attribute: !1 })
], S.prototype, "radiator", 2);
C([
  x({ attribute: !1 })
], S.prototype, "outside", 2);
C([
  x({ type: Boolean })
], S.prototype, "loading", 2);
C([
  x({ type: Number })
], S.prototype, "days", 2);
C([
  w()
], S.prototype, "hovered", 2);
S = C([
  te("shc-energy-chart")
], S);
var gt = Object.defineProperty, ft = Object.getOwnPropertyDescriptor, K = (t, e, s, i) => {
  for (var a = i > 1 ? void 0 : i ? ft(e, s) : e, r = t.length - 1, n; r >= 0; r--)
    (n = t[r]) && (a = (i ? n(e, s, a) : n(a)) || a);
  return i && a && gt(e, s, a), a;
};
const vt = [
  { id: "general", key: "general" },
  { id: "temperatures", key: "temperatures" },
  { id: "schedule", key: "schedule" },
  { id: "price", key: "price" },
  { id: "energy", key: "energyMetering" },
  { id: "presence", key: "presence" },
  { id: "advanced", key: "advanced" }
];
let R = class extends z {
  constructor() {
    super(...arguments), this.open = !1, this.section = "general";
  }
  close() {
    this.dispatchEvent(
      new CustomEvent("shc-close", { bubbles: !0, composed: !0 })
    );
  }
  entity(t) {
    return this.zone?.entities?.[t];
  }
  async setNumber(t, e) {
    const s = this.entity(t);
    !s || !this.hass || await this.hass.callService("number", "set_value", {
      entity_id: s,
      value: e
    });
  }
  async toggleDryRun(t) {
    const e = this.entity("dry_run");
    !e || !this.hass || await this.hass.callService("switch", t ? "turn_on" : "turn_off", {
      entity_id: e
    });
  }
  async pressButton(t) {
    const e = this.entity(t);
    !e || !this.hass || await this.hass.callService("button", "press", { entity_id: e });
  }
  notifyRefresh() {
    this.dispatchEvent(
      new CustomEvent("shc-refresh", { bubbles: !0, composed: !0 })
    );
  }
  // ------------------------------------------------------------------
  // Schedule
  // ------------------------------------------------------------------
  currentSchedule() {
    return this.zone?.schedule ?? {
      enabled: !1,
      weekday: [],
      weekend: []
    };
  }
  async saveSchedule(t) {
    !this.hass || !this.zone?.entry_id || (await this.hass.callWS({
      type: "smart_heat_controller/set_schedule",
      entry_id: this.zone.entry_id,
      enabled: t.enabled,
      weekday: t.weekday,
      weekend: t.weekend
    }), this.notifyRefresh());
  }
  scheduleWithSegment(t, e, s, i = !1) {
    const a = this.currentSchedule(), r = [...a[t]];
    i ? r.splice(e, 1) : e >= r.length ? r.push({ start: "06:00", target: 21, ...s }) : r[e] = { ...r[e], ...s };
    const n = [...r].sort((d, l) => d.start.localeCompare(l.start));
    return { ...a, [t]: n };
  }
  async saveVacation(t, e) {
    !this.hass || !this.zone?.entry_id || (await this.hass.callWS({
      type: "smart_heat_controller/set_vacation",
      entry_id: this.zone.entry_id,
      start: t || null,
      end: e || null
    }), this.notifyRefresh());
  }
  renderProfile(t, e) {
    const i = this.currentSchedule()[t];
    return h`
      <div class="profile">
        <div class="profile-head">
          <strong>${e}</strong>
          <button
            class="link"
            @click=${() => this.saveSchedule(
      this.scheduleWithSegment(t, i.length, {})
    )}
          >
            + Lägg till
          </button>
        </div>
        ${i.length === 0 ? h`<p class="hint">Inga tider – schemat påverkar inte zonen.</p>` : i.map(
      (a, r) => h`
                <div class="segment">
                  <input
                    type="time"
                    .value=${a.start}
                    @change=${(n) => this.saveSchedule(
        this.scheduleWithSegment(t, r, {
          start: n.target.value
        })
      )}
                  />
                  <input
                    type="number"
                    min="5"
                    max="30"
                    step="0.5"
                    .value=${String(a.target)}
                    @change=${(n) => this.saveSchedule(
        this.scheduleWithSegment(t, r, {
          target: Number(n.target.value)
        })
      )}
                  />
                  <span class="hint">°C</span>
                  <button
                    class="link"
                    aria-label="Ta bort"
                    @click=${() => this.saveSchedule(
        this.scheduleWithSegment(t, r, {}, !0)
      )}
                  >
                    ✕
                  </button>
                </div>
              `
    )}
      </div>
    `;
  }
  renderSchedule() {
    const t = this.currentSchedule(), e = this.zone?.vacation, s = this.zone?.schedule_target;
    return h`
      <label class="field">
        <span>Använd veckoschema</span>
        <input
          type="checkbox"
          .checked=${t.enabled}
          @change=${(i) => this.saveSchedule({
      ...t,
      enabled: i.target.checked
    })}
        />
      </label>

      ${t.enabled && s != null ? h`<p class="hint">
            Schemat sätter nu <strong>${u(this.hass, s, 1)} °C</strong>.
            Elementets trösklar följer med automatiskt.
          </p>` : h`<p class="hint">
            Med schemat av används hemma-/borta-temperaturerna.
          </p>`}

      ${this.renderProfile("weekday", "Vardagar (mån–fre)")}
      ${this.renderProfile("weekend", "Helg (lör–sön)")}

      <div class="profile">
        <div class="profile-head"><strong>Semester</strong></div>
        <div class="segment">
          <input
            type="date"
            .value=${e?.start ?? ""}
            @change=${(i) => this.saveVacation(
      i.target.value,
      e?.end ?? null
    )}
          />
          <span class="hint">till</span>
          <input
            type="date"
            .value=${e?.end ?? ""}
            @change=${(i) => this.saveVacation(
      e?.start ?? null,
      i.target.value
    )}
          />
        </div>
        <p class="hint">
          Under semestern behandlas zonen som borta (endast i Auto-läge).
        </p>
      </div>
    `;
  }
  // ------------------------------------------------------------------
  // Price optimisation
  // ------------------------------------------------------------------
  currentPrice() {
    return this.zone?.price_settings ?? {
      enabled: !1,
      cheap_threshold: null,
      expensive_threshold: null,
      max_adjust: 1,
      min_comfort: 18
    };
  }
  async savePrice(t) {
    !this.hass || !this.zone?.entry_id || (await this.hass.callWS({
      type: "smart_heat_controller/set_price",
      entry_id: this.zone.entry_id,
      enabled: t.enabled,
      cheap: t.cheap_threshold,
      expensive: t.expensive_threshold,
      max_adjust: t.max_adjust,
      min_comfort: t.min_comfort
    }), this.notifyRefresh());
  }
  renderPrice() {
    const t = this.currentPrice(), e = this.zone?.price_decision, s = this.zone?.price?.sek_per_kwh;
    return h`
      <label class="field">
        <span>Aktivera prisoptimering</span>
        <input
          type="checkbox"
          .checked=${t.enabled}
          @change=${(i) => this.savePrice({
      ...t,
      enabled: i.target.checked
    })}
        />
      </label>

      <div class="field readonly">
        <span>Aktuellt pris</span>
        <strong>
          ${s != null ? `${u(this.hass, s, 2)} SEK/kWh` : "inget pris valt"}
        </strong>
      </div>

      ${this.numberField(
      "Billigt under (SEK/kWh)",
      t.cheap_threshold,
      0,
      10,
      0.05,
      (i) => this.savePrice({ ...t, cheap_threshold: i })
    )}
      ${this.numberField(
      "Dyrt över (SEK/kWh)",
      t.expensive_threshold,
      0,
      10,
      0.05,
      (i) => this.savePrice({ ...t, expensive_threshold: i })
    )}
      ${this.numberField(
      "Max justering (°C)",
      t.max_adjust,
      0,
      3,
      0.5,
      (i) => this.savePrice({ ...t, max_adjust: i ?? t.max_adjust })
    )}
      ${this.numberField(
      "Lägsta komfort (°C)",
      t.min_comfort,
      15,
      25,
      0.5,
      (i) => this.savePrice({ ...t, min_comfort: i ?? t.min_comfort })
    )}

      <p class="hint">
        Vid billigt pris höjs börvärdet högst ${u(this.hass, t.max_adjust, 1)} °C
        och bara när någon är hemma. Vid dyrt pris sänks det, men aldrig under
        ${u(this.hass, t.min_comfort, 1)} °C.
      </p>
      ${e && e.state !== "disabled" ? h`<p class="hint">
            Just nu: ${oe(this.hass, e.reason)}
            (${e.offset > 0 ? "+" : ""}${u(this.hass, e.offset, 1)} °C)
          </p>` : p}
    `;
  }
  numberField(t, e, s, i, a, r) {
    return h`
      <label class="field">
        <span>${t}</span>
        <input
          type="number"
          min=${s}
          max=${i}
          step=${a}
          .value=${e == null ? "" : String(e)}
          @change=${(n) => {
      const d = n.target.value;
      r(d === "" ? null : Number(d));
    }}
        />
      </label>
    `;
  }
  render() {
    return this.open ? h`
      <div class="backdrop" @click=${this.close}></div>
      <aside class="drawer" role="dialog" aria-modal="true" aria-label=${o(this.hass, "settings")}>
        <header>
          <h2>${o(this.hass, "settings")} – ${this.zone?.name ?? ""}</h2>
          <button class="icon" aria-label=${o(this.hass, "close")} @click=${this.close}>
            ✕
          </button>
        </header>

        <nav>
          ${vt.map(
      (t) => h`
              <button
                class=${this.section === t.id ? "active" : ""}
                @click=${() => {
        this.section = t.id;
      }}
              >
                ${o(this.hass, t.key)}
              </button>
            `
    )}
        </nav>

        <div class="body">${this.renderSection()}</div>

        <footer>
          <button
            class="primary"
            @click=${() => {
      const t = new CustomEvent("shc-open-options", {
        bubbles: !0,
        composed: !0
      });
      this.dispatchEvent(t);
    }}
          >
            ${o(this.hass, "options")}
          </button>
        </footer>
      </aside>
    ` : p;
  }
  renderSection() {
    switch (this.section) {
      case "temperatures":
        return this.renderTemperatures();
      case "schedule":
        return this.renderSchedule();
      case "price":
        return this.renderPrice();
      case "energy":
        return this.renderEnergy();
      case "presence":
        return this.renderPresence();
      case "advanced":
        return this.renderAdvanced();
      default:
        return this.renderGeneral();
    }
  }
  renderGeneral() {
    const t = this.entity("dry_run"), e = t ? this.hass?.states[t]?.state === "on" : !1;
    return h`
      <label class="field">
        <span>${o(this.hass, "dryRun")}</span>
        <input
          type="checkbox"
          .checked=${e}
          @change=${(s) => this.toggleDryRun(s.target.checked)}
        />
      </label>
      <p class="hint">${e ? o(this.hass, "dryRunOn") : ""}</p>

      <div class="field readonly">
        <span>${o(this.hass, "presence")}</span>
        <strong>${Y(this.hass, this.zone?.presence)}</strong>
      </div>
      <div class="field readonly">
        <span>${o(this.hass, "mode")}</span>
        <strong>${De(this.hass, this.zone?.effective_mode)}</strong>
      </div>
      <div class="field readonly">
        <span>${o(this.hass, "lastDecision")}</span>
        <strong>${oe(this.hass, this.zone?.reason)}</strong>
      </div>
    `;
  }
  renderTemperatures() {
    const t = this.zone?.settings;
    return h`
      ${this.slider("home_target", o(this.hass, "roomTarget"), t?.home_target, 5, 30, 0.5)}
      ${this.slider("away_target", o(this.hass, "awayTarget"), t?.away_target, 5, 30, 0.5)}
      ${this.slider(
      "radiator_on_below",
      o(this.hass, "onBelow"),
      t?.radiator_on_below,
      5,
      30,
      0.5
    )}
      ${this.slider(
      "radiator_off_above",
      o(this.hass, "offAbove"),
      t?.radiator_off_above,
      5,
      30,
      0.5
    )}
      ${this.slider(
      "min_on_minutes",
      "Minsta ON-tid",
      t?.min_on_minutes,
      0,
      120,
      1
    )}
      ${this.slider(
      "min_off_minutes",
      "Minsta OFF-tid",
      t?.min_off_minutes,
      0,
      120,
      1
    )}
    `;
  }
  renderEnergy() {
    const t = this.zone?.radiator, e = this.zone?.heatpump, s = this.zone?.price;
    return h`
      <div class="field readonly">
        <span>${o(this.hass, "radiator")}</span>
        <strong>${u(this.hass, t?.power_w, 0)} W</strong>
      </div>
      <div class="field readonly">
        <span>${o(this.hass, "heatpump")}</span>
        <strong>${u(this.hass, e?.power_w, 0)} W</strong>
      </div>
      <div class="field readonly">
        <span>${o(this.hass, "today")} – Mitsubishi</span>
        <strong>${u(this.hass, e?.kwh_today, 2)} kWh</strong>
      </div>
      <div class="field readonly">
        <span>${o(this.hass, "today")} – Gnosjö</span>
        <strong>${u(this.hass, t?.kwh_today, 2)} kWh</strong>
      </div>
      <div class="field readonly">
        <span>Elpris</span>
        <strong>
          ${s?.sek_per_kwh != null ? `${u(this.hass, s.sek_per_kwh, 2)} SEK/kWh` : "–"}
        </strong>
      </div>
      <p class="hint">
        ${s && !s.includes_fees ? "Endast spotpris – nätavgift, skatt och moms tillkommer." : ""}
      </p>

      <div class="actions">
        <button @click=${() => this.pressButton("start_baseline")}>
          ${o(this.hass, "startBaseline")}
        </button>
        <button @click=${() => this.pressButton("stop_baseline")}>
          ${o(this.hass, "stopBaseline")}
        </button>
      </div>
      <p class="hint">${o(this.hass, "baselineHint")}</p>
    `;
  }
  renderPresence() {
    const t = this.entity("presence"), s = (t ? this.hass?.states[t] : void 0)?.attributes ?? {};
    return h`
      <div class="field readonly">
        <span>${o(this.hass, "presence")}</span>
        <strong>${Y(this.hass, this.zone?.presence)}</strong>
      </div>
      <div class="field readonly">
        <span>Rå status</span>
        <strong>${Y(this.hass, String(s.raw ?? this.zone?.presence_raw ?? ""))}</strong>
      </div>
      <p class="hint">
        Korta WiFi-avbrott påverkar inte läget – frånvaro kräver den konfigurerade
        fördröjningen.
      </p>
    `;
  }
  renderAdvanced() {
    const t = this.zone?.faults ?? [];
    return h`
      <div class="field readonly">
        <span>${o(this.hass, "faults")}</span>
        <strong>${t.length ? t.join(", ") : o(this.hass, "noFaults")}</strong>
      </div>
      ${this.slider(
      "hysteresis",
      "Hysteres (°C)",
      this.zone?.settings?.hysteresis,
      0.1,
      3,
      0.1
    )}
      ${this.slider(
      "min_safety_temp",
      "Lägsta säkerhetstemp (°C)",
      this.zone?.settings?.min_safety_temp,
      5,
      25,
      0.5
    )}
      <p class="hint">
        ${o(this.hass, "updated")}: ${Te(this.hass, this.zone?.last_updated)}
      </p>
    `;
  }
  slider(t, e, s, i, a, r) {
    const n = !this.entity(t);
    return h`
      <label class="field">
        <span>${e}</span>
        <div class="slider">
          <input
            type="range"
            min=${i}
            max=${a}
            step=${r}
            .value=${String(s ?? i)}
            ?disabled=${n}
            @change=${(d) => this.setNumber(t, Number(d.target.value))}
          />
          <output>${u(this.hass, s, r < 1 ? 1 : 0)}</output>
        </div>
      </label>
    `;
  }
};
R.styles = [
  je,
  L`
      :host {
        position: fixed;
        inset: 0;
        z-index: 12;
        pointer-events: none;
      }

      :host([open]) {
        pointer-events: auto;
      }

      .backdrop {
        position: absolute;
        inset: 0;
        background: rgb(15 23 42 / 35%);
        backdrop-filter: blur(1px);
      }

      .drawer {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: min(420px, 100%);
        background: var(--shc-card);
        border-left: 1px solid var(--shc-border);
        display: flex;
        flex-direction: column;
        box-shadow: -8px 0 32px rgb(15 23 42 / 12%);
      }

      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 18px;
        border-bottom: 1px solid var(--shc-border);
      }

      header h2 {
        font-size: 16px;
        margin: 0;
        font-weight: 650;
      }

      .icon {
        border: none;
        background: transparent;
        font-size: 16px;
        padding: 6px 10px;
      }

      nav {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 12px 14px;
        border-bottom: 1px solid var(--shc-border);
      }

      nav button {
        padding: 6px 11px;
        font-size: 13px;
        border-radius: 999px;
      }

      .body {
        flex: 1;
        overflow-y: auto;
        padding: 16px 18px;
      }

      footer {
        padding: 12px 18px;
        border-top: 1px solid var(--shc-border);
      }

      footer button {
        width: 100%;
      }

      .field {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 9px 0;
        border-bottom: 1px dashed var(--shc-border);
        font-size: 14px;
      }

      .field span {
        color: var(--shc-muted);
      }

      .field.readonly strong {
        font-weight: 600;
      }

      .slider {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .slider input {
        width: 130px;
        accent-color: var(--shc-blue);
      }

      .slider output {
        min-width: 34px;
        text-align: right;
        font-variant-numeric: tabular-nums;
      }

      .hint {
        color: var(--shc-muted);
        font-size: 12px;
        margin: 8px 0 0;
      }

      .actions {
        display: flex;
        gap: 8px;
        margin-top: 14px;
      }

      .profile {
        margin-top: 16px;
        border-top: 1px solid var(--shc-border);
        padding-top: 12px;
      }

      .profile-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;
      }

      .segment {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 0;
      }

      .segment input[type="time"],
      .segment input[type="date"] {
        font: inherit;
        font-size: 13px;
        padding: 5px 7px;
        border: 1px solid var(--shc-border);
        border-radius: 8px;
        background: var(--shc-card);
        color: var(--shc-text);
      }

      .segment input[type="number"] {
        width: 66px;
        font: inherit;
        font-size: 13px;
        padding: 5px 7px;
        border: 1px solid var(--shc-border);
        border-radius: 8px;
        background: var(--shc-card);
        color: var(--shc-text);
      }

      button.link {
        border: none;
        background: transparent;
        color: var(--shc-blue);
        padding: 4px 6px;
        font-size: 13px;
      }

      .field input[type="number"] {
        width: 90px;
        font: inherit;
        font-size: 14px;
        padding: 5px 8px;
        border: 1px solid var(--shc-border);
        border-radius: 8px;
        background: var(--shc-card);
        color: var(--shc-text);
      }

      input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: var(--shc-blue);
      }

      @media (max-width: 720px) {
        .drawer {
          width: 100%;
        }
      }
    `
];
K([
  x({ attribute: !1 })
], R.prototype, "hass", 2);
K([
  x({ attribute: !1 })
], R.prototype, "zone", 2);
K([
  x({ type: Boolean, reflect: !0 })
], R.prototype, "open", 2);
K([
  w()
], R.prototype, "section", 2);
R = K([
  te("shc-settings-drawer")
], R);
var bt = Object.defineProperty, yt = Object.getOwnPropertyDescriptor, k = (t, e, s, i) => {
  for (var a = i > 1 ? void 0 : i ? yt(e, s) : e, r = t.length - 1, n; r >= 0; r--)
    (n = t[r]) && (a = (i ? n(e, s, a) : n(a)) || a);
  return i && a && bt(e, s, a), a;
};
const $t = 3e4, _t = 5 * 6e4, Ce = "smart-heat-controller.zone", xt = [
  { id: "auto", key: "auto", icon: "M12 3v2m0 14v2M5.6 5.6 7 7m10 10 1.4 1.4M3 12h2m14 0h2M5.6 18.4 7 17m10-10 1.4-1.4" },
  { id: "home", key: "home", icon: "M4 11 12 4l8 7v9H4z" },
  { id: "away", key: "away", icon: "M3 16h18l-2-5H5zM6 16v4m12-4v4" },
  { id: "boost", key: "boost", icon: "M5 15c4 0 4-9 9-9 3 0 5 2 5 5s-2 5-5 5H5z" }
];
let _ = class extends z {
  constructor() {
    super(...arguments), this.zones = [], this.outside = [], this.drawerOpen = !1, this.chartDays = 7, this.pending = /* @__PURE__ */ new Set(), this.lastFetch = 0, this.lastHistory = 0;
  }
  setConfig(t) {
    this.config = t;
  }
  getCardSize() {
    return 14;
  }
  connectedCallback() {
    super.connectedCallback(), this.selectedZoneId = window.localStorage.getItem(Ce) ?? void 0, this.refresh(!0);
  }
  updated(t) {
    if (t.has("hass") && this.hass) {
      const e = Date.now();
      e - this.lastFetch > $t && this.refresh(), e - this.lastHistory > _t && this.loadOutsideHistory();
    }
  }
  async refresh(t = !1) {
    if (!(!this.hass || !t && Date.now() - this.lastFetch < 5e3)) {
      this.lastFetch = Date.now();
      try {
        const e = await this.hass.callWS({
          type: "smart_heat_controller/zones"
        });
        this.zones = e.zones ?? [];
        const s = this.config?.entry_id ?? this.selectedZoneId;
        this.zone = (s ? this.zones.find((i) => i.entry_id === s) : void 0) ?? this.zones[0], this.zone && !this.config?.entry_id && (this.selectedZoneId = this.zone.entry_id), this.error = void 0, this.loadOutsideHistory();
      } catch (e) {
        this.error = e instanceof Error ? e.message : String(e);
      }
    }
  }
  chooseZone(t) {
    this.selectedZoneId = t, window.localStorage.setItem(Ce, t), this.zone = this.zones.find((e) => e.entry_id === t), this.outside = [], this.loadOutsideHistory();
  }
  async loadOutsideHistory() {
    const t = this.zone?.actuators?.outside_sensor;
    if (!(!this.hass || !t)) {
      this.lastHistory = Date.now();
      try {
        const e = /* @__PURE__ */ new Date(), s = new Date(e.getTime() - 336 * 3600 * 1e3), a = (await this.hass.callWS({
          type: "history/history_during_period",
          start_time: s.toISOString(),
          end_time: e.toISOString(),
          minimal_response: !1,
          no_attributes: !0,
          entity_ids: [t]
        }))?.[t] ?? [];
        this.outside = a.map((r) => ({ t: Number(r[0]), y: Number(r[1]) })).filter((r) => Number.isFinite(r.y));
      } catch {
        this.outside = [];
      }
    }
  }
  entity(t) {
    return this.zone?.entities?.[t];
  }
  stateValue(t) {
    const e = this.entity(t);
    return e ? this.hass?.states[e]?.state : void 0;
  }
  async setNumber(t, e) {
    const s = this.entity(t);
    if (!(!s || !this.hass)) {
      this.pending = new Set(this.pending).add(t), this.requestUpdate();
      try {
        await this.hass.callService("number", "set_value", {
          entity_id: s,
          value: e
        }), await this.refresh(!0);
      } finally {
        const i = new Set(this.pending);
        i.delete(t), this.pending = i;
      }
    }
  }
  async selectMode(t) {
    const e = this.entity("mode");
    !e || !this.hass || (t === "boost" ? await this.hass.callService(
      "smart_heat_controller",
      "set_mode",
      {
        entry_id: this.zone?.entry_id,
        mode: "boost",
        duration: 60
      },
      void 0,
      void 0,
      !1
    ) : await this.hass.callService("select", "select_option", {
      entity_id: e,
      option: t
    }), await this.refresh(!0));
  }
  async toggleRadiator() {
    const t = this.zone?.actuators?.switches ?? [];
    if (!t.length || !this.hass)
      return;
    const e = t.some(
      (s) => this.hass?.states[s]?.state === "on"
    );
    await this.hass.callService("smart_heat_controller", "set_mode", {
      entry_id: this.zone?.entry_id,
      mode: "manual",
      duration: 30
    }), await this.hass.callService("switch", e ? "turn_off" : "turn_on", {
      entity_id: t
    }), this.drawerOpen = !0;
  }
  async pressButton(t) {
    const e = this.entity(t);
    !e || !this.hass || (await this.hass.callService("button", "press", { entity_id: e }), await this.refresh(!0));
  }
  openOptions() {
    const t = this.zone?.entry_id, e = t ? `/config/integrations/integration/smart_heat_controller#config_entry=${t}` : "/config/integrations";
    history.pushState(null, "", e), window.dispatchEvent(new Event("location-changed"));
  }
  render() {
    if (this.error)
      return h`<div class="card">
        <h3>Smart Heat Controller</h3>
        <p class="empty">${this.error}</p>
      </div>`;
    if (!this.zone)
      return h`<div class="card"><p class="empty">…</p></div>`;
    const t = this.zone, e = t.settings, s = this.currentRoomTemperature(), i = this.heatpumpHeating(), a = this.radiatorOn(), r = t.mode ?? "auto", n = t.presence ?? "unknown", d = t.totals?.today ?? {}, l = t.totals?.week ?? {}, f = t.totals?.month ?? {}, v = t.costs?.today?.total ?? null, m = t.costs?.week?.total ?? null, $ = t.costs?.month?.total ?? null, c = t.savings, y = t.series, A = t.dry_run === !0;
    return h`
      <div class="shell">
        ${A ? h`<div class="banner">${o(this.hass, "dryRunOn")}</div>` : p}
        ${(t.faults ?? []).length ? h`<div class="banner">
              ${o(this.hass, "faults")}: ${(t.faults ?? []).join(", ")}
            </div>` : p}

        <div class="topbar">
          <div class="brand">
            <span aria-hidden="true">🔥</span>
            <span>Smart Heat Controller – ${t.name}</span>
          </div>
          <div class="row">
            ${this.zones.length > 1 ? h`<select
                  aria-label="Zone"
                  .value=${t.entry_id}
                  @change=${(g) => {
      this.chooseZone(g.target.value);
    }}
                >
                  ${this.zones.map(
      (g) => h`<option
                      value=${g.entry_id}
                      ?selected=${g.entry_id === t.entry_id}
                    >
                      ${g.name}
                    </option>`
    )}
                </select>` : p}
            <span class="pill ${r === "auto" ? "ok" : ""}">
              ${r === "auto" ? (this.hass?.locale?.language ?? "").startsWith("en") ? "Automatic" : "Automatisk drift" : r.toUpperCase()}
            </span>
            <button
              aria-label=${o(this.hass, "settings")}
              @click=${() => {
      this.drawerOpen = !0;
    }}
            >
              ⚙
            </button>
          </div>
        </div>

        <div class="grid">
          <!-- Row 1 -->
          <div class="card zone">
            ${t.image_url ? h`<img src=${t.image_url} alt="" />` : p}
            <div class="caption">
              <strong>${t.name}</strong>
              ${t.area ? h`<span class="muted">${t.area} m²</span>` : p}
            </div>
          </div>

          <div class="card temp-card">
            <div class="row">
              <span aria-hidden="true">🌡</span>
              <span class="label">${o(this.hass, "room")}</span>
            </div>
            <div class="value">${u(this.hass, s, 1)} °C</div>
            <div class="muted">
              ${o(this.hass, "target")} (${o(this.hass, "home")}):
              ${u(this.hass, e?.home_target, 1)} °C
            </div>          </div>

          <div class="card temp-card">
            <div class="row">
              <span aria-hidden="true">☁️</span>
              <span class="label">${o(this.hass, "outside")}</span>
            </div>
            <div class="value">
              ${u(this.hass, this.outsideTemperature(), 1)} °C
            </div>
          </div>

          <div
            class="card presence-card ${n === "home" ? "" : n === "away" ? "away" : "unknown"}"
          >
            <div class="row">
              <span aria-hidden="true">👤</span>
              <span class="label">${o(this.hass, "presence")}</span>
            </div>
            <div class="big">
              ${Y(this.hass, n)}
            </div>
          </div>

          <!-- Row 2 -->
          <div class="card">
            <div class="device-head">
              <span aria-hidden="true">❄️</span>
              <div>
                <strong>${o(this.hass, "heatpump")}</strong>
                <span class="sub ${i ? "" : "off"}">
                  ${i ? o(this.hass, "heating") : o(this.hass, "idle")}
                </span>
              </div>
            </div>
            <div class="value small">
              ${u(this.hass, e?.heatpump_target, 1)} °C
              <span class="muted">(${o(this.hass, "target")})</span>
            </div>
            <div class="spread" style="margin-top:8px">
              <span class="muted">${o(this.hass, "powerNow")}</span>
              <strong
                >${t.heatpump?.power_w != null ? `${u(this.hass, t.heatpump.power_w, 0)} W` : "–"}</strong
              >
            </div>
          </div>

          <div class="card">
            <div class="device-head">
              <span aria-hidden="true">♨️</span>
              <div>
                <strong>${o(this.hass, "radiator")}</strong>
                <span class="sub ${a ? "" : "off"}">
                  ${a ? o(this.hass, "heating") : o(this.hass, "idle")}
                </span>
              </div>
            </div>
            <div class="spread" style="margin-top:10px">
              <span class="muted">${o(this.hass, "powerNow")}</span>
              <strong
                >${t.radiator?.power_w != null ? `${u(this.hass, t.radiator.power_w, 0)} W` : "–"}</strong
              >
            </div>
            <div class="spread" style="margin-top:6px">
              <span class="muted">${o(this.hass, "todayShort")}</span>
              <strong>${u(this.hass, t.radiator?.kwh_today, 2)} kWh</strong>
            </div>
            <button style="margin-top:12px;width:100%" @click=${this.toggleRadiator}>
              ${a ? "Slå AV" : "Slå PÅ"} (30 min)
            </button>
          </div>

          <div class="card span2">
            <h3>${o(this.hass, "mode")}</h3>
            <div class="mode-grid">
              ${xt.map(
      (g) => h`
                  <button
                    class=${r === g.id ? "active" : ""}
                    @click=${() => this.selectMode(g.id)}
                  >
                    <svg viewBox="0 0 24 24"><path d=${g.icon} /></svg>
                    ${o(this.hass, g.key)}
                  </button>
                `
    )}
            </div>
            <div class="status-note">
              <span aria-hidden="true">✓</span>
              <div>
                <strong>${De(this.hass, t.effective_mode)}</strong>
                ${oe(this.hass, t.reason)}
              </div>
            </div>
          </div>

          <!-- Row 3 -->
          <div class="card span2">
            <div class="spread">
              <h3>${o(this.hass, "energy")}</h3>
              <div class="row">
                ${[7, 30].map(
      (g) => h`
                    <button
                      class=${this.chartDays === g ? "active" : ""}
                      @click=${() => {
        this.chartDays = g;
      }}
                    >
                      ${g} ${"dgr"}
                    </button>
                  `
    )}
              </div>
            </div>
            <shc-energy-chart
              .hass=${this.hass}
              .heatpump=${y?.heatpump ?? []}
              .radiator=${y?.radiator ?? []}
              .outside=${this.outside}
              .days=${this.chartDays}
            ></shc-energy-chart>
          </div>

          <div class="card span2">
            <h3>${o(this.hass, "cost")}</h3>
            <div class="cost-grid">
              ${[
      { label: o(this.hass, "today"), total: d.total, cost: v },
      { label: o(this.hass, "week"), total: l.total, cost: m },
      { label: o(this.hass, "month"), total: f.total, cost: $ }
    ].map(
      (g) => h`
                  <div class="cost-cell">
                    <small class="label">${g.label}</small>
                    <div class="kwh">
                      ${g.total ? u(this.hass, g.total.kwh, 2) : "–"} kWh
                    </div>
                    <div class="sek">
                      ≈ ${dt(this.hass, g.cost)}
                      ${t.price?.includes_fees ? p : h`<span class="quality estimated"
                              >${o(this.hass, "estimated")}</span
                            >`}
                    </div>
                  </div>
                `
    )}
            </div>

            <div class="card" style="margin-top:12px;padding:12px 14px;border-radius:12px">
              <div class="spread">
                <h3>🌿 ${o(this.hass, "savings")}</h3>
              </div>
              ${c?.has_result ? h`
                    <div class="savings-box">
                      <div class="cell">
                        <small>${o(this.hass, "before")}</small>
                        <b>${u(this.hass, c.baseline_kwh_per_day, 1)}</b>
                        <span class="muted">${o(this.hass, "perDay")}</span>
                      </div>
                      <div class="cell">
                        <small>${o(this.hass, "after")}</small>
                        <b>${u(this.hass, c.comparison_kwh_per_day, 1)}</b>
                        <span class="muted">${o(this.hass, "perDay")}</span>
                      </div>
                      <div class="delta ${c.is_increase ? "increase" : ""}">
                        ${c.delta_kwh_per_day != null ? `${c.delta_kwh_per_day < 0 ? "+" : "−"}${u(
      this.hass,
      Math.abs(c.delta_kwh_per_day),
      1
    )}` : "–"}
                        <div class="muted" style="color:inherit">
                          ${c.percent != null ? `${u(this.hass, Math.abs(c.percent), 0)} %` : ""}
                        </div>
                      </div>
                    </div>
                  ` : h`<p class="empty">${o(this.hass, "noBaseline")}</p>`}
              ${t.savings_warning ? h`<p class="muted" style="margin:8px 0 0">
                    ${t.savings_warning}
                  </p>` : p}
              ${c && c.baseline_quality !== "measured" ? h`<p class="muted" style="margin:8px 0 0">
                    Datatäckning: ${c.baseline_quality} / ${c.comparison_quality}
                  </p>` : p}
            </div>
          </div>

          <!-- Row 4 -->
          <div class="card span2">
            <h3>${o(this.hass, "quick")}</h3>
            ${this.quickRow(
      "home_target",
      o(this.hass, "roomTarget"),
      e?.home_target
    )}
            ${this.quickRow(
      "away_target",
      o(this.hass, "awayTarget"),
      e?.away_target
    )}
            ${this.quickRow(
      "radiator_on_below",
      o(this.hass, "onBelow"),
      e?.radiator_on_below
    )}
            ${this.quickRow(
      "radiator_off_above",
      o(this.hass, "offAbove"),
      e?.radiator_off_above
    )}
          </div>

          <div class="card span2">
            <h3>${o(this.hass, "baseline")}</h3>
            ${this.renderBaseline()}
          </div>

          <!-- Row 5 -->
          <div class="card span2">
            <h3>${o(this.hass, "systemStatus")}</h3>
            <div class="status-list">
              ${this.statusRow("heatpump_available", "Mitsubishi (HVAC)")}
              ${this.statusRow("radiator_available", "Shelly (element)")}
              ${this.statusRow("temperature_stale", o(this.hass, "room"), !0)}
              ${this.statusRow("presence", o(this.hass, "presence"))}
            </div>
            <p class="muted" style="margin:12px 0 0">
              ${o(this.hass, "updated")}: ${Te(this.hass, t.last_updated)}
            </p>
          </div>

          <div class="card span2">
            <h3>${o(this.hass, "presence")}</h3>
            <div class="status-list">
              ${(t.actuators?.presence_entities ?? []).map(
      (g) => h`
                  <div class="status-row">
                    <span>${g}</span>
                    <span class=${this.hass?.states[g]?.state === "home" ? "ok" : "bad"}>
                      ${this.hass?.states[g]?.state ?? "–"}
                    </span>
                  </div>
                `
    )}
              ${(t.actuators?.presence_entities ?? []).length === 0 ? h`<p class="empty">${o(this.hass, "noData")}</p>` : p}
            </div>
            <div class="row" style="margin-top:12px">
              <button @click=${() => this.pressButton("start_baseline")}>
                ${o(this.hass, "startBaseline")}
              </button>
              <button @click=${() => this.pressButton("stop_baseline")}>
                ${o(this.hass, "stopBaseline")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <shc-settings-drawer
        .hass=${this.hass}
        .zone=${t}
        .open=${this.drawerOpen}
        @shc-close=${() => {
      this.drawerOpen = !1;
    }}
        @shc-refresh=${() => {
      this.refresh(!0);
    }}
        @shc-open-options=${this.openOptions}
      ></shc-settings-drawer>
    `;
  }
  renderBaseline() {
    const t = this.zone?.savings, e = this.zone?.baseline, s = Math.max(
      t?.baseline_kwh_per_day ?? 0,
      t?.comparison_kwh_per_day ?? 0,
      1e-3
    );
    if (!t?.has_result)
      return h`
        <p class="empty">${o(this.hass, "noBaseline")}</p>
        <p class="muted">${o(this.hass, "baselineHint")}</p>
        <div class="row">
          <button @click=${() => this.pressButton("start_baseline")}>
            ${o(this.hass, "startBaseline")}
          </button>
          ${e?.active ? h`<button @click=${() => this.pressButton("stop_baseline")}>
                ${o(this.hass, "stopBaseline")}
              </button>` : p}
        </div>
      `;
    const i = t.baseline_kwh_per_day ?? 0, a = t.comparison_kwh_per_day ?? 0;
    return h`
      <div class="bars">
        <div class="bar before" style="height: ${i / s * 100}%">
          ${u(this.hass, i, 1)}
        </div>
        <div class="bar after" style="height: ${a / s * 100}%">
          ${u(this.hass, a, 1)}
        </div>
      </div>
      <div class="bar-caption">
        <div>
          ${o(this.hass, "before")}<br />(${t.baseline_days} ${"dygn"})
        </div>
        <div>
          ${o(this.hass, "after")}<br />(${t.comparison_days} ${"dygn"})
        </div>
      </div>
      <ul class="checklist">
        <li class=${t.baseline_quality === "measured" ? "" : "warn"}>
          ${t.baseline_quality === "measured" ? "Verkligen mätta data i baslinjen" : "Baslinjen är ofullständig"}
        </li>
        <li class=${t.comparison_quality === "measured" ? "" : "warn"}>
          ${t.comparison_quality === "measured" ? "Verkligen mätta data i jämförelsen" : "Jämförelsen är ofullständig"}
        </li>
        <li class=${t.limited_to_radiator ? "warn" : ""}>
          ${t.limited_to_radiator ? "Endast elementets el mäts" : "Mitsubishi + Shelly mäts"}
        </li>
        <li>
          ${t.baseline_start ?? "–"} → ${t.baseline_end ?? "–"}
        </li>
        <li class=${t.weather_adjustment_available ? "" : "warn"}>
          ${t.weather_adjustment_available ? `Väderkorrigerat: ${u(
      this.hass,
      Math.abs(t.weather_adjusted_percent ?? 0),
      0
    )} % ${(t.weather_adjusted_percent ?? 0) < 0 ? "ökning" : "minskning"} (${u(this.hass, t.baseline_hdd, 0)} → ${u(
      this.hass,
      t.comparison_hdd,
      0
    )} graddygn)` : "Väderkorrigering saknas – utetemperatur behövs"}
        </li>
      </ul>
      ${t.weather_adjustment_available ? h`<p class="muted" style="margin:6px 0 0;font-size:11.5px">
            Graddagsnormaliserat mått (bastemp 17 °C). Tar inte hänsyn till
            solinstrålning, vind, internvärme eller ändrat nyttjande – det är en
            uppskattning, inte ett bevis.
          </p>` : p}
    `;
  }
  quickRow(t, e, s) {
    const i = !this.entity(t);
    return h`
      <div class="quick-row">
        <span class="quick-name">${e}</span>
        <input
          type="range"
          min="5"
          max="30"
          step="0.5"
          .value=${String(s ?? 20)}
          ?disabled=${i}
          @change=${(a) => this.setNumber(t, Number(a.target.value))}
        />
        <output>${u(this.hass, s, 1)} °C</output>
      </div>
    `;
  }
  statusRow(t, e, s = !1) {
    const i = this.stateValue(t), a = s ? i === "off" : i === "on";
    return h`
      <div class="status-row">
        <span>${e}</span>
        <span class=${a ? "ok" : "bad"}>
          ${a ? o(this.hass, "online") : o(this.hass, "offline")}
        </span>
      </div>
    `;
  }
  currentRoomTemperature() {
    const t = this.entity("room_temperature"), e = t ? this.hass?.states[t]?.state : void 0, s = e !== void 0 ? Number(e) : NaN;
    return Number.isFinite(s) ? s : this.zone?.room_temperature ?? null;
  }
  outsideTemperature() {
    const t = this.zone?.actuators?.outside_sensor;
    if (!t)
      return null;
    const e = this.hass?.states[t]?.state, s = e !== void 0 ? Number(e) : NaN;
    return Number.isFinite(s) ? s : null;
  }
  heatpumpHeating() {
    const t = this.zone?.actuators?.climate;
    if (!t)
      return !1;
    const e = this.hass?.states[t]?.state;
    return e !== void 0 && !["off", "unavailable", "unknown"].includes(e);
  }
  radiatorOn() {
    return (this.zone?.actuators?.switches ?? []).some(
      (e) => this.hass?.states[e]?.state === "on"
    );
  }
};
_.styles = [
  je,
  L`
      :host {
        display: block;
        background: var(--shc-bg);
        padding: 16px;
        box-sizing: border-box;
      }

      .shell {
        display: flex;
        flex-direction: column;
        gap: 14px;
        max-width: 1536px;
        margin: 0 auto;
      }

      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 4px 4px 0;
      }

      select {
        font: inherit;
        padding: 6px 10px;
        border-radius: 999px;
        border: 1px solid var(--divider-color, #d5dbe3);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #111);
        cursor: pointer;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 24px;
        font-weight: 700;
        letter-spacing: -0.02em;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
      }

      .span2 {
        grid-column: span 2;
      }

      .zone {
        position: relative;
        padding: 0;
        overflow: hidden;
        min-height: 132px;
        background: linear-gradient(135deg, #1e3a5f, #0f172a);
        color: #fff;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }

      .zone img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0.85;
      }

      .zone .caption {
        position: relative;
        padding: 16px 18px;
        background: linear-gradient(to top, rgb(15 23 42 / 78%), transparent);
      }

      .zone .caption strong {
        display: block;
        font-size: 22px;
        font-weight: 700;
      }

      .temp-card .value {
        margin-top: 6px;
      }

      .presence-card .big {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 22px;
        font-weight: 650;
        color: var(--shc-green);
        margin-top: 6px;
      }

      .presence-card.away .big {
        color: var(--shc-orange);
      }

      .presence-card.unknown .big {
        color: var(--shc-muted);
      }

      .device-head {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 6px;
      }

      .device-head strong {
        font-size: 15px;
        font-weight: 650;
        display: block;
      }

      .device-head .sub {
        font-size: 13px;
        font-weight: 600;
        color: var(--shc-green);
      }

      .device-head .sub.off {
        color: var(--shc-muted);
      }

      .mode-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 8px;
        margin-top: 10px;
      }

      .mode-grid button {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 10px 6px;
        font-size: 12.5px;
        font-weight: 600;
      }

      .mode-grid svg {
        width: 22px;
        height: 22px;
        stroke: currentColor;
        fill: none;
        stroke-width: 1.7;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .status-note {
        margin-top: 12px;
        display: flex;
        gap: 10px;
        align-items: flex-start;
        font-size: 13px;
        color: var(--shc-muted);
      }

      .status-note strong {
        color: var(--shc-text);
        font-size: 14px;
        display: block;
      }

      .cost-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
        margin-top: 12px;
      }

      .cost-cell {
        border: 1px solid var(--shc-border);
        border-radius: 12px;
        padding: 10px 12px;
      }

      .cost-cell .kwh {
        font-size: 20px;
        font-weight: 680;
        font-variant-numeric: tabular-nums;
      }

      .cost-cell .sek {
        font-size: 13px;
        color: var(--shc-muted);
      }

      .savings-box {
        display: grid;
        grid-template-columns: 1fr 1fr auto;
        gap: 12px;
        align-items: center;
        margin-top: 10px;
      }

      .savings-box .cell {
        text-align: left;
      }

      .savings-box .cell small {
        display: block;
        color: var(--shc-muted);
        font-size: 12px;
        margin-bottom: 2px;
      }

      .savings-box .cell b {
        font-size: 20px;
        font-variant-numeric: tabular-nums;
      }

      .delta {
        background: var(--shc-green-soft);
        border-radius: 12px;
        padding: 8px 14px;
        text-align: center;
        color: var(--shc-green);
        font-weight: 700;
      }

      .delta.increase {
        background: color-mix(in srgb, var(--shc-red) 10%, transparent);
        color: var(--shc-red);
      }

      .quick-row {
        display: grid;
        grid-template-columns: minmax(120px, 200px) 1fr 62px;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
      }

      .quick-row input[type="range"] {
        width: 100%;
        accent-color: var(--shc-blue);
      }

      .quick-row output {
        font-variant-numeric: tabular-nums;
        font-weight: 600;
        min-width: 58px;
        text-align: right;
      }

      .quick-name {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
      }

      .bars {
        display: flex;
        align-items: flex-end;
        gap: 26px;
        height: 132px;
        margin: 14px 0 8px;
      }

      .bar {
        flex: 1;
        border-radius: 8px 8px 4px 4px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        color: #fff;
        font-weight: 700;
        font-size: 15px;
        padding-bottom: 8px;
        position: relative;
      }

      .bar.before {
        background: #cbd5e1;
        color: var(--shc-text);
      }

      .bar.after {
        background: var(--shc-green);
      }

      .bar-caption {
        display: flex;
        gap: 26px;
        font-size: 12.5px;
        color: var(--shc-muted);
      }

      .bar-caption div {
        flex: 1;
        text-align: center;
      }

      .checklist {
        list-style: none;
        margin: 14px 0 0;
        padding: 0;
        display: grid;
        gap: 8px;
      }

      .checklist li {
        display: flex;
        gap: 8px;
        align-items: flex-start;
        font-size: 13px;
        color: var(--shc-muted);
      }

      .checklist li::before {
        content: "✓";
        color: var(--shc-green);
        font-weight: 700;
      }

      .checklist li.warn::before {
        content: "!";
        color: var(--shc-orange);
      }

      .status-list {
        display: grid;
        gap: 8px;
        margin-top: 10px;
      }

      .status-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
      }

      .status-row .ok {
        color: var(--shc-green);
        font-weight: 600;
      }

      .status-row .bad {
        color: var(--shc-red);
        font-weight: 600;
      }

      .banner {
        border-radius: 12px;
        padding: 10px 14px;
        font-size: 13px;
        background: color-mix(in srgb, var(--shc-orange) 14%, transparent);
        color: #92400e;
      }

      @media (max-width: 1100px) {
        .grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .span2 {
          grid-column: span 2;
        }
      }

      @media (max-width: 720px) {
        :host {
          padding: 10px;
        }
        .grid {
          grid-template-columns: minmax(0, 1fr);
        }
        .span2 {
          grid-column: span 1;
        }
        .mode-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .cost-grid {
          grid-template-columns: minmax(0, 1fr);
        }
        .savings-box {
          grid-template-columns: 1fr;
        }
        .brand {
          font-size: 18px;
        }
      }
    `
];
k([
  x({ attribute: !1 })
], _.prototype, "hass", 2);
k([
  w()
], _.prototype, "config", 2);
k([
  w()
], _.prototype, "zone", 2);
k([
  w()
], _.prototype, "zones", 2);
k([
  w()
], _.prototype, "selectedZoneId", 2);
k([
  w()
], _.prototype, "outside", 2);
k([
  w()
], _.prototype, "drawerOpen", 2);
k([
  w()
], _.prototype, "chartDays", 2);
k([
  w()
], _.prototype, "error", 2);
k([
  w()
], _.prototype, "pending", 2);
_ = k([
  te("smart-heat-dashboard")
], _);
var wt = Object.defineProperty, kt = Object.getOwnPropertyDescriptor, me = (t, e, s, i) => {
  for (var a = i > 1 ? void 0 : i ? kt(e, s) : e, r = t.length - 1, n; r >= 0; r--)
    (n = t[r]) && (a = (i ? n(e, s, a) : n(a)) || a);
  return i && a && wt(e, s, a), a;
};
let q = class extends z {
  constructor() {
    super(...arguments), this.narrow = !1;
  }
  render() {
    return h`<smart-heat-dashboard .hass=${this.hass}></smart-heat-dashboard>`;
  }
};
q.styles = L`
    :host {
      display: block;
      height: 100%;
      overflow: auto;
      background: var(--primary-background-color, #f5f8fc);
      box-sizing: border-box;
    }
    smart-heat-dashboard {
      min-height: 100%;
    }
  `;
me([
  x({ attribute: !1 })
], q.prototype, "hass", 2);
me([
  x({ type: Boolean })
], q.prototype, "narrow", 2);
q = me([
  te("smart-heat-panel")
], q);
window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "smart-heat-dashboard",
  name: "Smart Heat Controller",
  description: "Heating overview, energy, savings and settings for Smart Heat Controller.",
  preview: !1,
  documentationURL: "https://github.com/nikeng-forenade/smart-heat-controller"
});
export {
  _ as SmartHeatDashboard
};
