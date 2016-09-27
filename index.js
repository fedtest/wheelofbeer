const SlackBot = require('slackbots');
const config = require('./config.json');

const bot = new SlackBot(config);

bot.on('start', () => {

    console.log('Bot is online');

    bot.on('message', (data) => {
        if (data.type === 'message') {
            if (data.text.toLowerCase() === 'time for beer') {
                bot.postMessage(data.channel, 'spinning wheel, wait for it....', {
                     icon_emoji: ':beer:',
                });
            }
        }
    });
});
