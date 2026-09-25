// server.js or index.js
const express = require("express");
const cors = require("cors");
const app = express();

// Allow frontend requests from Vite's port (5173) or any port you run your client on
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json()); // Required to parse incoming json data from the frontend
