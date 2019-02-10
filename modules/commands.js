const fs = require('fs-extra');
const rp = require('request-promise');

module.exports = (Discord, client, config) => {
    console.log("Loaded main commands")
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

    client.commandMap.set('invite', {
        func(message) {
            client.generateInvite(8)
                .then(link => {
                    const embed = new Discord.RichEmbed()
                        .setColor(config.embedColor)
                        .setTitle(`Take me!`)
                        .setFooter('made with \u2764 by \u{1D4DB}\u{1D4F2}\u{1D503}\u{1D503}\u{1D502}')
                        .setURL(link);
                    message.channel.send(embed);
                });
        },
        check() {
            return true;
        },
        help: "Generate an invite for me <3"
    });

    client.commandMap.set('eval', {
        func(message) {
            try {
                let evalStr = eval(message.content.replace(config.prefix + "eval ", ""));
                let embed = new Discord.RichEmbed()
                    .setTitle("Result:")
                    .setDescription(evalStr)
                    .setColor(config.embedColor);
                message.channel.send(embed);
            } catch (err) {
                let embed = new Discord.RichEmbed()
                    .setTitle("Error:")
                    .setDescription(err.stack)
                    .setColor(config.errorColor);
                message.channel.send(embed);
            }
        },
        check(message) {
            if (message.author.id !== client.owner.id) {
                let embed = new Discord.RichEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('That command is restricted to the bot owner!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return false;
            } else {
                return true;
            }
        },
        help: "Nuthing as far as you're concerned :3 {owner only}"
    });

    client.commandMap.set('shutdown', {
        func() {
            let embed = new Discord.RichEmbed()
                .setTitle("Stopping bot!")
                .setColor(config.errorColor);
            client.owner.send(embed);
            process.exit();
        },
        check(message) {
            if (message.author.id !== client.owner.id) {
                let embed = new Discord.RichEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('That command is restricted to the bot owner!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return false;
            } else {
                return true;
            }
        },
        help: "Plez dun hurt me ;-; {owner only}"
    });

    client.commandMap.set('prefix', {
        func(message) {
            config.prefix = message.content.replace(config.prefix + "prefix ", "");
            fs.writeJsonSync('./config.json', config);
            let embed = new Discord.RichEmbed()
                .setTitle(`\u2705 Prefix changed to ${config.prefix}`)
                .setColor(config.embedColor);
            message.channel.send(embed);
        },
        check(message) {
            if (message.author.id !== client.owner.id) {
                let embed = new Discord.RichEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('That command is restricted to the bot owner!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return false;
            } else {
                return true;
            }
        },
        help: "Change my prefix {owner only}"
    });

    client.commandMap.set('ban', {
        func(message) {
            let banUser = message.mentions.users.first();
            client.banned.push(banUser.id);
            fs.writeJsonSync('./bannedusers.json', client.banned);
            let embed = new Discord.RichEmbed()
                .setDescription(`Banned ${banUser}`)
                .setColor(config.errorColor);
            message.channel.send(embed);
        },
        check(message) {
            if (message.author.id !== client.owner.id) {
                let embed = new Discord.RichEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('That command is restricted to the bot owner!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return false;
            } else {
                return true;
            }
        },
        help: "Ban user from me for any server {owner only}"
    });

    client.commandMap.set('unban', {
        func(message) {
            let banUser = message.mentions.users.first();
            client.banned = client.banned.filter(element => element !== banUser.id);
            fs.writeJsonSync('./bannedusers.json', client.banned);
            let embed = new Discord.RichEmbed()
                .setDescription(`Unbanned ${banUser}`)
                .setColor(config.errorColor);
            message.channel.send(embed);
        },
        check(message) {
            if (message.author.id !== client.owner.id) {
                let embed = new Discord.RichEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('That command is restricted to the bot owner!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return false;
            } else {
                return true;
            }
        },
        help: "Unban user from me for any server {owner only}"
    });

    client.commandMap.set('help', {
        func(message) {
            const pong = client.ping;
            const embed = new Discord.RichEmbed()
                .setColor(config.embedColor)
                client.commandMap.forEach((element, key) => {
                    embed.addField(key, element.help);
                });
            message.channel.send(embed);
        },
        check() {
            return true;
        },
        help: "Get a list of commands and help info."
    });

    

}



