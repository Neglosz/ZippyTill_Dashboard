const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables before requiring any other files
dotenv.config({ path: path.join(__dirname, ".env") });

const apiRoutes = require("./domains/core/routes/api");
const errorMiddleware = require("./domains/core/middleware/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api", apiRoutes); 

// Root endpoint
app.get("/", (req, res) => {
  res.send("ZippyTill Backend API is running...");
});

// Use centralized error handling middleware
app.use(errorMiddleware);

// 404 Handler (must be last)
app.use((req, res) => {
  res.status(404).json({ error: `Not Found: ${req.method} ${req.url}` });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
