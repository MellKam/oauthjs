import { getBasicAuthHeader, toQueryString } from "./general";

const APP_URLENCODED = "application/x-www-form-urlencoded";
const APP_JSON = "application/json";

type GetAuthURLOpts<TScope extends string = string> = {
  state?: string;
  scopes?: TScope[];
};

type AuthResponseType = "code" | "token";

type AuthReqParams = {
  client_id: string;
  response_type: AuthResponseType;
  redirect_uri: string;
  state?: string;
  scope?: string;

  // PKCE
  code_challenge_method?: "S256";
  code_challenge?: string;
};

type TokenReqParams = {
  grant_type: "refresh_token" | "client_credentials" | "authorization_code";
  redirect_uri?: string;
  refresh_token?: string;
  code?: string;
  client_id?: string;

  // PKCE
  code_verifier?: string;
};

type AuthSuccessResponse = {
  code: string;
  state?: string;
};

type AuthErrorResponse = {
  error:
    | "invalid_request"
    | "unauthorized_client"
    | "access_denied"
    | "unsupported_response_type"
    | "invalid_scope"
    | "server_error"
    | "temporarily_unavailable";
  error_description?: string;
  error_uri?: string;
  state?: string;
};

type TokenErrorResponse = {
  error:
    | "invalid_request"
    | "invalid_client"
    | "invalid_grant"
    | "unauthorized_client"
    | "unsupported_grant_type"
    | "invalid_scope";
  error_description?: string;
  error_uri?: string;
};

type AuthResponse = AuthSuccessResponse | AuthErrorResponse;

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  scope?: string;
  refresh_token?: string;
}

export class AuthCodeGrant<TScope extends string = string> {
  private readonly basicAuthHeader: string;

  constructor(
    private readonly opts: {
      readonly clientId: string;
      readonly clientSecret: string;
      readonly redirectUri: string;
      readonly authEndpoint: string;
      readonly tokenEndpoint: string;
    }
  ) {
    this.basicAuthHeader = getBasicAuthHeader(
      this.opts.clientId,
      this.opts.clientSecret
    );
  }

  getAuthURL({ scopes, state }: GetAuthURLOpts<TScope>): URL {
    const url = new URL(this.opts.authEndpoint);

    url.search = toQueryString<AuthReqParams>({
      state,
      redirect_uri: this.opts.redirectUri,
      response_type: "code",
      scope: scopes?.join(" "),
      client_id: this.opts.clientId,
    });

    return url;
  }

  async getToken(callbackURL: URL, state?: string) {
    const params = Object.fromEntries(callbackURL.searchParams) as AuthResponse;

    if ("error" in params) {
      throw new Error(params.error);
    }

    if (state && params.state && state !== params.state) {
      throw new Error("invalid state");
    }

    const url = new URL(this.opts.tokenEndpoint);
    url.search = toQueryString<TokenReqParams>({
      code: params.code,
      redirect_uri: this.opts.redirectUri,
      grant_type: "authorization_code",
    });

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: this.basicAuthHeader,
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

  async refresh(refresh_token: string) {
    const url = new URL(this.opts.tokenEndpoint);
    url.search = toQueryString<TokenReqParams>({
      refresh_token,
      grant_type: "refresh_token",
    });

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: this.basicAuthHeader,
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
