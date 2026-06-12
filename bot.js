// bot.js

const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Tokeni oxuyuruq
const TOKEN = process.env.TOKEN;

// Botu polling rejimində işə salırıq
const bot = new TelegramBot(TOKEN, { polling: true });

// İstifadəçilərin saxlanacağı siyahı
let users = [];

// Oyun aktivdir?
let gameStarted = false;

// /start komandası
bot.onText(/\/start/, (msg) => {
    gameStarted = true;
    users = []; // Yeni oyun üçün siyahını sıfırla

    bot.sendMessage(
        msg.chat.id,
        "Pasyolka FK:\nHəftə sonu olacaq futbol oyununun heyət seçimi başlamışdır.\nOyuna gəlmək istəyənlər '+' yazsın, siyahıda olub sonradan işi çıxanlar '-' yazsın."
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

    if (users.length === 0) {
        return bot.sendMessage(msg.chat.id, "Siyahı boşdur.");
    }

    const msgText = users
        .map((u, i) => `${i + 1}. ${u.name}`)
        .join('\n');

    bot.sendMessage(msg.chat.id, msgText);
});

// /completed komandası
bot.onText(/\/completed/, (msg) => {
    if (!gameStarted) {
        return bot.sendMessage(
            msg.chat.id,
            "Aktiv oyun yoxdur."
        );
    }

    if (users.length === 0) {
        gameStarted = false;

        return bot.sendMessage(
            msg.chat.id,
            "Heç bir istifadəçi qeyd olunmayıb."
        );
    }

    const msgText =
        users.map((u, i) => `${i + 1}. ${u.name}`).join('\n') +
        "\n\nSiyahı tamamlandı. Xoş oyunlar :)";

    bot.sendMessage(msg.chat.id, msgText);

    // Oyunu bağla və siyahını təmizlə
    gameStarted = false;
    users = [];
});

// İstifadəçi mesajları
bot.on('message', (msg) => {
    const text = (msg.text || '').trim();

    // Komandaları keç
    if (text.startsWith('/')) {
        return;
    }

    const name = msg.from.first_name;
    const userId = msg.from.id;

    // Oyun aktiv deyilsə + və - işləməsin
    if (!gameStarted) {
        if (text === '+' || text === '-') {
            return bot.sendMessage(
                msg.chat.id,
                "Hələ ki oyun planlaşdırılmayıb. Yeni oyun üçün /start yazın."
            );
        }

        return;
    }

    // Qeydiyyat
    if (text === '+') {
        const exists = users.find(u => u.id === userId);

        if (exists) {
            return bot.sendMessage(
                msg.chat.id,
                `${name} artıq siyahıda var ✅`
            );
        }

        users.push({
            id: userId,
            name
        });

        return bot.sendMessage(
            msg.chat.id,
            `${name} qeyd olundu ✔`
        );
    }

    // Siyahıdan çıxma
    if (text === '-') {
        const exists = users.find(u => u.id === userId);

        if (!exists) {
            return bot.sendMessage(
                msg.chat.id,
                `${name} siyahıda yoxdur ⚠`
            );
        }

        users = users.filter(u => u.id !== userId);

        return bot.sendMessage(
            msg.chat.id,
            `${name} silindi ❌`
        );
    }
});

console.log('Bot işə düşdü!');