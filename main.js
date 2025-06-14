const {exec} = require('child_process');
const fs = require('fs');
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

	const previousState = await getPreviousState();
	let chargeDifference;
	if(previousState === undefined)
	{
		chargeDifference = 100;
		console.log("[WARN] monitorBattery: Faking difference because no previous state is available");
	}
	else
	{
		chargeDifference = previousState.percentage - status.percentage;
		console.log(`[INFO] monitorBattery: Difference between current state and previous state is ${chargeDifference}%`);
	}

	if
	(
		(
			status.percentage <= config.battery_percentage_threshold
			&& status.plugged == "UNPLUGGED"
			&& chargeDifference >= config.notification_threshold
		)
		|| process.env.TEST === '1'
	)
	{
		if(process.env.TEST === '1')
		{
			console.log(`[WARN] We're performing a test, so we'll pretend the charge is currently low.`);
		}
		console.log(`[INFO] The device is at ${status.percentage}% of charge, please plug it in.`);
		await discordWrapper.sendDiscordMessage(config.messages.low_battery, `${status.percentage}%`);

		await setCurrentState(status.percentage);

		process.exit(0);
	}
	else
	{
		console.log(`[INFO] Device is at ${status.percentage}% of charge.\n[INFO] Not sending any messages`);
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

async function getPreviousState()
{
	let path = config.data_folder;
	if(path === '') return undefined;
	if(!path.endsWith('/')) path += '/';
	path += 'previous_state.json';

	try
	{
		const file = await fs.promises.readFile(path, {encoding: 'utf-8'});
		const json = JSON.parse(file);
		if(json === null) return undefined;
		else return json;
	}
	catch(err)
	{
		if(err.code === 'ENOENT')
		{
			console.log(`[WARN] getPreviousState: No previous state found. This is normal if this is the first time this program is running. But if this is not the first run, there might be a problem with the file at ${path}`);
			return undefined;
		}
		else
		{
			console.error(`[ERROR] getPreviousState: Failed to load previous state: ${err.toString()}`);
			return undefined;
		}
	}

	return undefined;
}

async function setCurrentState(batteryLevel)
{
	let path = config.data_folder;
	if(path === '') return undefined;
	if(!path.endsWith('/')) path += '/';
	path += 'previous_state.json';

	let stateObj =
	{
		percentage: batteryLevel
	}

	let stateString = JSON.stringify(stateObj);

	try
	{
		await fs.promises.writeFile(path, stateString);
	}
	catch(err)
	{
		console.error(`[ERROR] setCurrentState: Failed to write file: ${err.toString}`);
	}
}

