const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const fetch = require('node-fetch'); // for EmailJS
const twilio = require('twilio');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Environment variables
const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
  EMAILJS_USER_ID,
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  ADMIN_PHONE_NUMBER,
  ADMIN_EMAIL
} = process.env;

// Twilio client
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// POST endpoint for withdrawal request
app.post('/withdraw', async (req, res) => {
  const { username, cryptoAmount, phoneNumber, transactionType } = req.body;

  if (!username || !cryptoAmount || !phoneNumber || !transactionType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Prepare EmailJS data
  const emailPayload = {
    service_id: EMAILJS_SERVICE_ID,
    template_id: EMAILJS_TEMPLATE_ID,
    user_id: EMAILJS_USER_ID,
    template_params: {
      username,
      cryptoAmount,
      phoneNumber,
      transactionType,
      admin_email: ADMIN_EMAIL
    }
  };

  // Send email via EmailJS REST API
  try {
    const emailRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });

    if (!emailRes.ok) {
      throw new Error('Failed to send email');
    }

    // Send SMS via Twilio
    const smsBody = `New World2Mpesa request:
User: ${username}
Crypto: ${cryptoAmount}
Phone: ${phoneNumber}
Type: ${transactionType}`;
    await twilioClient.messages.create({
      body: smsBody,
      from: TWILIO_PHONE_NUMBER,
      to: ADMIN_PHONE_NUMBER
    });

    res.status(200).json({ message: 'Notification sent successfully' });

  } catch (err) {
    console.error('Notification Error:', err.message);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
