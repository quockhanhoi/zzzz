const { Client, GatewayIntentBits } = require("discord.js");
const puppeteer = require("puppeteer");

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

    // giả lập phát hiện captcha
    await page.waitForTimeout(3000);

    await sendCaptcha(msg);
  }

  // user nhập captcha
  if (waitingCaptcha && msg.author.bot === false) {
    const code = msg.content.trim();

    waitingCaptcha = false;

    await msg.reply(`⌛ Đang nhập mã: ${code}`);

    // ví dụ nhập captcha vào input
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

client.login("MTMyNTMzNTg4ODQ2NDcxMTY5MA.GW3tcW.4TmlKfA7lUopozRGfeQ2bAslrCFuSzxq8m71Kw");
