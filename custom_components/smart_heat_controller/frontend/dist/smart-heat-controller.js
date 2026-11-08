/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const J = globalThis, lt = J.ShadowRoot && (J.ShadyCSS === void 0 || J.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ht = Symbol(), ft = /* @__PURE__ */ new WeakMap();
let Ct = class {
  constructor(t, s, i) {
    if (this._$cssResult$ = !0, i !== ht) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = s;
  }
  get styleSheet() {
    let t = this.o;
    const s = this.t;
    if (lt && t === void 0) {
      const i = s !== void 0 && s.length === 1;
      i && (t = ft.get(s)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && ft.set(s, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Bt = (e) => new Ct(typeof e == "string" ? e : e + "", void 0, ht), L = (e, ...t) => {
  const s = e.length === 1 ? e[0] : t.reduce((i, a, r) => i + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(a) + e[r + 1], e[0]);
  return new Ct(s, e, ht);
}, Ut = (e, t) => {
  if (lt) e.adoptedStyleSheets = t.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of t) {
    const i = document.createElement("style"), a = J.litNonce;
    a !== void 0 && i.setAttribute("nonce", a), i.textContent = s.cssText, e.appendChild(i);
  }
}, vt = lt ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((t) => {
  let s = "";
  for (const i of t.cssRules) s += i.cssText;
  return Bt(s);
})(e) : e;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: It, defineProperty: Wt, getOwnPropertyDescriptor: Ft, getOwnPropertyNames: qt, getOwnPropertySymbols: Lt, getPrototypeOf: Vt } = Object, X = globalThis, bt = X.trustedTypes, Kt = bt ? bt.emptyScript : "", Gt = X.reactiveElementPolyfillSupport, U = (e, t) => e, Z = { toAttribute(e, t) {
  switch (t) {
    case Boolean:
      e = e ? Kt : null;
      break;
    case Object:
    case Array:
      e = e == null ? e : JSON.stringify(e);
  }
  return e;
}, fromAttribute(e, t) {
  let s = e;
  switch (t) {
    case Boolean:
      s = e !== null;
      break;
    case Number:
      s = e === null ? null : Number(e);
      break;
    case Object:
    case Array:
      try {
        s = JSON.parse(e);
      } catch {
        s = null;
      }
  }
  return s;
} }, dt = (e, t) => !It(e, t), yt = { attribute: !0, type: String, converter: Z, reflect: !1, useDefault: !1, hasChanged: dt };
Symbol.metadata ??= Symbol("metadata"), X.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let H = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, s = yt) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(t, s), !s.noAccessor) {
      const i = Symbol(), a = this.getPropertyDescriptor(t, i, s);
      a !== void 0 && Wt(this.prototype, t, a);
    }
  }
  static getPropertyDescriptor(t, s, i) {
    const { get: a, set: r } = Ft(this.prototype, t) ?? { get() {
      return this[s];
    }, set(n) {
      this[s] = n;
    } };
    return { get: a, set(n) {
      const d = a?.call(this);
      r?.call(this, n), this.requestUpdate(t, d, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? yt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(U("elementProperties"))) return;
    const t = Vt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(U("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(U("properties"))) {
      const s = this.properties, i = [...qt(s), ...Lt(s)];
      for (const a of i) this.createProperty(a, s[a]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const s = litPropertyMetadata.get(t);
      if (s !== void 0) for (const [i, a] of s) this.elementProperties.set(i, a);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, i] of this.elementProperties) {
      const a = this._$Eu(s, i);
      a !== void 0 && this._$Eh.set(a, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const s = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const a of i) s.unshift(vt(a));
    } else t !== void 0 && s.push(vt(t));
    return s;
  }
  static _$Eu(t, s) {
    const i = s.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), s = this.constructor.elementProperties;
    for (const i of s.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Ut(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, s, i) {
    this._$AK(t, i);
  }
  _$ET(t, s) {
    const i = this.constructor.elementProperties.get(t), a = this.constructor._$Eu(t, i);
    if (a !== void 0 && i.reflect === !0) {
      const r = (i.converter?.toAttribute !== void 0 ? i.converter : Z).toAttribute(s, i.type);
      this._$Em = t, r == null ? this.removeAttribute(a) : this.setAttribute(a, r), this._$Em = null;
    }
  }
  _$AK(t, s) {
    const i = this.constructor, a = i._$Eh.get(t);
    if (a !== void 0 && this._$Em !== a) {
      const r = i.getPropertyOptions(a), n = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : Z;
      this._$Em = a;
      const d = n.fromAttribute(s, r.type);
      this[a] = d ?? this._$Ej?.get(a) ?? d, this._$Em = null;
    }
  }
  requestUpdate(t, s, i, a = !1, r) {
    if (t !== void 0) {
      const n = this.constructor;
      if (a === !1 && (r = this[t]), i ??= n.getPropertyOptions(t), !((i.hasChanged ?? dt)(r, s) || i.useDefault && i.reflect && r === this._$Ej?.get(t) && !this.hasAttribute(n._$Eu(t, i)))) return;
      this.C(t, s, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, s, { useDefault: i, reflect: a, wrapped: r }, n) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t) && (this._$Ej.set(t, n ?? s ?? this[t]), r !== !0 || n !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (s = void 0), this._$AL.set(t, s)), a === !0 && this._$Em !== t && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (s) {
      Promise.reject(s);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
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
    let t = !1;
    const s = this._$AL;
    try {
      t = this.shouldUpdate(s), t ? (this.willUpdate(s), this._$EO?.forEach((i) => i.hostUpdate?.()), this.update(s)) : this._$EM();
    } catch (i) {
      throw t = !1, this._$EM(), i;
    }
    t && this._$AE(s);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((s) => s.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
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
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach((s) => this._$ET(s, this[s])), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
H.elementStyles = [], H.shadowRootOptions = { mode: "open" }, H[U("elementProperties")] = /* @__PURE__ */ new Map(), H[U("finalized")] = /* @__PURE__ */ new Map(), Gt?.({ ReactiveElement: H }), (X.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ct = globalThis, $t = (e) => e, Q = ct.trustedTypes, _t = Q ? Q.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, Pt = "$lit$", E = `lit$${Math.random().toFixed(9).slice(2)}$`, Ot = "?" + E, Jt = `<${Ot}>`, N = document, I = () => N.createComment(""), W = (e) => e === null || typeof e != "object" && typeof e != "function", pt = Array.isArray, Yt = (e) => pt(e) || typeof e?.[Symbol.iterator] == "function", rt = `[ 	
\f\r]`, j = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, xt = /-->/g, wt = />/g, P = RegExp(`>|${rt}(?:([^\\s"'>=/]+)(${rt}*=${rt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), kt = /'/g, St = /"/g, Mt = /^(?:script|style|textarea|title)$/i, Nt = (e) => (t, ...s) => ({ _$litType$: e, strings: t, values: s }), h = Nt(1), O = Nt(2), D = Symbol.for("lit-noChange"), p = Symbol.for("lit-nothing"), At = /* @__PURE__ */ new WeakMap(), M = N.createTreeWalker(N, 129);
function Rt(e, t) {
  if (!pt(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return _t !== void 0 ? _t.createHTML(t) : t;
}
const Zt = (e, t) => {
  const s = e.length - 1, i = [];
  let a, r = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", n = j;
  for (let d = 0; d < s; d++) {
    const l = e[d];
    let g, f, m = -1, $ = 0;
    for (; $ < l.length && (n.lastIndex = $, f = n.exec(l), f !== null); ) $ = n.lastIndex, n === j ? f[1] === "!--" ? n = xt : f[1] !== void 0 ? n = wt : f[2] !== void 0 ? (Mt.test(f[2]) && (a = RegExp("</" + f[2], "g")), n = P) : f[3] !== void 0 && (n = P) : n === P ? f[0] === ">" ? (n = a ?? j, m = -1) : f[1] === void 0 ? m = -2 : (m = n.lastIndex - f[2].length, g = f[1], n = f[3] === void 0 ? P : f[3] === '"' ? St : kt) : n === St || n === kt ? n = P : n === xt || n === wt ? n = j : (n = P, a = void 0);
    const c = n === P && e[d + 1].startsWith("/>") ? " " : "";
    r += n === j ? l + Jt : m >= 0 ? (i.push(g), l.slice(0, m) + Pt + l.slice(m) + E + c) : l + E + (m === -2 ? d : c);
  }
  return [Rt(e, r + (e[s] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class F {
  constructor({ strings: t, _$litType$: s }, i) {
    let a;
    this.parts = [];
    let r = 0, n = 0;
    const d = t.length - 1, l = this.parts, [g, f] = Zt(t, s);
    if (this.el = F.createElement(g, i), M.currentNode = this.el.content, s === 2 || s === 3) {
      const m = this.el.content.firstChild;
      m.replaceWith(...m.childNodes);
    }
    for (; (a = M.nextNode()) !== null && l.length < d; ) {
      if (a.nodeType === 1) {
        if (a.hasAttributes()) for (const m of a.getAttributeNames()) if (m.endsWith(Pt)) {
          const $ = f[n++], c = a.getAttribute(m).split(E), y = /([.?@])?(.*)/.exec($);
          l.push({ type: 1, index: r, name: y[2], strings: c, ctor: y[1] === "." ? Xt : y[1] === "?" ? te : y[1] === "@" ? ee : tt }), a.removeAttribute(m);
        } else m.startsWith(E) && (l.push({ type: 6, index: r }), a.removeAttribute(m));
        if (Mt.test(a.tagName)) {
          const m = a.textContent.split(E), $ = m.length - 1;
          if ($ > 0) {
            a.textContent = Q ? Q.emptyScript : "";
            for (let c = 0; c < $; c++) a.append(m[c], I()), M.nextNode(), l.push({ type: 2, index: ++r });
            a.append(m[$], I());
          }
        }
      } else if (a.nodeType === 8) if (a.data === Ot) l.push({ type: 2, index: r });
      else {
        let m = -1;
        for (; (m = a.data.indexOf(E, m + 1)) !== -1; ) l.push({ type: 7, index: r }), m += E.length - 1;
      }
      r++;
    }
  }
  static createElement(t, s) {
    const i = N.createElement("template");
    return i.innerHTML = t, i;
  }
}
function T(e, t, s = e, i) {
  if (t === D) return t;
  let a = i !== void 0 ? s._$Co?.[i] : s._$Cl;
  const r = W(t) ? void 0 : t._$litDirective$;
  return a?.constructor !== r && (a?._$AO?.(!1), r === void 0 ? a = void 0 : (a = new r(e), a._$AT(e, s, i)), i !== void 0 ? (s._$Co ??= [])[i] = a : s._$Cl = a), a !== void 0 && (t = T(e, a._$AS(e, t.values), a, i)), t;
}
class Qt {
  constructor(t, s) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = s;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: s }, parts: i } = this._$AD, a = (t?.creationScope ?? N).importNode(s, !0);
    M.currentNode = a;
    let r = M.nextNode(), n = 0, d = 0, l = i[0];
    for (; l !== void 0; ) {
      if (n === l.index) {
        let g;
        l.type === 2 ? g = new V(r, r.nextSibling, this, t) : l.type === 1 ? g = new l.ctor(r, l.name, l.strings, this, t) : l.type === 6 && (g = new se(r, this, t)), this._$AV.push(g), l = i[++d];
      }
      n !== l?.index && (r = M.nextNode(), n++);
    }
    return M.currentNode = N, a;
  }
  p(t) {
    let s = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, s), s += i.strings.length - 2) : i._$AI(t[s])), s++;
  }
}
class V {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, s, i, a) {
    this.type = 2, this._$AH = p, this._$AN = void 0, this._$AA = t, this._$AB = s, this._$AM = i, this.options = a, this._$Cv = a?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const s = this._$AM;
    return s !== void 0 && t?.nodeType === 11 && (t = s.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, s = this) {
    t = T(this, t, s), W(t) ? t === p || t == null || t === "" ? (this._$AH !== p && this._$AR(), this._$AH = p) : t !== this._$AH && t !== D && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Yt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== p && W(this._$AH) ? this._$AA.nextSibling.data = t : this.T(N.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: s, _$litType$: i } = t, a = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = F.createElement(Rt(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === a) this._$AH.p(s);
    else {
      const r = new Qt(a, this), n = r.u(this.options);
      r.p(s), this.T(n), this._$AH = r;
    }
  }
  _$AC(t) {
    let s = At.get(t.strings);
    return s === void 0 && At.set(t.strings, s = new F(t)), s;
  }
  k(t) {
    pt(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let i, a = 0;
    for (const r of t) a === s.length ? s.push(i = new V(this.O(I()), this.O(I()), this, this.options)) : i = s[a], i._$AI(r), a++;
    a < s.length && (this._$AR(i && i._$AB.nextSibling, a), s.length = a);
  }
  _$AR(t = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); t !== this._$AB; ) {
      const i = $t(t).nextSibling;
      $t(t).remove(), t = i;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
let tt = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, s, i, a, r) {
    this.type = 1, this._$AH = p, this._$AN = void 0, this.element = t, this.name = s, this._$AM = a, this.options = r, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = p;
  }
  _$AI(t, s = this, i, a) {
    const r = this.strings;
    let n = !1;
    if (r === void 0) t = T(this, t, s, 0), n = !W(t) || t !== this._$AH && t !== D, n && (this._$AH = t);
    else {
      const d = t;
      let l, g;
      for (t = r[0], l = 0; l < r.length - 1; l++) g = T(this, d[i + l], s, l), g === D && (g = this._$AH[l]), n ||= !W(g) || g !== this._$AH[l], g === p ? t = p : t !== p && (t += (g ?? "") + r[l + 1]), this._$AH[l] = g;
    }
    n && !a && this.j(t);
  }
  j(t) {
    t === p ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
};
class Xt extends tt {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === p ? void 0 : t;
  }
}
class te extends tt {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== p);
  }
}
class ee extends tt {
  constructor(t, s, i, a, r) {
    super(t, s, i, a, r), this.type = 5;
  }
  _$AI(t, s = this) {
    if ((t = T(this, t, s, 0) ?? p) === D) return;
    const i = this._$AH, a = t === p && i !== p || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, r = t !== p && (i === p || a);
    a && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class se {
  constructor(t, s, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    T(this, t);
  }
}
const ie = ct.litHtmlPolyfillSupport;
ie?.(F, V), (ct.litHtmlVersions ??= []).push("3.3.3");
const ae = (e, t, s) => {
  const i = s?.renderBefore ?? t;
  let a = i._$litPart$;
  if (a === void 0) {
    const r = s?.renderBefore ?? null;
    i._$litPart$ = a = new V(t.insertBefore(I(), r), r, void 0, s ?? {});
  }
  return a._$AI(e), a;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ut = globalThis;
class z extends H {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = ae(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return D;
  }
}
z._$litElement$ = !0, z.finalized = !0, ut.litElementHydrateSupport?.({ LitElement: z });
const re = ut.litElementPolyfillSupport;
re?.({ LitElement: z });
(ut.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const et = (e) => (t, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ne = { attribute: !0, type: String, converter: Z, reflect: !1, hasChanged: dt }, oe = (e = ne, t, s) => {
  const { kind: i, metadata: a } = s;
  let r = globalThis.litPropertyMetadata.get(a);
  if (r === void 0 && globalThis.litPropertyMetadata.set(a, r = /* @__PURE__ */ new Map()), i === "setter" && ((e = Object.create(e)).wrapped = !0), r.set(s.name, e), i === "accessor") {
    const { name: n } = s;
    return { set(d) {
      const l = t.get.call(this);
      t.set.call(this, d), this.requestUpdate(n, l, e, !0, d);
    }, init(d) {
      return d !== void 0 && this.C(n, void 0, e, d), d;
    } };
  }
  if (i === "setter") {
    const { name: n } = s;
    return function(d) {
      const l = this[n];
      t.call(this, d), this.requestUpdate(n, l, e, !0, d);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function _(e) {
  return (t, s) => typeof s == "object" ? oe(e, t, s) : ((i, a, r) => {
    const n = a.hasOwnProperty(r);
    return a.constructor.createProperty(r, i), n ? Object.getOwnPropertyDescriptor(a, r) : void 0;
  })(e, t, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function k(e) {
  return _({ ...e, state: !0, attribute: !1 });
}
function st(e) {
  return (e?.locale?.language ?? e?.language ?? "sv").toLowerCase().startsWith("en") ? "en" : "sv";
}
const le = {
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
function o(e, t) {
  return le[st(e)][t];
}
function it(e) {
  return st(e) === "en" ? "en-SE" : "sv-SE";
}
function u(e, t, s = 1) {
  return t == null || Number.isNaN(t) ? "–" : new Intl.NumberFormat(it(e), {
    minimumFractionDigits: s,
    maximumFractionDigits: s
  }).format(t);
}
function he(e, t) {
  return t == null || Number.isNaN(t) ? "–" : new Intl.NumberFormat(it(e), {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(t);
}
function Ht(e, t) {
  if (!t)
    return "–";
  const s = new Date(t);
  return Number.isNaN(s.getTime()) ? "–" : new Intl.DateTimeFormat(it(e), {
    hour: "2-digit",
    minute: "2-digit"
  }).format(s);
}
function Et(e, t) {
  const s = /* @__PURE__ */ new Date(`${t}T12:00:00`);
  return Number.isNaN(s.getTime()) ? t : new Intl.DateTimeFormat(it(e), {
    day: "numeric",
    month: "short"
  }).format(s);
}
const de = {
  auto: { sv: "Auto", en: "Auto" },
  home: { sv: "Hemma", en: "Home" },
  away: { sv: "Borta", en: "Away" },
  comfort: { sv: "Komfort", en: "Comfort" },
  eco: { sv: "Eco", en: "Eco" },
  boost: { sv: "Boost", en: "Boost" },
  manual: { sv: "Manuell", en: "Manual" },
  disabled: { sv: "Avstängd", en: "Disabled" }
};
function Dt(e, t) {
  if (!t)
    return "–";
  const s = de[t];
  return s ? st(e) === "en" ? s.en : s.sv : t;
}
const zt = {
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
function ot(e, t) {
  if (!t)
    return "–";
  const s = t.replace(/_(already_in_state|blocked_by_min_runtime)$/, ""), i = zt[t] ?? zt[s];
  return i ? st(e) === "en" ? i.en : i.sv : t.replaceAll("_", " ");
}
function Y(e, t) {
  switch (t) {
    case "home":
      return o(e, "home");
    case "away":
      return o(e, "away");
    default:
      return o(e, "unknown");
  }
}
const Tt = L`
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
`, ce = L`
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
var pe = Object.defineProperty, ue = Object.getOwnPropertyDescriptor, C = (e, t, s, i) => {
  for (var a = i > 1 ? void 0 : i ? ue(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (a = (i ? n(t, s, a) : n(a)) || a);
  return i && a && pe(t, s, a), a;
};
const B = 520, nt = 236, b = { top: 14, right: 38, bottom: 30, left: 34 };
let w = class extends z {
  constructor() {
    super(...arguments), this.heatpump = [], this.radiator = [], this.outside = [], this.loading = !1, this.days = 7, this.hovered = null;
  }
  columns() {
    const e = /* @__PURE__ */ new Map();
    for (const t of this.heatpump)
      e.set(t.date, {
        date: t.date,
        heatpump: t.kwh,
        radiator: null,
        complete: t.complete
      });
    for (const t of this.radiator) {
      const s = e.get(t.date);
      s ? (s.radiator = t.kwh, s.complete = s.complete && t.complete) : e.set(t.date, {
        date: t.date,
        heatpump: null,
        radiator: t.kwh,
        complete: t.complete
      });
    }
    return [...e.values()].sort((t, s) => t.date.localeCompare(s.date)).slice(-this.days);
  }
  maxEnergy(e) {
    const t = e.map(
      (s) => (s.heatpump ?? 0) + (s.radiator ?? 0)
    );
    return Math.max(1, Math.ceil(Math.max(...t, 0)));
  }
  render() {
    const e = this.columns();
    if (!e.length)
      return h`<div class="empty">
        ${this.loading ? "…" : o(this.hass, "noData")}
      </div>`;
    const t = B - b.left - b.right, s = nt - b.top - b.bottom, i = this.maxEnergy(e), a = t / e.length, r = Math.min(30, a * 0.56), n = this.outside.map((c) => c.y).filter(Number.isFinite), d = n.length ? Math.min(...n) : 0, l = n.length ? Math.max(...n) : 1, g = Math.max(1, l - d), f = (c) => b.top + s - (c - d) / g * s, m = this.buildTempPath(e, f, b.left, a), $ = [0, 0.25, 0.5, 0.75, 1];
    return h`
      <div class="chart-wrap">
        <svg viewBox="0 0 ${B} ${nt}" role="img" aria-label=${o(this.hass, "energy")}>
          ${$.map((c) => {
      const y = b.top + s * c, A = i * (1 - c);
      return O`
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

          ${e.map((c, y) => {
      const A = b.left + y * a + a / 2 - r / 2, v = c.heatpump ?? 0, jt = c.radiator ?? 0, G = v / i * s, at = jt / i * s, gt = b.top + s;
      return O`
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
                ${G > 0 ? O`<rect x=${A} y=${gt - G} width=${r} height=${G}
                        rx="4" fill="var(--shc-blue)" opacity="0.92" />` : p}
                ${at > 0 ? O`<rect x=${A} y=${gt - G - at} width=${r}
                        height=${at} rx="4" fill="var(--shc-orange)" opacity="0.95" />` : p}
                ${c.complete ? p : O`<title>${o(this.hass, "incomplete")}</title>`}
              </g>
              <text
                class="axis-label"
                x=${b.left + y * a + a / 2}
                y=${nt - 10}
                text-anchor="middle"
              >
                ${Et(this.hass, c.date)}
              </text>
            `;
    })}

          ${m ? O`<path d=${m} fill="none" stroke="var(--shc-violet)"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />` : p}
          ${this.outside.slice(Math.max(0, this.outside.length - e.length)).map((c, y) => {
      const A = b.left + y * a + a / 2;
      return O`<circle cx=${A} cy=${f(c.y)} r="3"
                fill="var(--shc-card)" stroke="var(--shc-violet)" stroke-width="2" />`;
    })}
        </svg>

        ${this.hovered !== null && e[this.hovered] ? h`<div
                class="tooltip"
                style="left: ${(b.left + this.hovered * a + a / 2) / B * 100}%; top: 0;"
              >
                <strong>${Et(this.hass, e[this.hovered].date)}</strong
                ><br />
                Mitsubishi: ${u(this.hass, e[this.hovered].heatpump, 2)} kWh<br />
                Gnosjö: ${u(this.hass, e[this.hovered].radiator, 2)} kWh<br />
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
  buildTempPath(e, t, s, i) {
    if (this.outside.length < 2)
      return null;
    const a = Math.max(0, this.outside.length - e.length);
    return this.outside.slice(a, a + e.length).map((r, n) => {
      const d = s + n * i + i / 2, l = t(r.y);
      return `${n === 0 ? "M" : "L"}${d.toFixed(1)},${l.toFixed(1)}`;
    }).join(" ");
  }
};
w.styles = [ce];
C([
  _({ attribute: !1 })
], w.prototype, "hass", 2);
C([
  _({ attribute: !1 })
], w.prototype, "heatpump", 2);
C([
  _({ attribute: !1 })
], w.prototype, "radiator", 2);
C([
  _({ attribute: !1 })
], w.prototype, "outside", 2);
C([
  _({ type: Boolean })
], w.prototype, "loading", 2);
C([
  _({ type: Number })
], w.prototype, "days", 2);
C([
  k()
], w.prototype, "hovered", 2);
w = C([
  et("shc-energy-chart")
], w);
var me = Object.defineProperty, ge = Object.getOwnPropertyDescriptor, K = (e, t, s, i) => {
  for (var a = i > 1 ? void 0 : i ? ge(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (a = (i ? n(t, s, a) : n(a)) || a);
  return i && a && me(t, s, a), a;
};
const fe = [
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
  entity(e) {
    return this.zone?.entities?.[e];
  }
  async setNumber(e, t) {
    const s = this.entity(e);
    !s || !this.hass || await this.hass.callService("number", "set_value", {
      entity_id: s,
      value: t
    });
  }
  async toggleDryRun(e) {
    const t = this.entity("dry_run");
    !t || !this.hass || await this.hass.callService("switch", e ? "turn_on" : "turn_off", {
      entity_id: t
    });
  }
  async pressButton(e) {
    const t = this.entity(e);
    !t || !this.hass || await this.hass.callService("button", "press", { entity_id: t });
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
  async saveSchedule(e) {
    !this.hass || !this.zone?.entry_id || (await this.hass.callWS({
      type: "smart_heat_controller/set_schedule",
      entry_id: this.zone.entry_id,
      enabled: e.enabled,
      weekday: e.weekday,
      weekend: e.weekend
    }), this.notifyRefresh());
  }
  scheduleWithSegment(e, t, s, i = !1) {
    const a = this.currentSchedule(), r = [...a[e]];
    i ? r.splice(t, 1) : t >= r.length ? r.push({ start: "06:00", target: 21, ...s }) : r[t] = { ...r[t], ...s };
    const n = [...r].sort((d, l) => d.start.localeCompare(l.start));
    return { ...a, [e]: n };
  }
  async saveVacation(e, t) {
    !this.hass || !this.zone?.entry_id || (await this.hass.callWS({
      type: "smart_heat_controller/set_vacation",
      entry_id: this.zone.entry_id,
      start: e || null,
      end: t || null
    }), this.notifyRefresh());
  }
  renderProfile(e, t) {
    const i = this.currentSchedule()[e];
    return h`
      <div class="profile">
        <div class="profile-head">
          <strong>${t}</strong>
          <button
            class="link"
            @click=${() => this.saveSchedule(
      this.scheduleWithSegment(e, i.length, {})
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
        this.scheduleWithSegment(e, r, {
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
        this.scheduleWithSegment(e, r, {
          target: Number(n.target.value)
        })
      )}
                  />
                  <span class="hint">°C</span>
                  <button
                    class="link"
                    aria-label="Ta bort"
                    @click=${() => this.saveSchedule(
        this.scheduleWithSegment(e, r, {}, !0)
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
    const e = this.currentSchedule(), t = this.zone?.vacation, s = this.zone?.schedule_target;
    return h`
      <label class="field">
        <span>Använd veckoschema</span>
        <input
          type="checkbox"
          .checked=${e.enabled}
          @change=${(i) => this.saveSchedule({
      ...e,
      enabled: i.target.checked
    })}
        />
      </label>

      ${e.enabled && s != null ? h`<p class="hint">
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
            .value=${t?.start ?? ""}
            @change=${(i) => this.saveVacation(
      i.target.value,
      t?.end ?? null
    )}
          />
          <span class="hint">till</span>
          <input
            type="date"
            .value=${t?.end ?? ""}
            @change=${(i) => this.saveVacation(
      t?.start ?? null,
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
  async savePrice(e) {
    !this.hass || !this.zone?.entry_id || (await this.hass.callWS({
      type: "smart_heat_controller/set_price",
      entry_id: this.zone.entry_id,
      enabled: e.enabled,
      cheap: e.cheap_threshold,
      expensive: e.expensive_threshold,
      max_adjust: e.max_adjust,
      min_comfort: e.min_comfort
    }), this.notifyRefresh());
  }
  renderPrice() {
    const e = this.currentPrice(), t = this.zone?.price_decision, s = this.zone?.price?.sek_per_kwh;
    return h`
      <label class="field">
        <span>Aktivera prisoptimering</span>
        <input
          type="checkbox"
          .checked=${e.enabled}
          @change=${(i) => this.savePrice({
      ...e,
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
      e.cheap_threshold,
      0,
      10,
      0.05,
      (i) => this.savePrice({ ...e, cheap_threshold: i })
    )}
      ${this.numberField(
      "Dyrt över (SEK/kWh)",
      e.expensive_threshold,
      0,
      10,
      0.05,
      (i) => this.savePrice({ ...e, expensive_threshold: i })
    )}
      ${this.numberField(
      "Max justering (°C)",
      e.max_adjust,
      0,
      3,
      0.5,
      (i) => this.savePrice({ ...e, max_adjust: i ?? e.max_adjust })
    )}
      ${this.numberField(
      "Lägsta komfort (°C)",
      e.min_comfort,
      15,
      25,
      0.5,
      (i) => this.savePrice({ ...e, min_comfort: i ?? e.min_comfort })
    )}

      <p class="hint">
        Vid billigt pris höjs börvärdet högst ${u(this.hass, e.max_adjust, 1)} °C
        och bara när någon är hemma. Vid dyrt pris sänks det, men aldrig under
        ${u(this.hass, e.min_comfort, 1)} °C.
      </p>
      ${t && t.state !== "disabled" ? h`<p class="hint">
            Just nu: ${ot(this.hass, t.reason)}
            (${t.offset > 0 ? "+" : ""}${u(this.hass, t.offset, 1)} °C)
          </p>` : p}
    `;
  }
  numberField(e, t, s, i, a, r) {
    return h`
      <label class="field">
        <span>${e}</span>
        <input
          type="number"
          min=${s}
          max=${i}
          step=${a}
          .value=${t == null ? "" : String(t)}
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
          ${fe.map(
      (e) => h`
              <button
                class=${this.section === e.id ? "active" : ""}
                @click=${() => {
        this.section = e.id;
      }}
              >
                ${o(this.hass, e.key)}
              </button>
            `
    )}
        </nav>

        <div class="body">${this.renderSection()}</div>

        <footer>
          <button
            class="primary"
            @click=${() => {
      const e = new CustomEvent("shc-open-options", {
        bubbles: !0,
        composed: !0
      });
      this.dispatchEvent(e);
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
    const e = this.entity("dry_run"), t = e ? this.hass?.states[e]?.state === "on" : !1;
    return h`
      <label class="field">
        <span>${o(this.hass, "dryRun")}</span>
        <input
          type="checkbox"
          .checked=${t}
          @change=${(s) => this.toggleDryRun(s.target.checked)}
        />
      </label>
      <p class="hint">${t ? o(this.hass, "dryRunOn") : ""}</p>

      <div class="field readonly">
        <span>${o(this.hass, "presence")}</span>
        <strong>${Y(this.hass, this.zone?.presence)}</strong>
      </div>
      <div class="field readonly">
        <span>${o(this.hass, "mode")}</span>
        <strong>${Dt(this.hass, this.zone?.effective_mode)}</strong>
      </div>
      <div class="field readonly">
        <span>${o(this.hass, "lastDecision")}</span>
        <strong>${ot(this.hass, this.zone?.reason)}</strong>
      </div>
    `;
  }
  renderTemperatures() {
    const e = this.zone?.settings;
    return h`
      ${this.slider("home_target", o(this.hass, "roomTarget"), e?.home_target, 5, 30, 0.5)}
      ${this.slider("away_target", o(this.hass, "awayTarget"), e?.away_target, 5, 30, 0.5)}
      ${this.slider(
      "radiator_on_below",
      o(this.hass, "onBelow"),
      e?.radiator_on_below,
      5,
      30,
      0.5
    )}
      ${this.slider(
      "radiator_off_above",
      o(this.hass, "offAbove"),
      e?.radiator_off_above,
      5,
      30,
      0.5
    )}
      ${this.slider(
      "min_on_minutes",
      "Minsta ON-tid",
      e?.min_on_minutes,
      0,
      120,
      1
    )}
      ${this.slider(
      "min_off_minutes",
      "Minsta OFF-tid",
      e?.min_off_minutes,
      0,
      120,
      1
    )}
    `;
  }
  renderEnergy() {
    const e = this.zone?.radiator, t = this.zone?.heatpump, s = this.zone?.price;
    return h`
      <div class="field readonly">
        <span>${o(this.hass, "radiator")}</span>
        <strong>${u(this.hass, e?.power_w, 0)} W</strong>
      </div>
      <div class="field readonly">
        <span>${o(this.hass, "heatpump")}</span>
        <strong>${u(this.hass, t?.power_w, 0)} W</strong>
      </div>
      <div class="field readonly">
        <span>${o(this.hass, "today")} – Mitsubishi</span>
        <strong>${u(this.hass, t?.kwh_today, 2)} kWh</strong>
      </div>
      <div class="field readonly">
        <span>${o(this.hass, "today")} – Gnosjö</span>
        <strong>${u(this.hass, e?.kwh_today, 2)} kWh</strong>
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
    const e = this.entity("presence"), s = (e ? this.hass?.states[e] : void 0)?.attributes ?? {};
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
    const e = this.zone?.faults ?? [];
    return h`
      <div class="field readonly">
        <span>${o(this.hass, "faults")}</span>
        <strong>${e.length ? e.join(", ") : o(this.hass, "noFaults")}</strong>
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
        ${o(this.hass, "updated")}: ${Ht(this.hass, this.zone?.last_updated)}
      </p>
    `;
  }
  slider(e, t, s, i, a, r) {
    const n = !this.entity(e);
    return h`
      <label class="field">
        <span>${t}</span>
        <div class="slider">
          <input
            type="range"
            min=${i}
            max=${a}
            step=${r}
            .value=${String(s ?? i)}
            ?disabled=${n}
            @change=${(d) => this.setNumber(e, Number(d.target.value))}
          />
          <output>${u(this.hass, s, r < 1 ? 1 : 0)}</output>
        </div>
      </label>
    `;
  }
};
R.styles = [
  Tt,
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
  _({ attribute: !1 })
], R.prototype, "hass", 2);
K([
  _({ attribute: !1 })
], R.prototype, "zone", 2);
K([
  _({ type: Boolean, reflect: !0 })
], R.prototype, "open", 2);
K([
  k()
], R.prototype, "section", 2);
R = K([
  et("shc-settings-drawer")
], R);
var ve = Object.defineProperty, be = Object.getOwnPropertyDescriptor, S = (e, t, s, i) => {
  for (var a = i > 1 ? void 0 : i ? be(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (a = (i ? n(t, s, a) : n(a)) || a);
  return i && a && ve(t, s, a), a;
};
const ye = 3e4, $e = 5 * 6e4, _e = [
  { id: "auto", key: "auto", icon: "M12 3v2m0 14v2M5.6 5.6 7 7m10 10 1.4 1.4M3 12h2m14 0h2M5.6 18.4 7 17m10-10 1.4-1.4" },
  { id: "home", key: "home", icon: "M4 11 12 4l8 7v9H4z" },
  { id: "away", key: "away", icon: "M3 16h18l-2-5H5zM6 16v4m12-4v4" },
  { id: "boost", key: "boost", icon: "M5 15c4 0 4-9 9-9 3 0 5 2 5 5s-2 5-5 5H5z" }
];
let x = class extends z {
  constructor() {
    super(...arguments), this.zones = [], this.outside = [], this.drawerOpen = !1, this.chartDays = 7, this.pending = /* @__PURE__ */ new Set(), this.lastFetch = 0, this.lastHistory = 0;
  }
  setConfig(e) {
    this.config = e;
  }
  getCardSize() {
    return 14;
  }
  connectedCallback() {
    super.connectedCallback(), this.refresh(!0);
  }
  updated(e) {
    if (e.has("hass") && this.hass) {
      const t = Date.now();
      t - this.lastFetch > ye && this.refresh(), t - this.lastHistory > $e && this.loadOutsideHistory();
    }
  }
  async refresh(e = !1) {
    if (!(!this.hass || !e && Date.now() - this.lastFetch < 5e3)) {
      this.lastFetch = Date.now();
      try {
        const t = await this.hass.callWS({
          type: "smart_heat_controller/zones"
        });
        this.zones = t.zones ?? [];
        const s = this.config?.entry_id;
        this.zone = s ? this.zones.find((i) => i.entry_id === s) ?? this.zones[0] : this.zones[0], this.error = void 0, this.loadOutsideHistory();
      } catch (t) {
        this.error = t instanceof Error ? t.message : String(t);
      }
    }
  }
  async loadOutsideHistory() {
    const e = this.zone?.actuators?.outside_sensor;
    if (!(!this.hass || !e)) {
      this.lastHistory = Date.now();
      try {
        const t = /* @__PURE__ */ new Date(), s = new Date(t.getTime() - 336 * 3600 * 1e3), a = (await this.hass.callWS({
          type: "history/history_during_period",
          start_time: s.toISOString(),
          end_time: t.toISOString(),
          minimal_response: !1,
          no_attributes: !0,
          entity_ids: [e]
        }))?.[e] ?? [];
        this.outside = a.map((r) => ({ t: Number(r[0]), y: Number(r[1]) })).filter((r) => Number.isFinite(r.y));
      } catch {
        this.outside = [];
      }
    }
  }
  entity(e) {
    return this.zone?.entities?.[e];
  }
  stateValue(e) {
    const t = this.entity(e);
    return t ? this.hass?.states[t]?.state : void 0;
  }
  async setNumber(e, t) {
    const s = this.entity(e);
    if (!(!s || !this.hass)) {
      this.pending = new Set(this.pending).add(e), this.requestUpdate();
      try {
        await this.hass.callService("number", "set_value", {
          entity_id: s,
          value: t
        }), await this.refresh(!0);
      } finally {
        const i = new Set(this.pending);
        i.delete(e), this.pending = i;
      }
    }
  }
  async selectMode(e) {
    const t = this.entity("mode");
    !t || !this.hass || (e === "boost" ? await this.hass.callService(
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
      entity_id: t,
      option: e
    }), await this.refresh(!0));
  }
  async toggleRadiator() {
    const e = this.zone?.actuators?.switches ?? [];
    if (!e.length || !this.hass)
      return;
    const t = e.some(
      (s) => this.hass?.states[s]?.state === "on"
    );
    await this.hass.callService("smart_heat_controller", "set_mode", {
      entry_id: this.zone?.entry_id,
      mode: "manual",
      duration: 30
    }), await this.hass.callService("switch", t ? "turn_off" : "turn_on", {
      entity_id: e
    }), this.drawerOpen = !0;
  }
  async pressButton(e) {
    const t = this.entity(e);
    !t || !this.hass || (await this.hass.callService("button", "press", { entity_id: t }), await this.refresh(!0));
  }
  openOptions() {
    const e = this.zone?.entry_id, t = e ? `/config/integrations/integration/smart_heat_controller#config_entry=${e}` : "/config/integrations";
    history.pushState(null, "", t), window.dispatchEvent(new Event("location-changed"));
  }
  render() {
    if (this.error)
      return h`<div class="card">
        <h3>Smart Heat Controller</h3>
        <p class="empty">${this.error}</p>
      </div>`;
    if (!this.zone)
      return h`<div class="card"><p class="empty">…</p></div>`;
    const e = this.zone, t = e.settings, s = this.currentRoomTemperature(), i = this.heatpumpHeating(), a = this.radiatorOn(), r = e.mode ?? "auto", n = e.presence ?? "unknown", d = e.totals?.today ?? {}, l = e.totals?.week ?? {}, g = e.totals?.month ?? {}, f = e.costs?.today?.total ?? null, m = e.costs?.week?.total ?? null, $ = e.costs?.month?.total ?? null, c = e.savings, y = e.series, A = e.dry_run === !0;
    return h`
      <div class="shell">
        ${A ? h`<div class="banner">${o(this.hass, "dryRunOn")}</div>` : p}
        ${(e.faults ?? []).length ? h`<div class="banner">
              ${o(this.hass, "faults")}: ${(e.faults ?? []).join(", ")}
            </div>` : p}

        <div class="topbar">
          <div class="brand">
            <span aria-hidden="true">🔥</span>
            <span>Smart Heat Controller – ${e.name}</span>
          </div>
          <div class="row">
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
            ${e.image_url ? h`<img src=${e.image_url} alt="" />` : p}
            <div class="caption">
              <strong>${e.name}</strong>
              ${e.area ? h`<span class="muted">${e.area} m²</span>` : p}
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
              ${u(this.hass, t?.home_target, 1)} °C
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
              ${u(this.hass, t?.heatpump_target, 1)} °C
              <span class="muted">(${o(this.hass, "target")})</span>
            </div>
            <div class="spread" style="margin-top:8px">
              <span class="muted">${o(this.hass, "powerNow")}</span>
              <strong
                >${e.heatpump?.power_w != null ? `${u(this.hass, e.heatpump.power_w, 0)} W` : "–"}</strong
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
                >${e.radiator?.power_w != null ? `${u(this.hass, e.radiator.power_w, 0)} W` : "–"}</strong
              >
            </div>
            <div class="spread" style="margin-top:6px">
              <span class="muted">${o(this.hass, "todayShort")}</span>
              <strong>${u(this.hass, e.radiator?.kwh_today, 2)} kWh</strong>
            </div>
            <button style="margin-top:12px;width:100%" @click=${this.toggleRadiator}>
              ${a ? "Slå AV" : "Slå PÅ"} (30 min)
            </button>
          </div>

          <div class="card span2">
            <h3>${o(this.hass, "mode")}</h3>
            <div class="mode-grid">
              ${_e.map(
      (v) => h`
                  <button
                    class=${r === v.id ? "active" : ""}
                    @click=${() => this.selectMode(v.id)}
                  >
                    <svg viewBox="0 0 24 24"><path d=${v.icon} /></svg>
                    ${o(this.hass, v.key)}
                  </button>
                `
    )}
            </div>
            <div class="status-note">
              <span aria-hidden="true">✓</span>
              <div>
                <strong>${Dt(this.hass, e.effective_mode)}</strong>
                ${ot(this.hass, e.reason)}
              </div>
            </div>
          </div>

          <!-- Row 3 -->
          <div class="card span2">
            <div class="spread">
              <h3>${o(this.hass, "energy")}</h3>
              <div class="row">
                ${[7, 30].map(
      (v) => h`
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
      { label: o(this.hass, "today"), total: d.total, cost: f },
      { label: o(this.hass, "week"), total: l.total, cost: m },
      { label: o(this.hass, "month"), total: g.total, cost: $ }
    ].map(
      (v) => h`
                  <div class="cost-cell">
                    <small class="label">${v.label}</small>
                    <div class="kwh">
                      ${v.total ? u(this.hass, v.total.kwh, 2) : "–"} kWh
                    </div>
                    <div class="sek">
                      ≈ ${he(this.hass, v.cost)}
                      ${e.price?.includes_fees ? p : h`<span class="quality estimated"
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
              ${e.savings_warning ? h`<p class="muted" style="margin:8px 0 0">
                    ${e.savings_warning}
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
      t?.home_target
    )}
            ${this.quickRow(
      "away_target",
      o(this.hass, "awayTarget"),
      t?.away_target
    )}
            ${this.quickRow(
      "radiator_on_below",
      o(this.hass, "onBelow"),
      t?.radiator_on_below
    )}
            ${this.quickRow(
      "radiator_off_above",
      o(this.hass, "offAbove"),
      t?.radiator_off_above
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
              ${o(this.hass, "updated")}: ${Ht(this.hass, e.last_updated)}
            </p>
          </div>

          <div class="card span2">
            <h3>${o(this.hass, "presence")}</h3>
            <div class="status-list">
              ${(e.actuators?.presence_entities ?? []).map(
      (v) => h`
                  <div class="status-row">
                    <span>${v}</span>
                    <span class=${this.hass?.states[v]?.state === "home" ? "ok" : "bad"}>
                      ${this.hass?.states[v]?.state ?? "–"}
                    </span>
                  </div>
                `
    )}
              ${(e.actuators?.presence_entities ?? []).length === 0 ? h`<p class="empty">${o(this.hass, "noData")}</p>` : p}
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
        .zone=${e}
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
    const e = this.zone?.savings, t = this.zone?.baseline, s = Math.max(
      e?.baseline_kwh_per_day ?? 0,
      e?.comparison_kwh_per_day ?? 0,
      1e-3
    );
    if (!e?.has_result)
      return h`
        <p class="empty">${o(this.hass, "noBaseline")}</p>
        <p class="muted">${o(this.hass, "baselineHint")}</p>
        <div class="row">
          <button @click=${() => this.pressButton("start_baseline")}>
            ${o(this.hass, "startBaseline")}
          </button>
          ${t?.active ? h`<button @click=${() => this.pressButton("stop_baseline")}>
                ${o(this.hass, "stopBaseline")}
              </button>` : p}
        </div>
      `;
    const i = e.baseline_kwh_per_day ?? 0, a = e.comparison_kwh_per_day ?? 0;
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
          ${o(this.hass, "before")}<br />(${e.baseline_days} ${"dygn"})
        </div>
        <div>
          ${o(this.hass, "after")}<br />(${e.comparison_days} ${"dygn"})
        </div>
      </div>
      <ul class="checklist">
        <li class=${e.baseline_quality === "measured" ? "" : "warn"}>
          ${e.baseline_quality === "measured" ? "Verkligen mätta data i baslinjen" : "Baslinjen är ofullständig"}
        </li>
        <li class=${e.comparison_quality === "measured" ? "" : "warn"}>
          ${e.comparison_quality === "measured" ? "Verkligen mätta data i jämförelsen" : "Jämförelsen är ofullständig"}
        </li>
        <li class=${e.limited_to_radiator ? "warn" : ""}>
          ${e.limited_to_radiator ? "Endast elementets el mäts" : "Mitsubishi + Shelly mäts"}
        </li>
        <li>
          ${e.baseline_start ?? "–"} → ${e.baseline_end ?? "–"}
        </li>
        <li class=${e.weather_adjustment_available ? "" : "warn"}>
          ${e.weather_adjustment_available ? `Väderkorrigerat: ${u(
      this.hass,
      Math.abs(e.weather_adjusted_percent ?? 0),
      0
    )} % ${(e.weather_adjusted_percent ?? 0) < 0 ? "ökning" : "minskning"} (${u(this.hass, e.baseline_hdd, 0)} → ${u(
      this.hass,
      e.comparison_hdd,
      0
    )} graddygn)` : "Väderkorrigering saknas – utetemperatur behövs"}
        </li>
      </ul>
      ${e.weather_adjustment_available ? h`<p class="muted" style="margin:6px 0 0;font-size:11.5px">
            Graddagsnormaliserat mått (bastemp 17 °C). Tar inte hänsyn till
            solinstrålning, vind, internvärme eller ändrat nyttjande – det är en
            uppskattning, inte ett bevis.
          </p>` : p}
    `;
  }
  quickRow(e, t, s) {
    const i = !this.entity(e);
    return h`
      <div class="quick-row">
        <span class="quick-name">${t}</span>
        <input
          type="range"
          min="5"
          max="30"
          step="0.5"
          .value=${String(s ?? 20)}
          ?disabled=${i}
          @change=${(a) => this.setNumber(e, Number(a.target.value))}
        />
        <output>${u(this.hass, s, 1)} °C</output>
      </div>
    `;
  }
  statusRow(e, t, s = !1) {
    const i = this.stateValue(e), a = s ? i === "off" : i === "on";
    return h`
      <div class="status-row">
        <span>${t}</span>
        <span class=${a ? "ok" : "bad"}>
          ${a ? o(this.hass, "online") : o(this.hass, "offline")}
        </span>
      </div>
    `;
  }
  currentRoomTemperature() {
    const e = this.entity("room_temperature"), t = e ? this.hass?.states[e]?.state : void 0, s = t !== void 0 ? Number(t) : NaN;
    return Number.isFinite(s) ? s : this.zone?.room_temperature ?? null;
  }
  outsideTemperature() {
    const e = this.zone?.actuators?.outside_sensor;
    if (!e)
      return null;
    const t = this.hass?.states[e]?.state, s = t !== void 0 ? Number(t) : NaN;
    return Number.isFinite(s) ? s : null;
  }
  heatpumpHeating() {
    const e = this.zone?.actuators?.climate;
    if (!e)
      return !1;
    const t = this.hass?.states[e]?.state;
    return t !== void 0 && !["off", "unavailable", "unknown"].includes(t);
  }
  radiatorOn() {
    return (this.zone?.actuators?.switches ?? []).some(
      (t) => this.hass?.states[t]?.state === "on"
    );
  }
};
x.styles = [
  Tt,
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
S([
  _({ attribute: !1 })
], x.prototype, "hass", 2);
S([
  k()
], x.prototype, "config", 2);
S([
  k()
], x.prototype, "zone", 2);
S([
  k()
], x.prototype, "zones", 2);
S([
  k()
], x.prototype, "outside", 2);
S([
  k()
], x.prototype, "drawerOpen", 2);
S([
  k()
], x.prototype, "chartDays", 2);
S([
  k()
], x.prototype, "error", 2);
S([
  k()
], x.prototype, "pending", 2);
x = S([
  et("smart-heat-dashboard")
], x);
var xe = Object.defineProperty, we = Object.getOwnPropertyDescriptor, mt = (e, t, s, i) => {
  for (var a = i > 1 ? void 0 : i ? we(t, s) : t, r = e.length - 1, n; r >= 0; r--)
    (n = e[r]) && (a = (i ? n(t, s, a) : n(a)) || a);
  return i && a && xe(t, s, a), a;
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
mt([
  _({ attribute: !1 })
], q.prototype, "hass", 2);
mt([
  _({ type: Boolean })
], q.prototype, "narrow", 2);
q = mt([
  et("smart-heat-panel")
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
  x as SmartHeatDashboard
};
