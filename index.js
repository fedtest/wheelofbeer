'use strict';

const SlackBot = require('slackbots');
const config = require('./config.json');
const bars = require('./bars.json');
const Gpio = require('onoff').Gpio;

const portId = [5, 6, 13, 19, 26, 16, 20, 21];
const sensors = [];

const motor = new Gpio(4, 'out');

const WHEEL_SPINNING = 'SPINNING';
const WHEEL_IDLE = 'IDLE';

let wheelState = WHEEL_IDLE;
let barIndex = 0;

portId.forEach(port => sensors.push(new Gpio(port, 'in', 'falling')));

const bot = new SlackBot(config);

bot.on('start', () => {
    console.log('Bot is online');
    sensors.forEach((sensor, index) => {
        sensor.watch(() => {
          barIndex = index;
          console.log(`Sensor index ${index}`);
        });
    });

    bot.on('message', (data) => {
        if (data.type === 'message' && data.text) {
            if (data.text.toLowerCase() === 'time for beer') {
                if (wheelState === WHEEL_SPINNING) {
                    bot.postMessage(data.channel, 'wheel is still spinning, wait for it...')
                }
                else if (wheelState === WHEEL_IDLE) {
                    bot.postMessage(data.channel, 'spinning wheel, wait for it....', {
                         icon_emoji: ':beer:',
                    });
                    motor.write(1);
                    wheelState = WHEEL_SPINNING;
                    setTimeout(() => {
                        motor.write(0);
                        wheelState = WHEEL_IDLE;
                        setTimeout(() => {
                            var bar = bars[barIndex];
                            bot.postMessage(data.channel, `We're going to <${bar.url}|${bar.name}>\n${bar.address}`, {
                                icon_emoji: ':beers:',
                            });
                        }, 2000);
                    }, 10000);
                }

            } else if (data.text.toLowerCase() === 'trigger bar') {
                var bar = bars[barIndex];
                bot.postMessage(data.channel, `We're going to <${bar.url}|${bar.name}>\n${bar.address}`, {
                    icon_emoji: ':beers:',
                });
            }
        }
    });

    bot.on('close', () => {
        console.log('Connection to slack closed');
        // Try to reconnect after 5 sec.
        setTimeout(() => {
            bot.login();
        }, 5000);
    });

    bot.on('error', (err) => {
        console.log(err);
    });
});
