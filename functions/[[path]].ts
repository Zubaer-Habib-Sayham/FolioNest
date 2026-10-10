interface ProxyContext {
  request: Request;
  env: { API_ORIGIN?: string };
  next: () => Promise<Response>;
}
export async function onRequest(context: ProxyContext): Promise<Response> {
  const incoming = new URL(context.request.url);
  if (!(
    incoming.pathname.startsWith("/api/") ||
    incoming.pathname.startsWith("/p/") ||
    incoming.pathname === "/sitemap.xml"
  ))
    return context.next();
  let origin: URL;
  try {
    origin = new URL(context.env.API_ORIGIN || "");
    if (
      origin.protocol !== "https:" ||
      origin.pathname !== "/" ||
      origin.search ||
      origin.hash ||
      origin.username ||
      origin.password ||
      origin.origin === incoming.origin
    )
      throw new Error();
  } catch {
    return unavailable("Hosting connection is not configured.");
  }
  const length = Number(context.request.headers.get("content-length") || 0);
  if (length > 2_097_152)
    return new Response("Request is too large.", {
      status: 413,
      headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
    });
  const upstream = new URL(incoming.pathname + incoming.search, origin);
  const headers = new Headers();
  for (const key of [
    "Authorization",
    "Content-Type",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
  ])
    if (context.request.headers.has(key))
      headers.set(key, context.request.headers.get(key)!);
  try {
    const response = await fetch(upstream, {
      method: context.request.method,
      headers,
      body: ["GET", "HEAD"].includes(context.request.method)
        ? undefined
        : context.request.body,
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });
    const forwarded = new Headers(response.headers);
    forwarded.delete("set-cookie");
    forwarded.set("Cache-Control", "no-store");
    if (incoming.pathname.startsWith("/api/"))
      forwarded.set("X-Robots-Tag", "noindex");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: forwarded,
    });
  } catch {
    return unavailable(
      "The cloud service is waking up or unavailable. Try again shortly; local drafts and exports are still available.",
    );
  }
}
function unavailable(message: string) {
  return new Response(
    JSON.stringify({ error: { code: "UPSTREAM_UNAVAILABLE", message } }),
    {
      status: 503,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex",
      },
    },
  );
}
