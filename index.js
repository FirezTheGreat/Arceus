const Arceus = require('./structures/YashNotBot');
const config = require('./config.json');

const bot = new Arceus(config);
bot.start();
