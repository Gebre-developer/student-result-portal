// server/app.js
const express = require("express");
const cors = require("cors");
// ... your other imports like routes, passport, or path configs go here ...

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      // ✅ REMOVED THE PLACEHOLDER AND ALIGNED IT WITH YOUR REAL LIVE FRONTEND URL
      "https://student-result-portal-omega.vercel.app",
    ],
    credentials: true,
  }),
);

// ... keep all the rest of your app.use handlers, body-parsers, and server listening loops exactly the same ...
