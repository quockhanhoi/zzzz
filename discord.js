const { Client, GatewayIntentBits } = require("discord.js");
const puppeteer = require("puppeteer");
const readline = require("readline");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let browser;
let page;
let waitingCaptcha = false;

// ================= READY =================
client.on("ready", () => {
  console.log(`✅ Bot đã login: ${client.user.tag}`);
});

// ================= MESSAGE =================
client.on("messageCreate", async (msg) => {
  try {
    if (msg.author.bot) return;

    const content = msg.content?.trim().toLowerCase();

    // START COMMAND
    if (content === "!start") {
      await msg.channel.send("🚀 Đang mở trình duyệt...");

      browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
      });

      page = await browser.newPage();

      await page.goto("https://zefoy.com", {
        waitUntil: "networkidle2",
      });

      await msg.channel.send("🔐 Đang chờ captcha...");

      await page.waitForTimeout(3000);

      await sendCaptcha(msg);
    }

    // CAPTCHA INPUT
    if (waitingCaptcha && msg.content && !msg.author.bot) {
      const code = msg.content.trim();

      waitingCaptcha = false;

      await msg.reply(`⌛ Đang nhập: **${code}**`);

      if (!page) {
        return msg.channel.send("❌ Page chưa mở!");
      }

      await page.type("input", code, { delay: 100 });
      await page.keyboard.press("Enter");

      await msg.channel.send("✅ Đã gửi captcha!");
    }
  } catch (err) {
    console.log("❌ ERROR:", err);
    msg.channel.send("❌ Bot bị lỗi, xem console!");
  }
});

// ================= CAPTCHA =================
async function sendCaptcha(msg) {
  try {
    waitingCaptcha = true;

    await page.screenshot({ path: "captcha.png" });

    await msg.channel.send({
      content: "🔐 Nhập captcha bằng cách gõ vào chat:",
      files: ["captcha.png"],
    });
  } catch (err) {
    console.log("Captcha error:", err);
  }
}

// ================= LOGIN =================
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Nhập token: ", (token) => {
  rl.close();
  client.login(token)
    .then(() => console.log("🔑 Logging in..."))
    .catch((err) => console.log("❌ Token lỗi:", err));
});
