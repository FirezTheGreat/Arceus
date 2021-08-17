const { Client, Collection } = require('discord.js');
const Util = require('./Util');

module.exports = class YashNotBot extends Client {
    constructor(options = {}) {
        super({
            partials: ['MESSAGE', 'REACTION', 'CHANNEL'],
            presence: {
                status: 'online',
                activities: [
                    { name: 'DM to contact staff', type: 'PLAYING' }
                ]
            },
            intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES']
        });

        this.validate(options);

        this.commands = new Collection();
        this.events = new Collection();
        this.utils = new Util(this);
        this.modmail = new Collection();
        this.mongoose = require('../structures/mongoose');
    };

    validate(options) {
        if (typeof options !== 'object') throw new TypeError('Options should be a type of Object.');

        if (!options.TOKEN) throw new Error('You must pass the token for the bot.');
        this.token = options.TOKEN;

        if (!options.PREFIX) throw new Error('You must pass a prefix for the bot.');
        if (typeof options.PREFIX !== 'string') throw new TypeError('Prefix should be a type of String.');
        this.prefix = options.PREFIX;
    };

    async start(token = this.token) {
        this.utils.loadCommands();
        this.utils.loadEvents();
        this.mongoose.init();
        super.login(token);
    };
};