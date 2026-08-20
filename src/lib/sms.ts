interface SendSmsArgs {
  to: string;
  body: string;
}

export async function sendSms({ to, body }: SendSmsArgs): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!sid || !token || !from) {
    console.warn(`\u250C\u2500 SMS NOT SENT (Twilio env vars unset)\n\u2502  To:   ${to}\n\u2502  Body: ${body}\n\u2514\u2500`);
    return;
  }

  const params = new URLSearchParams({ To: to, From: from, Body: body });
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error(`[sms] Twilio error ${res.status}: ${errBody}`);
  }
}
