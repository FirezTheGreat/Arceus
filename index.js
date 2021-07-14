const YashNotBot = require('./structures/YashNotBot');
const config = require('./config.json');

const bot = new YashNotBot(config);
bot.start();