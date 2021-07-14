const Command = require('../../structures/Command');
const ModmailList = require('../../structures/models/ModmailList');

module.exports = class Send extends Command {
    constructor(...args) {
        super(...args, {
            name: 'send',
            aliases: ['reply', 's'],
            description: 'Sends Message To User in DMs',
            category: 'Modmail',
            usage: '[text]',
            accessableby: 'Administrators'
        });
    };

    async run(message, args) {
        try {
            let role = message.guild.roles.cache.get('859313087030493207'); //'814563028347387935'
            if (!message.member.roles.cache.has(role.id) && !message.member.permissions.has('ADMINISTRATOR')) return message.channel.send(`**You Do Not Have Permissions To Use This Command!**`);

            let modmail = await ModmailList.findOne({ Channel_ID: message.channel.id });
            if (!modmail) return message.channel.send(`**Please Use This Command In A Valid Ticket Channel**`);

            if (!args[0]) return message.channel.send(`**Please Enter A Message!**`);

            try {
                let member = message.guild.members.cache.get(modmail.User_ID);

                await member.send(`**Moderator ${message.member.displayName}:** ${args.join(' ')}`);
                return message.channel.send(`Message Sent!`);
            } catch {
                return message.channel.send(`**Couldn't Send Message As User's DMs Were Blocked!**`);
            };
        } catch (error) {
            console.error(error);
            return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};