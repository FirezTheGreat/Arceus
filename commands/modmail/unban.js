const Command = require('../../structures/Command');
const BannedList = require('../../structures/models/BannedList');

module.exports = class Unban extends Command {
    constructor(...args) {
        super(...args, {
            name: 'ticketunban',
            aliases: [],
            description: 'Unbans User From Using Modmail',
            category: 'Modmail',
            usage: '[mention | ID]',
            accessableby: 'Administrators',
            slashCommand: true,
            commandOptions: [
                { name: 'member', type: 'USER', description: 'Message to Send', required: true }
            ]
        });
    };

    async interactionRun(interaction) {
        try {
            let role = interaction.guild.roles.cache.get('859313087030493207');
            if (!interaction.member.roles.cache.has(role.id) && !interaction.member.permissions.has('ADMINISTRATOR')) return interaction.reply(`**You Do Not Have Permissions To Use This Command!**`);
            
            const member = interaction.options.getMember('member');
            if (!member) return interaction.reply('**User Not Found!**');

            let modmail = await BannedList.findOne({ ID: member.id });
            if (!modmail) return interaction.reply(`**User Is Not Banned From Using Modmail!**`);

            try {
                await BannedList.deleteOne({ ID: member.id });

                interaction.reply(`**${interaction.member.displayName} Unbanned ${member.user.username} From Creating Tickets**`);
                return await member.send(`**You Are Unbanned By Moderator ${interaction.member.displayName} From Creating Tickets**`);
            } catch {
                return interaction.followUp(`**Couldn't Send Message As User's DMs Were Blocked!**`);
            };
        } catch (error) {
            console.error(error);
            return interaction.reply(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};