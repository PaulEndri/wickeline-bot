import { Command } from 'aidyn';
import { Items } from 'erbs-data';
import { Message } from 'discord.js';

const ItemKeysArr = Object.entries(Items).map(([ key, obj ]) => [ obj.displayName, key ]);
const ReverseItemLookup = Object.fromEntries(ItemKeysArr);

export class ItemCommand extends Command {
	static NAMESPACE = 'ER:BS';
	static NAME = 'Item';

	public Parametrized = true;
	public Lockdown = false;
	public Blurb = 'Get Item Information';
	public Arguments = [
		{
			name: 'name',
			text: 'Item to get information for',
			type: 'string'
		}
	];

	public async Run(message: Message, args) {
		const channel = message.channel;
		const { name } = args;

		if (!name) {
			return message.channel.send(`[Error] Item Name Must be Provided`);
		}

		let itemData = Items[name];

		if (!itemData) {
			itemData = ReverseItemLookup[name];
		}

		if (!itemData) {
			const foundItems = ItemKeysArr.filter(
				([ val, key ]) => `${val}`.includes(name) || `${key}`.includes(name)
			);

			if (foundItems) {
				const displayVal = [ ...new Set(foundItems.flat()) ].join(', ');

				if (displayVal.length > 1000) {
					return message.channel.send(
						'[Error] Found too many results matching the provided string'
					);
				}

				return message.channel.send(
					`[Results] Found the following possible items, please try again with one of these: ${displayVal}`
				);
			}

			return message.channel.send(`[Error] No Items Found matching ${name}`);
		}

		const embedBase = {
			title: itemData.displayName,
			url: `https://eternalreturn.gamepedia.com/${name}`,
			timestamp: new Date(),

			footer: {
				text: `${itemData.id}`
			}
		};

		const detailsEmbed = {
			...embedBase,
			fields: [
				{
					name: 'Description',
					inline: false,
					value: itemData.description || 'N/A'
				},
				{
					name: 'Rarity',

					inline: true,
					value: itemData.rarity
				},
				{ name: 'Category', inline: true, value: itemData.clientMetaData.category },
				{
					name: 'Type',
					inline: true,
					value: itemData.clientMetaData.type
				}
			],
			image: {
				url: `https://erbs-wickeline-imgs.s3.amazonaws.com/images/${name}.png`
			}
		};

		if (itemData.buildsFrom && itemData.buildsFrom.length > 0) {
			detailsEmbed.fields.push({
				name: 'Builds From',
				inline: false,
				value: itemData.buildsFrom.map((item) => item.name).join(', ')
			});
		}

		if (itemData.buildsInto && itemData.buildsInto.length > 0) {
			detailsEmbed.fields.push({
				name: 'Builds Into',
				inline: false,
				value: itemData.buildsInto.map((item) => item.name).join(', ')
			});
		}

		if (Object.keys(itemData.locations).length) {
			detailsEmbed.fields.push({
				name: 'Found in',
				inline: false,
				value: Object.entries(itemData.locations)
					.map(([ name, count ]) => `${name}(${count})`)
					.join(', ')
			});
		}

		if (itemData.droppedFrom && itemData.droppedFrom.length > 0) {
			detailsEmbed.fields.push({
				name: 'Dropped From',
				inline: false,
				value: itemData.droppedFrom.map((item) => item.name).join(', ')
			});
		}

		if (Object.keys(itemData.stats).length > 0) {
			detailsEmbed.fields.push({
				name: 'Stats',
				inline: false,
				value: Object.entries(itemData.stats)
					.map(
						([ [ first, ...rest ], value ]) =>
							first.toUpperCase() +
							rest.join('').replace(/([A-Z])/g, ' $1').trim() +
							`: ${value}`
					)
					.join(', ')
			});
		}

		detailsEmbed.fields = detailsEmbed.fields.filter(({ value }) => !!value);
		channel.send({ embed: detailsEmbed });
	}
}
