import { Command } from 'aidyn';
import { Animals } from 'erbs-data';
import { Message } from 'discord.js';

export class AnimalCommand extends Command {
	static NAMESPACE = 'ER:BS';
	static NAME = 'Animal';

	public Parametrized = true;
	public Lockdown = false;
	public Blurb = 'Get Animal Information';
	public Arguments = [
		{
			name: 'name',
			text: 'Animal to get information for',
			type: Object.keys(Animals).join(', ')
		}
	];

	public async Run(message: Message, args) {
		const channel = message.channel;
		const { name } = args;
		const AnimalName = name;

		if (!AnimalName) {
			return message.channel.send(`[Error] Animal Name Must be Provided`);
		} else if (!Animals[AnimalName]) {
			return message.channel.send(`[Error] Invalid Animal: ${AnimalName}`);
		}

		const AnimalData = Animals[AnimalName];
		console.log('[test]', AnimalData);

		const embedBase = {
			title: AnimalName,
			url: `https://eternalreturn.gamepedia.com/${AnimalName}`,
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
					name: 'Spawn Timer',
					inline: true,
					value: `${AnimalData.stats.createTime}`
				},
				{
					name: 'Respawn Timer',
					inline: true,
					value: `${AnimalData.stats.regenTime}`
				},
				{
					name: 'Locations',
					value: Object.entries(AnimalData.locations)
						.map(([ name, quantity ]) => `${name}(${quantity})`)
						.join(', ')
				},
				{
					name: 'Drops',
					value: AnimalData.items
						.map(({ name, percentage }) => `${name}(${percentage}%)`)
						.join(', ')
				}
			],
			image: {
				url: `https://erbs-wickeline-imgs.s3.amazonaws.com/images/Animals/${AnimalName}.jpg`
			}
		};

		detailsEmbed.fields = detailsEmbed.fields.filter(({ value }) => !!value);

		console.log('[test]', detailsEmbed);
		channel.send({ embed: detailsEmbed });
	}
}
