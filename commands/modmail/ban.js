const Command = require('../../structures/Command');
const { formatTime } = require('../../structures/functions');
const BannedList = require('../../structures/models/BannedList');

module.exports = class Ban extends Command {
    constructor(...args) {
        super(...args, {
            name: 'tban',
            aliases: [],
            description: 'Bans User From Using Modmail',
            category: 'Modmail',
            usage: '[mention | ID]',
            accessableby: 'Administrators'
        });
    };

    async run(message, args) {
        try {
            let role = message.guild.roles.cache.get('859313087030493207'); //'814563028347387935'
            let time;

            if (!message.member.roles.cache.has(role.id) && !message.member.permissions.has('ADMINISTRATOR')) return message.channel.send(`**You Do Not Have Permissions To Use This Command!**`);
            if (!args[0]) return message.channel.send(`**Please Enter A Valid User**`);

            let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
            if (!member) return message.channel.send(`**User Not Found!**`);

            if (!args[1]) time = false;
            else if (args[1] && parseTime(args[1]) > 0) time = parseTime(args[1]);
            else return message.channel.send(`**Please Enter Time In This Format!\n\n\`\`\`css\n1s, 1m, 1h, 1d, 1w, 1month, 1y\`\`\`**`);

            let modmail = await BannedList.findOne({ ID: member.id });
            if (modmail) return message.channel.send(`**User Already Banned From Using Modmail!**`);

            try {
                let member = message.guild.members.cache.get(member.id);

                await BannedList.create({
                    ID: member.id,
                    temporary: !time ? false : true,
                    time: time
                });

                if (time > 0) {
                    setTimeout(async () => {
                        await BannedList.deleteOne({ ID: member.id });
                    }, time);
                };

                member.send(`**You are banned by Moderator ${message.member.displayName} from creating tickets${!time ? '' : ` for ${formatTime(time)}`}**`).catch(() => message.channel.send(`**Couldn't Send Message To ${member.user.username}`));
                return await member.send(`**${message.member.displayName} Banned ${member.user.username} From Creating Tickets${!time ? '' : ` for ${formatTime(time)}`}**`);
            } catch {
                return message.channel.send(`**Couldn't Send Message As User's DMs Were Blocked!**`);
            };
        } catch (error) {
            console.error(error);
            return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};
