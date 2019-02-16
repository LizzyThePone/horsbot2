'use strict';

const Discord = require('discord.js');
const client = new Discord.Client();
const chalk = require('chalk');
const fs = require('fs-extra');
client.commandMap = new Map();
const Keyv = require("keyv");
let keyv;
let configLocation = './config/config.json';
let defaultConfigLocation = './config/default_config.json';
let bansLocation = './config/bannedusers.json';
let guildsLocation = './config/guilds.json';
let config;

fs.exists(configLocation).then(exists => {
    if (!exists) {
        fs.ensureFileSync(configLocation);
        console.log('Created config.json');
        let defaultConfig = fs.readJsonSync(defaultConfigLocation);
        fs.writeJsonSync(configLocation, defaultConfig);
        console.log('Wrote default_config.json to config.json');
        console.log('Add your token and mongo login into that file now');
    } else {
        let configFile = fs.readJsonSync(configLocation);
        console.log('Config loaded!');
        config = configFile;
        client.login(config.token);
        console.log(config.mongo);
        keyv = new Keyv(config.mongo);
    }
});

fs.exists(bansLocation).then(exists => {
    if (!exists) {
        fs.ensureFileSync(bansLocation);
        console.log('Created bannedusers.json');
        client.banned = [];
        fs.writeJsonSync(bansLocation, client.banned);
    } else {
        client.banned = fs.readJsonSync(bansLocation);
        console.log('Bans loaded!');
    }
});

fs.exists(guildsLocation).then(exists => {
    if (!exists) {
        fs.ensureFileSync(guildsLocation);
        console.log('Created guilds.json');
        client.guildConfig = new Map();
        fs.writeJsonSync(guildsLocation, client.banned);
    } else {
        client.guildConfig = fs.readJsonSync(guildsLocation);
        console.log('Guilds loaded!');
    }
});

let logCommand = message => {
    let denied = message.denied ? "DENIED" : "ALLOWED";
    console.log(chalk.hex(config.lineColor)('-----------------------------'));
    console.log(chalk.red(`${denied}\nCommand: ${chalk.blue(message.commandName)}\nUser: ${chalk.blue(message.author.tag)}\n${message.guild ? `Server: (${chalk.blue(message.guild.id)}) ${chalk.blue(message.guild.name)}\n` : ""}Channel: ${chalk.blue(message.channel.name || '[DM]')}\nTime: ${chalk.blue(new Date().toString())}`));
    console.log(chalk.hex(config.lineColor)('-----------------------------\n'));
};

client.on('ready', () => {
    client.user.setPresence({ game: { name: ']help' }, status: 'idle' })
    console.log(chalk.hex(config.lineColor)('-----------------------------'));
    console.log(chalk.hex(config.readyColor)(`Bot started as ${chalk.blue(client.user.tag)}`));
    client.fetchApplication().then(app => {
        process.on('uncaughtException', exception => {
            console.error(exception);
            let embed = new Discord.RichEmbed()
                .setTitle("Error:")
                .setDescription(exception.stack)
                .setColor(config.errorColor);
            app.owner.send(embed);
        });
        client.owner = app.owner;
        console.log(chalk.hex(config.readyColor)(`Owner set to ${chalk.blue(client.owner.tag)}`));
        console.log(chalk.hex(config.lineColor)('-----------------------------\n'));
        require('./modules/commands')(Discord, client, config, keyv);
        require('./modules/music')(Discord, client, config, keyv);
        require('./modules/moderation')(Discord, client, config, keyv);
        let embed = new Discord.RichEmbed()
            .setDescription(`Started at ${new Date()}`)
            .setColor(config.embedColor);
        app.owner.send(embed);
    });
});

client.on('message', message => {
    if (!message.content.startsWith(config.prefix)) return;
    message.commandName = message.content.toLocaleLowerCase().split(' ')[0].slice(config.prefix.length);
    let command = client.commandMap.get(message.commandName);
    if (command) {
        message.used = true
        if (client.banned.find(element => element === message.author.id)) {
            let embed = new Discord.RichEmbed()
                .setTitle("You are banned by the bot owner.")
                .setColor(config.errorColor);
            message.channel.send(embed);
            message.denied = true;
            logCommand(message);
            return;
        }
        if (command.check) {
            if (command.check(message) !== true) {
                message.denied = true;
                logCommand(message);
                return;
            }
        }
        command.func(message);
        message.denied = false;
        logCommand(message);
    }
});

client.on('messageUpdate', message => {
    if (!message.content.startsWith(config.prefix)) return;
    if (message.used && message.used === true) return;
    message.commandName = message.content.toLocaleLowerCase().split(' ')[0].slice(config.prefix.length);
    let command = client.commandMap.get(message.commandName);
    if (command) {
        message.used = true
        if (client.banned.find(element => element === message.author.id)) {
            let embed = new Discord.RichEmbed()
                .setTitle("You are banned by the bot owner.")
                .setColor(config.errorColor);
            message.channel.send(embed);
            message.denied = true;
            logCommand(message);
            return;
        }
        if (command.check) {
            if (command.check(message) !== true) {
                message.denied = true;
                logCommand(message);
                return;
            }
        }
        command.func(message);
        message.denied = false;
        logCommand(message);
    }
});

client.on('guildMemberAdd', member => {
    keyv.get(member.guild.id).then((guild = {}) => {
        if(!guild.autorole) return;
        member.addRole(guild.autorole).catch(() => {return});
    });
    keyv.get(member.guild.id).then((guild = {}) => {
        if(!guild.join) return;
        member.guild.channels.find('id', guild.join.id).send(guild.join.message.replace("$user", member)).catch(() => {return});
    });
})

client.on('message', message => {
    if ((!message.content.includes('http') || !message.content === "") && message.channel.id === "482180108220891146") message.delete()
})