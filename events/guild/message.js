const { MessageEmbed } = require('discord.js');
const Event = require('../../structures/Event');
const { generateRandomHex } = require('../../structures/functions');
const ModmailList = require('../../structures/models/ModmailList');
const BannedList = require('../../structures/models/BannedList');

module.exports = class Message extends Event {
	async run(message) {
		try {
			if (message.author.bot) return;

			if (message.channel.type === 'dm' && !this.bot.modmail.has(message.author.id)) {
				let banned = await BannedList.findOne({ ID: message.author.id });
				if (banned) return message.channel.send(`**You are banned from creating tickets!**`);

				let member = await ModmailList.findOne({ User_ID: message.author.id });

				if (member) {
					let newContent = message.mentions ? message.content.replace(/[<@]/g, ''): message.content;
					let channel = this.bot.channels.cache.get(member.Channel_ID);

					return channel.send(`**${message.author.username}:** ${newContent}`);
				} else {
					this.bot.modmail.set(message.author.id, { setup: true });
					const startEmbed = new MessageEmbed()
						.setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
						.setColor('GREEN')
						.addField(`Do You Want To Create A Ticket?`, 'If Yes, React With ✅\nIf No, React With ❌')
						.setFooter('You Have 30 Seconds')
						.setTimestamp();
					let msg = await message.channel.send({ embed: startEmbed });

					await msg.react('✅');
					await msg.react('❌');

					const filter = (reaction) => ['✅', '❌'].includes(reaction.emoji.name);
					const collected = await msg.awaitReactions(filter, {
						time: 30000,
						max: 1
					});

					if (collected.size === 0) {
						this.bot.modmail.delete(message.author.id);
						return message.channel.send(`**Modmail Cancelled Due To Timeout**`);
					} else if (collected.map(r => r)[0]._emoji.name.toLowerCase() === '✅') {
						let actualTicket = generateRandomHex(6);
						try {
							let channel = await this.bot.guilds.cache.get('724509069112639620').channels.create(`${message.author.username}-${message.author.discriminator}`, {
								type: 'text',
								topic: `#${actualTicket} | Use ${this.bot.prefix}end To Close This Ticket | ${message.author.username}'s Ticket`,
								parent: '724509069599309915', //'847381280953204737',
								permissionOverwrites: [
									{
										id: '724509069112639620',
										deny: ['VIEW_CHANNEL']
									},
									{
										id: '859313087030493207', //'814563028347387935',
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

							this.bot.modmail.delete(message.author.id);
							channel.send(`Ticket Created \`#${actualTicket}\` By ${message.author}`);
							return await message.channel.send(`**Ticket Created** ID: \`#${actualTicket}\`\nPlease enter your issue below, a moderator will be with you shortly!`);
						} catch (error) {
							console.error(error);
							this.bot.modmail.delete(message.author.id)
							await ModmailList.deleteOne({ ID: actualTicket });
						};
					} else {
						this.bot.modmail.delete(message.author.id);
						return message.channel.send(`**Modmail Cancelled**`);
					};
				};
			} else if (message.guild) {
				if (message.content === `<@!${this.bot.user.id}>`) return message.channel.send(`Prefix For This Server Is \`${this.bot.prefix}\``);

				if (!message.content.startsWith(this.bot.prefix)) return;

				const [cmd, ...args] = message.content.slice(this.bot.prefix.length).split(/ +/g);

				const command = this.bot.commands.get(cmd.toLowerCase()) || this.bot.commands.get(this.bot.aliases.get(cmd.toLowerCase()));
				if (command) command.run(message, args);
			};
		} catch (error) {
			console.error(error);
		};
	};
};
