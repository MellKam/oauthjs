var d = Object.defineProperty;
var u = (o, t, e) => t in o ? d(o, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : o[t] = e;
var a = (o, t, e) => (u(o, typeof t != "symbol" ? t + "" : t, e), e);
const s = (o) => {
  const t = new URLSearchParams();
  for (const [e, r] of Object.entries(o))
    typeof r < "u" && t.set(e, r.toString());
  return t.toString();
}, p = (o, t) => "Basic " + btoa(o + ":" + t), c = "application/x-www-form-urlencoded";
class f {
  constructor(t) {
    a(this, "basicAuthHeader");
    this.opts = t, this.basicAuthHeader = p(
      this.opts.clientId,
      this.opts.clientSecret
    );
  }
  getAuthURL({ scopes: t, state: e }) {
    const r = new URL(this.opts.authEndpoint);
    return r.search = s({
      state: e,
      redirect_uri: this.opts.redirectUri,
      response_type: "code",
      scope: t == null ? void 0 : t.join(" "),
      client_id: this.opts.clientId
    }), r;
  }
  async getToken(t, e) {
    const r = Object.fromEntries(t.searchParams);
    if ("error" in r)
      throw new Error(r.error);
    if (e && r.state && e !== r.state)
      throw new Error("invalid state");
    const n = new URL(this.opts.tokenEndpoint);
    n.search = s({
      code: r.code,
      redirect_uri: this.opts.redirectUri,
      grant_type: "authorization_code"
    });
    const i = await fetch(n, {
      method: "POST",
      headers: {
        Authorization: this.basicAuthHeader,
        "Content-Type": c,
        Accept: "application/json"
      }
    });
    if (!i.ok) {
      const h = await i.json();
      throw new Error(h.error);
    }
    return await i.json();
  }
  async refresh(t) {
    const e = new URL(this.opts.tokenEndpoint);
    e.search = s({
      refresh_token: t,
      grant_type: "refresh_token"
    });
    const r = await fetch(e, {
      method: "POST",
      headers: {
        Authorization: this.basicAuthHeader,
        "Content-Type": c
      }
    });
    if (!r.ok) {
      const n = await r.json();
      throw new Error(n.error);
    }
    return await r.json();
  }
}
export {
  f as AuthCodeGrant
};
