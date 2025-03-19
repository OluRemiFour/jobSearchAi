require("dotenv").config();
const express = require("express");
const PORT = process.env.PORT || 3000; // Use 3000 if .env is not set
const app = express();

app.get("/health", function (req, res) {
  res.status(200).send("Server is up and running!");
});

console.log("Port from .env:", PORT);
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
