import {
  APP_JSON,
  APP_URLENCODED,
  AuthReqParams,
  AuthResponse,
  GetAuthURLOpts,
  TokenErrorResponse,
  TokenReqParams,
  TokenResponse,
  getBasicAuthHeader,
  toQueryString,
} from "./general";

export class AuthCodeGrant<TScope extends string = string> {
  constructor(
    private readonly config: {
      readonly clientId: string;
      readonly clientSecret?: string;
      readonly authEndpoint: string;
      readonly tokenEndpoint: string;
    },
    private readonly opts: {
      fetch?: typeof fetch;
      scope?: string | TScope[];
      redirectURI?: string;
    } = {}
  ) {}

  getAuthURL({
    state,
    codeChallenge,
    redirectURI,
    scope,
  }: GetAuthURLOpts<TScope>): URL {
    const url = new URL(this.config.authEndpoint);

    url.search = toQueryString<AuthReqParams>({
      state,
      redirect_uri: redirectURI ?? this.opts.redirectURI,
      response_type: "code",
      scope: Array.isArray(scope) ? scope.join(" ") : scope,
      client_id: this.config.clientId,
      ...(codeChallenge
        ? { code_challenge_method: "S256", code_challenge: codeChallenge }
        : undefined),
    });

    return url;
  }

  async getToken(
    callbackURI: URL,
    {
      state,
      codeVerifier,
      redirectURI,
    }: { state?: string; codeVerifier?: string; redirectURI?: string } = {}
  ) {
    const params = Object.fromEntries(callbackURI.searchParams) as AuthResponse;

    if ("error" in params) {
      throw new Error(params.error);
    }

    if (state && params.state && state !== params.state) {
      throw new Error("invalid state");
    }

    const url = new URL(this.config.tokenEndpoint);
    url.search = toQueryString<TokenReqParams>({
      code: params.code,
      redirect_uri: redirectURI ?? this.opts.redirectURI,
      grant_type: "authorization_code",
      code_verifier: codeVerifier,
      client_id: codeVerifier ? this.config.clientId : undefined,
    });

    if (!codeVerifier && !this.config.clientSecret) {
      throw new Error("Requires 'client_secret' to make request");
    }

    const authorization = !codeVerifier
      ? {
          Authorization: getBasicAuthHeader(
            this.config.clientId,
            this.config.clientSecret!
          ),
        }
      : undefined;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        ...authorization,
        "Content-Type": APP_URLENCODED,
        Accept: APP_JSON,
      },
    });

    if (!res.ok) {
      const data = (await res.json()) as TokenErrorResponse;
      throw new Error(data.error);
    }

    return (await res.json()) as TokenResponse;
  }
}

// only for browser
const encodeBase64URL = (data: string) => {
  return btoa(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export const generateCodeVerifier = async (length = 64) => {
  return __IS_NODE__
    ? (await import("node:crypto")).randomBytes(length).toString("base64url")
    : encodeBase64URL(
        String.fromCharCode(...crypto.getRandomValues(new Uint8Array(length)))
      );
};

export const getCodeChallenge = async (codeVerifier: string) => {
  if (__IS_NODE__) {
    return (await import("node:crypto"))
      .createHash("sha256")
      .update(codeVerifier)
      .digest("base64url");
  }

  const buffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(codeVerifier)
  );

  return encodeBase64URL(String.fromCharCode(...new Uint8Array(buffer)));
};

export const generatePKCECodes = async () => {
  const codeVerifier = await generateCodeVerifier();
  const codeChallenge = await getCodeChallenge(codeVerifier);

  return { codeVerifier, codeChallenge };
};
