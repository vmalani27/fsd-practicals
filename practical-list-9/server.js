const express = require("express");
const app = express();
const port = 3000;

// Import routes
const homeRoute = require("./routes/home");

// Use routes
app.use("/", homeRoute);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
