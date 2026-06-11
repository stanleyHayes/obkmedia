import { Resend } from 'resend';
import { env } from '../config/env.js';
import { Admin } from '../models/Admin.js';
import type { ContactMessageDoc } from '../models/ContactMessage.js';

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

/** The configured owner inbox plus every active admin who opted in via preferences. */
async function contactRecipients(): Promise<string[]> {
  const optIns = await Admin.find({ isActive: true, 'preferences.notifyOnContact': true })
    .select('email')
    .lean()
    .catch(() => []);
  return [...new Set([env.contactNotifyEmail, ...optIns.map((admin) => admin.email)])];
}

export async function sendContactNotification(
  message: Pick<
    ContactMessageDoc,
    'fullName' | 'email' | 'phone' | 'company' | 'shootType' | 'preferredDate' | 'location' | 'budgetRange' | 'message'
  >,
): Promise<void> {
  const lines = [
    `Name: ${message.fullName}`,
    `Email: ${message.email}`,
    message.phone ? `Phone/WhatsApp: ${message.phone}` : null,
    message.company ? `Company: ${message.company}` : null,
    message.shootType ? `Shoot type: ${message.shootType}` : null,
    message.preferredDate ? `Preferred date: ${new Date(message.preferredDate).toDateString()}` : null,
    message.location ? `Location: ${message.location}` : null,
    message.budgetRange ? `Budget: ${message.budgetRange}` : null,
    '',
    message.message,
  ].filter((line): line is string => line !== null);

  const recipients = await contactRecipients();

  if (!resend) {
    console.log(
      `[email] (dev fallback) contact notification for ${recipients.join(', ')}:\n${lines.join('\n')}`,
    );
    return;
  }

  try {
    await resend.emails.send({
      from: env.contactFromEmail,
      to: recipients,
      replyTo: message.email,
      subject: `New booking inquiry from ${message.fullName} — OBK MEDIA`,
      text: lines.join('\n'),
    });
  } catch (err) {
    // Email failure must not fail the submission — it is already stored in the database.
    console.error('[email] failed to send contact notification', err);
  }
}
