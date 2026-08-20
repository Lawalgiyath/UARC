/**
 * What the site can actually tell a delegate, given what is configured.
 *
 * The copy used to promise "email and SMS" unconditionally. With no Twilio
 * credentials that is a promise the site cannot keep, and a delegate waiting
 * for a text that never arrives has no way to know the difference between a
 * slow network and a broken system. This keeps the wording honest to the
 * deployment it is running in.
 */
export function smsEnabled(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER
  );
}

/** "email" or "email and SMS", depending on what is switched on. */
export function notificationChannels(): string {
  return smsEnabled() ? "email and SMS" : "email";
}
