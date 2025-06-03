# low-battery-warning-discord
If you happen to have an Android device that you're using as some kind of server with [Termux](https://termux.dev/en/) and you don't want for it to be plugged in all the time, but also you always forget to charge it, maybe low-battery-warning-discord can help.

## Installation
### 1. Create a Discord bot
If you alredy have one, you can just use the token of the other bot (they can even run at the same time!).

If you don't, you can follow [this guide](https://discordpy.readthedocs.io/en/stable/discord.html), it's from discordpy but for this it works.

In terms of permissions, this bot only needs `Read Messages/View Channels` and `Send Messages`.

Copy the token to a safe place until we need it.

### 2. Clone the repository
We need to clone the repository to your Android device, to do that, first we have to install git on termux:

```shell
pkg install git
```

Before cloning the repository, you may want to `cd` into a folder in where you would want the repository to be cloned.

To clone the repository run:

```shell
git clone https://github.com/idko2004/low-battery-warning-discord.git
```

### 3. Install things
#### On Android
Install `Termux:API` from the same place you've installed `Termux`.

If you installed it from f-droid, here is a [link to the package](https://f-droid.org/packages/com.termux.api/), though you should install it through your f-droid client.

#### Inside Termux
To run this project, we need `nodejs` and `termux-api`, to install these, run:

```shell
pkg install nodejs termux-api
```

Now, cd into the cloned repository and run:

```shell
npm install
```

### Configure bot
Copy the file `config_template.json` to `config.json`

```shell
cp config_template.json config.json
```

Open `config.json` with your favorite text editor and modify the following things:

- In `battery_percentage_threshold` you need to specify at which percentage of battery should the bot start sending messages.

- In `low_battery` goes the message the bot will send when the battery level is below the threshold, the `%%` will be replaced with the actual percentage of battery.

- In `error` goes the message the bot will send if something goes wrong, the `%%` will be replaced with the error.

- In `discord_user_to_ping` you should place the id of the discord user that should receive a notification when the bot sends a message, to copy their id you need to enable developer mode on Discord and right-click on their profile picture, at the bottom should be the option `Copy user ID`, place it inside the `<@` and `>`.

- In `discord_bot_token` you should place your bot's token, the one you should've kept in a safe place.

- In `discord_channel_id` you need to place the id of the channel in which the bot should send messages, to copy the id of a channel, with developer mode enabled on Discord, right-click a channel and, at the bottom should be an option called `Copy channel ID`.

- `attempts_to_login` indicates how many times the bot should try to connect to Discord in case of failure.

### Run the bot
The bot now should be able to run.

```shell
npm start
```

The bot will only attempt to connect to discord when the battery is below the threshold or if something went wrong when reading the battery status. So you should check when the battery of the device is low to see if everything works properly. You can do a little test by running `TEST=1 npm start`.

Also the bot only runs once, it's not running in the background checking every once in a while, instead just checks once and exits, so you will need to create a script or a cronjon to check periodically.

### Cronjob

