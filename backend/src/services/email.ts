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

async function sendOrLog(to: string, subject: string, text: string): Promise<void> {
  if (!resend) {
    console.log(`[email] (dev fallback) to ${to} — ${subject}\n${text}`);
    return;
  }
  try {
    await resend.emails.send({ from: env.contactFromEmail, to, subject, text });
  } catch (err) {
    console.error('[email] failed to send', subject, err);
  }
}

const adminBase = env.clientOrigin.split(',')[0].trim();

/** Sends a new admin user their temporary password and the login link. */
export async function sendNewUserEmail(to: string, fullName: string, tempPassword: string): Promise<void> {
  const text = [
    `Hi ${fullName},`,
    '',
    'An OBK MEDIA admin account has been created for you.',
    '',
    `Sign in here: ${adminBase}/admin/login`,
    `Email: ${to}`,
    `Temporary password: ${tempPassword}`,
    '',
    'For your security, you’ll be asked to set a new password the first time you sign in.',
    '',
    '— OBK MEDIA',
  ].join('\n');
  await sendOrLog(to, 'Your OBK MEDIA admin account', text);
}

/** Sends a password-reset link containing the one-time token. */
export async function sendPasswordResetEmail(to: string, fullName: string, token: string): Promise<void> {
  const link = `${adminBase}/admin/reset-password?token=${token}`;
  const text = [
    `Hi ${fullName},`,
    '',
    'We received a request to reset your OBK MEDIA admin password.',
    '',
    `Reset it here (valid for 1 hour): ${link}`,
    '',
    'If you didn’t request this, you can safely ignore this email.',
    '',
    '— OBK MEDIA',
  ].join('\n');
  await sendOrLog(to, 'Reset your OBK MEDIA password', text);
}
