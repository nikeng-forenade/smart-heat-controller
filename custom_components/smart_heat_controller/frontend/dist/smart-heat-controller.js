/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const J = globalThis, pe = J.ShadowRoot && (J.ShadyCSS === void 0 || J.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ue = Symbol(), $e = /* @__PURE__ */ new WeakMap();
let Ne = class {
  constructor(e, s, a) {
    if (this._$cssResult$ = !0, a !== ue) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (pe && e === void 0) {
      const a = s !== void 0 && s.length === 1;
      a && (e = $e.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), a && $e.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const qe = (t) => new Ne(typeof t == "string" ? t : t + "", void 0, ue), K = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((a, i, r) => a + ((n) => {
    if (n._$cssResult$ === !0) return n.cssText;
    if (typeof n == "number") return n;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + n + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + t[r + 1], t[0]);
  return new Ne(s, t, ue);
}, Le = (t, e) => {
  if (pe) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const a = document.createElement("style"), i = J.litNonce;
    i !== void 0 && a.setAttribute("nonce", i), a.textContent = s.cssText, t.appendChild(a);
  }
}, _e = pe ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const a of e.cssRules) s += a.cssText;
  return qe(s);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Ve, defineProperty: Ke, getOwnPropertyDescriptor: Ze, getOwnPropertyNames: Ge, getOwnPropertySymbols: Ye, getPrototypeOf: Je } = Object, te = globalThis, xe = te.trustedTypes, Qe = xe ? xe.emptyScript : "", Xe = te.reactiveElementPolyfillSupport, F = (t, e) => t, X = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? Qe : null;
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
} }, me = (t, e) => !Ve(t, e), we = { attribute: !0, type: String, converter: X, reflect: !1, useDefault: !1, hasChanged: me };
Symbol.metadata ??= Symbol("metadata"), te.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let j = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = we) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const a = Symbol(), i = this.getPropertyDescriptor(e, a, s);
      i !== void 0 && Ke(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, s, a) {
    const { get: i, set: r } = Ze(this.prototype, e) ?? { get() {
      return this[s];
    }, set(n) {
      this[s] = n;
    } };
    return { get: i, set(n) {
      const l = i?.call(this);
      r?.call(this, n), this.requestUpdate(e, l, a);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? we;
  }
  static _$Ei() {
    if (this.hasOwnProperty(F("elementProperties"))) return;
    const e = Je(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(F("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(F("properties"))) {
      const s = this.properties, a = [...Ge(s), ...Ye(s)];
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
      for (const i of a) s.unshift(_e(i));
    } else e !== void 0 && s.push(_e(e));
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
    return Le(e, this.constructor.elementStyles), e;
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
      const r = (a.converter?.toAttribute !== void 0 ? a.converter : X).toAttribute(s, a.type);
      this._$Em = e, r == null ? this.removeAttribute(i) : this.setAttribute(i, r), this._$Em = null;
    }
  }
  _$AK(e, s) {
    const a = this.constructor, i = a._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const r = a.getPropertyOptions(i), n = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : X;
      this._$Em = i;
      const l = n.fromAttribute(s, r.type);
      this[i] = l ?? this._$Ej?.get(i) ?? l, this._$Em = null;
    }
  }
  requestUpdate(e, s, a, i = !1, r) {
    if (e !== void 0) {
      const n = this.constructor;
      if (i === !1 && (r = this[e]), a ??= n.getPropertyOptions(e), !((a.hasChanged ?? me)(r, s) || a.useDefault && a.reflect && r === this._$Ej?.get(e) && !this.hasAttribute(n._$Eu(e, a)))) return;
      this.C(e, s, a);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, s, { useDefault: a, reflect: i, wrapped: r }, n) {
    a && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, n ?? s ?? this[e]), r !== !0 || n !== void 0) || (this._$AL.has(e) || (this.hasUpdated || a || (s = void 0), this._$AL.set(e, s)), i === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
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
        for (const [i, r] of this._$Ep) this[i] = r;
        this._$Ep = void 0;
      }
      const a = this.constructor.elementProperties;
      if (a.size > 0) for (const [i, r] of a) {
        const { wrapped: n } = r, l = this[i];
        n !== !0 || this._$AL.has(i) || l === void 0 || this.C(i, void 0, r, l);
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
j.elementStyles = [], j.shadowRootOptions = { mode: "open" }, j[F("elementProperties")] = /* @__PURE__ */ new Map(), j[F("finalized")] = /* @__PURE__ */ new Map(), Xe?.({ ReactiveElement: j }), (te.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ge = globalThis, ke = (t) => t, ee = ge.trustedTypes, Se = ee ? ee.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, Re = "$lit$", H = `lit$${Math.random().toFixed(9).slice(2)}$`, De = "?" + H, et = `<${De}>`, R = document, W = () => R.createComment(""), q = (t) => t === null || typeof t != "object" && typeof t != "function", ve = Array.isArray, tt = (t) => ve(t) || typeof t?.[Symbol.iterator] == "function", he = `[ 	
\f\r]`, U = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Ae = /-->/g, Ee = />/g, M = RegExp(`>|${he}(?:([^\\s"'>=/]+)(${he}*=${he}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ze = /'/g, Ce = /"/g, Te = /^(?:script|style|textarea|title)$/i, je = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), d = je(1), C = je(2), B = Symbol.for("lit-noChange"), c = Symbol.for("lit-nothing"), He = /* @__PURE__ */ new WeakMap(), N = R.createTreeWalker(R, 129);
function Be(t, e) {
  if (!ve(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return Se !== void 0 ? Se.createHTML(e) : e;
}
const st = (t, e) => {
  const s = t.length - 1, a = [];
  let i, r = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", n = U;
  for (let l = 0; l < s; l++) {
    const h = t[l];
    let g, f, u = -1, $ = 0;
    for (; $ < h.length && (n.lastIndex = $, f = n.exec(h), f !== null); ) $ = n.lastIndex, n === U ? f[1] === "!--" ? n = Ae : f[1] !== void 0 ? n = Ee : f[2] !== void 0 ? (Te.test(f[2]) && (i = RegExp("</" + f[2], "g")), n = M) : f[3] !== void 0 && (n = M) : n === M ? f[0] === ">" ? (n = i ?? U, u = -1) : f[1] === void 0 ? u = -2 : (u = n.lastIndex - f[2].length, g = f[1], n = f[3] === void 0 ? M : f[3] === '"' ? Ce : ze) : n === Ce || n === ze ? n = M : n === Ae || n === Ee ? n = U : (n = M, i = void 0);
    const v = n === M && t[l + 1].startsWith("/>") ? " " : "";
    r += n === U ? h + et : u >= 0 ? (a.push(g), h.slice(0, u) + Re + h.slice(u) + H + v) : h + H + (u === -2 ? l : v);
  }
  return [Be(t, r + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), a];
};
class L {
  constructor({ strings: e, _$litType$: s }, a) {
    let i;
    this.parts = [];
    let r = 0, n = 0;
    const l = e.length - 1, h = this.parts, [g, f] = st(e, s);
    if (this.el = L.createElement(g, a), N.currentNode = this.el.content, s === 2 || s === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (i = N.nextNode()) !== null && h.length < l; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const u of i.getAttributeNames()) if (u.endsWith(Re)) {
          const $ = f[n++], v = i.getAttribute(u).split(H), E = /([.?@])?(.*)/.exec($);
          h.push({ type: 1, index: r, name: E[2], strings: v, ctor: E[1] === "." ? it : E[1] === "?" ? rt : E[1] === "@" ? nt : se }), i.removeAttribute(u);
        } else u.startsWith(H) && (h.push({ type: 6, index: r }), i.removeAttribute(u));
        if (Te.test(i.tagName)) {
          const u = i.textContent.split(H), $ = u.length - 1;
          if ($ > 0) {
            i.textContent = ee ? ee.emptyScript : "";
            for (let v = 0; v < $; v++) i.append(u[v], W()), N.nextNode(), h.push({ type: 2, index: ++r });
            i.append(u[$], W());
          }
        }
      } else if (i.nodeType === 8) if (i.data === De) h.push({ type: 2, index: r });
      else {
        let u = -1;
        for (; (u = i.data.indexOf(H, u + 1)) !== -1; ) h.push({ type: 7, index: r }), u += H.length - 1;
      }
      r++;
    }
  }
  static createElement(e, s) {
    const a = R.createElement("template");
    return a.innerHTML = e, a;
  }
}
function I(t, e, s = t, a) {
  if (e === B) return e;
  let i = a !== void 0 ? s._$Co?.[a] : s._$Cl;
  const r = q(e) ? void 0 : e._$litDirective$;
  return i?.constructor !== r && (i?._$AO?.(!1), r === void 0 ? i = void 0 : (i = new r(t), i._$AT(t, s, a)), a !== void 0 ? (s._$Co ??= [])[a] = i : s._$Cl = i), i !== void 0 && (e = I(t, i._$AS(t, e.values), i, a)), e;
}
class at {
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
    const { el: { content: s }, parts: a } = this._$AD, i = (e?.creationScope ?? R).importNode(s, !0);
    N.currentNode = i;
    let r = N.nextNode(), n = 0, l = 0, h = a[0];
    for (; h !== void 0; ) {
      if (n === h.index) {
        let g;
        h.type === 2 ? g = new Z(r, r.nextSibling, this, e) : h.type === 1 ? g = new h.ctor(r, h.name, h.strings, this, e) : h.type === 6 && (g = new ot(r, this, e)), this._$AV.push(g), h = a[++l];
      }
      n !== h?.index && (r = N.nextNode(), n++);
    }
    return N.currentNode = R, i;
  }
  p(e) {
    let s = 0;
    for (const a of this._$AV) a !== void 0 && (a.strings !== void 0 ? (a._$AI(e, a, s), s += a.strings.length - 2) : a._$AI(e[s])), s++;
  }
}
class Z {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, s, a, i) {
    this.type = 2, this._$AH = c, this._$AN = void 0, this._$AA = e, this._$AB = s, this._$AM = a, this.options = i, this._$Cv = i?.isConnected ?? !0;
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
    e = I(this, e, s), q(e) ? e === c || e == null || e === "" ? (this._$AH !== c && this._$AR(), this._$AH = c) : e !== this._$AH && e !== B && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : tt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== c && q(this._$AH) ? this._$AA.nextSibling.data = e : this.T(R.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: s, _$litType$: a } = e, i = typeof a == "number" ? this._$AC(e) : (a.el === void 0 && (a.el = L.createElement(Be(a.h, a.h[0]), this.options)), a);
    if (this._$AH?._$AD === i) this._$AH.p(s);
    else {
      const r = new at(i, this), n = r.u(this.options);
      r.p(s), this.T(n), this._$AH = r;
    }
  }
  _$AC(e) {
    let s = He.get(e.strings);
    return s === void 0 && He.set(e.strings, s = new L(e)), s;
  }
  k(e) {
    ve(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let a, i = 0;
    for (const r of e) i === s.length ? s.push(a = new Z(this.O(W()), this.O(W()), this, this.options)) : a = s[i], a._$AI(r), i++;
    i < s.length && (this._$AR(a && a._$AB.nextSibling, i), s.length = i);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); e !== this._$AB; ) {
      const a = ke(e).nextSibling;
      ke(e).remove(), e = a;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
let se = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, s, a, i, r) {
    this.type = 1, this._$AH = c, this._$AN = void 0, this.element = e, this.name = s, this._$AM = i, this.options = r, a.length > 2 || a[0] !== "" || a[1] !== "" ? (this._$AH = Array(a.length - 1).fill(new String()), this.strings = a) : this._$AH = c;
  }
  _$AI(e, s = this, a, i) {
    const r = this.strings;
    let n = !1;
    if (r === void 0) e = I(this, e, s, 0), n = !q(e) || e !== this._$AH && e !== B, n && (this._$AH = e);
    else {
      const l = e;
      let h, g;
      for (e = r[0], h = 0; h < r.length - 1; h++) g = I(this, l[a + h], s, h), g === B && (g = this._$AH[h]), n ||= !q(g) || g !== this._$AH[h], g === c ? e = c : e !== c && (e += (g ?? "") + r[h + 1]), this._$AH[h] = g;
    }
    n && !i && this.j(e);
  }
  j(e) {
    e === c ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
};
class it extends se {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === c ? void 0 : e;
  }
}
class rt extends se {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== c);
  }
}
class nt extends se {
  constructor(e, s, a, i, r) {
    super(e, s, a, i, r), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = I(this, e, s, 0) ?? c) === B) return;
    const a = this._$AH, i = e === c && a !== c || e.capture !== a.capture || e.once !== a.once || e.passive !== a.passive, r = e !== c && (a === c || i);
    i && this.element.removeEventListener(this.name, this, a), r && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class ot {
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
const lt = ge.litHtmlPolyfillSupport;
lt?.(L, Z), (ge.litHtmlVersions ??= []).push("3.3.3");
const ht = (t, e, s) => {
  const a = s?.renderBefore ?? e;
  let i = a._$litPart$;
  if (i === void 0) {
    const r = s?.renderBefore ?? null;
    a._$litPart$ = i = new Z(e.insertBefore(W(), r), r, void 0, s ?? {});
  }
  return i._$AI(t), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const fe = globalThis;
class O extends j {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ht(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return B;
  }
}
O._$litElement$ = !0, O.finalized = !0, fe.litElementHydrateSupport?.({ LitElement: O });
const dt = fe.litElementPolyfillSupport;
dt?.({ LitElement: O });
(fe.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ae = (t) => (e, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ct = { attribute: !0, type: String, converter: X, reflect: !1, hasChanged: me }, pt = (t = ct, e, s) => {
  const { kind: a, metadata: i } = s;
  let r = globalThis.litPropertyMetadata.get(i);
  if (r === void 0 && globalThis.litPropertyMetadata.set(i, r = /* @__PURE__ */ new Map()), a === "setter" && ((t = Object.create(t)).wrapped = !0), r.set(s.name, t), a === "accessor") {
    const { name: n } = s;
    return { set(l) {
      const h = e.get.call(this);
      e.set.call(this, l), this.requestUpdate(n, h, t, !0, l);
    }, init(l) {
      return l !== void 0 && this.C(n, void 0, t, l), l;
    } };
  }
  if (a === "setter") {
    const { name: n } = s;
    return function(l) {
      const h = this[n];
      e.call(this, l), this.requestUpdate(n, h, t, !0, l);
    };
  }
  throw Error("Unsupported decorator location: " + a);
};
function x(t) {
  return (e, s) => typeof s == "object" ? pt(t, e, s) : ((a, i, r) => {
    const n = i.hasOwnProperty(r);
    return i.constructor.createProperty(r, a), n ? Object.getOwnPropertyDescriptor(i, r) : void 0;
  })(t, e, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function S(t) {
  return x({ ...t, state: !0, attribute: !1 });
}
function ie(t) {
  return (t?.locale?.language ?? t?.language ?? "sv").toLowerCase().startsWith("en") ? "en" : "sv";
}
const ut = {
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
    demo: "Demo data"
  }
};
function o(t, e) {
  return ut[ie(t)][e];
}
function re(t) {
  return ie(t) === "en" ? "en-SE" : "sv-SE";
}
function p(t, e, s = 1) {
  return e == null || Number.isNaN(e) ? "–" : new Intl.NumberFormat(re(t), {
    minimumFractionDigits: s,
    maximumFractionDigits: s
  }).format(e);
}
function mt(t, e) {
  return e == null || Number.isNaN(e) ? "–" : new Intl.NumberFormat(re(t), {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(e);
}
function Ie(t, e) {
  if (!e)
    return "–";
  const s = new Date(e);
  return Number.isNaN(s.getTime()) ? "–" : new Intl.DateTimeFormat(re(t), {
    hour: "2-digit",
    minute: "2-digit"
  }).format(s);
}
function Oe(t, e) {
  const s = /* @__PURE__ */ new Date(`${e}T12:00:00`);
  return Number.isNaN(s.getTime()) ? e : new Intl.DateTimeFormat(re(t), {
    day: "numeric",
    month: "short"
  }).format(s);
}
const gt = {
  auto: { sv: "Auto", en: "Auto" },
  home: { sv: "Hemma", en: "Home" },
  away: { sv: "Borta", en: "Away" },
  comfort: { sv: "Komfort", en: "Comfort" },
  eco: { sv: "Eco", en: "Eco" },
  boost: { sv: "Boost", en: "Boost" },
  manual: { sv: "Manuell", en: "Manual" },
  disabled: { sv: "Avstängd", en: "Disabled" }
};
function Ue(t, e) {
  if (!e)
    return "–";
  const s = gt[e];
  return s ? ie(t) === "en" ? s.en : s.sv : e;
}
const Pe = {
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
function ce(t, e) {
  if (!e)
    return "–";
  const s = e.replace(/_(already_in_state|blocked_by_min_runtime)$/, ""), a = Pe[e] ?? Pe[s];
  return a ? ie(t) === "en" ? a.en : a.sv : e.replaceAll("_", " ");
}
function Q(t, e) {
  switch (e) {
    case "home":
      return o(t, "home");
    case "away":
      return o(t, "away");
    default:
      return o(t, "unknown");
  }
}
const Fe = K`
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
`, vt = K`
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
var ft = Object.defineProperty, bt = Object.getOwnPropertyDescriptor, P = (t, e, s, a) => {
  for (var i = a > 1 ? void 0 : a ? bt(e, s) : e, r = t.length - 1, n; r >= 0; r--)
    (n = t[r]) && (i = (a ? n(e, s, i) : n(i)) || i);
  return a && i && ft(e, s, i), i;
};
const T = 520, de = 236, b = { top: 14, right: 38, bottom: 30, left: 34 };
function yt(t) {
  const e = String(t.getMonth() + 1).padStart(2, "0"), s = String(t.getDate()).padStart(2, "0");
  return `${t.getFullYear()}-${e}-${s}`;
}
let z = class extends O {
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
      return d`<div class="empty">
        ${this.loading ? "…" : o(this.hass, "noData")}
      </div>`;
    const e = T - b.left - b.right, s = de - b.top - b.bottom, a = this.maxEnergy(t), i = e / t.length, r = Math.min(30, i * 0.56), n = this.dailyTemps(), l = t.map((y) => n.get(y.date)).filter((y) => y !== void 0), h = l.length ? Math.min(...l) : 0, g = l.length ? Math.max(...l) : 1, f = Math.max(1, g - h), u = (y) => b.top + s - (y - h) / f * s, $ = l.length > 1 ? this.buildTempPath(t, n, u, b.left, i) : null, v = f < 4 ? 1 : 0, E = [0, 0.25, 0.5, 0.75, 1], ne = a / (E.length - 1), m = Number.isInteger(ne) ? 0 : 1;
    return d`
      <div class="chart-wrap">
        <svg viewBox="0 0 ${T} ${de}" role="img" aria-label=${o(this.hass, "energy")}>
          ${E.map((y) => {
      const w = b.top + s * y, k = a * (1 - y);
      return C`
              <line class="grid-line" x1=${b.left} y1=${w} x2=${T - b.right} y2=${w} />
              <text class="axis-label" x=${b.left - 6} y=${w + 3} text-anchor="end">
                ${p(this.hass, k, m)}
              </text>
            `;
    })}
          <text class="axis-label" x=${b.left - 6} y=${b.top - 4} text-anchor="end">
            kWh
          </text>
          <text
            class="axis-label"
            x=${T - b.right + 6}
            y=${b.top - 4}
            text-anchor="start"
          >
            °C
          </text>
          ${l.length ? [0.25, 0.75].map((y) => {
      const w = b.top + s * y, k = g - f * y;
      return C`
                  <text class="axis-label" x=${T - b.right + 6} y=${w + 3} text-anchor="start">
                    ${p(this.hass, k, v)}
                  </text>
                `;
    }) : c}

          ${t.map((y, w) => {
      const k = b.left + w * i + i / 2 - r / 2, oe = y.heatpump ?? 0, We = y.radiator ?? 0, Y = oe / a * s, le = We / a * s, ye = b.top + s;
      return C`
              <g
                @mouseenter=${() => {
        this.hovered = w;
      }}
                @mouseleave=${() => {
        this.hovered = null;
      }}
              >
                <rect
                  x=${k - i * 0.22}
                  y=${b.top}
                  width=${i}
                  height=${s}
                  fill="transparent"
                />
                ${Y > 0 ? C`<rect x=${k} y=${ye - Y} width=${r} height=${Y}
                        rx="4" fill="var(--shc-blue)" opacity="0.92" />` : c}
                ${le > 0 ? C`<rect x=${k} y=${ye - Y - le} width=${r}
                        height=${le} rx="4" fill="var(--shc-orange)" opacity="0.95" />` : c}
                ${y.complete ? c : C`<title>${o(this.hass, "incomplete")}</title>`}
              </g>
              <text
                class="axis-label"
                x=${b.left + w * i + i / 2}
                y=${de - 10}
                text-anchor="middle"
              >
                ${Oe(this.hass, y.date)}
              </text>
            `;
    })}

          ${$ ? C`<path d=${$} fill="none" stroke="var(--shc-violet)"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />` : c}
          ${t.map((y, w) => {
      const k = n.get(y.date);
      if (k === void 0)
        return c;
      const oe = b.left + w * i + i / 2;
      return C`<circle cx=${oe} cy=${u(k)} r="3"
              fill="var(--shc-card)" stroke="var(--shc-violet)" stroke-width="2">
              <title>${p(this.hass, k, v)} °C</title>
            </circle>`;
    })}
        </svg>

        ${this.hovered !== null && t[this.hovered] ? d`<div
                class="tooltip"
                style="left: ${(b.left + this.hovered * i + i / 2) / T * 100}%; top: 0;"
              >
                <strong>${Oe(this.hass, t[this.hovered].date)}</strong
                ><br />
                Mitsubishi: ${p(this.hass, t[this.hovered].heatpump, 2)} kWh<br />
                Gnosjö: ${p(this.hass, t[this.hovered].radiator, 2)} kWh<br />
                ${n.has(t[this.hovered].date) ? `Ute: ${p(this.hass, n.get(t[this.hovered].date), 1)} °C` : ""}
              </div>` : c}
      </div>

      <div class="legend">
        <span><i class="swatch" style="background: var(--shc-blue)"></i>Mitsubishi (kWh)</span>
        <span><i class="swatch" style="background: var(--shc-orange)"></i>Gnosjö (kWh)</span>
        <span><i class="swatch" style="background: var(--shc-violet)"></i
          >${o(this.hass, "outside")} (°C)</span>
      </div>
    `;
  }
  /** Mean outside temperature per local day, keyed like the energy dates. */
  dailyTemps() {
    const t = /* @__PURE__ */ new Map();
    for (const e of this.outside) {
      if (!Number.isFinite(e.t) || !Number.isFinite(e.y))
        continue;
      const s = yt(new Date(e.t)), a = t.get(s) ?? { sum: 0, count: 0 };
      a.sum += e.y, a.count += 1, t.set(s, a);
    }
    return new Map(
      [...t].map(([e, s]) => [e, s.sum / s.count])
    );
  }
  buildTempPath(t, e, s, a, i) {
    const r = [];
    return t.forEach((n, l) => {
      const h = e.get(n.date);
      if (h === void 0)
        return;
      const g = a + l * i + i / 2;
      r.push(`${g.toFixed(1)},${s(h).toFixed(1)}`);
    }), r.map((n, l) => `${l === 0 ? "M" : "L"}${n}`).join(" ");
  }
};
z.styles = [vt];
P([
  x({ attribute: !1 })
], z.prototype, "hass", 2);
P([
  x({ attribute: !1 })
], z.prototype, "heatpump", 2);
P([
  x({ attribute: !1 })
], z.prototype, "radiator", 2);
P([
  x({ attribute: !1 })
], z.prototype, "outside", 2);
P([
  x({ type: Boolean })
], z.prototype, "loading", 2);
P([
  x({ type: Number })
], z.prototype, "days", 2);
P([
  S()
], z.prototype, "hovered", 2);
z = P([
  ae("shc-energy-chart")
], z);
var $t = Object.defineProperty, _t = Object.getOwnPropertyDescriptor, G = (t, e, s, a) => {
  for (var i = a > 1 ? void 0 : a ? _t(e, s) : e, r = t.length - 1, n; r >= 0; r--)
    (n = t[r]) && (i = (a ? n(e, s, i) : n(i)) || i);
  return a && i && $t(e, s, i), i;
};
const xt = [
  { id: "general", key: "general" },
  { id: "temperatures", key: "temperatures" },
  { id: "schedule", key: "schedule" },
  { id: "price", key: "price" },
  { id: "energy", key: "energyMetering" },
  { id: "presence", key: "presence" },
  { id: "advanced", key: "advanced" }
];
let D = class extends O {
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
  scheduleWithSegment(t, e, s, a = !1) {
    const i = this.currentSchedule(), r = [...i[t]];
    a ? r.splice(e, 1) : e >= r.length ? r.push({ start: "06:00", target: 21, ...s }) : r[e] = { ...r[e], ...s };
    const n = [...r].sort((l, h) => l.start.localeCompare(h.start));
    return { ...i, [t]: n };
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
    return d`
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
        ${a.length === 0 ? d`<p class="hint">Inga tider – schemat påverkar inte zonen.</p>` : a.map(
      (i, r) => d`
                <div class="segment">
                  <input
                    type="time"
                    .value=${i.start}
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
                    .value=${String(i.target)}
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
    return d`
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

      ${t.enabled && s != null ? d`<p class="hint">
            Schemat sätter nu <strong>${p(this.hass, s, 1)} °C</strong>.
            Elementets trösklar följer med automatiskt.
          </p>` : d`<p class="hint">
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
    return d`
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
          ${s != null ? `${p(this.hass, s, 2)} SEK/kWh` : "inget pris valt"}
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
        Vid billigt pris höjs börvärdet högst ${p(this.hass, t.max_adjust, 1)} °C
        och bara när någon är hemma. Vid dyrt pris sänks det, men aldrig under
        ${p(this.hass, t.min_comfort, 1)} °C.
      </p>
      ${e && e.state !== "disabled" ? d`<p class="hint">
            Just nu: ${ce(this.hass, e.reason)}
            (${e.offset > 0 ? "+" : ""}${p(this.hass, e.offset, 1)} °C)
          </p>` : c}
    `;
  }
  numberField(t, e, s, a, i, r) {
    return d`
      <label class="field">
        <span>${t}</span>
        <input
          type="number"
          min=${s}
          max=${a}
          step=${i}
          .value=${e == null ? "" : String(e)}
          @change=${(n) => {
      const l = n.target.value;
      r(l === "" ? null : Number(l));
    }}
        />
      </label>
    `;
  }
  render() {
    return this.open ? d`
      <div class="backdrop" @click=${this.close}></div>
      <aside class="drawer" role="dialog" aria-modal="true" aria-label=${o(this.hass, "settings")}>
        <header>
          <h2>${o(this.hass, "settings")} – ${this.zone?.name ?? ""}</h2>
          <button class="icon" aria-label=${o(this.hass, "close")} @click=${this.close}>
            ✕
          </button>
        </header>

        <nav>
          ${xt.map(
      (t) => d`
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
    ` : c;
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
    return d`
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
        <strong>${Q(this.hass, this.zone?.presence)}</strong>
      </div>
      <div class="field readonly">
        <span>${o(this.hass, "mode")}</span>
        <strong>${Ue(this.hass, this.zone?.effective_mode)}</strong>
      </div>
      <div class="field readonly">
        <span>${o(this.hass, "lastDecision")}</span>
        <strong>${ce(this.hass, this.zone?.reason)}</strong>
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
    return d`
      <label class="field">
        <span>${o(this.hass, "awayHvac")}</span>
        <select
          .value=${t}
          @change=${(s) => this.saveAwayHvacMode(s.target.value)}
        >
          ${e.map(
      ([s, a]) => d`<option value=${s} ?selected=${s === t}>
                ${o(this.hass, a)}
              </option>`
    )}
        </select>
      </label>
      <p class="hint">${o(this.hass, "awayHvacHint")}</p>
    `;
  }
  renderTemperatures() {
    const t = this.zone?.settings;
    return d`
      ${this.slider("home_target", o(this.hass, "roomTarget"), t?.home_target, 5, 30, 0.5)}
      ${this.slider("away_target", o(this.hass, "awayTarget"), t?.away_target, 5, 30, 0.5)}
      ${this.renderAwayHvacMode()}
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
    return d`
      <div class="field readonly">
        <span>${o(this.hass, "radiator")}</span>
        <strong>${p(this.hass, t?.power_w, 0)} W</strong>
      </div>
      <div class="field readonly">
        <span>${o(this.hass, "heatpump")}</span>
        <strong>${p(this.hass, e?.power_w, 0)} W</strong>
      </div>
      <div class="field readonly">
        <span>${o(this.hass, "today")} – Mitsubishi</span>
        <strong>${p(this.hass, e?.kwh_today, 2)} kWh</strong>
      </div>
      <div class="field readonly">
        <span>${o(this.hass, "today")} – Gnosjö</span>
        <strong>${p(this.hass, t?.kwh_today, 2)} kWh</strong>
      </div>
      <div class="field readonly">
        <span>Elpris</span>
        <strong>
          ${s?.sek_per_kwh != null ? `${p(this.hass, s.sek_per_kwh, 2)} SEK/kWh` : "–"}
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
    return d`
      <div class="field readonly">
        <span>${o(this.hass, "presence")}</span>
        <strong>${Q(this.hass, this.zone?.presence)}</strong>
      </div>
      <div class="field readonly">
        <span>Rå status</span>
        <strong>${Q(this.hass, String(s.raw ?? this.zone?.presence_raw ?? ""))}</strong>
      </div>
      <p class="hint">
        Korta WiFi-avbrott påverkar inte läget – frånvaro kräver den konfigurerade
        fördröjningen.
      </p>
    `;
  }
  renderAdvanced() {
    const t = this.zone?.faults ?? [];
    return d`
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
        ${o(this.hass, "updated")}: ${Ie(this.hass, this.zone?.last_updated)}
      </p>
    `;
  }
  slider(t, e, s, a, i, r) {
    const n = !this.entity(t);
    return d`
      <label class="field">
        <span>${e}</span>
        <div class="slider">
          <input
            type="range"
            min=${a}
            max=${i}
            step=${r}
            .value=${String(s ?? a)}
            ?disabled=${n}
            @change=${(l) => this.setNumber(t, Number(l.target.value))}
          />
          <output>${p(this.hass, s, r < 1 ? 1 : 0)}</output>
        </div>
      </label>
    `;
  }
};
D.styles = [
  Fe,
  K`
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
G([
  x({ attribute: !1 })
], D.prototype, "hass", 2);
G([
  x({ attribute: !1 })
], D.prototype, "zone", 2);
G([
  x({ type: Boolean, reflect: !0 })
], D.prototype, "open", 2);
G([
  S()
], D.prototype, "section", 2);
D = G([
  ae("shc-settings-drawer")
], D);
var wt = Object.defineProperty, kt = Object.getOwnPropertyDescriptor, A = (t, e, s, a) => {
  for (var i = a > 1 ? void 0 : a ? kt(e, s) : e, r = t.length - 1, n; r >= 0; r--)
    (n = t[r]) && (i = (a ? n(e, s, i) : n(i)) || i);
  return a && i && wt(e, s, i), i;
};
const St = 3e4, At = 5 * 6e4, Me = "smart-heat-controller.zone", Et = [
  { id: "auto", key: "auto", icon: "M12 3v2m0 14v2M5.6 5.6 7 7m10 10 1.4 1.4M3 12h2m14 0h2M5.6 18.4 7 17m10-10 1.4-1.4" },
  { id: "home", key: "home", icon: "M4 11 12 4l8 7v9H4z" },
  { id: "away", key: "away", icon: "M3 16h18l-2-5H5zM6 16v4m12-4v4" },
  { id: "boost", key: "boost", icon: "M5 15c4 0 4-9 9-9 3 0 5 2 5 5s-2 5-5 5H5z" }
];
let _ = class extends O {
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
    super.connectedCallback(), this.selectedZoneId = window.localStorage.getItem(Me) ?? void 0, this.refresh(!0);
  }
  updated(t) {
    if (t.has("hass") && this.hass) {
      const e = Date.now();
      e - this.lastFetch > St && this.refresh(), e - this.lastHistory > At && this.loadOutsideHistory();
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
    this.selectedZoneId = t, window.localStorage.setItem(Me, t), this.zone = this.zones.find((e) => e.entry_id === t), this.outside = [], this.loadOutsideHistory();
  }
  async loadOutsideHistory() {
    const t = this.zone?.actuators?.outside_sensor;
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
        this.outside = i.map((r) => ({
          t: Number(r.lu) * 1e3,
          y: Number(r.s)
        })).filter((r) => Number.isFinite(r.y) && Number.isFinite(r.t));
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
      return d`<div class="card">
        <h3>Smart Heat Controller</h3>
        <p class="empty">${this.error}</p>
      </div>`;
    if (!this.zone)
      return d`<div class="card"><p class="empty">…</p></div>`;
    const t = this.zone, e = t.settings, s = this.currentRoomTemperature(), a = this.heatpumpHeating(), i = this.radiatorOn(), r = t.mode ?? "auto", n = t.presence ?? "unknown", l = t.totals?.today ?? {}, h = t.totals?.week ?? {}, g = t.totals?.month ?? {}, f = t.costs?.today?.total ?? null, u = t.costs?.week?.total ?? null, $ = t.costs?.month?.total ?? null, v = t.savings, E = t.series, ne = t.dry_run === !0;
    return d`
      <div class="shell">
        ${ne ? d`<div class="banner">${o(this.hass, "dryRunOn")}</div>` : c}
        ${(t.faults ?? []).length ? d`<div class="banner">
              ${o(this.hass, "faults")}: ${(t.faults ?? []).join(", ")}
            </div>` : c}

        <div class="topbar">
          <div class="brand">
            <span aria-hidden="true">🔥</span>
            <span>Smart Heat Controller – ${t.name}</span>
          </div>
          <div class="row">
            ${this.zones.length > 1 ? d`<select
                  aria-label="Zone"
                  .value=${t.entry_id}
                  @change=${(m) => {
      this.chooseZone(m.target.value);
    }}
                >
                  ${this.zones.map(
      (m) => d`<option
                      value=${m.entry_id}
                      ?selected=${m.entry_id === t.entry_id}
                    >
                      ${m.name}
                    </option>`
    )}
                </select>` : c}
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
            ${t.image_url ? d`<img src=${t.image_url} alt="" />` : c}
            <div class="caption">
              <strong>${t.name}</strong>
              ${t.area ? d`<span class="muted">${t.area} m²</span>` : c}
            </div>
          </div>

          <div class="card temp-card">
            <div class="row">
              <span aria-hidden="true">🌡</span>
              <span class="label">${o(this.hass, "room")}</span>
            </div>
            <div class="value">${p(this.hass, s, 1)} °C</div>
            <div class="muted">
              ${o(this.hass, "target")} (${o(this.hass, "home")}):
              ${p(this.hass, e?.home_target, 1)} °C
            </div>          </div>

          <div class="card temp-card">
            <div class="row">
              <span aria-hidden="true">☁️</span>
              <span class="label">${o(this.hass, "outside")}</span>
            </div>
            <div class="value">
              ${p(this.hass, this.outsideTemperature(), 1)} °C
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
              ${Q(this.hass, n)}
            </div>
          </div>

          <!-- Row 2 -->
          <div class="card">
            <div class="device-head">
              <span aria-hidden="true">❄️</span>
              <div>
                <strong>${o(this.hass, "heatpump")}</strong>
                <span class="sub ${a ? "" : "off"}">
                  ${a ? o(this.hass, "heating") : o(this.hass, "idle")}
                </span>
              </div>
            </div>
            <div class="value small">
              ${p(this.hass, e?.heatpump_target, 1)} °C
              <span class="muted">(${o(this.hass, "target")})</span>
            </div>
            <div class="spread" style="margin-top:8px">
              <span class="muted">${o(this.hass, "powerNow")}</span>
              <strong
                >${t.heatpump?.power_w != null ? `${p(this.hass, t.heatpump.power_w, 0)} W` : "–"}</strong
              >
            </div>
          </div>

          <div class="card">
            <div class="device-head">
              <span aria-hidden="true">♨️</span>
              <div>
                <strong>${o(this.hass, "radiator")}</strong>
                <span class="sub ${i ? "" : "off"}">
                  ${i ? o(this.hass, "heating") : o(this.hass, "idle")}
                </span>
              </div>
            </div>
            <div class="spread" style="margin-top:10px">
              <span class="muted">${o(this.hass, "powerNow")}</span>
              <strong
                >${t.radiator?.power_w != null ? `${p(this.hass, t.radiator.power_w, 0)} W` : "–"}</strong
              >
            </div>
            <div class="spread" style="margin-top:6px">
              <span class="muted">${o(this.hass, "todayShort")}</span>
              <strong>${p(this.hass, t.radiator?.kwh_today, 2)} kWh</strong>
            </div>
            <button style="margin-top:12px;width:100%" @click=${this.toggleRadiator}>
              ${i ? "Slå AV" : "Slå PÅ"} (30 min)
            </button>
          </div>

          <div class="card span2">
            <h3>${o(this.hass, "mode")}</h3>
            <div class="mode-grid">
              ${Et.map(
      (m) => d`
                  <button
                    class=${r === m.id ? "active" : ""}
                    @click=${() => this.selectMode(m.id)}
                  >
                    <svg viewBox="0 0 24 24"><path d=${m.icon} /></svg>
                    ${o(this.hass, m.key)}
                  </button>
                `
    )}
            </div>
            <div class="status-note">
              <span aria-hidden="true">✓</span>
              <div>
                <strong>${Ue(this.hass, t.effective_mode)}</strong>
                ${ce(this.hass, t.reason)}
              </div>
            </div>
          </div>

          <!-- Row 3 -->
          <div class="card span2">
            <div class="spread">
              <h3>${o(this.hass, "energy")}</h3>
              <div class="row">
                ${[7, 30].map(
      (m) => d`
                    <button
                      class=${this.chartDays === m ? "active" : ""}
                      @click=${() => {
        this.chartDays = m;
      }}
                    >
                      ${m} ${"dgr"}
                    </button>
                  `
    )}
              </div>
            </div>
            <shc-energy-chart
              .hass=${this.hass}
              .heatpump=${E?.heatpump ?? []}
              .radiator=${E?.radiator ?? []}
              .outside=${this.outside}
              .days=${this.chartDays}
            ></shc-energy-chart>
          </div>

          <div class="card span2">
            <h3>${o(this.hass, "cost")}</h3>
            <div class="cost-grid">
              ${[
      { label: o(this.hass, "today"), total: l.total, cost: f },
      { label: o(this.hass, "week"), total: h.total, cost: u },
      { label: o(this.hass, "month"), total: g.total, cost: $ }
    ].map(
      (m) => d`
                  <div class="cost-cell">
                    <small class="label">${m.label}</small>
                    <div class="kwh">
                      ${m.total ? p(this.hass, m.total.kwh, 2) : "–"} kWh
                    </div>
                    <div class="sek">
                      ≈ ${mt(this.hass, m.cost)}
                      ${t.price?.includes_fees ? c : d`<span class="quality estimated"
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
              ${v?.has_result ? d`
                    <div class="savings-box">
                      <div class="cell">
                        <small>${o(this.hass, "before")}</small>
                        <b>${p(this.hass, v.baseline_kwh_per_day, 1)}</b>
                        <span class="muted">${o(this.hass, "perDay")}</span>
                      </div>
                      <div class="cell">
                        <small>${o(this.hass, "after")}</small>
                        <b>${p(this.hass, v.comparison_kwh_per_day, 1)}</b>
                        <span class="muted">${o(this.hass, "perDay")}</span>
                      </div>
                      <div class="delta ${v.is_increase ? "increase" : ""}">
                        ${v.delta_kwh_per_day != null ? `${v.delta_kwh_per_day < 0 ? "+" : "−"}${p(
      this.hass,
      Math.abs(v.delta_kwh_per_day),
      1
    )}` : "–"}
                        <div class="muted" style="color:inherit">
                          ${v.percent != null ? `${p(this.hass, Math.abs(v.percent), 0)} %` : ""}
                        </div>
                      </div>
                    </div>
                  ` : d`<p class="empty">${o(this.hass, "noBaseline")}</p>`}
              ${t.savings_warning ? d`<p class="muted" style="margin:8px 0 0">
                    ${t.savings_warning}
                  </p>` : c}
              ${v && v.baseline_quality !== "measured" ? d`<p class="muted" style="margin:8px 0 0">
                    Datatäckning: ${v.baseline_quality} / ${v.comparison_quality}
                  </p>` : c}
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
              ${o(this.hass, "updated")}: ${Ie(this.hass, t.last_updated)}
            </p>
          </div>

          <div class="card span2">
            <h3>${o(this.hass, "presence")}</h3>
            <div class="status-list">
              ${(t.actuators?.presence_entities ?? []).map(
      (m) => d`
                  <div class="status-row">
                    <span>${m}</span>
                    <span class=${this.hass?.states[m]?.state === "home" ? "ok" : "bad"}>
                      ${this.hass?.states[m]?.state ?? "–"}
                    </span>
                  </div>
                `
    )}
              ${(t.actuators?.presence_entities ?? []).length === 0 ? d`<p class="empty">${o(this.hass, "noData")}</p>` : c}
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
      return d`
        <p class="empty">${o(this.hass, "noBaseline")}</p>
        <p class="muted">${o(this.hass, "baselineHint")}</p>
        <div class="row">
          <button @click=${() => this.pressButton("start_baseline")}>
            ${o(this.hass, "startBaseline")}
          </button>
          ${e?.active ? d`<button @click=${() => this.pressButton("stop_baseline")}>
                ${o(this.hass, "stopBaseline")}
              </button>` : c}
        </div>
      `;
    const a = t.baseline_kwh_per_day ?? 0, i = t.comparison_kwh_per_day ?? 0;
    return d`
      <div class="bars">
        <div class="bar before" style="height: ${a / s * 100}%">
          ${p(this.hass, a, 1)}
        </div>
        <div class="bar after" style="height: ${i / s * 100}%">
          ${p(this.hass, i, 1)}
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
          ${t.weather_adjustment_available ? `Väderkorrigerat: ${p(
      this.hass,
      Math.abs(t.weather_adjusted_percent ?? 0),
      0
    )} % ${(t.weather_adjusted_percent ?? 0) < 0 ? "ökning" : "minskning"} (${p(this.hass, t.baseline_hdd, 0)} → ${p(
      this.hass,
      t.comparison_hdd,
      0
    )} graddygn)` : "Väderkorrigering saknas – utetemperatur behövs"}
        </li>
      </ul>
      ${t.weather_adjustment_available ? d`<p class="muted" style="margin:6px 0 0;font-size:11.5px">
            Graddagsnormaliserat mått (bastemp 17 °C). Tar inte hänsyn till
            solinstrålning, vind, internvärme eller ändrat nyttjande – det är en
            uppskattning, inte ett bevis.
          </p>` : c}
    `;
  }
  quickRow(t, e, s) {
    const a = !this.entity(t);
    return d`
      <div class="quick-row">
        <span class="quick-name">${e}</span>
        <input
          type="range"
          min="5"
          max="30"
          step="0.5"
          .value=${String(s ?? 20)}
          ?disabled=${a}
          @change=${(i) => this.setNumber(t, Number(i.target.value))}
        />
        <output>${p(this.hass, s, 1)} °C</output>
      </div>
    `;
  }
  statusRow(t, e, s = !1) {
    const a = this.stateValue(t), i = s ? a === "off" : a === "on";
    return d`
      <div class="status-row">
        <span>${e}</span>
        <span class=${i ? "ok" : "bad"}>
          ${i ? o(this.hass, "online") : o(this.hass, "offline")}
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
  Fe,
  K`
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
A([
  x({ attribute: !1 })
], _.prototype, "hass", 2);
A([
  S()
], _.prototype, "config", 2);
A([
  S()
], _.prototype, "zone", 2);
A([
  S()
], _.prototype, "zones", 2);
A([
  S()
], _.prototype, "selectedZoneId", 2);
A([
  S()
], _.prototype, "outside", 2);
A([
  S()
], _.prototype, "drawerOpen", 2);
A([
  S()
], _.prototype, "chartDays", 2);
A([
  S()
], _.prototype, "error", 2);
A([
  S()
], _.prototype, "pending", 2);
_ = A([
  ae("smart-heat-dashboard")
], _);
var zt = Object.defineProperty, Ct = Object.getOwnPropertyDescriptor, be = (t, e, s, a) => {
  for (var i = a > 1 ? void 0 : a ? Ct(e, s) : e, r = t.length - 1, n; r >= 0; r--)
    (n = t[r]) && (i = (a ? n(e, s, i) : n(i)) || i);
  return a && i && zt(e, s, i), i;
};
let V = class extends O {
  constructor() {
    super(...arguments), this.narrow = !1;
  }
  render() {
    return d`<smart-heat-dashboard .hass=${this.hass}></smart-heat-dashboard>`;
  }
};
V.styles = K`
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
be([
  x({ attribute: !1 })
], V.prototype, "hass", 2);
be([
  x({ type: Boolean })
], V.prototype, "narrow", 2);
V = be([
  ae("smart-heat-panel")
], V);
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
