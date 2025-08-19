const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.use(morgan("dev"));

app.use(express.json());

/// Root route
app.get("/", (req, res) => {
    res.json({
        message: "Weebs Scraper API",
        version: "1.0.0",
        endpoints: {
            anoboy: "/api/anoboy",
            komiku: "/api/komiku",
            komikcast: "/api/komikcast",
            proxy: "/api/proxy"
        },
        status: "running",
        environment: {
            anoboy_configured: !!process.env.ANOBOY_LINK,
            komikcast_configured: !!process.env.KOMIKCAST_LINK
        }
    });
});

/// Health check
app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

/// Use Komikcast route
app.use("/api/komikcast/", require("./routes/manga-route.js"));

/// Use Komiku route
app.use("/api/komiku/", require("./routes/komiku-route.js"));

/// Use Anoboy route
app.use("/api/anoboy/", require("./routes/anoboy-route.js"));

/// Use Proxy route
app.use("/api/proxy/", require("./routes/proxy-route.js"));

/// Listen to certain port
app.listen(port, () => console.log(`server running on port ${port}`));