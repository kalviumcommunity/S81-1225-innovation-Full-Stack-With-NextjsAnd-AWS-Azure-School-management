import { sendEmailViaSendGrid, type SendEmailInput } from "./sendgrid";
import { welcomeTemplate } from "./templates/welcome";

export async function sendEmail(input: SendEmailInput) {
  return sendEmailViaSendGrid(input);
}

export async function sendWelcomeEmail(params: {
  to: string;
  firstName: string;
}) {
  const html = welcomeTemplate(params.firstName);
  return sendEmail({
    to: params.to,
    subject: `Welcome, ${params.firstName}!`,
    html,
  });
}
