# ZSurvive

ZSurvive is a RPG-like Discord bot game. Farm resources, upgrade tools, defeat epic bosses, earn achievements, and be
the strongest survivor ever!

## Features
* Unique reaction menu and gameplay.
* Energy system that keeps players engaged with the bot, including notifications by DM.
* Pre-made patron system with rewards auto-delivery.
* Minimap with different bosses and resources.
* Ability tree and upgrades.

## How to setup
### Pre-requirements
1. Install NodeJS https://nodejs.org/
2. Install the global PM2 module running the command `npm install pm2 -g`

### Setup
1. Clone the repository.
2. Make a copy of envconfig-sample.json and call it envconfig.json
* Please make sure to complete all missing information such as bot token.
3. Install dependencies running `npm install` inside the project directory (first use the `cd {path}` command if necessary).
4. Start the bot using PM2 and the watch.json file included in the project (`pm2 start watch.json`). If on windows, you can create a file called start.bat that contains this command.
