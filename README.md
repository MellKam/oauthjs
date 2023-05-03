# OAuthJS

The goal of OAuthJS is to offer JavaScript developers a straightforward
implementation of the OAuth protocol through user-friendly libraries.

At present, the main focus is on the `@oauthjs/oauth2.0-client` library, which
enables client authorization (Note that _"client"_ here refers to a wide range
of applications, regardless of their implementation, such as those running on
servers, on the web or other devices).

# References

- https://www.rfc-editor.org/rfc/rfc6749 (Official OAuth standard documentation)
- https://github.com/mulesoft-labs/js-client-oauth2 (The popular oauth js
  library, which, unfortunately, is outdated from the point of view of modern js
  and does not provide the full range of functionality, for example, the PKCE
  extension)
- https://github.com/badgateway/oauth2-client
- https://github.com/cmd-johnson/deno-oauth2-client
