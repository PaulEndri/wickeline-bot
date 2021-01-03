import { Aidyn, Help } from 'aidyn';
import { AnimalCommand } from './commands/Animal.command';
import { CharacterCommand } from './commands/Character.command';
import { ItemCommand } from './commands/Item.command';
import { LocationCommand } from './commands/Location.command';
import { PlayerCommand } from './commands/Player.command';
import dotenv from 'dotenv';

dotenv.config();

const aidyn = new Aidyn({
	Logging: 1,
	BotToken: process.env.BOT_TOKEN,
	ConnectionString: process.env.CONNECTION_STRING,
	Prefix: '%'
});

aidyn.Start({
	Character: CharacterCommand,
	Location: LocationCommand,
	Animal: AnimalCommand,
	Item: ItemCommand,
	Player: PlayerCommand,
	Help
});
