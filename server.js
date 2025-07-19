const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");


const app = express();
app.use(cors());
app.use(bodyParser.json());


// 🚀 1. Receive message → Send to n8n POST webhook
app.post("/send", async (req, res) => {
 const { message } = req.body;


 try {
   await axios.post(
     "https://dden4.app.n8n.cloud/webhook/b83a898a-208d-4a30-a134-3b513beb6244",
     { message }
   );


   res.json({ status: "Message sent", data: { message } });
 } catch (err) {
   console.error("❌ Failed to send to n8n:", err.message);
   console.error("Full error:", err.response?.data || err);
   res.status(500).json({ error: "n8n POST failed" });
 }
});


// 📤 2. Frontend will call this to fetch all messages
app.get("/all-messages", async (req, res) => {
 try {
   const response = await axios.get(
     "https://dden4.app.n8n.cloud/webhook/352b1ed9-a6be-411b-a0c3-1e754c4ed900"
   );
   res.json({ messages: response.data });
 } catch (err) {
   console.error("❌ Failed to fetch messages:", err.message);
   res.status(500).json({ error: "n8n GET failed" });
 }
});


// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
 console.log(`🚀 Server running at http://localhost:${PORT}`);
});
