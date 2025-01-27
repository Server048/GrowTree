const { Client, IntentsBitField, SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('node:fs/promises'); // Menggunakan fs.promises untuk async/await
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const botFilesDir = path.join(__dirname, 'bot_files'); // Lokasi file yang dibuat bot

// Middleware untuk melayani file statis dari direktori 'bot_files'
app.use('/bot_files', express.static(botFilesDir));

app.get('/', (req, res) => {
  res.send('<h1>Selamat Datang!</h1><p>Akses file di /bot_files</p>');
});

app.listen(port, () => {
  console.log(`Server web berjalan di http://localhost:${port}`);
});
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID; // Gunakan Guild ID jika Anda hanya ingin mendaftarkan perintah di satu guild. Kosongkan jika global.
const token = process.env.BOT_TOKEN;

const client = new Client({ intents: [IntentsBitField.Flags.Guilds] });
const rest = new REST({ version: '10' }).setToken(token); // Perbarui ke version 10

console.log("Direktori Kerja:", process.cwd()); // Menampilkan direktori kerja

const commands = [
    new SlashCommandBuilder()
        .setName('buat')
        .setDescription('Buat file konfigurasi dan kirim ke Discord')
        .addStringOption(option =>
            option.setName('nama_file')
                .setDescription('Nama file (tanpa ekstensi)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('ip_address')
                .setDescription('Alamat IP')
                .setRequired(true)
        ),
];

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    (async () => {
        try {
            console.log('Mendaftarkan perintah slash...');

            const data = await rest.put(
                guildId ? Routes.applicationGuildCommands(clientId, guildId) : Routes.applicationCommands(clientId),
                { body: commands },
            );

            console.log(`Berhasil mendaftarkan ${data.length} perintah slash.`);
        } catch (error) {
            console.error('Gagal mendaftarkan perintah slash:', error);
        }
    })();
});


client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'buat') {
        const namaFile = interaction.options.getString('nama_file');
        const ipAddress = interaction.options.getString('ip_address');
        const botFilesDir = './bot_files'; // Ganti dengan jalur yang sesuai
        const fileName = `${botFilesDir}/${namaFile}.txt`;

        const fileContent = `COPY FOR IPHONE:
www.growtopia1.com = ${ipAddress}
www.growtopia2.com = ${ipAddress}

COPY FOR ANDROID:
${ipAddress} growtopia1.com
${ipAddress} growtopia2.com
${ipAddress} www.growtopia1.com
${ipAddress} www.growtopia2.com
${ipAddress} growtopiagame.com
${ipAddress} hamumu.com
${ipAddress} rtsoft.com
HEEEHEEE
#Script Made By Server048
#Owner GrowTree`;
console.log("Nama File:", fileName);
console.log("Isi File:", fileContent);
        try {
            await fs.writeFile(fileName, fileContent);
            const attachment = new AttachmentBuilder(fileName);
            await interaction.reply({ content: `File '${fileName}' berhasil dibuat!`, files: [attachment] });
          //  await fs.unlink(fileName);
        } catch (error) {
            console.error("Error:", error);
            await interaction.reply({ content: `Terjadi kesalahan: ${error.message}`, ephemeral: true });
        }
    }
});

client.login(token);
