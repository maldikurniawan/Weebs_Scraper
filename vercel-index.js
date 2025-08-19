const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

/// Use Komikcast route
app.use("/api/komikcast/", require("../routes/manga-route.js"));
/// Use Komiku route
app.use("/api/komiku/", require("../routes/komiku-route.js"));
/// Use Anoboy route
app.use("/api/anoboy/", require("../routes/anoboy-route.js"));
/// Use Proxy route
app.use("/api/proxy/", require("../routes/proxy-route.js"));

module.exports = app;
