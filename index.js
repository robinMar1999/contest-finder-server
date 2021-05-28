const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");

const app = express();

// Connect DB
connectDB();

// Use cors
app.use(cors());

// Init Middleware
app.use(express.json({ extended: false })); // to access req.body

// Define routes
app.use("/api/contest", require("./routes/api/contest"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
