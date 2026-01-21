import sgMail from "@sendgrid/mail";

import { getServerEnv } from "@/lib/env";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult = {
  provider: "sendgrid";
  messageId?: string;
  responseHeaders?: Record<string, unknown>;
};

export function isSendGridConfigured(): boolean {
  try {
    const env = getServerEnv();
    return Boolean(env.SENDGRID_API_KEY && env.SENDGRID_SENDER);
  } catch {
    return false;
  }
}

export async function sendEmailViaSendGrid(
  input: SendEmailInput
): Promise<SendEmailResult> {
  const env = getServerEnv();

  if (!env.SENDGRID_API_KEY || !env.SENDGRID_SENDER) {
    throw new Error(
      "SendGrid is not configured. Set SENDGRID_API_KEY and SENDGRID_SENDER."
    );
  }

  sgMail.setApiKey(env.SENDGRID_API_KEY);

  const msg: Record<string, unknown> = {
    to: input.to,
    from: env.SENDGRID_SENDER,
    subject: input.subject,
    html: input.html,
  };

  if (input.text) msg.text = input.text;

  // Optional: SendGrid sandbox mode (won't actually deliver)
  if (env.SENDGRID_SANDBOX_MODE) {
    msg.mail_settings = {
      sandbox_mode: {
        enable: true,
      },
    };
  }

  const [response] = (await sgMail.send(msg as any)) as any[];
  const headers = (response?.headers ?? {}) as Record<string, unknown>;

  const messageId =
    (headers["x-message-id"] as string | undefined) ??
    (headers["x-message-id".toLowerCase()] as string | undefined);

  return {
    provider: "sendgrid",
    messageId,
    responseHeaders: headers,
  };
}
