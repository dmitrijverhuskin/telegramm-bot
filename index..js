const TelegramBot = require ('node-telegram-bot-api');

const TOKEN ='618965651:AAGeL-fVHuv0_Hoc7x4ZTi389PtQP-HKLaE';

const _ = require('lodash');
const request = require('request');
const fs = require('fs');

const bot = new TelegramBot(TOKEN, {
    polling:true
});

const KB = {
    currency: 'Exchange rates',
    picture: 'Pictures',
    cat: 'Cat',
    car: 'Car',
    back: 'Back'
};

const PicScrs = {
    [KB.cat]: [
        'cat1.jpg',
        'cat2.jpg',
        'cat3.jpg',

    ],
    [KB.car]: [
        'car1.jpg',
        'car2.jpg',
        'car3.jpg',

    ]
};

bot.onText (/\/start/, msg => {
    sendGreeting(msg)
    });
    bot.on('message', msg => {
        switch (msg.text) {
            case KB.picture:
                sendPictureScreen(msg.chat.id);
                break;
            case KB.currency:
                sendCurrencyScreen(msg.chat.id);
                break;
            case KB.back:
                sendGreeting(msg, false);
                break;
            case KB.car:
            case KB.cat:
                sendPictureByName(msg.chat.id, msg.text);
                break

        }
    });

    bot.on('callback_query', query => {
        const base = query.data;
        const symbol = 'ILS';

        bot.answerCallbackQuery({
            callback_query_id: query.id,
            text: 'You choose ${base}'
        });

        request('http://api.fixer.io/latest?symbols=${symbol}&base=${base}', (error, response, body) => {
            
            if (error) throw new  Error(error);
            if (response.statusCode === 200){
                const currencyData = JSON.parse(body);
                const html  = '<b>1 ${base}</b> - <em>${currencyData.rates[symbol]} ${symbol}</em>';
                bot.sendMessage(query.message.chat.id, html {
                    parse_mode: 'HTML'
                })
            }
        })

        // console.log(JSON.stringify(query, null, 2));
    });

    function sendPictureScreen(chatId) {
        bot.sendMessage(chatId, 'Choose picture type: ', {
            reply_markup:  {
                keyboard: [
                    [KB.car, KB.cat],
                    [KB.back]
                ]
            }
        })
    }
    
    function sendGreeting(msg, sayHello = true) {

        const text = sayHello
            ?'Hello, ${msg.from.first_name}\n What do you want to do?'
            :'What do you want to do?'
        bot.sendMessage(msg.chat.id, text, {
            reply_markup: {
                keyboard: [
                    [KB.currency, KB.picture]
                ]
            }

        })
    }
    
    function sendPictureByName(chatId, picName) {
        const srcs = PicScrs[picName];
        const src = srcs[_.random(0, srcs.length-1)];

        bot.sendMessage(chatId, 'Download . . . ');

        fs.readFile('${__dirname}/images/${src}', (error, picture) => {
            if (error) throw new Error(error);

            bot.sendPhoto(chatId, picture).then(() => {
                bot.sendMessage(chatId, 'Delivered!!')
            })

        })
        
    }
    
    function sendCurrencyScreen(chatId) {
        bot.sendMessage(chatId, 'Select currency type: ', {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'DOLLAR',
                            callback_data: 'USD'
                        }
                    ],
                    [
                        {
                            text: 'EURO',
                            callback_data: 'EUR'
                        }
                    ]
                ]
            }
        })
        
    }
