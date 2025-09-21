import express from "express";
import dotenv from "dotenv";
import { initDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

import transactionsRoute from "./routes/transactionsRoute.js";
import job from "./config/cron.js";

dotenv.config();

const app = express();

// Run cron job if in production
if (process.env.NODE_ENV === "production") job.start();

// Middleware
app.use(rateLimiter);
app.use(express.json());

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Transactions route
app.use("/api/transactions", transactionsRoute);

// Get port from .env or default to 5001
const PORT = process.env.PORT || 5001;

// Initialize DB and start server
initDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is up and running on PORT: ${PORT}`);
    console.log(`Accessible on your network at http://<your-laptop-ip>:${PORT}`);
  });
}).catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

// import express from "express";
// import dotenv from "dotenv";
// import serverless from "serverless-http";
// import { initDB } from "./config/db.js";
// import rateLimiter from "./middleware/rateLimiter.js";
// import transactionsRoute from "./routes/transactionsRoute.js";
// import job from "./config/cron.js";

// dotenv.config();

// const app = express();

// // Run cron job if in production
// if (process.env.NODE_ENV === "production") job.start();

// // Middleware
// app.use(rateLimiter);
// app.use(express.json());

// // Health check
// app.get("/api/health", (req, res) => {
//   res.status(200).json({ status: "ok" });
// });

// // Transactions route
// app.use("/api/transactions", transactionsRoute);

// // Function to start local server
// const startServer = async () => {
//   try {
//     await initDB();

//     if (process.env.NODE_ENV !== "production") {
//       const PORT = process.env.PORT || 5001;
//       app.listen(PORT, () => {
//         console.log("Server running locally on Port", PORT);
//       });
//     }
//   } catch (error) {
//     console.log("Failed to start server", error);
//     process.exit(1);
//   }
// };

// // Detect if running on Vercel
// const isServerless = !!process.env.VERCEL;

// if (!isServerless) {
//   startServer();
// }

// // Export for serverless
// export default isServerless ? serverless(app) : app;