// server/app.js
const express = require("express");
const cors = require("cors");
// ... Keep your other existing imports here (db, routes, etc.) ...

const app = express();

// 1. Configure CORS to allow your local environment and your exact Vercel frontend
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://student-result-portal-omega.vercel.app", // ✅ Your real deployed frontend
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// 2. Handle HTTP OPTIONS preflight requests explicitly
// This prevents the "Redirect is not allowed for a preflight request" browser error
app.options("*", cors());

// 3. Built-in body parsers (Make sure these are placed before your routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ... Keep your existing routes and server setup below exactly as they were ...
// Example:
// app.use("/auth", authRoutes);
// app.listen(5000, () => { console.log("Server running") });
