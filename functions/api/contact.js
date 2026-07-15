/**
 * POST /api/contact — Cloudflare Pages Function.
 *
 * Configure in the Cloudflare Pages dashboard (Settings > Environment variables):
 *   RESEND_API_KEY  (secret, required)  — API key from resend.com
 *   CONTACT_TO      (optional)          — destination inbox, defaults below
 *   CONTACT_FROM    (optional)          — verified sender on your domain
 *
 * Until RESEND_API_KEY exists this returns 503 / "not_configured" and the form
 * tells the visitor to email us directly. It never reports a message as sent
 * when it was not.
 */

const REQUIRED = ["name", "email", "projectType", "budget", "inquiryType", "message"];
const DEFAULT_TO = "business@vkdapps.com";

const json = (data, status) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: "bad_request", error: "Invalid request body." }, 400);
  }

  // Honeypot: a real person never fills this in.
  if (body.website) return json({ ok: true }, 200);

  const missing = REQUIRED.filter((field) => !String(body[field] || "").trim());
  if (missing.length) {
    return json({ ok: false, code: "missing_fields", error: `Missing: ${missing.join(", ")}` }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email))) {
    return json({ ok: false, code: "bad_email", error: "That email address doesn't look right." }, 400);
  }
  if (String(body.message).length > 5000) {
    return json({ ok: false, code: "too_long", error: "That message is longer than we can accept." }, 400);
  }

  if (!env.RESEND_API_KEY) {
    return json({ ok: false, code: "not_configured", error: "Email delivery is not configured yet." }, 503);
  }

  const rows = [
    ["Name", body.name],
    ["Email", body.email],
    ["Company", body.company || "—"],
    ["Phone", body.phone || "—"],
    ["Project type", body.projectType],
    ["Budget", body.budget],
    ["Inquiry", body.inquiryType],
  ]
    .map(([k, v]) => `<tr><td><strong>${escapeHtml(k)}</strong></td><td>${escapeHtml(v)}</td></tr>`)
    .join("");

  const html = [
    "<h2>New enquiry from vkdapps.com</h2>",
    `<table cellpadding="6">${rows}</table>`,
    "<h3>Project details</h3>",
    `<p>${escapeHtml(body.message).replace(/\n/g, "<br>")}</p>`,
  ].join("");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM || `VKD Apps Website <website@vkdapps.com>`,
        to: [env.CONTACT_TO || DEFAULT_TO],
        reply_to: String(body.email),
        subject: `New enquiry — ${String(body.name).slice(0, 80)}`,
        html,
      }),
    });

    if (!res.ok) {
      console.error("[contact] provider rejected:", res.status, await res.text());
      return json({ ok: false, code: "send_failed", error: "We couldn't send your message." }, 502);
    }
    return json({ ok: true }, 200);
  } catch (err) {
    console.error("[contact] send threw:", err);
    return json({ ok: false, code: "send_failed", error: "We couldn't send your message." }, 502);
  }
}

export const onRequestGet = () =>
  json({ ok: false, code: "method_not_allowed", error: "Use POST." }, 405);
