import {
  APP_URLENCODED,
  TokenErrorResponse,
  TokenResponse,
  getBasicAuthHeader,
} from "./general";

export class ClientCredentialsGrant {
  constructor(
    private readonly opts: {
      readonly clientId: string;
      readonly clientSecret: string;
      readonly tokenEndpoint: string;
    }
  ) {}

  async getToken() {
    const res = await fetch(this.opts.tokenEndpoint, {
      method: "POST",
      headers: {
        Authorization: getBasicAuthHeader(
          this.opts.clientId,
          this.opts.clientSecret
        ),
        "Content-Type": APP_URLENCODED,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
    });

    if (!res.ok) {
      const data = (await res.json()) as TokenErrorResponse;
      throw new Error(data.error);
    }

    return (await res.json()) as TokenResponse;
  }
}
