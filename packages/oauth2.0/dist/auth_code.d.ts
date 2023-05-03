type GetAuthURLOpts<TScope extends string = string> = {
    state?: string;
    scopes?: TScope[];
};
interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in?: number;
    scope?: string;
    refresh_token?: string;
}
export declare class AuthCodeGrant<TScope extends string = string> {
    private readonly opts;
    private readonly basicAuthHeader;
    constructor(opts: {
        readonly clientId: string;
        readonly clientSecret: string;
        readonly redirectUri: string;
        readonly authEndpoint: string;
        readonly tokenEndpoint: string;
    });
    getAuthURL({ scopes, state }: GetAuthURLOpts<TScope>): URL;
    getToken(callbackURL: URL, state?: string): Promise<TokenResponse>;
    refresh(refresh_token: string): Promise<TokenResponse>;
}
export {};
