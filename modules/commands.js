const fs = require('fs-extra');
const rp = require('request-promise');

module.exports = (Discord, client, config) => {
    let e621 = tags => {
        let options = {
            'uri': 'https://e621.net/post/index.json',
            'method': 'POST',
            'json': true,
            'headers': {
                "User-Agent": "node-e621/1.0 "
            },
            'body': {
                tags,
                'limit': 200,
            },
        };
        return rp(options).then(e621data => e621data[Math.floor(Math.random() * e621data.length)]);
    };

    client.commandMap.set('e621', {
        func(message) {
            let e621Request;
            e621(message.content.replace(config.prefix + "e621 ", "")).then(data => {
                e621Request = data;
                const embed = new Discord.RichEmbed()
                    .setColor(config.embedColor)
                    .setTitle('Result:')
                    .setDescription(`\`${e621Request.tags}\``)
                    .setImage(e621Request.file_url)
                    .setURL(`https://e621.net/post/show/${e621Request.id}`)
                    .setFooter(e621Request.author);
                message.channel.send(embed);
            });
        },
        check(message) {
            if (message.channel.type === 'text' && !message.channel.nsfw) {
                let embed = new Discord.RichEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('This can only be run in NSFW channels or direct messages!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return false;
            } else {
                return true;
            }
        },
        help: "Searches e621 and pulls a random result from the first 200"
    });



//write bans to database
//function to feed user id


    client.commandMap.set('ping', {
        func(message) {
            const embed = new Discord.RichEmbed()
                .setColor(config.embedColor)
                .setDescription(`Pong! ${client.ping}ms`);
            message.channel.send(embed);
        },
        check() {
            return true;
        },
        help: "Play pingus you dingus."
    })

    

}



