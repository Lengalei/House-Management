/* eslint-disable no-undef */
import dotenv from 'dotenv';
dotenv.config();
// sendEmail.mjs
import nodemailer from 'nodemailer';
import Mailjet from 'node-mailjet';

// Initialize Nodemailer transport
const transport = nodemailer.createTransport({
  service: 'gmail',
  secure: false,
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Initialize Mailjet client
const mailjetClient = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

const getResetPasswordEmailContent = (resetLink) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
      <p style="color: #555; font-size: 16px;">
        We received a request to reset your password. Click the button below to reset your password:
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
          Reset Password
        </a>
      </div>
      <p style="color: #555; font-size: 14px;">
        If you did not request a password reset, please ignore this email. This link will expire in 24 hours.
      </p>
      <p style="color: #777; font-size: 12px; text-align: center;">
        © 2024 House Management Team. All rights reserved.
      </p>
    </div>
  `;
};

const sendMailjetEmail = async (to, subject, html) => {
  const request = mailjetClient.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: process.env.MAILJET_FROM_EMAIL,
          Name: 'House Management Team',
        },
        To: [
          {
            Email: to,
          },
        ],
        Subject: subject,
        HTMLPart: html,
      },
    ],
  });

  try {
    await request;
    console.log('Email sent via Mailjet');
  } catch (err) {
    console.error('Failed to send email via Mailjet', err);
    throw new Error('Failed to send email via Mailjet');
  }
};

const sendNodemailerEmail = async (to, subject, html) => {
  try {
    await transport.sendMail({
      from: process.env.AUTH_EMAIL,
      to,
      subject,
      html,
    });
    console.log('Email sent via Nodemailer');
  } catch (err) {
    console.error('Failed to send email via Nodemailer', err);
    throw new Error('Failed to send email via Nodemailer');
  }
};

const sendResetPasswordEmail = async (email, resetLink) => {
  const subject = 'Reset your password';
  const html = getResetPasswordEmailContent(resetLink);

  try {
    await sendMailjetEmail(email, subject, html);
  } catch (err) {
    console.error('Failed to send email via Mailjet, trying Nodemailer', err);
    try {
      await sendNodemailerEmail(email, subject, html);
    } catch (err) {
      console.error('Failed to send email via Nodemailer as well', err);
      throw new Error('Failed to send email via both Mailjet and Nodemailer');
    }
  }
};

export default sendResetPasswordEmail;
