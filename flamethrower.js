var k = Object.defineProperty;
var S = (o, e, t) => e in o ? k(o, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : o[e] = t;
var d = (o, e, t) => (S(o, typeof e != "symbol" ? e + "" : e, t), t);
function g(o, e) {
  if (["link", "go"].includes(o))
    if (e) {
      const t = document.querySelector(e);
      t ? t.scrollIntoView({ behavior: "smooth", block: "start" }) : window.scrollTo({ top: 0 });
    } else
      window.scrollTo({ top: 0 });
}
function f(o) {
  const e = new URL(o || window.location.href).href;
  return e.endsWith("/") || e.includes(".") || e.includes("#") ? e : `${e}/`;
}
function F(o) {
  (!window.history.state || window.history.state.url !== o) && window.history.pushState({ url: o }, "internalLink", o);
}
function N(o) {
  document.querySelector(o).scrollIntoView({ behavior: "smooth", block: "start" });
}
function q(o) {
  return { type: "popstate", next: f() };
}
function A(o) {
  var t;
  let e;
  if (o.altKey || o.ctrlKey || o.metaKey || o.shiftKey)
    return { type: "disqualified" };
  for (let r = o.target; r.parentNode; r = r.parentNode)
    if (r.nodeName === "A") {
      e = r;
      break;
    }
  if (e && e.host !== location.host)
    return e.target = "_blank", { type: "external" };
  if (e && "cold" in (e == null ? void 0 : e.dataset))
    return { type: "disqualified" };
  if (e != null && e.hasAttribute("href")) {
    const r = e.getAttribute("href"), n = new URL(r, location.href);
    if (o.preventDefault(), r != null && r.startsWith("#"))
      return N(r), { type: "scrolled" };
    const s = (t = r.match(/#([\w'-]+)\b/g)) == null ? void 0 : t[0], i = f(n.href), c = f();
    return { type: "link", next: i, prev: c, scrollId: s };
  } else
    return { type: "noop" };
}
function L(o) {
  return new DOMParser().parseFromString(o, "text/html");
}
function b(o) {
  document.body.querySelectorAll("[flamethrower-preserve]").forEach((r) => {
    const n = o.body.querySelector('[flamethrower-preserve][id="' + r.id + '"]');
    if (n) {
      const s = r.cloneNode(!0);
      n.replaceWith(s);
    }
  });
  const t = "[flamethrower-base]";
  o.querySelector(t) ? document.querySelector(t).replaceWith(o.querySelector(t)) : document.body.replaceWith(o.body);
}
function x(o) {
  const e = (i) => Array.from(i.querySelectorAll('head>:not([rel="prefetch"]')), t = e(document), r = e(o), { staleNodes: n, freshNodes: s } = T(t, r);
  n.forEach((i) => i.remove()), document.head.append(...s);
}
function T(o, e) {
  const t = [], r = [];
  let n = 0, s = 0;
  for (; n < o.length || s < e.length; ) {
    const i = o[n], c = e[s];
    if (i != null && i.isEqualNode(c)) {
      n++, s++;
      continue;
    }
    const a = i ? r.findIndex((l) => l.isEqualNode(i)) : -1;
    if (a !== -1) {
      r.splice(a, 1), n++;
      continue;
    }
    const h = c ? t.findIndex((l) => l.isEqualNode(c)) : -1;
    if (h !== -1) {
      t.splice(h, 1), s++;
      continue;
    }
    i && t.push(i), c && r.push(c), n++, s++;
  }
  return { staleNodes: t, freshNodes: r };
}
function y() {
  document.head.querySelectorAll("[data-reload]").forEach(v), document.body.querySelectorAll("script").forEach(v);
}
function v(o) {
  const e = document.createElement("script"), t = Array.from(o.attributes);
  for (const { name: r, value: n } of t)
    e[r] = n;
  e.append(o.textContent), o.replaceWith(e);
}
const C = {
  log: !1,
  pageTransitions: !1
};
class O {
  constructor(e) {
    d(this, "enabled", !0);
    d(this, "prefetched", /* @__PURE__ */ new Set());
    d(this, "observer");
    this.opts = e, this.opts = { ...C, ...e != null ? e : {} }, window != null && window.history ? (document.addEventListener("click", (t) => this.onClick(t)), window.addEventListener("popstate", (t) => this.onPop(t)), this.prefetch()) : (console.warn("flamethrower router not supported in this browser or environment"), this.enabled = !1);
  }
  go(e) {
    const t = window.location.href, r = new URL(e, location.origin).href;
    return this.reconstructDOM({ type: "go", next: r, prev: t });
  }
  back() {
    window.history.back();
  }
  forward() {
    window.history.forward();
  }
  get allLinks() {
    return Array.from(document.links).filter(
      (e) => e.href.includes(document.location.origin) && !e.href.includes("#") && e.href !== (document.location.href || document.location.href + "/") && !this.prefetched.has(e.href)
    );
  }
  log(...e) {
    this.opts.log && console.log(...e);
  }
  prefetch() {
    if (this.opts.prefetch === "visible")
      this.prefetchVisible();
    else if (this.opts.prefetch === "hover")
      this.prefetchOnHover();
    else
      return;
  }
  prefetchOnHover() {
    this.allLinks.forEach((e) => {
      const t = e.getAttribute("href");
      e.addEventListener("pointerenter", () => this.createLink(t), { once: !0 });
    });
  }
  prefetchVisible() {
    const e = {
      root: null,
      rootMargin: "0px",
      threshold: 1
    };
    "IntersectionObserver" in window && (this.observer || (this.observer = new IntersectionObserver((t, r) => {
      t.forEach((n) => {
        const s = n.target.getAttribute("href");
        if (this.prefetched.has(s)) {
          r.unobserve(n.target);
          return;
        }
        n.isIntersecting && (this.createLink(s), r.unobserve(n.target));
      });
    }, e)), this.allLinks.forEach((t) => this.observer.observe(t)));
  }
  createLink(e) {
    const t = document.createElement("link");
    t.rel = "prefetch", t.href = e, t.as = "document", t.onload = () => this.log("\u{1F329}\uFE0F prefetched", e), t.onerror = (r) => this.log("\u{1F915} can't prefetch", e, r), document.head.appendChild(t), this.prefetched.add(e);
  }
  onClick(e) {
    this.reconstructDOM(A(e));
  }
  onPop(e) {
    this.reconstructDOM(q());
  }
  async reconstructDOM({ type: e, next: t, prev: r, scrollId: n }) {
    if (!this.enabled) {
      this.log("router disabled");
      return;
    }
    try {
      if (this.log("\u26A1", e), ["popstate", "link", "go"].includes(e) && t !== r) {
        this.opts.log && console.time("\u23F1\uFE0F"), window.dispatchEvent(new CustomEvent("flamethrower:router:fetch")), e != "popstate" && F(t);
        const i = await (await fetch(t, { headers: { "X-Flamethrower": "1" } }).then((a) => {
          console.log(a.body);
          const h = a.body.getReader(), l = parseInt(a.headers.get("Content-Length"));
          let u = 0;
          return new ReadableStream({
            start(p) {
              function w() {
                h.read().then(({ done: E, value: m }) => {
                  if (E) {
                    p.close();
                    return;
                  }
                  u += m.length, window.dispatchEvent(
                    new CustomEvent("flamethrower:router:fetch-progress", {
                      detail: {
                        progress: Number.isNaN(l) ? 0 : u / l * 100,
                        received: u,
                        length: l || 0
                      }
                    })
                  ), p.enqueue(m), w();
                });
              }
              w();
            }
          });
        }).then((a) => new Response(a, { headers: { "Content-Type": "text/html" } }))).text(), c = L(i);
        x(c), this.opts.pageTransitions && document.createDocumentTransition ? document.createDocumentTransition().start(() => {
          b(c), y(), g(e, n);
        }) : (b(c), y(), g(e, n)), window.dispatchEvent(new CustomEvent("flamethrower:router:end")), setTimeout(() => {
          this.prefetch();
        }, 200), this.opts.log && console.timeEnd("\u23F1\uFE0F");
      }
    } catch (s) {
      return window.dispatchEvent(new CustomEvent("flamethrower:router:error", s)), this.opts.log && console.timeEnd("\u23F1\uFE0F"), console.error("\u{1F4A5} router fetch failed", s), !1;
    }
  }
}
const R = (o) => {
  const e = new O(o);
  if (o.log && console.log("\u{1F525} flamethrower engaged"), window) {
    const t = window;
    t.flamethrower = e;
  }
  return e;
};
export {
  R as default
};
