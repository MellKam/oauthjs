import { AuthCodeGrant } from "@oauthjs/oauth2.0-client";
import { fastify } from "fastify";
import cookie from "@fastify/cookie";
import { randomUUID } from "node:crypto";

const app = fastify({
  logger: false,
});

await app.register(cookie);

const oauth = new AuthCodeGrant({
  clientId: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  authEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
  redirectUri: "http://localhost:3000/callback",
});

app.get("/", (req, reply) => {
  const state = randomUUID();
  reply.cookie("state", state);

  reply.redirect(302, oauth.getAuthURL({ state }).toString());
});

app.get("/callback", async (req, reply) => {
  const url = new URL(req.protocol + "://" + req.hostname + req.url);
  const token = await oauth.getToken(url, {
    state: req.cookies.state,
  });

  return token;
});

await app.listen({ port: 3000 });
