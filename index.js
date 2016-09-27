'use strict';

const SlackBot = require('slackbots');
const config = require('./config.json');
const bars = require('./bars.json');
const Gpio = require('onoff').Gpio;

const portId = [5, 6, 13, 19, 26, 16, 20, 21];
const sensors = [];

let barIndex = 0;

portId.forEach(port => sensors.push(new Gpio(port, 'in', 'falling')));

const bot = new SlackBot(config);

bot.on('start', () => {
    console.log('Bot is online');
    sensors.forEach((sensor, index) => {
        sensor.watch(() => (barIndex = index));
    });

    bot.on('message', (data) => {
        if (data.type === 'message') {
            if (data.text.toLowerCase() === 'time for beer') {
                bot.postMessage(data.channel, 'spinning wheel, wait for it....', {
                     icon_emoji: ':beer:',
                });
            } else if (data.text.toLowerCase() === 'trigger bar') {
                bot.postMessage(data.channel, `We're going to ${bars[barIndex].name}`, {
                    icon_emoji: ':beers:',
                });
            }
        }
    });
});
