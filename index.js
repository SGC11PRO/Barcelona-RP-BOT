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


// ----------------------------- EMBEDS ------------------------------------------

const embedVotacion = new EmbedBuilder()
    .setTitle('Votación para abrir el servidor!')
    .setDescription('Reacciona con ✅ para votar! Se necesitan 10 votos para abrir el server')
    .setFooter({ text: 'Los moderadores que quieran moderar que reaccionen con 🛠️' })
    .setColor('ffc000');

const embedAbrirServidor = new EmbedBuilder()
    .setTitle('🟢🟢🟢 Servidor Abierto 🟢🟢🟢')
    .setDescription('Vamos todo el mundo a rolear!')
    .setColor('47eb00');

const embedCerrarServidor = new EmbedBuilder()
    .setTitle('🔴🔴🔴 Servidor Cerrado 🔴🔴🔴')
    .setDescription('Gracias por rolear con nosotros')
    .setColor('f10750')


// ----------------------------- EVENTOS ------------------------------------------

client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // obtener canales especificos
    const canalVotacion = client.channels.cache.get(canalVotacionID);
    const canalServidor = client.channels.cache.get(canalServidorID);


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
        canalServidor.send({ embeds: [embedAbrirServidor]})
    }

    // cerrar servidor
    if(command === 'cerrar-servidor') {
        canalServidor.send({ embeds: [embedCerrarServidor]})
    }
});

client.login(process.env.DISCORD_TOKEN);