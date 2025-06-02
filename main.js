const {exec} = require('child_process');
const discordWrapper = require('./discord_wrapper');
const config = require('./config.json');

console.log(`${new Date().toString()}\n`);

monitorBattery();

async function monitorBattery()
{
	let status;
	try
	{
		status = await getBatteryStatus();
	}
	catch(err)
	{
		console.log("[ERROR] monitorBattery: Failed to get battery status.");
		await discordWrapper.sendDiscordMessage(config.messages.error, err.toString());
		return;
	}

	if(status == undefined)
	{
		console.log("[ERROR] monitorBattery: Battery status is undefined!");
		await discordWrapper.sendDiscordMessage(config.messages.error, "Battery status is undefined!");
		return;
	}

	if(status.percentage <= config.battery_percentage_threshold
	&& status.plugged == "UNPLUGGED")
	{
		console.log(`[INFO] The device is at ${status.percentage}% of charge, please plug it in.`);
		await discordWrapper.sendDiscordMessage(config.messages.low_battery, `${status.percentage}%`);
	}
	else
	{
		console.log(`[INFO] Device is at ${status.percentage}% of charge.`);
	}
}

function getBatteryStatus()
{
	/*
	return new Promise((good, bad) =>
	{
		good({percentage: 15, plugged: "UNPLUGGED"});
	});
	*/
	return new Promise((good, bad) =>
	{
		exec("termux-battery-status", (stderr, stdout) =>
		{
			//console.log("stderr: ", stderr);
			console.log("[INFO] What termux-battery-status said: ", stdout);

			if(stderr != null)
			{
				console.log("[ERROR] getBatteryStatus: Something appeared on stderr, Printing:\n", stderr);
				bad(stderr)
			}
		
			try
			{
				good(JSON.parse(stdout));
			}
			catch(err)
			{
				console.log("[ERROR] getBatteryStatus: Failed to parse as JSON. Printing what I was trying to parse:\n", stdout);
				bad(err);
			}
		});
	});
}

