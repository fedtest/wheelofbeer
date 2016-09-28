'use strict';

const SlackBot = require('slackbots');
const config = require('./config.json');
const audioConfig = require('./audio-config.json');
const bars = require('./bars.json');
const Gpio = require('onoff').Gpio;
const Sound = require('node-aplay');

const minSpinTimeMS = 20000;
const maxSpinTimeMS = 30000;

const portId = [5, 6, 13, 19, 26, 16, 20, 21];
const sensors = [];

const motor = new Gpio(4, 'out');

const WHEEL_SPINNING = 'SPINNING';
const WHEEL_IDLE = 'IDLE';
const BEERLOCATOR_SONG = new Sound(audioConfig.beerLocatorSong);

let wheelState = WHEEL_IDLE;
let barIndex = 0;
let botUserId;

portId.forEach(port => sensors.push(new Gpio(port, 'in', 'falling')));

const bot = new SlackBot(config);

bot.on('start', () => {
    console.log('Bot is online');
    bot.getUserId(config.name).then(userId => {
      console.log(userId);
      botUserId = userId;
    });
    sensors.forEach((sensor, index) => {
        sensor.watch(() => {
          barIndex = index;
          console.log(`Sensor index ${index}`);
          console.log(sensors.map(sensor => {
              return sensor.readSync()
          }));
        });
    });

    bot.on('message', (data) => {
        if (data.type === 'message' && data.text) {
            if (data.text.toLowerCase() === 'time for beer') {
                if (wheelState === WHEEL_SPINNING) {
                    bot.postMessage(data.channel, 'wheel is still spinning, wait for it...')
                }
                else if (wheelState === WHEEL_IDLE) {
                    const spinTime = minSpinTimeMS + (Math.random() * (maxSpinTimeMS - minSpinTimeMS));
                    bot.postMessage(data.channel, `spinning wheel for ${ Math.floor(spinTime / 1000)} s, wait for it....`, {
                         icon_emoji: ':beer:',
                    });
                    motor.write(1);
                    BEERLOCATOR_SONG.play();

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
                    }, spinTime);
                }

            } else if (data.text.toLowerCase() === 'trigger bar') {
                var bar = bars[barIndex];
                bot.postMessage(data.channel, `We're going to <${bar.url}|${bar.name}>\n${bar.address}`, {
                    icon_emoji: ':beers:',
                });
            } else if (data.text.toLowerCase().match(/(^| )(öl|beers?)\b/) && data.user !== botUserId) {
                bot.postMessage(data.channel, "Mmm beer...", {
                    icon_emoji: ':beer:',
                })
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
