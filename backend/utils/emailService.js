import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  let transporter;

  // If real SMTP settings exist, use them
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 5000, // 5 seconds timeout
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });
  } else {
    // Fail fast in production if SMTP is missing
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SMTP_HOST and SMTP_USER environment variables are required in production.');
    }
    
    // Otherwise, generate a fake Ethereal account on the fly for testing
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
      connectionTimeout: 5000,
    });
    console.log(`\n=== NO SMTP CONFIG FOUND: Using Ethereal Test Account ===`);
  }

  const message = {
    from: `${process.env.FROM_NAME || 'CDGI Administrator'} <${process.env.FROM_EMAIL || 'noreply@cdgi.edu.in'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
  // Log the ethereal url if using ethereal
  if (info.messageId && transporter.options.host === 'smtp.ethereal.email') {
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
};
