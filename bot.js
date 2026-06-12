// bot.js
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// read token
const TOKEN = process.env.TOKEN;

// running bot
const bot = new TelegramBot(TOKEN, { polling: true });

// users list
let users = [];

// new game started ?
let gameStarted = false;

// /start command
bot.onText(/\/start/, (msg) => {
    gameStarted = true;
    users = [];

    bot.sendMessage(
        msg.chat.id,
        "Pasyolka FK:\nHəftə sonu olacaq futbol oyununun heyət seçimi başlamışdır.\nOyuna gəlmək istəyənlər '+' yazsın, siyahıda olub sonradan işi çıxanlar '-' yazsın."
    );
});

// /list command
bot.onText(/\/list/, (msg) => {
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

// /completed command
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

    // close current game and initialize list
    gameStarted = false;
    users = [];
});

// user messages
bot.on('message', (msg) => {
    const text = (msg.text || '').trim();

    // skip commands
    if (text.startsWith('/')) {
        return;
    }

    const name = msg.from.first_name;
    const userId = msg.from.id;

    // is game started ?
    if (!gameStarted) {
        if (text === '+' || text === '-') {
            return bot.sendMessage(
                msg.chat.id,
                "Hələ ki oyun planlaşdırılmayıb. Yeni oyun üçün /start yazın."
            );
        }

        return;
    }

    // Register
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

        let msgText = `${name} qeyd olundu ✔ \n \n `;
        msgText += users.map((u, i) => `${i + 1}. ${u.name}`).join('\n');
        return bot.sendMessage(msg.chat.id, msgText);
    }

    // leave the list
    if (text === '-') {
        const exists = users.find(u => u.id === userId);

        if (!exists) {
            return bot.sendMessage(
                msg.chat.id,
                `${name} siyahıda yoxdur ⚠`
            );
        }

        users = users.filter(u => u.id !== userId);

        let msgText = `${name} silindi ❌ \n \n `;
        msgText += users.map((u, i) => `${i + 1}. ${u.name}`).join('\n');
        return bot.sendMessage(msg.chat.id, msgText);
    }
});

console.log('Bot started!');