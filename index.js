const { Client, EmbedBuilder } = require('discord.js');
require('dotenv').config(); // Cargar variables de entorno

const client = new Client({
    intents: 53608447
});


client.once('ready', () => {
    console.log(`[!] BOT ACTIVO : Iniciado como ${client.user.username}`);
});


// ----------------------------- VARIABLES ------------------------------------------

const version = '`^1.12.2`'

const prefix = '!';
const requiredReactions = 5;
const reactionsTimeLimit = 1800000;

const canalVotacionID = '1280835452068433981';
const canalServidorID = '1280542955202941128';
const canalModeracionID = '1280542954796220467'
const canalDenunciasID = '1281652489334296636'
const canalMultasID = '1280542958487080963'

let estadoServidor = false; // bool de estado del servidor

// ----------------------------- EMBEDS ------------------------------------------

const embedVotacion = new EmbedBuilder()
    .setTitle('Votación para abrir el servidor!')
    .setDescription('Reacciona con ✅ para votar! Se necesitan 10 votos para abrir el server')
    .setFooter({ text: 'Los moderadores que quieran moderar que reaccionen con 🛠️' })
    .setColor('ffc000');

const embedAbrirServidor = new EmbedBuilder()
    .setTitle('🟢🟢🟢 Servidor Abierto 🟢🟢🟢')
    .setDescription('Vamos todo el mundo a rolear!')
    .addFields(
        { name: 'Aviso', value: 'Se hace un llamamiento a todos los <@&1280905403882016879> disponibles'}
    )
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
        { name: '!version', value: 'Muestra la version actual del bot'},
        { name: '!ping', value: 'Sorpresa...'},
        { name: '!hola', value: 'Te da la bienvenida'},
        { name: '!votacion-servidor', value: 'Abre votacion para abrir server'},
        { name: '!abrir-servidor', value: 'Abre el servidor manualmente'},
        { name: '!cerrar-servidor', value: 'Cierra el servidor manualmente'},
        { name: '!estado-servidor', value: 'Comprueba el estado del servidor'},
        { name: '!ban [user] [motivo]', value: 'Banea a un usuario'},
        { name: '!unban [user] [motivo]', value: 'Desbanea a un usuario'},
        { name: '!kick [user] [motivo]', value: 'Expulsa a un []usuario del servidor'},
        { name: '!denunciar [denunciado] [abogado (opcional)] [descripcion]', value: 'Denuncia a un usuario'},
        { name: '!multar [user] [artículo] [cantidad/condena]', value: 'Multa a un usuario'},
        { name: '!pda [user]', value: 'Consulta las multas de un usuario'},
        { name: '!eliminarmulta [user] [index]', value: 'Elimina la multa especifica de un usuario'},
    )
    .setColor('484e55')

const infoEmbed = new EmbedBuilder()
    .setTitle('Dubai RP')
    .setDescription('Bienvenido al servidor de roleplay de **Dubai RP**')
    .addFields({ name: 'Código de ER:LC', value: '`dubairpesp`'})
    .setFooter({text: 'Dubai RP'})
    .setColor('ffc000')


// ----------------------------- OTROS ------------------------------------------

// ----------------------------- multas ------------------------------------------


    const fs = require('fs');
    const path = './multas.json'; // Archivo donde se almacenarán las multas

    // Leer multas desde el archivo JSON
    function leerMultas() {
        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, JSON.stringify([]));
        }
        const data = fs.readFileSync(path);
        return JSON.parse(data);
    }

    // Escribir multas en el archivo JSON
    function guardarMultas() {
        fs.writeFileSync(path, JSON.stringify(multas, null, 2)); // null, 2 es para formatear el JSON
    }

    let multas = leerMultas();

    // Función para agregar una multa
    function agregarMulta(agente, afectado, articulo, condena) {
        const nuevaMulta = {
            agente: agente.username,
            afectadoId: afectado.id,
            afectadoUsername: afectado.username,
            articulo: articulo,
            condena: condena,
            fecha: new Date()
        };

        multas.push(nuevaMulta);
        guardarMultas();
    }


// ----------------------------- denuncias ------------------------------------------

    const pathDenuncias = './denuncias.json'; // Archivo donde se almacenarán las denuncias
    
    // Leer denuncias desde el archivo JSON
    function leerDenuncias() {
        if (!fs.existsSync(pathDenuncias)) {
            fs.writeFileSync(pathDenuncias, JSON.stringify([]));
        }
        const data = fs.readFileSync(pathDenuncias);
        return JSON.parse(data);
    }
    
    // Escribir denuncias en el archivo JSON
    function guardarDenuncias(denuncias) {
        fs.writeFileSync(pathDenuncias, JSON.stringify(denuncias, null, 2));
    }
    
    // Función para agregar una denuncia
    function agregarDenuncia(denunciante, denunciado, abogado, descripcion) {
        const denuncias = leerDenuncias();
    
        const nuevaDenuncia = {
            denunciante: denunciante.username,
            denunciado: denunciado.username,
            abogado: abogado ? abogado.username : 'No asignado',
            descripcion: descripcion,
            fecha: new Date()
        };
    
        denuncias.push(nuevaDenuncia);
        guardarDenuncias(denuncias);
    }

// ----------------------------- EVENTOS ------------------------------------------

client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // obtener canales especificos
    const canalVotacion = client.channels.cache.get(canalVotacionID);
    const canalServidor = client.channels.cache.get(canalServidorID);

    const canalModeracion = client.channels.cache.get(canalModeracionID)

    const canalDenuncias = client.channels.cache.get(canalDenunciasID)
    const canalMultas = client.channels.cache.get(canalMultasID)


    // ----------------------------- COMANDOS ------------------------------------------
    
    // comando ping pong
    if (command === 'ping') {
        message.reply('pong!');
    }

    // comando para bienvenida en el server
    if (command === 'hola') {
        message.reply(`¡Hola! Bienvenido a **${message.guild.name}**`);
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

        if(!estadoServidor) // solo si el servidor antes estaba cerrado
        {
            // embed
            canalServidor.send({ embeds: [embedAbrirServidor]})
    
            // abrir server
            estadoServidor = true
        }
        else
        {
            message.reply('⚠️ Debe cerrarse el servidor antes de volver a abrirlo ⚠️')
            console.log('Se ha intentado abrir el servidor una vez abierto')
        }
    }

    // cerrar servidor
    if(command === 'cerrar-servidor') {

        if(estadoServidor) // solo si antes estaba abierto
        {
            // envia embed
            canalServidor.send({ embeds: [embedCerrarServidor]})
    
            // cerrar server
            estadoServidor = false

        }
        else
        {
            message.reply('⚠️ Debe abrise el servidor antes de volver a cerrarlo ⚠️')
            console.log('Se ha intentado cerrar el servidor antes de abrirlo')
        }
    }

    // comando de estado del servidor
    if(command === 'estado-servidor') {
        estadoServidor 
            ? message.reply({ embeds: [embedAbrirServidor]})
            : message.reply({ embeds: [embedCerrarServidor]})
    }

    // comando de ayuda
    if(command === 'help') message.reply({ embeds: [helpEmbed]})


    // COMANDOS DE MODERACION

    // comando de kick
    if(command === 'kick') {

        // comprueba si el usuario tiene permisos
        if(!message.member.permissions.has('KickMembers')) return message.reply('⛔ No tienes permisos para usar este comando')

        // obtener argumentos del comando
        const member = message.mentions.members.first()
        const args = message.content.split(' ').slice(1)
        const reason = args.slice(1).join(' ')


        // verifica si se menciono a algun usuario
        if(!member) return message.reply('⚠️ No has mencionado a ningún usuario. Revisa la estructura del comando con !help')

        if(!reason) return message.reply('⚠️ No has proporcionado un motivo. Revisa la estructura del comando con !help')


        // crear embed
        const embedKick = new EmbedBuilder()
            .setTitle('Moderación Dubai RP')
            .setDescription(`El usuario ${member.username} ha sido expulsado del servidor 🚀`)
            .setFooter({text: `Acción realizada por el moderador ${message.member.username}`})
            .setColor('cf0911')

        // expulsar al usuario
        if(member && reason)
        {
            try
            {
                await member.kick(reason)
                canalModeracion.send({ embeds: [embedKick]})
            }
            catch (error)
            {
                console.log(error)
                message.reply('⭕ Ha ocurrido un error. Intentalo de nuevo más tarde o contacta con el soporte del servidor ⭕')
            }
        }
    }

    // comando de ban
    if(command === 'ban')
    {
        // obtener argumentos
        const args = message.content.split(' ')
        const user = message.mentions.members.first()
        const reason = args.slice(2).join(' ') || 'No se proporcionó una razón';

        // comprobar si tiene permisos
        if(!message.member.permissions.has('BanMembers')) return message.reply('⛔ No tienes permisos para usar este comando')

        // verifica si se han especificado los argumentos del comando
        if(!user) return message.reply('⚠️ No has mencionado a ningún usuario. Revisa la estructura del comando con !help')
        if(!reason) return message.reply('⚠️ No has proporcionado un motivo. Revisa la estructura del comando con !help')

        // accede al id del miembro a banear
        const member = message.guild.members.cache.get(user.id)
        if(!member) return message.reply('⭕ El usuario no se encuentra en el servidor ⭕')

        // crear embed
        const embedBan = new EmbedBuilder()
        .setTitle('Moderación Dubai RP')
        .setDescription(`El usuario ${user.username} ha sido baneado del servidor ⛔`)
        .setFooter({text: `Acción realizada por el moderador ${message.member.username}`})
        .setColor('cf0911')

        // intentar banear al usuario
        try
        {
            await member.ban({ reason })
            canalModeracion.send({ embeds: [embedBan]})
        }
        catch (err)
        {
            message.reply('⭕ Ha ocurrido un error. Intentalo de nuevo más tarde o contacta con el soporte del servidor ⭕')
            console.log(err)
        }
    }


    // comando para desbanear
    if(command === 'unban')
    {
        // extraer argumentos
        const args = message.content.split(' ');
        const userId = args[1];
        const reason = args.slice(2).join(' ') || 'No se proporcionó una razón';

        // comprobar que se especifican los argumentos necesarios
        if (!message.member.permissions.has('BAN_MEMBERS')) return message.reply('⛔ No tienes permisos para usar este comando');
        if (!userId) return message.reply('⚠️ No has proporcionado un ID valido. Revisa la estructura del comando con !help');

        // crear embed
        const embedUnban = new EmbedBuilder()
        .setTitle('Moderación Dubai RP')
        .setDescription(`El usuario ${userId.username} ha sido desbaneado del servidor 🚫`)
        .setFooter({text: `Acción realizada por el moderador ${message.member.username}`})
        .setColor('cf0911')

        try {

            // accede al usuario baneado
            const bannedUser = await message.guild.bans.fetch(userId);


            if (!bannedUser) {
                return message.reply('⭕ El usuario no se encuentra baneado ⭕');
            }

            // desbanea el usuario
            await message.guild.members.unban(userId, reason);

            // envia embed
            canalModeracion.send({ embeds: [embedUnban]})

        } 
        catch (error) 
        {
            message.reply('⭕ Ha ocurrido un error. Intentalo de nuevo más tarde o contacta con el soporte del servidor ⭕');
            console.error(error);
        }
    }

    // comando de info del server
    if (command === 'info')
    {
        message.reply({embeds: [infoEmbed]})
    }

    // comando para la version del vot
    if (command === 'version')
    {
        message.reply({
            content: version,
            ephemeral: true // mensaje solo visible para el autor del comando
        })
    }

        // comando para la denuncia
    if (command === 'denunciar') {

        if(message.member.roles.cache.has('1280542954108489896')) return message.reply('⛔ Debes estar verificado para usar este comando')

        // extrae argumentos
        const args = message.content.split(' ').slice(1);
        const denunciante = message.author;
        const mencionados = message.mentions.users; // Obtener todos los usuarios mencionados
        const denunciado = mencionados.first(); // Primer usuario mencionado
        const abogado = mencionados.size > 1 ? mencionados.at(1) : null; // Segundo usuario mencionado (si existe)
        const descripcion = args.slice(mencionados.size).join(' '); // El resto de los argumentos son la descripción

        // embed
        const embedDenuncia = new EmbedBuilder()
            .setTitle('Ministerio de Justicia')
            .addFields(
                { name: 'Denunciante', value: `${denunciante}`, inline: true },
                { name: 'Denunciado', value: `${denunciado}`, inline: true },
                { name: 'Abogado', value: abogado ? `${abogado}` : 'No asignado', inline: true },
                { name: 'Descripción', value: descripcion, inline: false }
            )
            .setColor('Blurple')
            .setFooter({ text: `Denuncia presentada por: ${denunciante.username}` });

        // faltan argumentos
        if (!denunciado || !descripcion) {
            return message.channel.send('⚠️ No has rellenado todos los campos. \nUso : !denuncia @denunciado @abogado(opcional) descripcion');
        }


        // agrega la denuncia al json
        agregarDenuncia(denunciante, denunciado, abogado, descripcion)

        // envia embed
        canalDenuncias.send({ embeds: [embedDenuncia] });
    }

    // Comando para ver todas las denuncias
    if (command === 'verdenuncias') 
    {
        if(!message.member.roles.cache.has('1282058725838032978') || !message.member.roles.cache.has('1282058884353232947')) return message.reply('⛔ Solo los jueces y el ministro de justicia pueden usar este comando')

        // lee las denuncias del json
        const denuncias = leerDenuncias();

        // comprueba que haya denuncias
        if (denuncias.length === 0) {
            return message.channel.send('⚠️ No hay denuncias registradas.');
        }

        denuncias.forEach(denuncia => {
            const embedDenuncia = new EmbedBuilder()
                .setTitle('Denuncias Registradas')
                .addFields(
                    { name: 'Denunciante', value: denuncia.denunciante, inline: true },
                    { name: 'Denunciado', value: denuncia.denunciado, inline: true },
                    { name: 'Abogado', value: denuncia.abogado, inline: true },
                    { name: 'Descripción', value: denuncia.descripcion, inline: false },
                    { name: 'Fecha', value: new Date(denuncia.fecha).toLocaleString(), inline: false }
                )
                .setColor('FF0000');

            message.channel.send({ embeds: [embedDenuncia] });
        });

    }


    // añadir multas
    if(command === 'multar')
    {
        // Verificar si el usuario tiene el rol necesario
        if (!message.member.roles.cache.has('1280542954326593611') || !message.member.roles.cache.has('1280542954301161500') ) {
            return message.reply('⛔ Solo los cuerpos de seguridad pueden usar este comando');
        }

        // extraer argumentos
        const args = message.content.split(' ');
        const afectado = message.mentions.users.first(); // Menciona al usuario afectado
        const articulo = args[2]; // Artículo de la multa
        const condena = args.slice(3).join(' '); // Monto o condena

        // falta de argumentos
        if (!afectado || !articulo || !condena) {
            return message.reply('⚠️ No has rellenado todos los campos. \nUso : !multar @usuario [artículo] [cantidad/condena]');
        }

        // Agregar la multa
        agregarMulta(message.author, afectado, articulo, condena);

        // Crear embed para la multa
        const embed = new EmbedBuilder()
            .setTitle('Policía de Dubai')
            .setColor('FF0000')
            .addFields(
                { name: 'Agente', value: message.author.username, inline: true },
                { name: 'Afectado', value: afectado.username, inline: true },
                { name: 'Artículo', value: articulo, inline: true },
                { name: 'Monto/Condena', value: condena, inline: true }
            )
            .setFooter({ text: `Fecha: ${new Date().toLocaleString()}` });

        // Enviar el embed en el canal
        canalMultas.send({ embeds: [embed] });

        message.reply(`Multa registrada correctamente en el canal de multas para @${afectado.username}.`);
    }

    // Ver multas
    if (command === 'pda') {

        multas = leerMultas()

        // Extraer argumentos
        const args = message.content.split(' ');
        let userId = args[1]?.replace('<@!', '').replace('>', '');

        // Elimina simbolos innecesarios para quedarse solo con la ID del usuario
        if (userId.startsWith('<@')) userId = userId.slice(2);

        console.log(multas);
        console.log(userId)

        // Falta de argumentos
        if (!userId) return message.reply('⚠️ Debes mencionar a un usuario para ver sus multas');

        // Filtrar multas del usuario
        const multasUsuario = multas.filter(multa => multa.afectadoId === userId);

        // Embed 0 multas
        const embedLimpio = new EmbedBuilder()
            .setTitle('PDA')
            .setDescription('Este usuario no tiene multas')
            .setColor('Blue');

        // En el caso de que el usuario no tenga multas
        if (multasUsuario.length === 0) return canalMultas.send({ embeds: [embedLimpio] });

        // Nuevo embed con un campo por cada multa
        const embedMultas = new EmbedBuilder()
            .setTitle(`Multas de ${message.guild.members.cache.get(userId).user.username}`)
            .setColor('Blue');

        multasUsuario.forEach((multa, index)=> {
            embedMultas.addFields(
                { name: 'Índice', value: `${index}`, inline: true },
                { name: 'Artículo', value: multa.articulo, inline: true },
                { name: 'Condena', value: multa.condena, inline: true }, // Asegúrate de que el campo sea 'condena'
                { name: 'Fecha', value: new Date(multa.fecha).toLocaleString(), inline: false }
            );
        });

        // Envía el embed
        canalMultas.send({ embeds: [embedMultas] });
    }

    // eliminar multa
    if(command === 'eliminarmulta') 
    {

        // Verificar si el usuario tiene el rol necesario
        if (!message.member.roles.cache.has('1280542954351628327') || !message.member.roles.cache.has('1280905403882016879') ) {
            return message.reply('⛔ Solo los moderadores / staffs pueden usar este comando');
        }

        // Extraer argumentos
        const args = message.content.split(' ');
        let userId = args[1]?.replace('<@!', '').replace('>', ''); // ID del usuario mencionado
        let multaIndex = parseInt(args[2], 10); // Índice de la multa a eliminar

        // Elimina simbolos innecesarios para quedarse solo con la ID del usuario
        if (userId.startsWith('<@')) userId = userId.slice(2);

        if (!userId || isNaN(multaIndex)) {
            return message.reply('⚠️ Uso incorrecto del comando. Uso :  !eliminarmulta @usuario indice. Usa !help para más información');
        }

        // Leer multas desde el archivo JSON
        multas = leerMultas();

        // Encontrar las multas del usuario
        let multasUsuario = multas.filter(multa => multa.afectadoId === userId);

        // si no se encuentra la multa
        if (multasUsuario.length <= multaIndex) {
            return message.reply(`⚠️ No existe ninguna multa con índice ${multaIndex}`);
        }

        // Eliminar la multa especificada
        multas.splice(multas.indexOf(multasUsuario[multaIndex]), 1);

        // Guardar cambios en el archivo JSON
        guardarMultas();

        // Confirmar eliminación
        message.reply('✅ La multa ha sido eliminada correctamente.');
    }
});


client.login(process.env.DISCORD_TOKEN);