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
            accessableby: 'Administrators',
            slashCommand: true,
            commandOptions: [
                { name: 'message', type: 'STRING', description: 'Message to Send', required: true }
            ]
        });
    };

    async interactionRun(interaction) {
        try {
            let role = interaction.guild.roles.cache.get('859313087030493207');
            if (!interaction.member.roles.cache.has(role.id) && !interaction.member.permissions.has('ADMINISTRATOR')) return interaction.reply(`**You Do Not Have Permissions To Use This Command!**`);

            let modmail = await ModmailList.findOne({ Channel_ID: interaction.channel.id });
            if (!modmail) return interaction.reply(`**Please Use This Command In A Valid Ticket Channel**`);

            const content = interaction.options.getString('message');
            if (!content) return interaction.reply('**Please Enter A Message To Send**');

            try {
                let member = interaction.guild.members.cache.get(modmail.User_ID);

                await member.send(`**Moderator ${interaction.member.displayName}:** ${content}`);
                return interaction.reply(`Message Sent!`);
            } catch {
                return interaction.reply(`**Couldn't Send Message As User's DMs Were Blocked!**`);
            };
        } catch (error) {
            console.error(error);
            return interaction.reply(`An Error Occurred: \`${error.message}\`!`);
        };
    };
};