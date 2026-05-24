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

let page;
let waitingCaptcha = false;

client.on("messageCreate", async (msg) => {
  if (msg.content === "!start") {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });

    page = await browser.newPage();
    await page.goto("https://zefoy.com");

    msg.channel.send("🚀 Đã mở Zefoy. Đang chờ captcha...");

    await new Promise(r => setTimeout(r, 3000));

    await sendCaptcha(msg);
  }

  if (waitingCaptcha && msg.author.bot === false) {
    const code = msg.content.trim();

    waitingCaptcha = false;

    await msg.reply(`⌛ Đang nhập mã: ${code}`);

    await page.type("input", code);
    await page.keyboard.press("Enter");

    msg.channel.send("✅ Đã gửi captcha, tiếp tục chạy...");
  }
});

async function sendCaptcha(msg) {
  waitingCaptcha = true;

  await page.screenshot({ path: "captcha.png" });

  msg.channel.send({
    content: "🔐 Nhập mã captcha bằng cách gõ trực tiếp vào chat:",
    files: ["captcha.png"],
  });
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("Nhập token: ", (token) => {
  rl.close();
  client.login(token);
});
