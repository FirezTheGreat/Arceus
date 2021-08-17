const Command = require('../../structures/Command');
const ModmailList = require('../../structures/models/ModmailList');

module.exports = class End extends Command {
    constructor(...args) {
        super(...args, {
            name: 'end',
            description: 'Ends The Current Modmail Ticket',
            category: 'Modmail',
            usage: '',
            accessableby: 'Administrators',
            slashCommand: true,
            commandOptions: [
                { name: 'channel', type: 'CHANNEL', description: 'TicketChannel to End', required: true }
            ]
        });
    };

    async interactionRun(interaction) {
        try {
            const role = interaction.guild.roles.cache.get('859313087030493207');
            if (!interaction.member.roles.cache.has(role.id) && !interaction.member.permissions.has('ADMINISTRATOR')) return interaction.reply(`**You Do Not Have Permissions To Use This Command!**`);

            const channel = interaction.options.getChannel('channel');
            if (!channel || !channel.isText()) return interaction.reply('**Channel Not Found!**');

            const modmail = await ModmailList.findOne({ Channel_ID: channel.id });
            if (!modmail) return interaction.reply(`**Please Use This Command In A Valid Ticket Channel**`);

            try {
                let member = interaction.guild.members.cache.get(modmail.User_ID);

                await ModmailList.deleteOne({ ID: modmail.ID });
                interaction.reply(`**Ticket ${modmail.ID} Has Been Closed!**`);
                await channel.delete();

                return await member.send(`**Moderator ${interaction.member.displayName}:** Closed Your Ticket\nTicket ID: \`${modmail.ID}\``);
            } catch {
                return interaction.followUp(`**Couldn't Send Message As User's DMs Were Blocked!**`).catch(() => null);
            };
        } catch (error) {
            console.error(error);
            return interaction.reply(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};