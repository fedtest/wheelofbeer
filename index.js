const SlackBot = require('slackbots');
const config = require('./config.json');
const Gpio = require('onoff').Gpio;

const sensorTest1 = new Gpio(21, 'in');
const sensorTest2 = new Gpio(29, 'in');
const sensorTest3 = new Gpio(40, 'in');

const bot = new SlackBot(config);
function onWatch(){
    console.log('Watch triggered')
}
bot.on('start', () => {
    console.log('Bot is online');
    sensorTest1.watch(onWatch);
    sensorTest2.watch(onWatch);
    sensorTest3.watch(onWatch);

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
