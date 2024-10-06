/* eslint-disable no-undef */
// src/services/emailService.js
import nodemailer from 'nodemailer';
import Mailjet from 'node-mailjet';
import dotenv from 'dotenv';
dotenv.config();

const { MAILER_USER, MAILER_HOST, MAILER_PORT, MAILER_PASSWORD } = process.env;

// Configure Mailjet
const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

// Nodemailer transport configuration
const transporter = nodemailer.createTransport({
  host: MAILER_HOST,
  port: MAILER_PORT,
  secure: false,
  auth: {
    user: MAILER_USER,
    pass: MAILER_PASSWORD,
  },
  // debug: true, // Enable debugging output
  // logger: true, // Log to console
  tls: {
    ciphers: 'SSLv3',
    minVersion: 'TLSv1',
    rejectUnauthorized: false,
  },
});

// Function to send email using Nodemailer
const sendEmailWithNodemailer = async (to, subject, text) => {
  const mailOptions = {
    from: MAILER_USER,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully with Nodemailer.');
  } catch (error) {
    console.error('Error sending email with Nodemailer:', error);
    throw error; // Throw error to allow fallback
  }
};

// Function to send email using Mailjet
const sendEmailWithMailjet = async (to, subject, text) => {
  try {
    await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_FROM_EMAIL,
            Name: 'Sleek Abode Apartments',
          },
          To: [{ Email: to }],
          Subject: subject,
          TextPart: text,
        },
      ],
    });
    console.log('Email sent successfully with Mailjet.');
  } catch (error) {
    console.error('Error sending email with Mailjet:', error);
    throw error;
  }
};

// Function to send email (primary and fallback)
export const sendEmail = async (to, subject, text) => {
  try {
    await sendEmailWithNodemailer(to, subject, text);
  } catch (err) {
    console.error(
      'Failed to send email via Nodemailer , trying Mailjet',
      err.message
    );
    try {
      await sendEmailWithMailjet(to, subject, text);
    } catch (error) {
      console.error('Failed to send email via Mailjet as well', err);
      throw new Error(
        'Failed to send email via both Mailjet and Nodemailer',
        error.message
      );
    }
  }
};
