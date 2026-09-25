// server/app.js
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://vercel.app", // Replace with your actual frontend domain when deployed
    ],
    credentials: true,
  }),
);
