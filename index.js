const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config(); // Cargar variables de entorno

const client = new Client({
    intents: 53608447
});


client.once('ready', () => {
    console.log(`[!] BOT ACTIVO : Iniciado como ${client.user.tag}`);
});


// ----------------------------- VARIABLES ------------------------------------------

const prefix = '!';
const requiredReactions = 5;
const reactionsTimeLimit = 1800000;

const canalVotacionID = '1280835452068433981';
const canalServidorID = '1280542955202941128';
const canalModeracionID = '1280542954385309796'

let estadoServidor = false; // bool de estado del servidor

const dniDatabase = new Map() // Almacenamiento de DNIs


// ----------------------------- EMBEDS ------------------------------------------

const embedVotacion = new EmbedBuilder()
    .setTitle('Votación para abrir el servidor!')
    .setDescription('Reacciona con ✅ para votar! Se necesitan 10 votos para abrir el server')
    .setFooter({ text: 'Los moderadores que quieran moderar que reaccionen con 🛠️' })
    .setColor('ffc000');

const embedAbrirServidor = new EmbedBuilder()
    .setTitle('🟢🟢🟢 Servidor Abierto 🟢🟢🟢')
    .setDescription('Vamos todo el mundo a rolear!')
    .setFooter({text:'⚙️ CÓDIGO : dubairpesp'})
    .setColor('47eb00');

const embedCerrarServidor = new EmbedBuilder()
    .setTitle('🔴🔴🔴 Servidor Cerrado 🔴🔴🔴')
    .setDescription('Gracias por rolear con nosotros')
    .setColor('f10750')

const helpEmbed = new EmbedBuilder()
    .setTitle('Comandos Disponibles')
    .setDescription('Aquí están los comandos que puedes usar:')
    .addFields(
        { name: '!help', value: 'Muestra esta ayuda.' },
        { name: '!info', value: 'Proporciona información sobre el servidor.' },
        { name: '!ping', value: 'Sorpresa...'},
        { name: '!hola', value: 'Te da la bienvenida'},
        { name: '!votacion-servidor', value: 'Abre votacion para abrir server'},
        { name: '!abrir-servidor', value: 'Abre el servidor manualmente'},
        { name: '!cerrar-servidor', value: 'Cierra el servidor manualmente'},
        { name: '!estado-servidor', value: 'Comprueba el estado del servidor'},
        { name: '!ban [user] [motivo]', value: 'Banea a un usuario'},
        { name: '!kick [user] [motivo]', value: 'Expulsa a un usuario del servidor'},
        { name: '!mute [user] [tiempo (en minutos)]', value: 'Mutea a un usuario'},
        { name: '!unmute [user]', value: 'Desmutea a un usuario'},
        { name: '!ping', value: 'Sorpresa'},
    )
    .setColor('484e55')


// ----------------------------- EVENTOS ------------------------------------------

client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // obtener canales especificos
    const canalVotacion = client.channels.cache.get(canalVotacionID);
    const canalServidor = client.channels.cache.get(canalServidorID);

    const canalModeracion = client.channels.cache.get(canalModeracionID)


    // ----------------------------- COMANDOS ------------------------------------------
    
    // comando ping pong
    if (command === 'ping') {
        message.channel.send('pong!');
    }

    // comando para bienvenida en el server
    if (command === 'hola') {
        message.channel.send(`¡Hola! Bienvenido a **${message.guild.name}**`);
    }

    // comando para iniciar votacion de abrir server
    if (command === 'votacion-servidor') {



        // catch error
        if (!canalVotacion || !canalServidor) {
            console.error('Uno o ambos canales no se encontraron.');
            return;
        }

        // envia embed de votacion
        const embedMessage = await canalVotacion.send({ embeds: [embedVotacion] });

        // agrega reacciones iniciales
        await embedMessage.react('✅');
        await embedMessage.react('🛠️');


        const filter = (reaction) => ['✅', '🛠️'].includes(reaction.emoji.name);
        const collector = embedMessage.createReactionCollector({ filter, time: reactionsTimeLimit });

        collector.on('collect', (reaction) => {

            console.log(`[-] Se ha añadido ${reaction.emoji.name}`);

            let totalReactions = 0;

            // calcular reacciones totales
            if (embedMessage.reactions.cache.has('✅')) totalReactions += embedMessage.reactions.cache.get('✅').count;
            if (embedMessage.reactions.cache.has('🛠️')) totalReactions += embedMessage.reactions.cache.get('🛠️').count;

            console.log(`[*] Total de reacciones: ${totalReactions}`);

            if (totalReactions >= requiredReactions) {
                
                // envia embed de abrir servidor
                canalServidor.send({ embeds: [embedAbrirServidor] });

                // actualiza estado del servidor
                estadoServidor = true

                // dejar de recolectar reacciones
                collector.stop();
            }
        });

        // cuando finaliza el proceso...
        collector.on('end', () => {
            console.log('[/] Ha terminado la recoleccion de reacciones.');
        });
    }

    // abrir server manualmente
    if(command === 'abrir-servidor') {

        // embed
        canalServidor.send({ embeds: [embedAbrirServidor]})

        // abrir server
        estadoServidor = true
    }

    // cerrar servidor
    if(command === 'cerrar-servidor') {

        // envia embed
        canalServidor.send({ embeds: [embedCerrarServidor]})

        // cerrar server
        estadoServidor = false
    }

    // comando de estado del servidor
    if(command === 'estado-servidor') {
        estadoServidor 
            ? message.channel.send({ embeds: [embedAbrirServidor]})
            : message.channel.send({ embeds: [embedCerrarServidor]})
    }

    // comando de ayuda
    if(command === 'help') message.channel.send({ embeds: [helpEmbed]})


    // COMANDOS DE MODERACION
    if(command === 'ban') {
        
        // comprueba los permisos del autor del comando
        if (!message.member.permissions.has('BAN_MEMBERS')) {
            return message.reply('¡No tienes permiso para usar este comando!');
        }

        // argumentos del comando
        const user = message.mentions.users.first();
        const reason = args.slice(1).join(' ') || 'No se proporcionó razón';

        if (!user) return message.reply('¡Debes mencionar a un usuario para banear!'); // en el caso de que no se proporcione el usuario

        // accede al usuario banedao
        const member = message.guild.cache.get(user.id)

        // banea al miembro (si es que esta en el server)
        if(member) {
            await member.ban({ reason })

            // nuevo embed
            const banEmbed = new EmbedBuilder()
                .setTitle('Aviso de Moderación')
                .setDescription(`El usuario ${member} ha sido baneado del servidor`)
                .setFooter(`Usuario baneado por el moderador ${user}`)
                .setColor(f10750)


            // envia el embed
            canalModeracion.send({ embeds: [banEmbed]})
        }
        else 
        {
            // si no se encuentra el miembro a banear
            message.channel.send(`No se pudo encontrar el usuario ${member}`)
        }
    }

    if(command === 'ban') {
        
        // comprueba los permisos del autor del comando
        if (!message.member.permissions.has('KICK_MEMBERS')) {
            return message.reply('¡No tienes permiso para usar este comando!');
        }

        // argumentos del comando
        const user = message.mentions.users.first();
        const reason = args.slice(1).join(' ') || 'No se proporcionó razón';

        if (!user) return message.reply('¡Debes mencionar a un usuario para banear!'); // en el caso de que no se proporcione el usuario

        // accede al usuario a expulsar
        const member = message.guild.cache.get(user.id)

        // expulsa al miembro (si es que esta en el server)
        if(member) {
            await member.kick(reason )

            // nuevo embed
            const kickEmbed = new EmbedBuilder()
                .setTitle('Aviso de Moderación')
                .setDescription(`El usuario ${member} ha sido expulsado del servidor`)
                .setFooter(`Usuario expulsado por el moderador ${user}`)
                .setColor(f10750)


            // envia el embed
            canalModeracion.send({ embeds: [kickEmbed]})
        }
        else 
        {
            // si no se encuentra el miembro a banear
            message.channel.send(`No se pudo encontrar el usuario ${member}`)
        }
    }

    if (command === 'mute') {

        // comprueba si no tienes permisos
        if (!message.member.permissions.has('MANAGE_MESSAGES')) {
            return message.reply('¡No tienes permiso para usar este comando!');
        }

        // accede a los atributos del comando
        const user = message.mentions.users.first();
        const muteRole = message.guild.roles.cache.find(role => role.name === 'Muteado');
        const muteTime = parseInt(args[1]) || 0;

        // en caso de que falte algun atributo
        if (!user) return message.reply('¡Debes mencionar a un usuario para mutear!');
        if (!muteRole) return message.reply('¡No se encontró el rol de mutear!');

        // accede al usuario a mutear
        const member = message.guild.members.cache.get(user.id);

        // comprueba si existe ese usuario
        if (member) {
            
            // añade los roles
            await member.roles.add(muteRole);
            message.channel.send(`¡${user.tag} ha sido muteado por ${muteTime} minutos!`); // menciona al usuario

            // Desmutear después de un tiempo
            setTimeout(() => {

                // elimina los roles
                member.roles.remove(muteRole);
                message.channel.send(`¡${user.tag} ha sido desmuteado!`);

            }, muteTime * 60000); // tiempo en minutos

        }
        else 
        {
            message.reply('¡No se pudo encontrar al usuario!');
        }
    }


});

client.login(process.env.DISCORD_TOKEN);