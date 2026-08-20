import nodemailer, { type Transporter } from "nodemailer";

// Email goes out by whichever route is configured, checked in this order:
//
//   1. SMTP  (SMTP_HOST / SMTP_USER / SMTP_PASS)  — works with Gmail, Zoho,
//      Outlook, or the university's own mail server. This is the quickest
//      route to a working demo: a Gmail App Password needs no domain, no
//      sender verification and no approval queue.
//   2. SendGrid (SENDGRID_API_KEY / SENDGRID_FROM_EMAIL) — better for volume
//      once the conference is live and sending hundreds of confirmations.
//   3. Neither — the message is printed to the server log in full, so a flow
//      can still be walked end to end and the wording checked. Nothing is
//      silently swallowed.
//
// Whichever route is used, a failure to send never breaks the request that
// triggered it: a delegate's registration must not fail because a mail server
// was briefly unreachable.

interface SendEmailArgs {
  to: string;
  subject: string;
  text: string;
  /** So replies reach the Secretariat rather than the sending account. */
  replyTo?: string;
}

/** Reused across requests; building a transport per message is wasteful. */
let cachedTransport: Transporter | null = null;

function smtpConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function transport(): Transporter {
  if (cachedTransport) return cachedTransport;

  const port = Number(process.env.SMTP_PORT || 587);
  cachedTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // 465 is implicit TLS; 587 starts plain and upgrades via STARTTLS.
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      // Google displays App Passwords in four groups of four. People paste
      // them exactly as shown, and the spaces are not part of the secret.
      pass: (process.env.SMTP_PASS || "").replace(/\s+/g, ""),
    },
  });
  return cachedTransport;
}

/** The address delegates see in the From line. */
function fromAddress(): string {
  const name = process.env.MAIL_FROM_NAME || "UNILAG Annual Research Conference";
  const address =
    process.env.MAIL_FROM_ADDRESS || process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_USER || "";
  return `${name} <${address}>`;
}

function logToConsole({ to, subject, text }: SendEmailArgs, reason: string) {
  console.warn(
    [
      "",
      `┌─ EMAIL NOT SENT (${reason})`,
      `│  To:      ${to}`,
      `│  Subject: ${subject}`,
      "│",
      ...text.split("\n").map((l) => `│  ${l}`),
      "└─",
      "",
    ].join("\n")
  );
}

export async function sendEmail(args: SendEmailArgs): Promise<void> {
  const { to, subject, text, replyTo } = args;

  // ---- 1. SMTP ----------------------------------------------------------
  if (smtpConfigured()) {
    try {
      const info = await transport().sendMail({
        from: fromAddress(),
        to,
        subject,
        text,
        replyTo: replyTo || process.env.MAIL_REPLY_TO || undefined,
      });
      console.log(`[email] sent to ${to} via SMTP (${info.messageId})`);
    } catch (err) {
      console.error(`[email] SMTP send to ${to} failed`, err);
    }
    return;
  }

  // ---- 2. SendGrid ------------------------------------------------------
  const apiKey = process.env.SENDGRID_API_KEY;
  const sendgridFrom = process.env.SENDGRID_FROM_EMAIL;

  if (apiKey && sendgridFrom) {
    try {
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: {
            email: sendgridFrom,
            name: process.env.MAIL_FROM_NAME || "UNILAG Annual Research Conference",
          },
          ...(replyTo || process.env.MAIL_REPLY_TO
            ? { reply_to: { email: replyTo || process.env.MAIL_REPLY_TO } }
            : {}),
          subject,
          content: [{ type: "text/plain", value: text }],
        }),
      });

      if (!res.ok) {
        console.error(`[email] SendGrid error ${res.status}: ${await res.text()}`);
      } else {
        console.log(`[email] sent to ${to} via SendGrid`);
      }
    } catch (err) {
      console.error(`[email] SendGrid send to ${to} failed`, err);
    }
    return;
  }

  // ---- 3. Nothing configured -------------------------------------------
  logToConsole(args, "no SMTP_* or SENDGRID_* credentials set");
}

/**
 * Proves the mail route works without walking a whole registration.
 * Used by `npm run test-email`.
 */
export async function verifyEmailTransport(): Promise<string> {
  if (smtpConfigured()) {
    await transport().verify();
    return `SMTP ready: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587} as ${process.env.SMTP_USER}`;
  }
  if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) {
    return `SendGrid configured, sending as ${process.env.SENDGRID_FROM_EMAIL}`;
  }
  throw new Error(
    "No email route configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS (see README), or SENDGRID_API_KEY and SENDGRID_FROM_EMAIL."
  );
}
