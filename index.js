const Arceus = require('./structures/Arceus');
const config = require('./config.json');

const bot = new Arceus(config);
bot.start();