const axios = require("axios");

/// Chapter Service
class ChapterService {
  /**
   * Validates if the target URL is safe to proxy
   * @param {string} urlString - The URL to validate
   * @returns {boolean} - True if safe, false otherwise
   */
  static isValidTargetUrl(urlString) {
    try {
      const url = new URL(urlString);
      const hostname = url.hostname.toLowerCase();

      // Block local and private addresses
      const privateRanges = [
        /^127\./, // Loopback
        /^10\./, // Private Class A
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private Class B
        /^192\.168\./, // Private Class C
        /^169\.254\./, // Link-local
        /^localhost$/, // Localhost
        /^0\./, // Current network
      ];

      if (privateRanges.some((range) => range.test(hostname))) {
        return false;
      }

      // Ensure protocol is http or https
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  /// Stream data
  static async stream(req, res) {
    /// Get the url from query params
    const url = req.query.url;

    /// Validate the url
    if (!url || !this.isValidTargetUrl(url)) {
      return res.status(400).json({
        error:
          "Invalid or unsafe URL. Access to internal networks is prohibited.",
      });
    }

    /// Get image
    try {
      const response = await axios.get(url, { 
        responseType: "stream",
        // Menambahkan headers khusus untuk melewati proteksi DDoS-Guard & Komiku
        headers: {
          'Host': 'img.komiku.org',
          'Cookie': '__ddg9_=104.28.156.139; __ddgid_=mlHfH1uTwwz8qsJg; __ddgmark_=bAxOowsMw7bBeYgE; __ddg5_=0mhGaPYMBNHq4RMS; __ddg1_=P0g4vMEfJfhl4Bn2lK8C; _ga=GA1.1.218227453.1780996195; _ga_ZEY1BX76ZS=GS2.1.s1780996195$o1$g1$t1780996304$j60$l0$h0; __ddg10_=1780996305; __ddg8_=unbfIA7YryHSlKjG',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Accept-Language': 'en-US,en;q=0.9',
          'Sec-Ch-Ua': '"Not-A.Brand";v="24", "Chromium";v="146"',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
          'Sec-Ch-Ua-Mobile': '?0',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Sec-Fetch-Site': 'same-site',
          'Sec-Fetch-Mode': 'no-cors',
          'Sec-Fetch-Dest': 'image',
          'Referer': 'https://komiku.org/',
          'Accept-Encoding': 'gzip, deflate, br',
          'Priority': 'i'
        },
        timeout: 15000 // Menambahkan timeout 15 detik agar server tidak hang jika lambat
      });

      /// Content
      res.setHeader("Content-Type", response.headers["content-type"]);
      
      /// Pipe the result
      response.data.pipe(res);
    } catch (err) {
      console.error("Failed to proxy :", err.message);
      res.status(500).json({ error: `Failed to proxy : ${err.message}` });
    }
  }
}

module.exports = ChapterService;