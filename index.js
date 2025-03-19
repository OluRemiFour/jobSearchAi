const express = require("express");
const app = express();

app.get("/health", function (req, res) {
  res.status(200).send("Server is up and running!");
});
const PORT = 5000;
app.listen(PORT, function () {
  console.log("Server is listening on port", PORT);
});
