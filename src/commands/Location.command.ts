import { Command } from 'aidyn';
import { Locations } from 'erbs-data';
import { Message } from 'discord.js';

export class LocationCommand extends Command {
	static NAMESPACE = 'ER:BS';
	static NAME = 'Location';

	public Parametrized = true;
	public Lockdown = false;
	public Blurb = 'Get Location Information';
	public Arguments = [
		{
			name: 'name',
			text: 'Location to get information for',
			type: Object.keys(Locations).join(', ')
		}
	];

	public async Run(message: Message, args) {
		const channel = message.channel;
		const { name } = args;
		const LocationName = name;

		if (!LocationName) {
			return message.channel.send(`[Error] Location Name Must be Provided`);
		} else if (!Locations[LocationName]) {
			return message.channel.send(`[Error] Invalid Location: ${LocationName}`);
		}

		const LocationData = Locations[LocationName];
		console.log('[test]', LocationData);

		const embedBase = {
			title: LocationName,
			url: `https://eternalreturn.gamepedia.com/${LocationName}`,
			timestamp: new Date()

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
			fields: [
				{
					name: 'Has Hyperloop?',
					value: LocationData.teleport ? 'Yes' : 'No'
				},
				{
					name: 'Animals',
					value: LocationData.animals
						.map(({ name, quantity }) => `${name}(${quantity})`)
						.join(', ')
				},
				{
					name: 'Drops',
					value: LocationData.drops
						.map(({ name, quantity }) => `${name}(${quantity})`)
						.join(', ')
				},
				{
					name: 'Connections',
					value: LocationData.connections.map(({ name }) => `${name}`).join(', ')
				}
			],
			image: {
				url: `https://erbs-wickeline-imgs.s3.amazonaws.com/images/locations/${LocationName}.jpg`
			}
		};

		console.log('[test]', detailsEmbed);
		channel.send({ embed: detailsEmbed });
	}
}
