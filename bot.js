// bot.js
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Tokeni oxuyuruq
const TOKEN = process.env.TOKEN;

// Botu polling rejimində işə salırıq
const bot = new TelegramBot(TOKEN, { polling: true });

// İstifadəçilərin saxlanacağı siyahı
let users = [];

// /start komandası
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Pasyolka FK: \n Həftə sonu olacaq futbol oyununun heyət seçimi başlamışdır.Oyuna gəlmək istəyənlər '+' yazsın, Siyahıda olub sonradan işi çıxanlar '-'."
  );
});

// /siyahi komandası
bot.onText(/\/siyahi/, (msg) => {
  if (users.length > 0) {
    const msgText = users.map((u, i) => `${i + 1}. ${u}`).join('\n');
    bot.sendMessage(msg.chat.id, msgText);
  } else {
    bot.sendMessage(msg.chat.id, "Siyahı boşdur");
  }
});

// /completed komandası
bot.onText(/\/completed/, (msg) => {
  if (users.length > 0) {
    const msgText = users.map((u, i) => `${i + 1}. ${u} Siyahı tamamlandı. Xoş oyunlar :)`).join('\n');
    bot.sendMessage(msg.chat.id, msgText);
  } else {
    bot.sendMessage(msg.chat.id, "Heç bir istifadəçi qeyd olunmayıb");
  }
});

// İstifadəçi mesajlarını emal edirik
bot.on('message', (msg) => {
  const text = msg.text.trim();
  const name = msg.from.first_name;

  if (text === '+') {
    if (!users.includes(name)) {
      users.push(name);
      bot.sendMessage(msg.chat.id, `${name} qeyd olundu ✔`);
    } else {
      bot.sendMessage(msg.chat.id, `${name} artıq siyahıda var ✅`);
    }
  } else if (text === '-') {
    if (users.includes(name)) {
      users = users.filter(u => u !== name);
      bot.sendMessage(msg.chat.id, `${name} silindi ❌`);
    } else {
      bot.sendMessage(msg.chat.id, `${name} siyahıda yoxdur ⚠`);
    }
  }
});

console.log("Bot işə düşdü...");