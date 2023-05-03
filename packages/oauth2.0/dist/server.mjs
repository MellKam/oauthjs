var d = Object.defineProperty;
var u = (o, t, r) => t in o ? d(o, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : o[t] = r;
var a = (o, t, r) => (u(o, typeof t != "symbol" ? t + "" : t, r), r);
const s = (o) => {
  const t = new URLSearchParams();
  for (const [r, e] of Object.entries(o))
    typeof e < "u" && t.set(r, e.toString());
  return t.toString();
}, p = (o, t) => "Basic " + Buffer.from(o + ":" + t).toString("base64"), c = "application/x-www-form-urlencoded";
class f {
  constructor(t) {
    a(this, "basicAuthHeader");
    this.opts = t, this.basicAuthHeader = p(
      this.opts.clientId,
      this.opts.clientSecret
    );
  }
  getAuthURL({ scopes: t, state: r }) {
    const e = new URL(this.opts.authEndpoint);
    return e.search = s({
      state: r,
      redirect_uri: this.opts.redirectUri,
      response_type: "code",
      scope: t == null ? void 0 : t.join(" "),
      client_id: this.opts.clientId
    }), e;
  }
  async getToken(t, r) {
    const e = Object.fromEntries(t.searchParams);
    if ("error" in e)
      throw new Error(e.error);
    if (r && e.state && r !== e.state)
      throw new Error("invalid state");
    const n = new URL(this.opts.tokenEndpoint);
    n.search = s({
      code: e.code,
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
    const r = new URL(this.opts.tokenEndpoint);
    r.search = s({
      refresh_token: t,
      grant_type: "refresh_token"
    });
    const e = await fetch(r, {
      method: "POST",
      headers: {
        Authorization: this.basicAuthHeader,
        "Content-Type": c
      }
    });
    if (!e.ok) {
      const n = await e.json();
      throw new Error(n.error);
    }
    return await e.json();
  }
}
export {
  f as AuthCodeGrant
};
