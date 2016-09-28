'use strict';

const SlackBot = require('slackbots');
const config = require('./config.json');
const audioConfig = require('./audio-config.json');
const bars = require('./bars.json');
const Gpio = require('onoff').Gpio;
const Sound = require('node-aplay');
const describe = require('./describe.js')

const minSpinTimeMS = 15000;
const maxSpinTimeMS = 25000;

const portId = [5, 6, 13, 19, 26, 16, 20, 21];
const sensors = [];

const motor = new Gpio(4, 'out');

const WHEEL_SPINNING = 'SPINNING';
const WHEEL_IDLE = 'IDLE';
const BEERLOCATOR_SONG = new Sound(audioConfig.beerLocatorSong);
const TICK = new Sound(audioConfig.tick);

let wheelState = WHEEL_IDLE;
let barIndex = 0;

portId.forEach(port => sensors.push(new Gpio(port, 'in', 'falling')));

function runBot(){
    console.log('Bot is online');
    sensors.forEach((sensor, index) => {
        sensor.watch(() => {
          barIndex = index;
          console.log(`Sensor index ${index}`);
          TICK.play();
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
                    bot.postMessage(data.channel, `Spinning wheel for ${ Math.floor(spinTime / 1000)} s, wait for it....`, {
                         icon_emoji: ':beer:',
                    });
                    motor.write(1);
                    BEERLOCATOR_SONG.play();

                    setTimeout(() => {
                        bot.postMessage(data.channel, 'Still spinning...');
                    }, (spinTime / 2));

                    setTimeout(() => {
                        bot.postMessage(data.channel, 'Almost there...');
                    }, ((spinTime / 2) + (spinTime / 4)));

                    wheelState = WHEEL_SPINNING;
                    setTimeout(() => {
                        motor.write(0);
                        wheelState = WHEEL_IDLE;
                        setTimeout(() => {
                            var bar = bars[barIndex];
                            bot.postMessage(data.channel, describe.bar(bar), {
                                icon_emoji: ':beers:',
                            });
                        }, 9000);
                    }, spinTime);
                }
            } else if (data.text.toLowerCase() === 'trigger bar') {
                var bar = bars[barIndex];
                bot.postMessage(data.channel, describe.bar(bar), {
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
}
function startup(){
    try{
        const bot = new SlackBot(config);
        bot.on('start', runBot);
    }catch(err){
        setTimeout(1000, startup);
    }
}
startup();
