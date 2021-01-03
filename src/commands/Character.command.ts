import { Command } from 'aidyn';
import { Characters } from 'erbs-data';
import { Character } from 'erbs-sdk';
import { Message } from 'discord.js';

const embedifyData = (obj) =>
	Object.entries(obj)
		.map(([ [ first, ...rest ], value ]) => ({
			name: first.toUpperCase() + rest.join('').replace(/([A-Z])/g, ' $1').trim(),
			inline: true,
			value: `${value}`
		}))
		.filter(({ value }) => value !== undefined && value !== null);

export class CharacterCommand extends Command {
	static NAMESPACE = 'ER:BS';
	static NAME = 'Character';

	public Parametrized = true;
	public Lockdown = false;
	public Blurb = 'Get Character Information';
	public Arguments = [
		{
			name: 'name',
			text: 'Character to get information for',
			type: Object.keys(Characters).join(', ')
		},
		{ name: 'stats', type: 'boolean', text: 'Show Character Stats' },
		{
			name: 'statsForLevel',
			text: 'Show Stats for Character at Requested Level',
			type: 'number'
		}
	];

	public async Run(message: Message, args) {
		const channel = message.channel;
		const { stats, statsForLevel, name } = args;
		const characterName = name;

		if (!characterName) {
			return message.channel.send(`[Error] Character Name Must be Provided`);
		} else if (!Characters[characterName]) {
			return message.channel.send(`[Error] Invalid Charafcter: ${characterName}`);
		}

		const characterData = Characters[characterName];
		console.log('[test]', characterData);
		if (statsForLevel && isNaN(statsForLevel)) {
			return message.channel.send(
				`[Error] ${statsForLevel} is an invallid/non-numeric value`
			);
		}

		const embedBase = {
			title: characterData.displayName || characterName,
			url: `https://eternalreturn.gamepedia.com/${characterName}`,
			timestamp: new Date(),
			thumbnail: {
				url: `https://erbs-wickeline-imgs.s3.amazonaws.com/images/characters/mini/${characterName}.png`
			}

			// footer: {
			// 	text: 'Some footer text here',
			// 	icon_url: 'https://i.imgur.com/wSTFkRM.png'
			// }
			// thumbnail: {
			//     url: 'https://i.imgur.com/wSTFkRM.png',
			// },
		};
		const detailsEmbed = {
			...embedBase,
			description: characterData.description,
			fields: [
				{
					name: 'Weapons',
					value: characterData.weapons.join(', ') || 'no'
				},
				...embedifyData(characterData.details)
			],
			image: {
				url: `https://erbs-wickeline-imgs.s3.amazonaws.com/images/characters/half/${characterName}.png`
			}
		};
		console.log('[test]', detailsEmbed);
		channel.send({ embed: detailsEmbed });

		if (stats) {
			const initialStatsEmbed = {
				...embedBase,
				description: 'Initial Stats',
				fields: embedifyData(characterData.stats.initial)
			};

			const statsPerLevelEmbed = {
				...embedBase,
				description: 'Stats Per Level',
				fields: embedifyData(characterData.stats.perLevel)
			};

			channel.send({ embed: initialStatsEmbed });
			channel.send({ embed: statsPerLevelEmbed });
		}

		if (statsForLevel) {
			const char = new Character(characterData);
			const stats = char.getStatsForLevel(+statsForLevel);

			const statsPerLevelEmbed = {
				...embedBase,
				description: `Stats at level ${statsForLevel}`,
				fields: embedifyData(stats)
			};

			channel.send({ embed: statsPerLevelEmbed });
		}
	}
}
