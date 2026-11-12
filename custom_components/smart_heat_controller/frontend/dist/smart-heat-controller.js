/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const X = globalThis, ge = X.ShadowRoot && (X.ShadyCSS === void 0 || X.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, fe = Symbol(), we = /* @__PURE__ */ new WeakMap();
let Be = class {
  constructor(e, s, a) {
    if (this._$cssResult$ = !0, a !== fe) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (ge && e === void 0) {
      const a = s !== void 0 && s.length === 1;
      a && (e = we.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), a && we.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const qe = (t) => new Be(typeof t == "string" ? t : t + "", void 0, fe), G = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((a, i, n) => a + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + t[n + 1], t[0]);
  return new Be(s, t, fe);
}, Ke = (t, e) => {
  if (ge) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const a = document.createElement("style"), i = X.litNonce;
    i !== void 0 && a.setAttribute("nonce", i), a.textContent = s.cssText, t.appendChild(a);
  }
}, xe = ge ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const a of e.cssRules) s += a.cssText;
  return qe(s);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Ze, defineProperty: Ge, getOwnPropertyDescriptor: Ye, getOwnPropertyNames: Je, getOwnPropertySymbols: Qe, getPrototypeOf: Xe } = Object, ie = globalThis, ke = ie.trustedTypes, et = ke ? ke.emptyScript : "", tt = ie.reactiveElementPolyfillSupport, L = (t, e) => t, se = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? et : null;
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
} }, ve = (t, e) => !Ze(t, e), Se = { attribute: !0, type: String, converter: se, reflect: !1, useDefault: !1, hasChanged: ve };
Symbol.metadata ??= Symbol("metadata"), ie.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let D = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = Se) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const a = Symbol(), i = this.getPropertyDescriptor(e, a, s);
      i !== void 0 && Ge(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, s, a) {
    const { get: i, set: n } = Ye(this.prototype, e) ?? { get() {
      return this[s];
    }, set(o) {
      this[s] = o;
    } };
    return { get: i, set(o) {
      const d = i?.call(this);
      n?.call(this, o), this.requestUpdate(e, d, a);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? Se;
  }
  static _$Ei() {
    if (this.hasOwnProperty(L("elementProperties"))) return;
    const e = Xe(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(L("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(L("properties"))) {
      const s = this.properties, a = [...Je(s), ...Qe(s)];
      for (const i of a) this.createProperty(i, s[i]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const s = litPropertyMetadata.get(e);
      if (s !== void 0) for (const [a, i] of s) this.elementProperties.set(a, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, a] of this.elementProperties) {
      const i = this._$Eu(s, a);
      i !== void 0 && this._$Eh.set(i, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const s = [];
    if (Array.isArray(e)) {
      const a = new Set(e.flat(1 / 0).reverse());
      for (const i of a) s.unshift(xe(i));
    } else e !== void 0 && s.push(xe(e));
    return s;
  }
  static _$Eu(e, s) {
    const a = s.attribute;
    return a === !1 ? void 0 : typeof a == "string" ? a : typeof e == "string" ? e.toLowerCase() : void 0;
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
    for (const a of s.keys()) this.hasOwnProperty(a) && (e.set(a, this[a]), delete this[a]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Ke(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, s, a) {
    this._$AK(e, a);
  }
  _$ET(e, s) {
    const a = this.constructor.elementProperties.get(e), i = this.constructor._$Eu(e, a);
    if (i !== void 0 && a.reflect === !0) {
      const n = (a.converter?.toAttribute !== void 0 ? a.converter : se).toAttribute(s, a.type);
      this._$Em = e, n == null ? this.removeAttribute(i) : this.setAttribute(i, n), this._$Em = null;
    }
  }
  _$AK(e, s) {
    const a = this.constructor, i = a._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const n = a.getPropertyOptions(i), o = typeof n.converter == "function" ? { fromAttribute: n.converter } : n.converter?.fromAttribute !== void 0 ? n.converter : se;
      this._$Em = i;
      const d = o.fromAttribute(s, n.type);
      this[i] = d ?? this._$Ej?.get(i) ?? d, this._$Em = null;
    }
  }
  requestUpdate(e, s, a, i = !1, n) {
    if (e !== void 0) {
      const o = this.constructor;
      if (i === !1 && (n = this[e]), a ??= o.getPropertyOptions(e), !((a.hasChanged ?? ve)(n, s) || a.useDefault && a.reflect && n === this._$Ej?.get(e) && !this.hasAttribute(o._$Eu(e, a)))) return;
      this.C(e, s, a);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, s, { useDefault: a, reflect: i, wrapped: n }, o) {
    a && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, o ?? s ?? this[e]), n !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || a || (s = void 0), this._$AL.set(e, s)), i === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
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
        for (const [i, n] of this._$Ep) this[i] = n;
        this._$Ep = void 0;
      }
      const a = this.constructor.elementProperties;
      if (a.size > 0) for (const [i, n] of a) {
        const { wrapped: o } = n, d = this[i];
        o !== !0 || this._$AL.has(i) || d === void 0 || this.C(i, void 0, n, d);
      }
    }
    let e = !1;
    const s = this._$AL;
    try {
      e = this.shouldUpdate(s), e ? (this.willUpdate(s), this._$EO?.forEach((a) => a.hostUpdate?.()), this.update(s)) : this._$EM();
    } catch (a) {
      throw e = !1, this._$EM(), a;
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
D.elementStyles = [], D.shadowRootOptions = { mode: "open" }, D[L("elementProperties")] = /* @__PURE__ */ new Map(), D[L("finalized")] = /* @__PURE__ */ new Map(), tt?.({ ReactiveElement: D }), (ie.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const be = globalThis, Ae = (t) => t, ae = be.trustedTypes, ze = ae ? ae.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, Re = "$lit$", M = `lit$${Math.random().toFixed(9).slice(2)}$`, De = "?" + M, st = `<${De}>`, B = document, q = () => B.createComment(""), K = (t) => t === null || typeof t != "object" && typeof t != "function", ye = Array.isArray, at = (t) => ye(t) || typeof t?.[Symbol.iterator] == "function", pe = `[ 	
\f\r]`, W = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ee = /-->/g, He = />/g, O = RegExp(`>|${pe}(?:([^\\s"'>=/]+)(${pe}*=${pe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Me = /'/g, Ce = /"/g, je = /^(?:script|style|textarea|title)$/i, Ie = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), l = Ie(1), H = Ie(2), j = Symbol.for("lit-noChange"), p = Symbol.for("lit-nothing"), Te = /* @__PURE__ */ new WeakMap(), P = B.createTreeWalker(B, 129);
function Fe(t, e) {
  if (!ye(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ze !== void 0 ? ze.createHTML(e) : e;
}
const it = (t, e) => {
  const s = t.length - 1, a = [];
  let i, n = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = W;
  for (let d = 0; d < s; d++) {
    const h = t[d];
    let u, f, c = -1, y = 0;
    for (; y < h.length && (o.lastIndex = y, f = o.exec(h), f !== null); ) y = o.lastIndex, o === W ? f[1] === "!--" ? o = Ee : f[1] !== void 0 ? o = He : f[2] !== void 0 ? (je.test(f[2]) && (i = RegExp("</" + f[2], "g")), o = O) : f[3] !== void 0 && (o = O) : o === O ? f[0] === ">" ? (o = i ?? W, c = -1) : f[1] === void 0 ? c = -2 : (c = o.lastIndex - f[2].length, u = f[1], o = f[3] === void 0 ? O : f[3] === '"' ? Ce : Me) : o === Ce || o === Me ? o = O : o === Ee || o === He ? o = W : (o = O, i = void 0);
    const g = o === O && t[d + 1].startsWith("/>") ? " " : "";
    n += o === W ? h + st : c >= 0 ? (a.push(u), h.slice(0, c) + Re + h.slice(c) + M + g) : h + M + (c === -2 ? d : g);
  }
  return [Fe(t, n + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), a];
};
class Z {
  constructor({ strings: e, _$litType$: s }, a) {
    let i;
    this.parts = [];
    let n = 0, o = 0;
    const d = e.length - 1, h = this.parts, [u, f] = it(e, s);
    if (this.el = Z.createElement(u, a), P.currentNode = this.el.content, s === 2 || s === 3) {
      const c = this.el.content.firstChild;
      c.replaceWith(...c.childNodes);
    }
    for (; (i = P.nextNode()) !== null && h.length < d; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const c of i.getAttributeNames()) if (c.endsWith(Re)) {
          const y = f[o++], g = i.getAttribute(c).split(M), z = /([.?@])?(.*)/.exec(y);
          h.push({ type: 1, index: n, name: z[2], strings: g, ctor: z[1] === "." ? rt : z[1] === "?" ? ot : z[1] === "@" ? lt : ne }), i.removeAttribute(c);
        } else c.startsWith(M) && (h.push({ type: 6, index: n }), i.removeAttribute(c));
        if (je.test(i.tagName)) {
          const c = i.textContent.split(M), y = c.length - 1;
          if (y > 0) {
            i.textContent = ae ? ae.emptyScript : "";
            for (let g = 0; g < y; g++) i.append(c[g], q()), P.nextNode(), h.push({ type: 2, index: ++n });
            i.append(c[y], q());
          }
        }
      } else if (i.nodeType === 8) if (i.data === De) h.push({ type: 2, index: n });
      else {
        let c = -1;
        for (; (c = i.data.indexOf(M, c + 1)) !== -1; ) h.push({ type: 7, index: n }), c += M.length - 1;
      }
      n++;
    }
  }
  static createElement(e, s) {
    const a = B.createElement("template");
    return a.innerHTML = e, a;
  }
}
function I(t, e, s = t, a) {
  if (e === j) return e;
  let i = a !== void 0 ? s._$Co?.[a] : s._$Cl;
  const n = K(e) ? void 0 : e._$litDirective$;
  return i?.constructor !== n && (i?._$AO?.(!1), n === void 0 ? i = void 0 : (i = new n(t), i._$AT(t, s, a)), a !== void 0 ? (s._$Co ??= [])[a] = i : s._$Cl = i), i !== void 0 && (e = I(t, i._$AS(t, e.values), i, a)), e;
}
class nt {
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
    const { el: { content: s }, parts: a } = this._$AD, i = (e?.creationScope ?? B).importNode(s, !0);
    P.currentNode = i;
    let n = P.nextNode(), o = 0, d = 0, h = a[0];
    for (; h !== void 0; ) {
      if (o === h.index) {
        let u;
        h.type === 2 ? u = new Y(n, n.nextSibling, this, e) : h.type === 1 ? u = new h.ctor(n, h.name, h.strings, this, e) : h.type === 6 && (u = new ht(n, this, e)), this._$AV.push(u), h = a[++d];
      }
      o !== h?.index && (n = P.nextNode(), o++);
    }
    return P.currentNode = B, i;
  }
  p(e) {
    let s = 0;
    for (const a of this._$AV) a !== void 0 && (a.strings !== void 0 ? (a._$AI(e, a, s), s += a.strings.length - 2) : a._$AI(e[s])), s++;
  }
}
class Y {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, s, a, i) {
    this.type = 2, this._$AH = p, this._$AN = void 0, this._$AA = e, this._$AB = s, this._$AM = a, this.options = i, this._$Cv = i?.isConnected ?? !0;
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
    e = I(this, e, s), K(e) ? e === p || e == null || e === "" ? (this._$AH !== p && this._$AR(), this._$AH = p) : e !== this._$AH && e !== j && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : at(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== p && K(this._$AH) ? this._$AA.nextSibling.data = e : this.T(B.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: s, _$litType$: a } = e, i = typeof a == "number" ? this._$AC(e) : (a.el === void 0 && (a.el = Z.createElement(Fe(a.h, a.h[0]), this.options)), a);
    if (this._$AH?._$AD === i) this._$AH.p(s);
    else {
      const n = new nt(i, this), o = n.u(this.options);
      n.p(s), this.T(o), this._$AH = n;
    }
  }
  _$AC(e) {
    let s = Te.get(e.strings);
    return s === void 0 && Te.set(e.strings, s = new Z(e)), s;
  }
  k(e) {
    ye(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let a, i = 0;
    for (const n of e) i === s.length ? s.push(a = new Y(this.O(q()), this.O(q()), this, this.options)) : a = s[i], a._$AI(n), i++;
    i < s.length && (this._$AR(a && a._$AB.nextSibling, i), s.length = i);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); e !== this._$AB; ) {
      const a = Ae(e).nextSibling;
      Ae(e).remove(), e = a;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
let ne = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, s, a, i, n) {
    this.type = 1, this._$AH = p, this._$AN = void 0, this.element = e, this.name = s, this._$AM = i, this.options = n, a.length > 2 || a[0] !== "" || a[1] !== "" ? (this._$AH = Array(a.length - 1).fill(new String()), this.strings = a) : this._$AH = p;
  }
  _$AI(e, s = this, a, i) {
    const n = this.strings;
    let o = !1;
    if (n === void 0) e = I(this, e, s, 0), o = !K(e) || e !== this._$AH && e !== j, o && (this._$AH = e);
    else {
      const d = e;
      let h, u;
      for (e = n[0], h = 0; h < n.length - 1; h++) u = I(this, d[a + h], s, h), u === j && (u = this._$AH[h]), o ||= !K(u) || u !== this._$AH[h], u === p ? e = p : e !== p && (e += (u ?? "") + n[h + 1]), this._$AH[h] = u;
    }
    o && !i && this.j(e);
  }
  j(e) {
    e === p ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
};
class rt extends ne {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === p ? void 0 : e;
  }
}
class ot extends ne {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== p);
  }
}
class lt extends ne {
  constructor(e, s, a, i, n) {
    super(e, s, a, i, n), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = I(this, e, s, 0) ?? p) === j) return;
    const a = this._$AH, i = e === p && a !== p || e.capture !== a.capture || e.once !== a.once || e.passive !== a.passive, n = e !== p && (a === p || i);
    i && this.element.removeEventListener(this.name, this, a), n && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class ht {
  constructor(e, s, a) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = a;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    I(this, e);
  }
}
const dt = be.litHtmlPolyfillSupport;
dt?.(Z, Y), (be.litHtmlVersions ??= []).push("3.3.3");
const ct = (t, e, s) => {
  const a = s?.renderBefore ?? e;
  let i = a._$litPart$;
  if (i === void 0) {
    const n = s?.renderBefore ?? null;
    a._$litPart$ = i = new Y(e.insertBefore(q(), n), n, void 0, s ?? {});
  }
  return i._$AI(t), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $e = globalThis;
class C extends D {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ct(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return j;
  }
}
C._$litElement$ = !0, C.finalized = !0, $e.litElementHydrateSupport?.({ LitElement: C });
const pt = $e.litElementPolyfillSupport;
pt?.({ LitElement: C });
($e.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const re = (t) => (e, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ut = { attribute: !0, type: String, converter: se, reflect: !1, hasChanged: ve }, mt = (t = ut, e, s) => {
  const { kind: a, metadata: i } = s;
  let n = globalThis.litPropertyMetadata.get(i);
  if (n === void 0 && globalThis.litPropertyMetadata.set(i, n = /* @__PURE__ */ new Map()), a === "setter" && ((t = Object.create(t)).wrapped = !0), n.set(s.name, t), a === "accessor") {
    const { name: o } = s;
    return { set(d) {
      const h = e.get.call(this);
      e.set.call(this, d), this.requestUpdate(o, h, t, !0, d);
    }, init(d) {
      return d !== void 0 && this.C(o, void 0, t, d), d;
    } };
  }
  if (a === "setter") {
    const { name: o } = s;
    return function(d) {
      const h = this[o];
      e.call(this, d), this.requestUpdate(o, h, t, !0, d);
    };
  }
  throw Error("Unsupported decorator location: " + a);
};
function _(t) {
  return (e, s) => typeof s == "object" ? mt(t, e, s) : ((a, i, n) => {
    const o = i.hasOwnProperty(n);
    return i.constructor.createProperty(n, a), o ? Object.getOwnPropertyDescriptor(i, n) : void 0;
  })(t, e, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function x(t) {
  return _({ ...t, state: !0, attribute: !1 });
}
function J(t) {
  return (t?.locale?.language ?? t?.language ?? "sv").toLowerCase().startsWith("en") ? "en" : "sv";
}
const gt = {
  sv: {
    auto: "Auto",
    home: "Hemma",
    away: "Borta",
    boost: "Boost",
    mode: "Driftläge",
    settings: "Inställningar",
    room: "Rumstemperatur",
    outside: "Utetemperatur",
    outsideMissing: "Ingen utetemperatursensor vald – använd pumpens utegivare, en vädersensor eller välj sensor i inställningarna.",
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
    fan: "Fläkt",
    powerApprox: "≈ snitt senaste 30 min (från energimätaren)",
    powerNominal: "≈ uppskattat från märkeffekten",
    awayBoost: "Boost när ingen är hemma",
    awayBoostHint: "När ingen är hemma och rummet blir kallt värmer pumpen för fullt upp till stopptemperaturen och går sedan tillbaka till låg fläkt. Elementet hålls av – pumpen ger ungefär tre gånger mer värme per kWh.",
    awayBoostStart: "Starta boost under",
    awayBoostStop: "Sluta boosta vid",
    awayBoostFan: "Fläkt under boost",
    awayIdleFan: "Fläkt efter boost",
    awayBoostActive: "Boostar",
    awayBoostIdle: "Låg fläkt",
    awayBoostStopError: "Stopptemperaturen måste vara högre än starttemperaturen.",
    awayBoostSafety: "Starttemperaturen ligger vid eller under säkerhetsgränsen – då hinner elementet slå på först.",
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
    version: "Version",
    close: "Stäng",
    roomTarget: "Mål hemma",
    awayTarget: "Mål borta",
    awayHvac: "Värmepumpen när ingen är hemma",
    awayHvacHint: "Bara driftläget ändras – börvärdet styrs som vanligt. Välj Behåll för att lämna pumpen precis som den är.",
    awayHvacKeep: "Behåll som den är",
    awayHvacHeat: "Slå på värme",
    awayHvacFan: "Endast fläkt",
    awayHvacOff: "Stäng av",
    onBelow: "Element PÅ under",
    offAbove: "Element AV över",
    save: "Spara",
    confirm: "Bekräfta",
    cancel: "Avbryt",
    manualOverride: "Manuell överstyrning i 30 minuter",
    noEntities: "Integationen är inte konfigurerad.",
    demo: "Demodata",
    decrease: "Minska",
    increase: "Öka",
    heatpumpSection: "Värmepump",
    fanSpeed: "Fläkthastighet vid start",
    fanSpeedHint: "Skickas till pumpen när styrenheten sätter på den. Ändrar du fläkten på fjärrkontrollen rör vi den inte igen.",
    fanKeep: "Behåll som den är",
    fanNone: "Pumpen rapporterar inga fläktlägen – styr fläkten på fjärrkontrollen i stället.",
    startTarget: "Starttemperatur",
    startTargetHint: "Börvärdet som skickas i samma stund som pumpen startas. Därefter tar rummets mål över.",
    startTargetAuto: "Inte satt – rummets mål används.",
    startTargetCustom: "Egen starttemperatur används.",
    clear: "Nollställ",
    now: "Nu",
    priceSpot: "Spotpris",
    priceSurcharge: "Nätavgift + energiskatt",
    priceTotal: "Totalt pris",
    inclVat: "inkl. moms",
    priceSourceSensor: "Källa: prissensorn (live).",
    priceSourceAllIn: "Källa: fast all-in-pris från inställningarna.",
    priceSourceNone: "Inget elpris valt – koppla en prissensor under Elpris-optimering.",
    priceHintTotal: "Spot + nätavgift och energiskatt, allt inkl. moms.",
    priceHintSpot: "Spotpriset inkluderar moms men saknar nätavgift och energiskatt – fyll i dem under Elpris-optimering."
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
    outsideMissing: "No outside temperature available – use the unit's own outdoor sensor, a weather entity, or pick a sensor in the settings.",
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
    fan: "Fan",
    powerApprox: "≈ average over the last 30 min (from the energy meter)",
    powerNominal: "≈ estimated from the rated power",
    awayBoost: "Boost while nobody is home",
    awayBoostHint: "When nobody is home and the room gets cold, the pump heats at full speed up to the stop temperature and then drops back to a low fan. The radiator stays off – the pump gives roughly three times more heat per kWh.",
    awayBoostStart: "Start boost below",
    awayBoostStop: "Stop boosting at",
    awayBoostFan: "Fan while boosting",
    awayIdleFan: "Fan after the boost",
    awayBoostActive: "Boosting",
    awayBoostIdle: "Low fan",
    awayBoostStopError: "The stop temperature must be above the start temperature.",
    awayBoostSafety: "The start temperature is at or below the safety limit – the radiator would switch on first.",
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
    version: "Version",
    close: "Close",
    roomTarget: "Home target",
    awayTarget: "Away target",
    awayHvac: "Heat pump when nobody is home",
    awayHvacHint: "Only the HVAC mode changes – the setpoint is still controlled. Pick Leave as it is to keep the unit exactly as it is.",
    awayHvacKeep: "Leave as it is",
    awayHvacHeat: "Switch heating on",
    awayHvacFan: "Fan only",
    awayHvacOff: "Switch off",
    onBelow: "Radiator on below",
    offAbove: "Radiator off above",
    save: "Save",
    confirm: "Confirm",
    cancel: "Cancel",
    manualOverride: "Manual override for 30 minutes",
    noEntities: "The integration is not configured.",
    demo: "Demo data",
    decrease: "Decrease",
    increase: "Increase",
    heatpumpSection: "Heat pump",
    fanSpeed: "Fan speed at start",
    fanSpeedHint: "Sent to the unit when the controller switches it on. If you change the fan on the remote we leave it alone.",
    fanKeep: "Leave as it is",
    fanNone: "The unit reports no fan speeds – use the remote to change the fan.",
    startTarget: "Start temperature",
    startTargetHint: "The setpoint sent at the moment the unit starts. The room target takes over afterwards.",
    startTargetAuto: "Not set – the room target is used.",
    startTargetCustom: "A custom start temperature is used.",
    clear: "Reset",
    now: "Now",
    priceSpot: "Spot price",
    priceSurcharge: "Grid fee + energy tax",
    priceTotal: "Total price",
    inclVat: "incl. VAT",
    priceSourceSensor: "Source: the price sensor (live).",
    priceSourceAllIn: "Source: fixed all-in price from the settings.",
    priceSourceNone: "No electricity price selected – connect a price sensor under Price optimisation.",
    priceHintTotal: "Spot + grid fee and energy tax, all including VAT.",
    priceHintSpot: "The spot price includes VAT but not the grid fee or energy tax – add them under Price optimisation."
  }
};
function r(t, e) {
  return gt[J(t)][e];
}
function oe(t) {
  return J(t) === "en" ? "en-SE" : "sv-SE";
}
function m(t, e, s = 1) {
  return e == null || Number.isNaN(e) ? "–" : new Intl.NumberFormat(oe(t), {
    minimumFractionDigits: s,
    maximumFractionDigits: s
  }).format(e);
}
function ft(t, e) {
  return e == null || Number.isNaN(e) ? "–" : new Intl.NumberFormat(oe(t), {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(e);
}
function Ue(t, e) {
  if (!e)
    return "–";
  const s = new Date(e);
  return Number.isNaN(s.getTime()) ? "–" : new Intl.DateTimeFormat(oe(t), {
    hour: "2-digit",
    minute: "2-digit"
  }).format(s);
}
function Ne(t, e) {
  const s = /* @__PURE__ */ new Date(`${e}T12:00:00`);
  return Number.isNaN(s.getTime()) ? e : new Intl.DateTimeFormat(oe(t), {
    day: "numeric",
    month: "short"
  }).format(s);
}
const vt = {
  auto: { sv: "Auto", en: "Auto" },
  home: { sv: "Hemma", en: "Home" },
  away: { sv: "Borta", en: "Away" },
  comfort: { sv: "Komfort", en: "Comfort" },
  eco: { sv: "Eco", en: "Eco" },
  boost: { sv: "Boost", en: "Boost" },
  manual: { sv: "Manuell", en: "Manual" },
  disabled: { sv: "Avstängd", en: "Disabled" }
};
function We(t, e) {
  if (!e)
    return "–";
  const s = vt[e];
  return s ? J(t) === "en" ? s.en : s.sv : e;
}
const Oe = {
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
function me(t, e) {
  if (!e)
    return "–";
  const s = e.replace(/_(already_in_state|blocked_by_min_runtime)$/, ""), a = Oe[e] ?? Oe[s];
  return a ? J(t) === "en" ? a.en : a.sv : e.replaceAll("_", " ");
}
function ee(t, e) {
  switch (e) {
    case "home":
      return r(t, "home");
    case "away":
      return r(t, "away");
    default:
      return r(t, "unknown");
  }
}
const bt = {
  auto: { sv: "Auto", en: "Auto" },
  quiet: { sv: "Tyst", en: "Quiet" },
  low: { sv: "Låg", en: "Low" },
  medium: { sv: "Medel", en: "Medium" },
  medium_low: { sv: "Medel-låg", en: "Medium low" },
  medium_high: { sv: "Medel-hög", en: "Medium high" },
  high: { sv: "Hög", en: "High" },
  strong: { sv: "Max", en: "Strong" },
  1: { sv: "1", en: "1" },
  2: { sv: "2", en: "2" },
  3: { sv: "3", en: "3" },
  4: { sv: "4", en: "4" },
  5: { sv: "5", en: "5" }
};
function te(t, e) {
  const s = bt[e.toLowerCase()];
  return s ? J(t) === "en" ? s.en : s.sv : e;
}
const Ve = G`
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

  /* Touch friendly − / + control. Range inputs are unreliable in the mobile app,
     so every setting is stepped with real buttons instead. */
  .stepper {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .stepper button {
    width: 44px;
    height: 44px;
    min-width: 44px;
    padding: 0;
    font-size: 21px;
    font-weight: 600;
    line-height: 1;
    border-radius: 12px;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }

  .stepper output {
    min-width: 74px;
    text-align: center;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    font-size: 15px;
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
`, yt = G`
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
var $t = Object.defineProperty, _t = Object.getOwnPropertyDescriptor, N = (t, e, s, a) => {
  for (var i = a > 1 ? void 0 : a ? _t(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (i = (a ? o(e, s, i) : o(i)) || i);
  return a && i && $t(e, s, i), i;
};
const R = 520, ue = 236, b = { top: 14, right: 38, bottom: 30, left: 34 };
function wt(t) {
  const e = String(t.getMonth() + 1).padStart(2, "0"), s = String(t.getDate()).padStart(2, "0");
  return `${t.getFullYear()}-${e}-${s}`;
}
let E = class extends C {
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
      return l`<div class="empty">
        ${this.loading ? "…" : r(this.hass, "noData")}
      </div>`;
    const e = R - b.left - b.right, s = ue - b.top - b.bottom, a = this.maxEnergy(t), i = e / t.length, n = Math.min(30, i * 0.56), o = this.dailyTemps(), d = t.map(($) => o.get($.date)).filter(($) => $ !== void 0), h = d.length ? Math.min(...d) : 0, u = d.length ? Math.max(...d) : 1, f = Math.max(1, u - h), c = ($) => b.top + s - ($ - h) / f * s, y = d.length > 1 ? this.buildTempPath(t, o, c, b.left, i) : null, g = f < 4 ? 1 : 0, z = [0, 0.25, 0.5, 0.75, 1], he = a / (z.length - 1), v = Number.isInteger(he) ? 0 : 1;
    return l`
      <div class="chart-wrap">
        <svg viewBox="0 0 ${R} ${ue}" role="img" aria-label=${r(this.hass, "energy")}>
          ${z.map(($) => {
      const k = b.top + s * $, S = a * (1 - $);
      return H`
              <line class="grid-line" x1=${b.left} y1=${k} x2=${R - b.right} y2=${k} />
              <text class="axis-label" x=${b.left - 6} y=${k + 3} text-anchor="end">
                ${m(this.hass, S, v)}
              </text>
            `;
    })}
          <text class="axis-label" x=${b.left - 6} y=${b.top - 4} text-anchor="end">
            kWh
          </text>
          <text
            class="axis-label"
            x=${R - b.right + 6}
            y=${b.top - 4}
            text-anchor="start"
          >
            °C
          </text>
          ${d.length ? [0.25, 0.75].map(($) => {
      const k = b.top + s * $, S = u - f * $;
      return H`
                  <text class="axis-label" x=${R - b.right + 6} y=${k + 3} text-anchor="start">
                    ${m(this.hass, S, g)}
                  </text>
                `;
    }) : p}

          ${t.map(($, k) => {
      const S = b.left + k * i + i / 2 - n / 2, de = $.heatpump ?? 0, Le = $.radiator ?? 0, Q = de / a * s, ce = Le / a * s, _e = b.top + s;
      return H`
              <g
                @mouseenter=${() => {
        this.hovered = k;
      }}
                @mouseleave=${() => {
        this.hovered = null;
      }}
              >
                <rect
                  x=${S - i * 0.22}
                  y=${b.top}
                  width=${i}
                  height=${s}
                  fill="transparent"
                />
                ${Q > 0 ? H`<rect x=${S} y=${_e - Q} width=${n} height=${Q}
                        rx="4" fill="var(--shc-blue)" opacity="0.92" />` : p}
                ${ce > 0 ? H`<rect x=${S} y=${_e - Q - ce} width=${n}
                        height=${ce} rx="4" fill="var(--shc-orange)" opacity="0.95" />` : p}
                ${$.complete ? p : H`<title>${r(this.hass, "incomplete")}</title>`}
              </g>
              <text
                class="axis-label"
                x=${b.left + k * i + i / 2}
                y=${ue - 10}
                text-anchor="middle"
              >
                ${Ne(this.hass, $.date)}
              </text>
            `;
    })}

          ${y ? H`<path d=${y} fill="none" stroke="var(--shc-violet)"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />` : p}
          ${t.map(($, k) => {
      const S = o.get($.date);
      if (S === void 0)
        return p;
      const de = b.left + k * i + i / 2;
      return H`<circle cx=${de} cy=${c(S)} r="3"
              fill="var(--shc-card)" stroke="var(--shc-violet)" stroke-width="2">
              <title>${m(this.hass, S, g)} °C</title>
            </circle>`;
    })}
        </svg>

        ${this.hovered !== null && t[this.hovered] ? l`<div
                class="tooltip"
                style="left: ${(b.left + this.hovered * i + i / 2) / R * 100}%; top: 0;"
              >
                <strong>${Ne(this.hass, t[this.hovered].date)}</strong
                ><br />
                Mitsubishi: ${m(this.hass, t[this.hovered].heatpump, 2)} kWh<br />
                Gnosjö: ${m(this.hass, t[this.hovered].radiator, 2)} kWh<br />
                ${o.has(t[this.hovered].date) ? `Ute: ${m(this.hass, o.get(t[this.hovered].date), 1)} °C` : ""}
              </div>` : p}
      </div>

      <div class="legend">
        <span><i class="swatch" style="background: var(--shc-blue)"></i>Mitsubishi (kWh)</span>
        <span><i class="swatch" style="background: var(--shc-orange)"></i>Gnosjö (kWh)</span>
        <span><i class="swatch" style="background: var(--shc-violet)"></i
          >${r(this.hass, "outside")} (°C)</span>
      </div>
    `;
  }
  /** Mean outside temperature per local day, keyed like the energy dates. */
  dailyTemps() {
    const t = /* @__PURE__ */ new Map();
    for (const e of this.outside) {
      if (!Number.isFinite(e.t) || !Number.isFinite(e.y))
        continue;
      const s = wt(new Date(e.t)), a = t.get(s) ?? { sum: 0, count: 0 };
      a.sum += e.y, a.count += 1, t.set(s, a);
    }
    return new Map(
      [...t].map(([e, s]) => [e, s.sum / s.count])
    );
  }
  buildTempPath(t, e, s, a, i) {
    const n = [];
    return t.forEach((o, d) => {
      const h = e.get(o.date);
      if (h === void 0)
        return;
      const u = a + d * i + i / 2;
      n.push(`${u.toFixed(1)},${s(h).toFixed(1)}`);
    }), n.map((o, d) => `${d === 0 ? "M" : "L"}${o}`).join(" ");
  }
};
E.styles = [yt];
N([
  _({ attribute: !1 })
], E.prototype, "hass", 2);
N([
  _({ attribute: !1 })
], E.prototype, "heatpump", 2);
N([
  _({ attribute: !1 })
], E.prototype, "radiator", 2);
N([
  _({ attribute: !1 })
], E.prototype, "outside", 2);
N([
  _({ type: Boolean })
], E.prototype, "loading", 2);
N([
  _({ type: Number })
], E.prototype, "days", 2);
N([
  x()
], E.prototype, "hovered", 2);
E = N([
  re("shc-energy-chart")
], E);
function V(t) {
  const { hass: e, value: s, min: a, max: i, step: n, disabled: o = !1 } = t, d = t.unit ?? "°C", h = t.digits ?? (n < 1 ? 1 : 0), u = s ?? a, f = (c) => {
    const y = Math.round(c / n) * n, g = Math.min(i, Math.max(a, y));
    t.onStep(Number(g.toFixed(2)));
  };
  return l`
    <div class="stepper">
      <button
        type="button"
        aria-label=${r(e, "decrease")}
        ?disabled=${o}
        @click=${() => f(u - n)}
      >
        −
      </button>
      <output>${m(e, s, h)}${d ? l` ${d}` : p}</output>
      <button
        type="button"
        aria-label=${r(e, "increase")}
        ?disabled=${o}
        @click=${() => f(u + n)}
      >
        +
      </button>
    </div>
  `;
}
var xt = Object.defineProperty, kt = Object.getOwnPropertyDescriptor, U = (t, e, s, a) => {
  for (var i = a > 1 ? void 0 : a ? kt(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (i = (a ? o(e, s, i) : o(i)) || i);
  return a && i && xt(e, s, i), i;
};
const St = [
  { id: "general", key: "general" },
  { id: "temperatures", key: "temperatures" },
  { id: "heatpump", key: "heatpumpSection" },
  { id: "schedule", key: "schedule" },
  { id: "price", key: "price" },
  { id: "energy", key: "energyMetering" },
  { id: "presence", key: "presence" },
  { id: "advanced", key: "advanced" }
];
let T = class extends C {
  constructor() {
    super(...arguments), this.open = !1, this.section = "general", this.pending = /* @__PURE__ */ new Set();
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
    if (!(!s || !this.hass)) {
      this.pending = new Set(this.pending).add(t);
      try {
        await this.hass.callService("number", "set_value", {
          entity_id: s,
          value: e
        });
      } finally {
        const a = new Set(this.pending);
        a.delete(t), this.pending = a, this.notifyRefresh();
      }
    }
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
  scheduleWithSegment(t, e, s, a = !1) {
    const i = this.currentSchedule(), n = [...i[t]];
    a ? n.splice(e, 1) : e >= n.length ? n.push({ start: "06:00", target: 21, ...s }) : n[e] = { ...n[e], ...s };
    const o = [...n].sort((d, h) => d.start.localeCompare(h.start));
    return { ...i, [t]: o };
  }
  async saveAwayHvacMode(t) {
    !this.hass || !this.zone?.entry_id || (await this.hass.callWS({
      type: "smart_heat_controller/set_away_hvac_mode",
      entry_id: this.zone.entry_id,
      mode: t
    }), this.notifyRefresh());
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
    const a = this.currentSchedule()[t];
    return l`
      <div class="profile">
        <div class="profile-head">
          <strong>${e}</strong>
          <button
            class="link"
            @click=${() => this.saveSchedule(
      this.scheduleWithSegment(t, a.length, {})
    )}
          >
            + Lägg till
          </button>
        </div>
        ${a.length === 0 ? l`<p class="hint">Inga tider – schemat påverkar inte zonen.</p>` : a.map(
      (i, n) => l`
                <div class="segment">
                  <input
                    type="time"
                    .value=${i.start}
                    @change=${(o) => this.saveSchedule(
        this.scheduleWithSegment(t, n, {
          start: o.target.value
        })
      )}
                  />
                  <input
                    type="number"
                    min="5"
                    max="30"
                    step="0.5"
                    .value=${String(i.target)}
                    @change=${(o) => this.saveSchedule(
        this.scheduleWithSegment(t, n, {
          target: Number(o.target.value)
        })
      )}
                  />
                  <span class="hint">°C</span>
                  <button
                    class="link"
                    aria-label="Ta bort"
                    @click=${() => this.saveSchedule(
        this.scheduleWithSegment(t, n, {}, !0)
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
    return l`
      <label class="field">
        <span>Använd veckoschema</span>
        <input
          type="checkbox"
          .checked=${t.enabled}
          @change=${(a) => this.saveSchedule({
      ...t,
      enabled: a.target.checked
    })}
        />
      </label>

      ${t.enabled && s != null ? l`<p class="hint">
            Schemat sätter nu <strong>${m(this.hass, s, 1)} °C</strong>.
            Elementets trösklar följer med automatiskt.
          </p>` : l`<p class="hint">
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
            @change=${(a) => this.saveVacation(
      a.target.value,
      e?.end ?? null
    )}
          />
          <span class="hint">till</span>
          <input
            type="date"
            .value=${e?.end ?? ""}
            @change=${(a) => this.saveVacation(
      e?.start ?? null,
      a.target.value
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
    return l`
      <label class="field">
        <span>Aktivera prisoptimering</span>
        <input
          type="checkbox"
          .checked=${t.enabled}
          @change=${(a) => this.savePrice({
      ...t,
      enabled: a.target.checked
    })}
        />
      </label>

      <div class="field readonly">
        <span>Aktuellt pris</span>
        <strong>
          ${s != null ? `${m(this.hass, s, 2)} SEK/kWh` : "inget pris valt"}
        </strong>
      </div>

      ${this.numberField(
      "Billigt under (SEK/kWh)",
      t.cheap_threshold,
      0,
      10,
      0.05,
      (a) => this.savePrice({ ...t, cheap_threshold: a })
    )}
      ${this.numberField(
      "Dyrt över (SEK/kWh)",
      t.expensive_threshold,
      0,
      10,
      0.05,
      (a) => this.savePrice({ ...t, expensive_threshold: a })
    )}
      ${this.numberField(
      "Max justering (°C)",
      t.max_adjust,
      0,
      3,
      0.5,
      (a) => this.savePrice({ ...t, max_adjust: a ?? t.max_adjust })
    )}
      ${this.numberField(
      "Lägsta komfort (°C)",
      t.min_comfort,
      15,
      25,
      0.5,
      (a) => this.savePrice({ ...t, min_comfort: a ?? t.min_comfort })
    )}

      <p class="hint">
        Vid billigt pris höjs börvärdet högst ${m(this.hass, t.max_adjust, 1)} °C
        och bara när någon är hemma. Vid dyrt pris sänks det, men aldrig under
        ${m(this.hass, t.min_comfort, 1)} °C.
      </p>
      ${e && e.state !== "disabled" ? l`<p class="hint">
            Just nu: ${me(this.hass, e.reason)}
            (${e.offset > 0 ? "+" : ""}${m(this.hass, e.offset, 1)} °C)
          </p>` : p}
    `;
  }
  numberField(t, e, s, a, i, n) {
    return l`
      <label class="field">
        <span>${t}</span>
        <input
          type="number"
          min=${s}
          max=${a}
          step=${i}
          .value=${e == null ? "" : String(e)}
          @change=${(o) => {
      const d = o.target.value;
      n(d === "" ? null : Number(d));
    }}
        />
      </label>
    `;
  }
  render() {
    return this.open ? l`
      <div class="backdrop" @click=${this.close}></div>
      <aside class="drawer" role="dialog" aria-modal="true" aria-label=${r(this.hass, "settings")}>
        <header>
          <h2>${r(this.hass, "settings")} – ${this.zone?.name ?? ""}</h2>
          <button class="icon" aria-label=${r(this.hass, "close")} @click=${this.close}>
            ✕
          </button>
        </header>

        <nav>
          ${St.map(
      (t) => l`
              <button
                class=${this.section === t.id ? "active" : ""}
                @click=${() => {
        this.section = t.id;
      }}
              >
                ${r(this.hass, t.key)}
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
            ${r(this.hass, "options")}
          </button>
        </footer>
      </aside>
    ` : p;
  }
  renderSection() {
    switch (this.section) {
      case "temperatures":
        return this.renderTemperatures();
      case "heatpump":
        return this.renderHeatpump();
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
    return l`
      <label class="field">
        <span>${r(this.hass, "dryRun")}</span>
        <input
          type="checkbox"
          .checked=${e}
          @change=${(s) => this.toggleDryRun(s.target.checked)}
        />
      </label>
      <p class="hint">${e ? r(this.hass, "dryRunOn") : ""}</p>

      <div class="field readonly">
        <span>${r(this.hass, "presence")}</span>
        <strong>${ee(this.hass, this.zone?.presence)}</strong>
      </div>
      <div class="field readonly">
        <span>${r(this.hass, "mode")}</span>
        <strong>${We(this.hass, this.zone?.effective_mode)}</strong>
      </div>
      <div class="field readonly">
        <span>${r(this.hass, "lastDecision")}</span>
        <strong>${me(this.hass, this.zone?.reason)}</strong>
      </div>
      <div class="field readonly">
        <span>${r(this.hass, "version")}</span>
        <strong>${this.zone?.version ?? "–"}</strong>
      </div>
    `;
  }
  renderAwayHvacMode() {
    const t = this.zone?.settings?.away_hvac_mode ?? "keep", e = [
      ["keep", "awayHvacKeep"],
      ["heat", "awayHvacHeat"],
      ["fan_only", "awayHvacFan"],
      ["off", "awayHvacOff"]
    ];
    return l`
      <label class="field">
        <span>${r(this.hass, "awayHvac")}</span>
        <select
          .value=${t}
          @change=${(s) => this.saveAwayHvacMode(s.target.value)}
        >
          ${e.map(
      ([s, a]) => l`<option value=${s} ?selected=${s === t}>
                ${r(this.hass, a)}
              </option>`
    )}
        </select>
      </label>
      <p class="hint">${r(this.hass, "awayHvacHint")}</p>
    `;
  }
  renderTemperatures() {
    const t = this.zone?.settings;
    return l`
      ${this.stepperRow("home_target", r(this.hass, "roomTarget"), t?.home_target, 5, 30, 0.5)}
      ${this.stepperRow("away_target", r(this.hass, "awayTarget"), t?.away_target, 5, 30, 0.5)}
      ${this.renderAwayHvacMode()}
      ${this.stepperRow(
      "radiator_on_below",
      r(this.hass, "onBelow"),
      t?.radiator_on_below,
      5,
      30,
      0.5
    )}
      ${this.stepperRow(
      "radiator_off_above",
      r(this.hass, "offAbove"),
      t?.radiator_off_above,
      5,
      30,
      0.5
    )}
      ${this.stepperRow(
      "min_on_minutes",
      "Minsta ON-tid",
      t?.min_on_minutes,
      0,
      120,
      1,
      "min"
    )}
      ${this.stepperRow(
      "min_off_minutes",
      "Minsta OFF-tid",
      t?.min_off_minutes,
      0,
      120,
      1,
      "min"
    )}
    `;
  }
  renderHeatpump() {
    const t = this.zone?.settings, e = this.zone?.heatpump, s = t?.heatpump_fan_mode ?? "", a = t?.heatpump_start_target ?? null, i = t?.home_target ?? 21, n = (e?.fan_modes ?? []).filter((u) => u), o = e?.fan_mode, d = this.pending.has("heatpump"), h = (u, f) => {
      this.saveHeatpumpProfile(u, f);
    };
    return l`
      <div class="field">
        <span>${r(this.hass, "fanSpeed")}</span>
        <select
          .value=${s}
          @change=${(u) => h(u.target.value || null, a)}
        >
          <option value="" ?selected=${s === ""}>
            ${r(this.hass, "fanKeep")}
          </option>
          ${n.map(
      (u) => l`<option value=${u} ?selected=${u === s}>
                ${te(this.hass, u)}
              </option>`
    )}
        </select>
      </div>
      ${n.length === 0 ? l`<p class="hint">${r(this.hass, "fanNone")}</p>` : p}
      ${o ? l`<p class="hint">${r(this.hass, "now")}: ${te(this.hass, o)}</p>` : p}
      <p class="hint">${r(this.hass, "fanSpeedHint")}</p>

      <div class="field">
        <span>${r(this.hass, "startTarget")}</span>
        ${V({
      hass: this.hass,
      value: a ?? i,
      min: 5,
      max: 30,
      step: 0.5,
      disabled: d,
      onStep: (u) => h(s || null, u)
    })}
      </div>
      <p class="hint">
        ${a == null ? r(this.hass, "startTargetAuto") : r(this.hass, "startTargetCustom")}
        ${a == null ? p : l` <button class="link" @click=${() => h(s || null, null)}>
              ${r(this.hass, "clear")}
            </button>`}
      </p>
      <p class="hint">${r(this.hass, "startTargetHint")}</p>

      ${this.renderAwayBoost()}
    `;
  }
  renderAwayBoost() {
    const t = this.zone?.settings, e = t?.away_boost ?? !1, s = t?.away_boost_start_below ?? 17, a = t?.away_boost_stop_at ?? 18, i = t?.away_boost_fan_mode ?? "auto", n = t?.away_idle_fan_mode ?? "1", o = t?.min_safety_temp ?? null, d = (this.zone?.heatpump?.fan_modes ?? []).filter((c) => c), h = this.pending.has("away_boost"), u = (c) => {
      this.saveAwayBoost({
        enabled: e,
        start_below: s,
        stop_at: a,
        boost_fan_mode: i,
        idle_fan_mode: n,
        ...c
      });
    }, f = (c, y) => l`
      <select
        .value=${c}
        ?disabled=${h}
        @change=${(g) => y(g.target.value)}
      >
        ${(d.includes(c) ? d : [c, ...d]).map(
      (g) => l`<option value=${g} ?selected=${g === c}>
              ${te(this.hass, g)}
            </option>`
    )}
      </select>
    `;
    return l`
      <h4 class="subhead">${r(this.hass, "awayBoost")}</h4>
      <label class="field">
        <span>${r(this.hass, "awayBoost")}</span>
        <input
          type="checkbox"
          .checked=${e}
          ?disabled=${h}
          @change=${(c) => u({ enabled: c.target.checked })}
        />
      </label>
      <p class="hint">${r(this.hass, "awayBoostHint")}</p>
      ${e ? l`
            <div class="field">
              <span>${r(this.hass, "awayBoostStart")}</span>
              ${V({
      hass: this.hass,
      value: s,
      min: 5,
      max: a - 0.5,
      step: 0.5,
      disabled: h,
      onStep: (c) => u({ start_below: c })
    })}
            </div>
            <div class="field">
              <span>${r(this.hass, "awayBoostStop")}</span>
              ${V({
      hass: this.hass,
      value: a,
      min: s + 0.5,
      max: 30,
      step: 0.5,
      disabled: h,
      onStep: (c) => u({ stop_at: c })
    })}
            </div>
            ${o != null && s <= o ? l`<p class="hint warn">${r(this.hass, "awayBoostSafety")}</p>` : p}
            <div class="field">
              <span>${r(this.hass, "awayBoostFan")}</span>
              ${f(i, (c) => u({ boost_fan_mode: c }))}
            </div>
            <div class="field">
              <span>${r(this.hass, "awayIdleFan")}</span>
              ${f(n, (c) => u({ idle_fan_mode: c }))}
            </div>
            ${d.length === 0 ? l`<p class="hint">${r(this.hass, "fanNone")}</p>` : p}
          ` : p}
    `;
  }
  async saveAwayBoost(t) {
    if (!(!this.hass || !this.zone?.entry_id)) {
      this.pending = new Set(this.pending).add("away_boost");
      try {
        await this.hass.callWS({
          type: "smart_heat_controller/set_away_boost",
          entry_id: this.zone.entry_id,
          ...t
        });
      } finally {
        const e = new Set(this.pending);
        e.delete("away_boost"), this.pending = e, this.notifyRefresh();
      }
    }
  }
  async saveHeatpumpProfile(t, e) {
    if (!(!this.hass || !this.zone?.entry_id)) {
      this.pending = new Set(this.pending).add("heatpump");
      try {
        await this.hass.callWS({
          type: "smart_heat_controller/set_heatpump_profile",
          entry_id: this.zone.entry_id,
          fan_mode: t,
          start_target: e
        });
      } finally {
        const s = new Set(this.pending);
        s.delete("heatpump"), this.pending = s, this.notifyRefresh();
      }
    }
  }
  renderEnergy() {
    const t = this.zone?.radiator, e = this.zone?.heatpump, s = this.zone?.price;
    return l`
      <div class="field readonly">
        <span>${r(this.hass, "radiator")}</span>
        <strong>${m(this.hass, t?.power_w, 0)} W</strong>
      </div>
      <div class="field readonly">
        <span>${r(this.hass, "heatpump")}</span>
        <strong>${m(this.hass, e?.power_w, 0)} W</strong>
      </div>
      <div class="field readonly">
        <span>${r(this.hass, "today")} – Mitsubishi</span>
        <strong>${m(this.hass, e?.kwh_today, 2)} kWh</strong>
      </div>
      <div class="field readonly">
        <span>${r(this.hass, "today")} – Gnosjö</span>
        <strong>${m(this.hass, t?.kwh_today, 2)} kWh</strong>
      </div>
      <div class="field readonly">
        <span>
          ${r(this.hass, "priceSpot")} (${r(this.hass, "inclVat")}
          ${m(this.hass, s?.vat_percent ?? 25, 0)} %)
        </span>
        <strong>
          ${s?.spot_sek_per_kwh != null ? `${m(this.hass, s.spot_sek_per_kwh, 2)} kr/kWh` : "–"}
        </strong>
      </div>
      ${s && s.includes_fees ? l`<div class="field readonly">
            <span>${r(this.hass, "priceSurcharge")}</span>
            <strong>${m(this.hass, s.surcharge, 2)} kr/kWh</strong>
          </div>` : p}
      <div class="field readonly">
        <span>${r(this.hass, "priceTotal")}</span>
        <strong>
          ${s?.sek_per_kwh != null ? `${m(this.hass, s.sek_per_kwh, 2)} kr/kWh` : "–"}
        </strong>
      </div>
      <p class="hint">
        ${s?.source === "all_in_price" ? r(this.hass, "priceSourceAllIn") : s?.source === "price_sensor" ? r(this.hass, "priceSourceSensor") : r(this.hass, "priceSourceNone")}
      </p>
      <p class="hint">
        ${s?.includes_fees ? r(this.hass, "priceHintTotal") : r(this.hass, "priceHintSpot")}
      </p>

      <div class="actions">
        <button @click=${() => this.pressButton("start_baseline")}>
          ${r(this.hass, "startBaseline")}
        </button>
        <button @click=${() => this.pressButton("stop_baseline")}>
          ${r(this.hass, "stopBaseline")}
        </button>
      </div>
      <p class="hint">${r(this.hass, "baselineHint")}</p>
    `;
  }
  renderPresence() {
    const t = this.entity("presence"), s = (t ? this.hass?.states[t] : void 0)?.attributes ?? {};
    return l`
      <div class="field readonly">
        <span>${r(this.hass, "presence")}</span>
        <strong>${ee(this.hass, this.zone?.presence)}</strong>
      </div>
      <div class="field readonly">
        <span>Rå status</span>
        <strong>${ee(this.hass, String(s.raw ?? this.zone?.presence_raw ?? ""))}</strong>
      </div>
      <p class="hint">
        Korta WiFi-avbrott påverkar inte läget – frånvaro kräver den konfigurerade
        fördröjningen.
      </p>
    `;
  }
  renderAdvanced() {
    const t = this.zone?.faults ?? [];
    return l`
      <div class="field readonly">
        <span>${r(this.hass, "faults")}</span>
        <strong>${t.length ? t.join(", ") : r(this.hass, "noFaults")}</strong>
      </div>
      ${this.stepperRow(
      "hysteresis",
      "Hysteres (°C)",
      this.zone?.settings?.hysteresis,
      0.1,
      3,
      0.1
    )}
      ${this.stepperRow(
      "min_safety_temp",
      "Lägsta säkerhetstemp (°C)",
      this.zone?.settings?.min_safety_temp,
      5,
      25,
      0.5
    )}
      <p class="hint">
        ${r(this.hass, "updated")}: ${Ue(this.hass, this.zone?.last_updated)}
      </p>
    `;
  }
  stepperRow(t, e, s, a, i, n, o = "°C") {
    const d = !this.entity(t) || this.pending.has(t);
    return l`
      <div class="field">
        <span>${e}</span>
        ${V({
      hass: this.hass,
      value: s,
      min: a,
      max: i,
      step: n,
      unit: o,
      disabled: d,
      onStep: (h) => {
        this.setNumber(t, h);
      }
    })}
      </div>
    `;
  }
};
T.styles = [
  Ve,
  G`
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

      .field select {
        font: inherit;
        font-size: 13px;
        padding: 5px 8px;
        max-width: 190px;
        border: 1px solid var(--shc-border);
        border-radius: 8px;
        background: var(--shc-card);
        color: var(--shc-text);
      }

      .hint {
        color: var(--shc-muted);
        font-size: 12px;
        margin: 8px 0 0;
      }

      .hint.warn {
        color: var(--warning-color, #b45309);
      }

      .subhead {
        margin: 20px 0 4px;
        padding-top: 12px;
        border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
        font-size: 14px;
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
U([
  _({ attribute: !1 })
], T.prototype, "hass", 2);
U([
  _({ attribute: !1 })
], T.prototype, "zone", 2);
U([
  _({ type: Boolean, reflect: !0 })
], T.prototype, "open", 2);
U([
  x()
], T.prototype, "section", 2);
U([
  x()
], T.prototype, "pending", 2);
T = U([
  re("shc-settings-drawer")
], T);
var At = Object.defineProperty, zt = Object.getOwnPropertyDescriptor, A = (t, e, s, a) => {
  for (var i = a > 1 ? void 0 : a ? zt(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (i = (a ? o(e, s, i) : o(i)) || i);
  return a && i && At(e, s, i), i;
};
const Et = 3e4, Ht = 5 * 6e4, Pe = "smart-heat-controller.zone", Mt = [
  { id: "auto", key: "auto", icon: "M12 3v2m0 14v2M5.6 5.6 7 7m10 10 1.4 1.4M3 12h2m14 0h2M5.6 18.4 7 17m10-10 1.4-1.4" },
  { id: "home", key: "home", icon: "M4 11 12 4l8 7v9H4z" },
  { id: "away", key: "away", icon: "M3 16h18l-2-5H5zM6 16v4m12-4v4" },
  { id: "boost", key: "boost", icon: "M5 15c4 0 4-9 9-9 3 0 5 2 5 5s-2 5-5 5H5z" }
];
let w = class extends C {
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
    super.connectedCallback(), this.selectedZoneId = window.localStorage.getItem(Pe) ?? void 0, this.refresh(!0);
  }
  updated(t) {
    if (t.has("hass") && this.hass) {
      const e = Date.now();
      e - this.lastFetch > Et && this.refresh(), e - this.lastHistory > Ht && this.loadOutsideHistory();
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
        this.zone = (s ? this.zones.find((a) => a.entry_id === s) : void 0) ?? this.zones[0], this.zone && !this.config?.entry_id && (this.selectedZoneId = this.zone.entry_id), this.error = void 0, this.loadOutsideHistory();
      } catch (e) {
        this.error = e instanceof Error ? e.message : String(e);
      }
    }
  }
  chooseZone(t) {
    this.selectedZoneId = t, window.localStorage.setItem(Pe, t), this.zone = this.zones.find((e) => e.entry_id === t), this.outside = [], this.loadOutsideHistory();
  }
  async loadOutsideHistory() {
    const t = this.zone?.actuators?.outside_sensor ?? this.entity("outside_temperature");
    if (!(!this.hass || !t)) {
      this.lastHistory = Date.now();
      try {
        const e = /* @__PURE__ */ new Date(), s = new Date(e.getTime() - 336 * 3600 * 1e3), i = (await this.hass.callWS({
          type: "history/history_during_period",
          start_time: s.toISOString(),
          end_time: e.toISOString(),
          minimal_response: !0,
          no_attributes: !0,
          entity_ids: [t]
        }))?.[t] ?? [];
        this.outside = i.map((n) => ({
          t: Number(n.lu) * 1e3,
          y: Number(n.s)
        })).filter((n) => Number.isFinite(n.y) && Number.isFinite(n.t));
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
        const a = new Set(this.pending);
        a.delete(t), this.pending = a;
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
      return l`<div class="card">
        <h3>Smart Heat Controller</h3>
        <p class="empty">${this.error}</p>
      </div>`;
    if (!this.zone)
      return l`<div class="card"><p class="empty">…</p></div>`;
    const t = this.zone, e = t.settings, s = this.currentRoomTemperature(), a = this.heatpumpHeating(), i = this.radiatorOn(), n = t.mode ?? "auto", o = t.presence ?? "unknown", d = t.totals?.today ?? {}, h = t.totals?.week ?? {}, u = t.totals?.month ?? {}, f = t.costs?.today?.total ?? null, c = t.costs?.week?.total ?? null, y = t.costs?.month?.total ?? null, g = t.savings, z = t.series, he = t.dry_run === !0;
    return l`
      <div class="shell">
        ${he ? l`<div class="banner">${r(this.hass, "dryRunOn")}</div>` : p}
        ${(t.faults ?? []).length ? l`<div class="banner">
              ${r(this.hass, "faults")}: ${(t.faults ?? []).join(", ")}
            </div>` : p}

        <div class="topbar">
          <div class="brand">
            <span aria-hidden="true">🔥</span>
            <span>Smart Heat Controller – ${t.name}</span>
          </div>
          <div class="row">
            ${this.zones.length > 1 ? l`<select
                  aria-label="Zone"
                  .value=${t.entry_id}
                  @change=${(v) => {
      this.chooseZone(v.target.value);
    }}
                >
                  ${this.zones.map(
      (v) => l`<option
                      value=${v.entry_id}
                      ?selected=${v.entry_id === t.entry_id}
                    >
                      ${v.name}
                    </option>`
    )}
                </select>` : p}
            <span class="pill ${n === "auto" ? "ok" : ""}">
              ${n === "auto" ? (this.hass?.locale?.language ?? "").startsWith("en") ? "Automatic" : "Automatisk drift" : n.toUpperCase()}
            </span>
            <button
              aria-label=${r(this.hass, "settings")}
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
            ${t.image_url ? l`<img src=${t.image_url} alt="" />` : p}
            <div class="caption">
              <strong>${t.name}</strong>
              ${t.area ? l`<span class="muted">${t.area} m²</span>` : p}
            </div>
          </div>

          <div class="card temp-card">
            <div class="row">
              <span aria-hidden="true">🌡</span>
              <span class="label">${r(this.hass, "room")}</span>
            </div>
            <div class="value">${m(this.hass, s, 1)} °C</div>
            <div class="muted">
              ${r(this.hass, "target")} (${r(this.hass, "home")}):
              ${m(this.hass, e?.home_target, 1)} °C
            </div>          </div>

          <div class="card temp-card">
            <div class="row">
              <span aria-hidden="true">☁️</span>
              <span class="label">${r(this.hass, "outside")}</span>
            </div>
            <div class="value">
              ${m(this.hass, this.outsideTemperature(), 1)} °C
            </div>
            ${this.outsideTemperature() == null ? l`<div class="muted">${r(this.hass, "outsideMissing")}</div>` : p}
          </div>

          <div
            class="card presence-card ${o === "home" ? "" : o === "away" ? "away" : "unknown"}"
          >
            <div class="row">
              <span aria-hidden="true">👤</span>
              <span class="label">${r(this.hass, "presence")}</span>
            </div>
            <div class="big">
              ${ee(this.hass, o)}
            </div>
          </div>

          <!-- Row 2 -->
          <div class="card">
            <div class="device-head">
              <span aria-hidden="true">❄️</span>
              <div>
                <strong>${r(this.hass, "heatpump")}</strong>
                <span class="sub ${a ? "" : "off"}">
                  ${a ? r(this.hass, "heating") : r(this.hass, "idle")}
                  ${t.away_boost === !0 ? l` · <strong>${r(this.hass, "awayBoostActive")}</strong>` : t.away_boost === !1 ? l` · ${r(this.hass, "awayBoostIdle")}` : p}
                </span>
              </div>
            </div>
            <div class="value small">
              ${m(this.hass, e?.heatpump_target, 1)} °C
              <span class="muted">(${r(this.hass, "target")})</span>
            </div>
            <div class="spread" style="margin-top:8px">
              <span class="muted">${r(this.hass, "fan")}</span>
              <strong
                >${t.heatpump?.fan_mode ? te(this.hass, t.heatpump.fan_mode) : "–"}</strong
              >
            </div>
            ${this.powerRow(t.heatpump?.power_w, t.heatpump?.power_source)}
            <div class="spread" style="margin-top:6px">
              <span class="muted">${r(this.hass, "todayShort")}</span>
              <strong>${m(this.hass, t.heatpump?.kwh_today, 2)} kWh</strong>
            </div>
          </div>

          <div class="card">
            <div class="device-head">
              <span aria-hidden="true">♨️</span>
              <div>
                <strong>${r(this.hass, "radiator")}</strong>
                <span class="sub ${i ? "" : "off"}">
                  ${i ? r(this.hass, "heating") : r(this.hass, "idle")}
                </span>
              </div>
            </div>
            ${this.powerRow(t.radiator?.power_w, t.radiator?.power_source)}
            <div class="spread" style="margin-top:6px">
              <span class="muted">${r(this.hass, "todayShort")}</span>
              <strong>${m(this.hass, t.radiator?.kwh_today, 2)} kWh</strong>
            </div>
            <button style="margin-top:12px;width:100%" @click=${this.toggleRadiator}>
              ${i ? "Slå AV" : "Slå PÅ"} (30 min)
            </button>
          </div>

          <div class="card span2">
            <h3>${r(this.hass, "mode")}</h3>
            <div class="mode-grid">
              ${Mt.map(
      (v) => l`
                  <button
                    class=${n === v.id ? "active" : ""}
                    @click=${() => this.selectMode(v.id)}
                  >
                    <svg viewBox="0 0 24 24"><path d=${v.icon} /></svg>
                    ${r(this.hass, v.key)}
                  </button>
                `
    )}
            </div>
            <div class="status-note">
              <span aria-hidden="true">✓</span>
              <div>
                <strong>${We(this.hass, t.effective_mode)}</strong>
                ${me(this.hass, t.reason)}
              </div>
            </div>
          </div>

          <!-- Row 3 -->
          <div class="card span2">
            <div class="spread">
              <h3>${r(this.hass, "energy")}</h3>
              <div class="row">
                ${[7, 30].map(
      (v) => l`
                    <button
                      class=${this.chartDays === v ? "active" : ""}
                      @click=${() => {
        this.chartDays = v;
      }}
                    >
                      ${v} ${"dgr"}
                    </button>
                  `
    )}
              </div>
            </div>
            <shc-energy-chart
              .hass=${this.hass}
              .heatpump=${z?.heatpump ?? []}
              .radiator=${z?.radiator ?? []}
              .outside=${this.outside}
              .days=${this.chartDays}
            ></shc-energy-chart>
          </div>

          <div class="card span2">
            <h3>${r(this.hass, "cost")}</h3>
            <div class="cost-grid">
              ${[
      { label: r(this.hass, "today"), total: d.total, cost: f },
      { label: r(this.hass, "week"), total: h.total, cost: c },
      { label: r(this.hass, "month"), total: u.total, cost: y }
    ].map(
      (v) => l`
                  <div class="cost-cell">
                    <small class="label">${v.label}</small>
                    <div class="kwh">
                      ${v.total ? m(this.hass, v.total.kwh, 2) : "–"} kWh
                    </div>
                    <div class="sek">
                      ≈ ${ft(this.hass, v.cost)}
                      ${t.price?.includes_fees ? p : l`<span class="quality estimated"
                              >${r(this.hass, "estimated")}</span
                            >`}
                    </div>
                  </div>
                `
    )}
            </div>

            <div class="card" style="margin-top:12px;padding:12px 14px;border-radius:12px">
              <div class="spread">
                <h3>🌿 ${r(this.hass, "savings")}</h3>
              </div>
              ${g?.has_result ? l`
                    <div class="savings-box">
                      <div class="cell">
                        <small>${r(this.hass, "before")}</small>
                        <b>${m(this.hass, g.baseline_kwh_per_day, 1)}</b>
                        <span class="muted">${r(this.hass, "perDay")}</span>
                      </div>
                      <div class="cell">
                        <small>${r(this.hass, "after")}</small>
                        <b>${m(this.hass, g.comparison_kwh_per_day, 1)}</b>
                        <span class="muted">${r(this.hass, "perDay")}</span>
                      </div>
                      <div class="delta ${g.is_increase ? "increase" : ""}">
                        ${g.delta_kwh_per_day != null ? `${g.delta_kwh_per_day < 0 ? "+" : "−"}${m(
      this.hass,
      Math.abs(g.delta_kwh_per_day),
      1
    )}` : "–"}
                        <div class="muted" style="color:inherit">
                          ${g.percent != null ? `${m(this.hass, Math.abs(g.percent), 0)} %` : ""}
                        </div>
                      </div>
                    </div>
                  ` : l`<p class="empty">${r(this.hass, "noBaseline")}</p>`}
              ${t.savings_warning ? l`<p class="muted" style="margin:8px 0 0">
                    ${t.savings_warning}
                  </p>` : p}
              ${g && g.baseline_quality !== "measured" ? l`<p class="muted" style="margin:8px 0 0">
                    Datatäckning: ${g.baseline_quality} / ${g.comparison_quality}
                  </p>` : p}
            </div>
          </div>

          <!-- Row 4 -->
          <div class="card span2">
            <h3>${r(this.hass, "quick")}</h3>
            ${this.quickRow(
      "home_target",
      r(this.hass, "roomTarget"),
      e?.home_target
    )}
            ${this.quickRow(
      "away_target",
      r(this.hass, "awayTarget"),
      e?.away_target
    )}
            ${this.quickRow(
      "radiator_on_below",
      r(this.hass, "onBelow"),
      e?.radiator_on_below
    )}
            ${this.quickRow(
      "radiator_off_above",
      r(this.hass, "offAbove"),
      e?.radiator_off_above
    )}
          </div>

          <div class="card span2">
            <h3>${r(this.hass, "baseline")}</h3>
            ${this.renderBaseline()}
          </div>

          <!-- Row 5 -->
          <div class="card span2">
            <h3>${r(this.hass, "systemStatus")}</h3>
            <div class="status-list">
              ${this.statusRow("heatpump_available", "Mitsubishi (HVAC)")}
              ${this.statusRow("radiator_available", "Shelly (element)")}
              ${this.statusRow("temperature_stale", r(this.hass, "room"), !0)}
              ${this.statusRow("presence", r(this.hass, "presence"))}
            </div>
            <p class="muted" style="margin:12px 0 0">
              ${r(this.hass, "updated")}: ${Ue(this.hass, t.last_updated)}
            </p>
          </div>

          <div class="card span2">
            <h3>${r(this.hass, "presence")}</h3>
            <div class="status-list">
              ${(t.actuators?.presence_entities ?? []).map(
      (v) => l`
                  <div class="status-row">
                    <span>${v}</span>
                    <span class=${this.hass?.states[v]?.state === "home" ? "ok" : "bad"}>
                      ${this.hass?.states[v]?.state ?? "–"}
                    </span>
                  </div>
                `
    )}
              ${(t.actuators?.presence_entities ?? []).length === 0 ? l`<p class="empty">${r(this.hass, "noData")}</p>` : p}
            </div>
            <div class="row" style="margin-top:12px">
              <button @click=${() => this.pressButton("start_baseline")}>
                ${r(this.hass, "startBaseline")}
              </button>
              <button @click=${() => this.pressButton("stop_baseline")}>
                ${r(this.hass, "stopBaseline")}
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
      return l`
        <p class="empty">${r(this.hass, "noBaseline")}</p>
        <p class="muted">${r(this.hass, "baselineHint")}</p>
        <div class="row">
          <button @click=${() => this.pressButton("start_baseline")}>
            ${r(this.hass, "startBaseline")}
          </button>
          ${e?.active ? l`<button @click=${() => this.pressButton("stop_baseline")}>
                ${r(this.hass, "stopBaseline")}
              </button>` : p}
        </div>
      `;
    const a = t.baseline_kwh_per_day ?? 0, i = t.comparison_kwh_per_day ?? 0;
    return l`
      <div class="bars">
        <div class="bar before" style="height: ${a / s * 100}%">
          ${m(this.hass, a, 1)}
        </div>
        <div class="bar after" style="height: ${i / s * 100}%">
          ${m(this.hass, i, 1)}
        </div>
      </div>
      <div class="bar-caption">
        <div>
          ${r(this.hass, "before")}<br />(${t.baseline_days} ${"dygn"})
        </div>
        <div>
          ${r(this.hass, "after")}<br />(${t.comparison_days} ${"dygn"})
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
          ${t.weather_adjustment_available ? `Väderkorrigerat: ${m(
      this.hass,
      Math.abs(t.weather_adjusted_percent ?? 0),
      0
    )} % ${(t.weather_adjusted_percent ?? 0) < 0 ? "ökning" : "minskning"} (${m(this.hass, t.baseline_hdd, 0)} → ${m(
      this.hass,
      t.comparison_hdd,
      0
    )} graddygn)` : "Väderkorrigering saknas – utetemperatur behövs"}
        </li>
      </ul>
      ${t.weather_adjustment_available ? l`<p class="muted" style="margin:6px 0 0;font-size:11.5px">
            Graddagsnormaliserat mått (bastemp 17 °C). Tar inte hänsyn till
            solinstrålning, vind, internvärme eller ändrat nyttjande – det är en
            uppskattning, inte ett bevis.
          </p>` : p}
    `;
  }
  quickRow(t, e, s) {
    const a = !this.entity(t) || this.pending.has(t);
    return l`
      <div class="quick-row">
        <span class="quick-name">${e}</span>
        ${V({
      hass: this.hass,
      value: s,
      min: 5,
      max: 30,
      step: 0.5,
      disabled: a,
      onStep: (i) => {
        this.setNumber(t, i);
      }
    })}
      </div>
    `;
  }
  statusRow(t, e, s = !1) {
    const a = this.stateValue(t), i = s ? a === "off" : a === "on";
    return l`
      <div class="status-row">
        <span>${e}</span>
        <span class=${i ? "ok" : "bad"}>
          ${i ? r(this.hass, "online") : r(this.hass, "offline")}
        </span>
      </div>
    `;
  }
  currentRoomTemperature() {
    const t = this.entity("room_temperature"), e = t ? this.hass?.states[t]?.state : void 0, s = e !== void 0 ? Number(e) : NaN;
    return Number.isFinite(s) ? s : this.zone?.room_temperature ?? null;
  }
  outsideTemperature() {
    const t = this.zone?.outside_temperature;
    if (typeof t == "number" && Number.isFinite(t))
      return t;
    const e = this.zone?.actuators?.outside_sensor;
    if (!e)
      return null;
    const s = this.hass?.states[e]?.state, a = s !== void 0 ? Number(s) : NaN;
    return Number.isFinite(a) ? a : null;
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
  /** "Power now" row; approximations are marked with ≈ and explained. */
  powerRow(t, e) {
    const s = e === "energy_average" || e === "nominal";
    return l`
      <div
        class="spread"
        style="margin-top:6px"
        title=${s ? r(this.hass, e === "nominal" ? "powerNominal" : "powerApprox") : ""}
      >
        <span class="muted">${r(this.hass, "powerNow")}</span>
        <strong
          >${t != null ? `${s ? "≈ " : ""}${m(this.hass, t, 0)} W` : "–"}</strong
        >
      </div>
    `;
  }
};
w.styles = [
  Ve,
  G`
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
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        gap: 10px;
        padding: 6px 0;
      }

      .quick-row + .quick-row {
        border-top: 1px dashed var(--shc-border);
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
A([
  _({ attribute: !1 })
], w.prototype, "hass", 2);
A([
  x()
], w.prototype, "config", 2);
A([
  x()
], w.prototype, "zone", 2);
A([
  x()
], w.prototype, "zones", 2);
A([
  x()
], w.prototype, "selectedZoneId", 2);
A([
  x()
], w.prototype, "outside", 2);
A([
  x()
], w.prototype, "drawerOpen", 2);
A([
  x()
], w.prototype, "chartDays", 2);
A([
  x()
], w.prototype, "error", 2);
A([
  x()
], w.prototype, "pending", 2);
w = A([
  re("smart-heat-dashboard")
], w);
var Ct = Object.defineProperty, Tt = Object.getOwnPropertyDescriptor, le = (t, e, s, a) => {
  for (var i = a > 1 ? void 0 : a ? Tt(e, s) : e, n = t.length - 1, o; n >= 0; n--)
    (o = t[n]) && (i = (a ? o(e, s, i) : o(i)) || i);
  return a && i && Ct(e, s, i), i;
};
const Nt = "M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z";
let F = class extends C {
  constructor() {
    super(...arguments), this.narrow = !1;
  }
  /** The menu button is needed on phones and whenever the sidebar is hidden. */
  get showMenu() {
    const t = this.hass?.dockedSidebar;
    return this.narrow || t === "always_hidden";
  }
  toggleMenu() {
    this.dispatchEvent(
      new CustomEvent("hass-toggle-menu", { bubbles: !0, composed: !0 })
    );
  }
  render() {
    const t = this.showMenu;
    return l`
      <div class="toolbar ${t ? "" : "wide"}">
        ${t ? l`<button class="menu" aria-label="Menu" @click=${this.toggleMenu}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d=${Nt}></path></svg>
            </button>` : p}
        <div class="title">${this.panel?.title || "Smart Heat"}</div>
      </div>
      <div class="content">
        <smart-heat-dashboard .hass=${this.hass}></smart-heat-dashboard>
      </div>
    `;
  }
};
F.styles = G`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--primary-background-color, #f5f8fc);
      box-sizing: border-box;
    }

    /* Same toolbar as Home Assistant's own panels, so the mobile app has a
       way back to the sidebar without the Android back button. */
    .toolbar {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 0 0 auto;
      height: var(--header-height, 56px);
      padding: 0 12px 0 4px;
      padding-top: env(safe-area-inset-top);
      box-sizing: content-box;
      background: var(--app-header-background-color, var(--primary-color, #03a9f4));
      color: var(--app-header-text-color, var(--text-primary-color, #fff));
      border-bottom: var(--app-header-border-bottom, none);
    }

    .toolbar.wide {
      padding-left: 16px;
    }

    .menu {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: transparent;
      color: inherit;
      cursor: pointer;
    }

    .menu:hover,
    .menu:focus-visible {
      background: rgba(255, 255, 255, 0.12);
      outline: none;
    }

    .menu svg {
      width: 24px;
      height: 24px;
      fill: currentColor;
    }

    .title {
      font-size: 20px;
      font-weight: 400;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .content {
      flex: 1 1 auto;
      overflow: auto;
      -webkit-overflow-scrolling: touch;
    }

    smart-heat-dashboard {
      min-height: 100%;
    }
  `;
le([
  _({ attribute: !1 })
], F.prototype, "hass", 2);
le([
  _({ type: Boolean })
], F.prototype, "narrow", 2);
le([
  _({ attribute: !1 })
], F.prototype, "panel", 2);
F = le([
  re("smart-heat-panel")
], F);
window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "smart-heat-dashboard",
  name: "Smart Heat Controller",
  description: "Heating overview, energy, savings and settings for Smart Heat Controller.",
  preview: !1,
  documentationURL: "https://github.com/nikeng-forenade/smart-heat-controller"
});
export {
  w as SmartHeatDashboard
};
