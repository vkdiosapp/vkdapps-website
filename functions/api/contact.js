/**
 * POST /api/contact — Cloudflare Pages Function.
 *
 * Configure in the Cloudflare Pages dashboard (Settings > Environment variables):
 *   RESEND_API_KEY  (secret, required)  — API key from resend.com
 *   CONTACT_TO      (optional)          — destination inbox, defaults to vkdiosapp@gmail.com
 *   CONTACT_FROM    (optional)          — verified sender on your domain (e.g. contact@vkdapps.com)
 *
 * Defaults to 'VKD Apps <onboarding@resend.dev>' if CONTACT_FROM is not yet verified,
 * allowing instant delivery to the account email.
 */

const REQUIRED = ["name", "email", "projectType", "budget", "inquiryType", "message"];
const DEFAULT_TO = "vkdiosapp@gmail.com";

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

  const rawKey = env.RESEND_API_KEY ? String(env.RESEND_API_KEY).trim() : "";
  if (!rawKey) {
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

  const recipient = env.CONTACT_TO || DEFAULT_TO;
  const primarySender = env.CONTACT_FROM || "VKD Apps <onboarding@resend.dev>";

  const sendEmail = async (fromAddress) => {
    return fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${rawKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [recipient],
        reply_to: String(body.email),
        subject: `New enquiry — ${String(body.name).slice(0, 80)}`,
        html,
      }),
    });
  };

  try {
    let res = await sendEmail(primarySender);
    let resData = await res.json().catch(() => ({}));

    // If custom sender failed (e.g. unverified custom domain), fallback to onboarding@resend.dev
    if (!res.ok && primarySender !== "VKD Apps <onboarding@resend.dev>") {
      console.warn("[contact] primary sender failed, trying onboarding sender:", res.status, resData);
      res = await sendEmail("VKD Apps <onboarding@resend.dev>");
      resData = await res.json().catch(() => ({}));
    }

    if (!res.ok) {
      console.error("[contact] Resend rejected:", res.status, resData);
      const msg = resData.message || (typeof resData === "string" ? resData : "Email service rejected transmission.");
      return json({ ok: false, code: "provider_error", error: msg }, 400);
    }

    return json({ ok: true }, 200);
  } catch (err) {
    console.error("[contact] send threw:", err);
    return json({ ok: false, code: "send_failed", error: "Connection error contacting email service." }, 400);
  }
}

export const onRequestGet = () =>
  json({ ok: false, code: "method_not_allowed", error: "Use POST." }, 405);
