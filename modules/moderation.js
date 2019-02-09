const fs = require('fs-extra');

module.exports = (Discord, client, config) => {

    client.commandMap.set('prune', {
        func(message) {
            let deleteAmmount = parseInt(message.content.replace(config.prefix + "prune ", "")) || 100;
            if (isNaN(deleteAmmount)) {
                let embed = new Discord.RichEmbed()
                    .setDescription('Must be a number!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return;
            }
            if (deleteAmmount > 100 || deleteAmmount < 2) {
                let embed = new Discord.RichEmbed()
                    .setDescription('Number must be between 2 and 100')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return;
            }
            message.channel.bulkDelete(deleteAmmount).then(messages => {
                deleteAmmount = messages.array().length;
                let embed = new Discord.RichEmbed()
                    .setTitle(`\u2705 Deleted ${deleteAmmount} messages!`)
                    .setColor(config.embedColor);
                message.channel.send(embed).then(response => {
                    response.delete(3000);
                });
            });
        },
        check(message) {
            if (message.channel.type !== "text") {
                let embed = new Discord.RichEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('This can only run in a server!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return false;
            } else if (!message.channel.permissionsFor(message.member).has('MANAGE_MESSAGES')) {
                let embed = new Discord.RichEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('You must be able to delete messages here!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return false;
            } else if (!message.channel.permissionsFor(message.guild.me).has('MANAGE_MESSAGES')) {
                let embed = new Discord.RichEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('I don\'t have permission to do that here!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return false;
            } else {
                return true;
            }
        },
        help: "Deletes a specified number of messages, or 100 by default"
    });
    /*
    client.commandMap.set('autorole', {
        func(message) {
            let role = message.mentions.roles.first();
            fs.writeJsonSync(guildsLocation, client.guildConfig);
        },
        check(message) {
            if (message.channel.type !== "text") {
                let embed = new Discord.RichEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('This can only run in a server!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return false;
            } else if (!message.channel.permissionsFor(message.member).has('MANAGE_MESSAGES')) {
                let embed = new Discord.RichEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('You must be able to delete messages here!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return false;
            } else if (!message.channel.permissionsFor(message.guild.me).has('MANAGE_MESSAGES')) {
                let embed = new Discord.RichEmbed()
                    .setTitle("Unable to run:")
                    .setDescription('I don\'t have permission to do that here!')
                    .setColor(config.errorColor);
                message.channel.send(embed);
                return false;
            } else {
                return true;
            }
        }
    });
*/
    
};