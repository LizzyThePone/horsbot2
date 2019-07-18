const fs = require('fs-extra');
const rp = require('request-promise');
const git = require('git-pull-or-clone');
moduleName = "MAIN";

module.exports = (Discord, client, config, keyv) => {
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
        help: "Searches e621 and pulls a random result from the first 200",
        module: moduleName
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
        help: "Generate an invite for me <3",
        module: moduleName
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
        help: "Nuthing as far as you're concerned :3 {owner only}",
        module: moduleName,
        owner: true
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
        help: "Plez dun hurt me ;-; {owner only}",
        module: moduleName,
        owner: true
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
        help: "Change my prefix {owner only}",
        module: moduleName,
        owner: true
    });

    client.commandMap.set('gban', {
        func(message) {
            let banUser = message.mentions.users.first();
            keyv.get(banUser.id).then((user = {}) => {
                user.banned = true;
                keyv.set(banUser.id, user)
            });
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
        help: "Global ban a user {owner only}",
        module: moduleName,
        owner: true
    });

    client.commandMap.set('gunban', {
        func(message) {
            let banUser = message.mentions.users.first();
            keyv.get(banUser.id).then((user = {}) => {
                user.banned = false;
                keyv.set(banUser.id, user)
            });
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
        help: "Undo a global ban {owner only}",
        module: moduleName,
        owner: true
    });

    client.commandMap.set('help', {
        func(message) {
            const pong = client.ping;
            const embed = new Discord.RichEmbed()
                .setColor(config.embedColor)
                client.commandMap.forEach((element, key) => {
                    if(element.owner){
                        embed.addField(key, element.help);
                    }
                });
            message.channel.send(embed);
        },
        check() {
            return true;
        },
        help: "Get a list of commands and help info.",
        module: moduleName
    });

    client.commandMap.set('update', {
        func(message) {
            git('git@github.com:LizzyThePone/horsbot2.git', `${__dirname}/..`, (err) => {
                if (err) throw err
                let embed = new Discord.RichEmbed()
                    .setTitle("Update complete! Stopping bot!")
                    .setColor(config.errorColor);
                client.owner.send(embed);
                console.log('Update complete!')
                process.exit();
              })
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
        help: "Update the bot to the latest github version {owner only}",
        module: moduleName,
        owner: true
    })

    client.commandMap.set('video', {
        func(message) {
            if(message.guild){
                let member = message.member
                if(message.member.voiceChannelID){
                    let embed = new Discord.RichEmbed()
                        .setTitle(`https://discordapp.com/channels/${message.guild.id}/${member.voiceChannel.id}`)
                        .setColor(config.embedColor)
                    message.channel.send(embed);
                } else {
                    let embed = new Discord.RichEmbed()
                        .setTitle('You\'re not in a voice channel!')
                        .setColor(config.embedColor)
                    message.channel.send(embed);
                }
            }
        },
        check() {
            return true;
        },
        help: "Make a video share link for the voice channel you're in.",
        module: moduleName
    });

    client.commandMap.set('listvideo', {
        func(message) {
            if(message.guild){
                let embed = new Discord.RichEmbed()
                let channels = message.guild.channels.filter(channel => channel.type == "voice").array().forEach(channel => {
                    embed.addField(channel.name, `https://discordapp.com/channels/${message.guild.id}/${channel.id}`)
                })
                message.channel.send(embed);
            }
        },
        check() {
            return true;
        },
        help: "Make video share links for all voice channels.",
        module: moduleName
    });


}



