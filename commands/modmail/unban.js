const Command = require('../../structures/Command');
const { formatTime } = require('../../structures/functions');
const BannedList = require('../../structures/models/BannedList');

module.exports = class Unban extends Command {
    constructor(...args) {
        super(...args, {
            name: 'tunban',
            aliases: [],
            description: 'Unbans User From Using Modmail',
            category: 'Modmail',
            usage: '[mention | ID]',
            accessableby: 'Administrators'
        });
    };

    async run(message, args) {
        try {
            let role = message.guild.roles.cache.get('859313087030493207'); //'814563028347387935'

            if (!message.member.roles.cache.has(role.id) && !message.member.permissions.has('ADMINISTRATOR')) return message.channel.send(`**You Do Not Have Permissions To Use This Command!**`);
            if (!args[0]) return message.channel.send(`**Please Enter A Valid User**`);

            let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
            if (!member) return message.channel.send(`**User Not Found!**`);

            let modmail = await BannedList.findOne({ ID: member.id });
            if (!modmail) return message.channel.send(`**User Is Not Banned From Using Modmail!**`);

            try {
                let member = message.guild.members.cache.get(member.id);

                await BannedList.deleteOne({ ID: member.id });

                member.send(`**You are unbanned by Moderator ${message.member.displayName} from creating tickets**`).catch(() => message.channel.send(`**Couldn't Send Message To ${member.user.username}`));
                return await member.send(`**${message.member.displayName} Unbanned ${member.user.username} From Creating Tickets**`);
            } catch {
                return message.channel.send(`**Couldn't Send Message As User's DMs Were Blocked!**`);
            };
        } catch (error) {
            console.error(error);
            return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};