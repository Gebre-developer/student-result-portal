// index.js
const express = require("express");
const cors = require("cors");
const app = express();

// ✅ FIXED CORS: Grant explicit permission to both local development and your live production URL
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://student-result-portal-omega.vercel.app", // 👈 Your exact live production website domain path
    ],
    credentials: true,
  }),
);

app.use(express.json()); // Required to parse incoming json data from the frontend
