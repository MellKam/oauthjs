import {
  APP_JSON,
  APP_URLENCODED,
  TokenErrorResponse,
  TokenReqParams,
  TokenResponse,
  getBasicAuthHeader,
  toQueryString,
} from "./general";

export class RefreshGrant {
  constructor(
    private readonly opts: {
      readonly clientId: string;
      readonly clientSecret?: string;
      readonly tokenEndpoint: string;
    }
  ) {}

  async refresh(refreshToken: string) {
    const url = new URL(this.opts.tokenEndpoint);
    url.search = toQueryString<TokenReqParams>({
      refresh_token: refreshToken,
      grant_type: "refresh_token",
      client_id: this.opts.clientId,
    });

    const authorization = !this.opts.clientSecret
      ? {
          Authorization: getBasicAuthHeader(
            this.opts.clientId,
            this.opts.clientSecret!
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
