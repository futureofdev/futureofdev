import type { MiddlewareHandler } from "astro";
import { SITE_ORIGIN } from "./lib/seo";

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { url, request } = context;
  if (context.isPrerendered) return next();
  const productionHost = ["futureofdev.com", "www.futureofdev.com"].includes(url.hostname);
  const path = url.pathname.replace(/^\/+/, "/").replace(/\/+$/, "") || "/";
  const utility = /^\/(api(?:\/|$)|unsubscribe(?:\/|$)|404(?:\/|$))/.test(path);
  if (["GET", "HEAD"].includes(request.method) && !utility) {
    let destination = path;
    let fragment = "";
    if (path === "/claude-academy" || path.startsWith("/claude-academy/")) {
      const slug = path.slice("/claude-academy/".length);
      destination = ["coding-bootcamp-in-a-box", "setting-up-claude-academy"].includes(slug)
        ? "/learning/coding-bootcamp-in-a-box" : "/learning";
      if (slug === "setting-up-claude-academy") fragment = "#getting-started";
    }
    const wrongOrigin = productionHost && url.origin !== SITE_ORIGIN;
    if (wrongOrigin || destination !== url.pathname) {
      const target = `${wrongOrigin ? SITE_ORIGIN : ""}${destination}${url.search}${fragment}`;
      return new Response(null, { status: 301, headers: { Location: target,
        ...(!productionHost ? { "X-Robots-Tag": "noindex, nofollow" } : {}) } });
    }
  }
  const response = await next();
  if (!productionHost || utility) {
    const headers = new Headers(response.headers);
    headers.set("X-Robots-Tag", "noindex, nofollow");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
  return response;
};
