const config = require('./config.json');

let Discord;
let discordClient;

function initializeDiscordClient()
{
	return new Promise(async function(good, bad)
	{
		console.log('[INFO] Starting Discord Client');

		Discord = require('discord.js');

		discordClient = new Discord.Client(
		{
			intents:
			[
				Discord.GatewayIntentBits.Guilds,
				Discord.GatewayIntentBits.GuildMessages,
				Discord.GatewayIntentBits.MessageContent,
				Discord.GatewayIntentBits.GuildMembers,
			],
			partials:
			[
				Discord.Partials.Channel
			]
		});

		Discord.DefaultWebSocketManagerOptions.identifyProperties.browser = 'Discord Android';

		discordClient.on(Discord.Events.ClientReady, async function(e)
		{
			console.log("[INFO] Discord is ready");
			good();
		});

		let tryAgain = true;
		let tries = 0;
		while(tryAgain)
		{
			tries++;

			try
			{
				console.log(`[INFO] Attempting to log in... (Attempt ${tries})`);
				await discordClient.login(config.discord_bot_token);
				tryAgain = false;
			}
			catch(err)
			{
				console.error('[ERROR] Failed to login', err);
				tryAgain = true;
			}

			if(tries > config.attempts_to_login && tryAgain)
			{
				console.error('[ERROR] Too many login attempts, giving up.');
				tryAgain = false;
			}
		}
	});
}

function prepareMessage(message, extraString)
{
	if(message.includes('%%'))
	{
		message = message.replace('%%', extraString);
	}

	return message;
}

async function sendDiscordMessage(message, extraString)
{
	message = prepareMessage(message, extraString);

	await initializeDiscordClient();

	let channel = await discordClient.channels.fetch(config.discord_channel_id);
	if(!channel)
	{
		console.log(`[ERROR] Channel with id ${config.discord_channel_id} doesn't seem to exist, or the bot does not have access to it.`);
		process.exit(1);
	}

	await channel.send({content: `${config.discord_user_to_ping}, ${message}`});
	console.log('[INFO] Message send!');
	process.exit(0);
}

module.exports = { sendDiscordMessage };