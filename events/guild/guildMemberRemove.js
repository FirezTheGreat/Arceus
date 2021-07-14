const Event = require('../../structures/Event');
const ModmailList = require('../../structures/models/ModmailList');

module.exports = class GuildMemberAdd extends Event {
    async run(member) {
        try {
            if (member.user.bot) return;

            const user = await ModmailList.findOne({ User_ID: member.id });
            if (user) {
                await this.bot.channels.cache.get(user.Channel_ID).delete();
                return await ModmailList.deleteOne({ ID: member.id });
            };
        } catch (error) {
            return console.error(error);
        };
    }
};
