const Event = require('../../structures/Event');
const BannedList = require('../../structures/models/BannedList');

module.exports = class extends Event {
	constructor(...args) {
		super(...args, {
			once: true
		});
	};

	async run() {
		try {
            let slashCommands = this.bot.commands.filter(command => command.slashCommand);
			let data = [];

			for (const [key, value] of slashCommands) {
				data.push({ name: key, description: value.description, options: value.commandOptions });
			};
            
			await this.bot.application.commands.set(data)
			console.log(`${this.bot.user.username} is Online!`);

			const banned = await BannedList.find({});

			for (let i = 0; i < banned.length; i++) {
				let time = banned[i].time - Date.now();
				if (time <= 0) time = 0;

				setTimeout(async () => {
					await BannedList.deleteOne({ ID: banned[i].ID });

					let { user } = this.bot.users.fetch(banned[i].ID);
					if (user) user.send(`**You Have Been Unbanned From Using Modmail**`).catch(() => null);
				}, time);
			};
		} catch (error) {
			console.error(error);
		};
	};
};
