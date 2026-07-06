const axios = require("axios");

class ChapterService {
  /**
   * Validate safe URL
   */
  static isValidTargetUrl(urlString) {
    try {
      const url = new URL(urlString);
      const hostname = url.hostname.toLowerCase();

      const privateRanges = [
        /^127\./,
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
        /^192\.168\./,
        /^169\.254\./,
        /^localhost$/,
        /^0\./,
      ];

      if (privateRanges.some((r) => r.test(hostname))) {
        return false;
      }

      return url.protocol === "http:" || url.protocol === "https:";
    } catch (e) {
      return false;
    }
  }

  /**
   * Normalize Komiku CDN domain
   */
  static normalizeUrl(url) {
    return url.replace("img.komiku.org", "img2.komiku.org");
  }

  /**
   * Try fetch image stream with fallback
   */
  static async fetchStream(url) {
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      Referer: "https://komiku.org/",
      Accept: "image/*",
    };

    try {
      return await axios.get(url, {
        responseType: "stream",
        headers,
        timeout: 15000,
      });
    } catch (err) {
      // fallback if still using old domain
      if (url.includes("img.komiku.org")) {
        const fallbackUrl = url.replace(
          "img.komiku.org",
          "img1.komiku.org",
          "img2.komiku.org"
        );

        return await axios.get(fallbackUrl, {
          responseType: "stream",
          headers,
          timeout: 15000,
        });
      }

      throw err;
    }
  }

  /**
   * Stream handler
   */
  static async stream(req, res) {
    let url = req.query.url;

    if (!url || !this.isValidTargetUrl(url)) {
      return res.status(400).json({
        error: "Invalid or unsafe URL",
      });
    }

    // normalize domain BEFORE request
    url = this.normalizeUrl(url);

    try {
      const response = await this.fetchStream(url);

      res.setHeader(
        "Content-Type",
        response.headers["content-type"] || "image/jpeg"
      );

      response.data.pipe(res);
    } catch (err) {
      console.error("Proxy error:", err.message);

      return res.status(500).json({
        error: "Failed to proxy image",
        detail: err.message,
      });
    }
  }
}

module.exports = ChapterService;