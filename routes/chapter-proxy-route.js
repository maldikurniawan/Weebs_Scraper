const router = require("express").Router();
const chapterProxy = require("../services/chapter-proxy.js");

router.get("/", (req, res) => chapterProxy.stream(req, res));

module.exports = router;
