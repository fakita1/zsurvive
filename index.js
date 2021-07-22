const envconfig = require('./envconfig.json');

// Include discord.js ShardingManger
const {ShardingManager} = require('discord.js-light');

// Create your ShardingManger instance
const manager = new ShardingManager('./bot.js', {
    // for ShardingManager options see:
    // https://discord.js.org/#/docs/main/v12/class/ShardingManager
    totalShards: 'auto',
    token: envconfig.BotToken
});

// Spawn your shards
manager.spawn();

// Emitted when a shard is created
manager.on('shardCreate', (shard) => console.log(`Shard ${shard.id} launched`));