export type SearchParam = string | number | boolean | SearchParamArray;
export type SearchParamArray = SearchParam[];
export type SearchParams = { [k: string]: SearchParam | undefined };

/**
 * Creates a query string from the object and skips `undefined` values.
 */
export const toQueryString = <T extends SearchParams>(obj: T): string => {
  const params = new URLSearchParams();

  for (const [name, value] of Object.entries(obj)) {
    if (typeof value !== "undefined") params.set(name, value.toString());
  }

  return params.toString();
};

export const getBasicAuthHeader = (clientId: string, clientSecret: string) => {
  return (
    "Basic " +
    (__IS_NODE__
      ? Buffer.from(clientId + ":" + clientSecret).toString("base64")
      : btoa(clientId + ":" + clientSecret))
  );
};

export const APP_URLENCODED = "application/x-www-form-urlencoded";
export const APP_JSON = "application/json";

export type GetAuthURLOpts<TScope extends string = string> = {
  state?: string;
  redirectURI?: string;
  scope?: TScope[] | string;
  codeChallenge?: string;
};

export type AuthReqParams = {
  client_id: string;
  response_type: "code" | "token";
  redirect_uri?: string;
  state?: string;
  scope?: string;

  // PKCE
  code_challenge_method?: "S256";
  code_challenge?: string;
};

export type TokenReqParams = {
  grant_type: "refresh_token" | "client_credentials" | "authorization_code";
  redirect_uri?: string;
  refresh_token?: string;
  code?: string;
  client_id?: string;

  // PKCE
  code_verifier?: string;
};

export type AuthSuccessResponse = {
  code: string;
  state?: string;
};

export type AuthErrorResponse = {
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

export type TokenErrorResponse = {
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

export type AuthResponse = AuthSuccessResponse | AuthErrorResponse;

export type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in?: number;
  scope?: string;
  refresh_token?: string;
};
