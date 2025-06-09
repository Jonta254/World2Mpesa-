const express = require("express");
const cors = require("cors");
const twilio = require("twilio");

const app = express();
app.use(cors());
app.use(express.json());

const accountSid = "ACb837ffb79fb28b80af1192fae62d07bb";
const authToken = "7ece521815f0a85f7e509ab706cd0044";
const client = twilio(accountSid, authToken);
const adminPhone = "+254795621901";

app.post("/api/send-sms", async (req, res) => {
  const { phone, amount } = req.body;

  try {
    await client.messages.create({
      body: `New World2Mpesa request: ${amount} from ${phone}`,
      from: "+1234567890", // your Twilio number
      to: adminPhone
    });
    res.sendStatus(200);
  } catch (err) {
    console.error("SMS error", err);
    res.sendStatus(500);
  }
});

module.exports = app;
