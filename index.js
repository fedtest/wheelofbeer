const SlackBot = require('slackbots');
const config = require('./config.json');
const Gpio = require('onoff').Gpio;

const sensorTest1 = new Gpio(21, 'in', 'falling');
const sensorTest2 = new Gpio(29, 'in', 'falling');
const sensorTest3 = new Gpio(40, 'in', 'falling');

const bot = new SlackBot(config);
function onWatch(pin){
    console.log(`Watch triggered on pin: ${pin}`)
}
bot.on('start', () => {
    console.log('Bot is online');
    sensorTest1.watch(() => onWatch(21));
    sensorTest2.watch(() => onWatch(29));
    sensorTest3.watch(() => onWatch(40));

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
