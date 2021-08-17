const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const Event = require('../../structures/Event');
const { generateRandomHex } = require('../../structures/functions');
const ModmailList = require('../../structures/models/ModmailList');
const BannedList = require('../../structures/models/BannedList');
const buttonMonthOptions = [
    { customId: 'yes', value: '✅' },
    { customId: 'no', value: '<:cz_cross:590234470221742146>' }
];

module.exports = class messageCreate extends Event {
    async run(message) {
        try {
            if (message.author.bot) return;
            if (message.channel.type === 'DM' && !this.bot.modmail.has(message.author.id)) {
                let banned = await BannedList.findOne({ ID: message.author.id });
                if (banned) return message.reply(`**You are banned from creating tickets!**`);

                let member = await ModmailList.findOne({ User_ID: message.author.id });

                if (member) {
                    let newContent = message.mentions ? message.content.replace(/[<@>]/g, '') : message.content;
                    let channel = this.bot.channels.cache.get(member.Channel_ID);

                    return message.attachments.size === 0 ? channel.send(`**${message.author.username}:** ${newContent}`) : channel.send({ content: `**${message.author.username}:** ${newContent}`, files: [message.attachments] });
                } else {
                    this.bot.modmail.set(message.author.id, { setup: true });
                    const startEmbed = new MessageEmbed()
                        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                        .setColor('GREEN')
                        .addField(`Do You Want To Create A Ticket?`, 'If Yes, React With ✅\nIf No, React With ❌')
                        .setFooter('You Have 30 Seconds')
                        .setTimestamp();

                    const row_first = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('yes')
                                .setEmoji('✅')
                                .setStyle('SUCCESS'),
                            new MessageButton()
                                .setCustomId('no')
                                .setEmoji('cz_cross:590234470221742146')
                                .setStyle('DANGER')
                        );

                    let msg = await message.reply({ embeds: [startEmbed], components: [row_first], fetchReply: true });

                    const filter = button => ['yes', 'no'].includes(button.customId) && button.user.id === message.author.id;

                    const collector = await msg.awaitMessageComponent({ filter: filter, time: 20000, componentType: 'BUTTON' });
                    const { value } = buttonMonthOptions.find(button => button.customId === collector.customId);

                    if (value === '✅') {
                        let actualTicket = generateRandomHex(6);
                        try {
                            let channel = await this.bot.guilds.cache.get('').channels.create(`${message.author.username}-${message.author.discriminator}`, {
                                type: 'text',
                                topic: `#${actualTicket} | Use ${this.bot.prefix}end To Close This Ticket | ${message.author.username}'s Ticket`,
                                parent: '877106297345048636',
                                permissionOverwrites: [
                                    {
                                        id: '',
                                        deny: ['VIEW_CHANNEL']
                                    },
                                    {
                                        id: '694191215062679604',
                                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                                    }
                                ]
                            });

                            await ModmailList.create({
                                ID: actualTicket,
                                createdAt: Date.now(),
                                User_ID: message.author.id,
                                Channel_ID: channel.id
                            });

                            const updated_row = new MessageActionRow()
                                .addComponents(
                                    new MessageButton()
                                        .setCustomId('updated_yes')
                                        .setEmoji('✅')
                                        .setStyle('SUCCESS')
                                        .setDisabled()
                                );

                            this.bot.modmail.delete(message.author.id);
                            channel.send(`Ticket Created \`#${actualTicket}\` By ${message.author}`);
                            await collector.update({ components: [updated_row] });
                            return await message.reply(`**Ticket Created** ID: \`#${actualTicket}\`\nPlease Enter Your Issue Below, A Moderator Will Be With You Shortly!`);
                        } catch (error) {
                            console.error(error);
                            this.bot.modmail.delete(message.author.id)
                            await ModmailList.deleteOne({ ID: actualTicket });
                        };
                    } else {
                        this.bot.modmail.delete(message.author.id);
                        await collector.update({ components: [] });
                        return message.reply(`**Modmail Cancelled**`);
                    };
                };
            };
        } catch (error) {
            if (error.code === 'INTERACTION_COLLECTOR_ERROR') {
                return message.reply('**Timeout**');
            } else {
                console.error(error);
                return message.channel.send(`An Error Occurred: \`${error.message}\`!`);
            };
        };
    };
};