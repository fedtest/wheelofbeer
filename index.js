const SlackBot = require('slackbots');
const config = require('./config.json');
const Gpio = require('onoff').Gpio;

const sensorTest = new Gpio(4, 'in');

const bot = new SlackBot(config);

bot.on('start', () => {
    console.log('Bot is online');
    sensorTest.watch((err) => {
        if (err) {
            throw err;
        }
        else{
            bot.postMessage(data.channel, 'Input on 4, Fleming it is.');
        }
    } );
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
