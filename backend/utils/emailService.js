import axios from 'axios';

export const sendEmail = async (options) => {
  // We use EmailJS REST API to send emails instead of SMTP
  // This bypasses the render port blocking issues.

  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY; // Optional, but good if required in settings

  if (!serviceId || !templateId || !publicKey) {
    console.error('EmailJS credentials are not configured in .env');
    return;
  }

  const data = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: {
      to_email: options.email,
      to_name: options.to_name || 'Faculty Member',
      subject: options.subject,
      message: options.message,
      reset_url: options.reset_url || '',
    }
  };

  // Add accessToken (private key) if configured for higher security
  if (privateKey) {
    data.accessToken = privateKey;
  }

  try {
    const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('Email sent successfully via EmailJS');
  } catch (error) {
    console.error('Error sending email via EmailJS:', error.response?.data || error.message);
    throw new Error('Email sending failed');
  }
};
