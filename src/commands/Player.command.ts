import { Command } from 'aidyn';
import { Message } from 'discord.js';
import { GameModes } from 'erbs-client';
import { ClientService } from '../services/Client.service';
import { CharactersLookup } from 'erbs-sdk';

const ReversedCharactters = Object.fromEntries(
	Object.entries(CharactersLookup).map(([ k, v ]) => [ v, k ])
);
const ReversedModes = Object.fromEntries(Object.entries(GameModes).map(([ k, v ]) => [ v, k ]));
export class PlayerCommand extends Command {
	static NAMESPACE = 'ER:BS';
	static NAME = 'Player';

	public Parametrized = true;
	public Lockdown = false;
	public Blurb = 'Get Item Information';
	public SeasonMax = 1;
	public SeasonMin = 0;
	public Arguments = [
		{
			name: 'name',
			text: 'Player to get information for',
			type: 'string'
		},
		{
			name: 'mode',
			text: 'Mode to get stats for (Defaults to solos)',
			type: Object.keys(GameModes).join(', ')
		},
		{
			name: 'season',
			text: 'Season to get stats for (Defaults to 0)',
			type: `Between ${this.SeasonMax} and ${this.SeasonMin}`
		}
	];

	public async Run(message: Message, args) {
		const channel = message.channel;
		const { name, mode = GameModes.Solo, season = 0 } = args;
		let localMode = mode;

		if (!name) {
			return message.reply('[Error] Name must be provided');
		}

		if (mode !== GameModes.Solo) {
			const selectedMode = Object.keys(GameModes).find((key) => key === mode);

			if (!selectedMode) {
				return message.reply(`[Error] ${mode} is an invalid mode`);
			}

			localMode = GameModes[selectedMode];
		}

		if (isNaN(season) || +season > this.SeasonMax || season < this.SeasonMin) {
			return message.reply(`[Error] ${season} is an invalid season`);
		}

		const number = await ClientService.getNumber(name, message);

		if (!number) {
			return message.reply(`[Error] ${name} is an invalid user`);
		}

		const values = await ClientService.getStats(number, season, message);
		const modeData = values.find((record) => record.matchingTeamMode === localMode);

		if (!modeData) {
			return message.reply(
				`[Update] It looks like that test subject has hidden from ${ReversedModes[
					localMode
				]} in season ${season}`
			);
		}

		const embed = {
			title: name,
			timestamp: new Date(),
			footer: {
				text: number
			},
			fields: [
				{
					name: 'Rank',
					inline: true,
					value: modeData.rank.toString()
				},
				{
					name: 'MMR',
					inline: true,
					value: modeData.mmr.toString()
				},
				{
					name: 'Mode/Season',
					value: `${ReversedModes[localMode]} - Season ${season}`
				},
				{
					name: 'Avg. Rank',
					inline: true,
					value: modeData.averageRank.toString()
				},
				{
					name: 'Avg. Kills',
					inline: true,
					value: modeData.averageKills.toString()
				},
				{
					name: 'Avg. Assists',
					inline: true,
					value: modeData.averageAssistants.toString()
				},
				{
					name: 'Total Games',
					inline: true,
					value: modeData.totalGames.toString()
				},
				{
					name: 'Total Wins',
					inline: true,
					value: modeData.totalWins.toString()
				},
				{
					name: 'Most Used Characters',
					value: modeData.characterStats
						.map(({ characterCode }) => ReversedCharactters[characterCode])
						.join(', ')
				}
			]
		};
		channel.send({ embed });
	}
}
