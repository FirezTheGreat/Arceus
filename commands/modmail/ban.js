const Command = require('../../structures/Command');
const { formatTime } = require('../../structures/functions');
const BannedList = require('../../structures/models/BannedList');

module.exports = class Ban extends Command {
    constructor(...args) {
        super(...args, {
            name: 'ticketban',
            description: 'Bans User From Using Modmail',
            category: 'Modmail',
            usage: '[mention | ID]',
            accessableby: 'Administrators',
            slashCommand: true,
            commandOptions: [
                { name: 'member', type: 'USER', description: 'User to TicketBan', required: true },
                { name: 'time', type: 'STRING', description: 'Duration of TicketBan', required: false }
            ]
        });
    };

    async interactionRun(interaction) {
        try {
            let role = interaction.guild.roles.cache.get('859313087030493207');

            if (!interaction.member.roles.cache.has(role.id) && !interaction.member.permissions.has('ADMINISTRATOR')) return interaction.reply(`**You Do Not Have Permissions To Use This Command!**`);

            const member = interaction.options.getMember('member');
            if (!member) return interaction.reply('**User Not Found!**');

            let time = interaction.options.getString('time') || null;

            if (!time) time = false;
            else if (time && parseTime(time) > 0) time = parseTime(time);
            else return interaction.reply(`**Please Enter Time In This Format!\n\n\`\`\`css\n1s, 1m, 1h, 1d, 1w, 1month, 1y\`\`\`**`);

            let modmail = await BannedList.findOne({ ID: member.id });
            if (modmail) return interaction.reply(`**User Already Banned From Using Modmail!**`);

            try {
                await BannedList.create({
                    ID: member.id,
                    temporary: !time ? false : true,
                    time: time ? time : 0
                });

                if (time > 0) {
                    setTimeout(async () => {
                        await BannedList.deleteOne({ ID: member.id });
                    }, time);
                };
                interaction.reply(`**${interaction.member.displayName} Banned ${member.user.username} From Creating Tickets${!time ? '' : ` for ${formatTime(time)}`}**`);
                return await member.send(`**${interaction.member.displayName} You From Creating Tickets${!time ? '' : ` for ${formatTime(time)}`}**`);
            } catch {
                return interaction.reply(`**Couldn't Send Message As User's DMs Were Blocked!**`);
            };
        } catch (error) {
            console.error(error);
            return interaction.reply(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};