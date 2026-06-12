// bot.js
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Tokeni oxuyuruq
const TOKEN = process.env.TOKEN;

// Botu polling rejimində işə salırıq
const bot = new TelegramBot(TOKEN, { polling: true });

// İstifadəçilərin saxlanacağı siyahı (RAM-dadır, restartda silinir)
let users = [];

// Oyun aktivdir?
let gameStarted = false;

// /start komandası
bot.onText(/\/start/, (msg) => {
    gameStarted = true;
    bot.sendMessage(
        msg.chat.id,
        "Pasyolka FK: \nHəftə sonu olacaq futbol oyununun heyət seçimi başlamışdır.\nOyuna gəlmək istəyənlər '+' yazsın, siyahıda olub sonradan işi çıxanlar '-' yazsın."
    );
});


// /siyahi komandası
bot.onText(/\/siyahi/, (msg) => {
    if (!gameStarted) {
        return bot.sendMessage(
            msg.chat.id,
            "Hələ ki oyun planlaşdırılmayıb. Yeni oyun üçün /start yazın."
        );
    }

    if (users.length > 0) {
        const msgText = users.map((u, i) => `${i + 1}. ${u.name}`).join('\n');
        bot.sendMessage(msg.chat.id, msgText);
    } else {
        bot.sendMessage(msg.chat.id, "Siyahı boşdur");
    }
});

// /completed komandası
bot.onText(/\/completed/, (msg) => {
    if (!gameStarted) {
        return bot.sendMessage(
            msg.chat.id,
            "Aktiv oyun yoxdur."
        );
    }

    if (users.length > 0) {
        const msgText =
            users.map((u, i) => `${i + 1}. ${u.name}`).join('\n') +
            "\n\nSiyahı tamamlandı. Xoş oyunlar :)";

        bot.sendMessage(msg.chat.id, msgText);
    } else {
        bot.sendMessage(msg.chat.id, "Heç bir istifadəçi qeyd olunmayıb");
    }

    gameStarted = false;
});

// Mesajlar
bot.on('message', (msg) => {
    const text = (msg.text || '').trim();
    const name = msg.from.first_name;
    const userId = msg.from.id;

    if (text === '+' || text === '-') {
        if (!gameStarted) {
            return bot.sendMessage(
                msg.chat.id,
                "Hələ ki oyun planlaşdırılmayıb. Yeni oyun üçün /start yazın."
            );
        }
    }

    if (text === '+') {
        if (!users.find(u => u.id === userId)) {
            users.push({ id: userId, name });
            bot.sendMessage(msg.chat.id, `${name} qeyd olundu ✔`);
        } else {
            bot.sendMessage(msg.chat.id, `${name} artıq siyahıda var ✅`);
        }
    }

    if (text === '-') {
        if (users.find(u => u.id === userId)) {
            users = users.filter(u => u.id !== userId);
            bot.sendMessage(msg.chat.id, `${name} silindi ❌`);
        } else {
            bot.sendMessage(msg.chat.id, `${name} siyahıda yoxdur ⚠`);
        }
    }
});

console.log('bot işə düşdü!')