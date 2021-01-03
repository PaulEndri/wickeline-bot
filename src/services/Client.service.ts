import Bottleneck from 'bottleneck';
import { ErBsClient } from 'erbs-client';
import { IPlayer, IPlayerSeasonRecord, Players } from '../models/Player.model';
import { Message } from 'discord.js';
import { IUserRecord } from 'erbs-client/dist/interfaces/IUserRecord';

export const ClientService = {
	_cacheTime: 1000 * 60 * 60,
	_client: new ErBsClient(),
	_limiter: new Bottleneck({ minTime: 1000 / (+process.env.RATE_LIMIT || 1), maxConcurrent: 1 }),
	getNumber: async (name: string, message: Message): Promise<number> => {
		const cachedData: IPlayer = await Players.findOne({ name });

		if (cachedData) {
			return cachedData.id;
		}

		if (message) {
			message.channel.send(
				"[Update] Searching the Research Center's databases for the requested test subject. I've heard it's British and involves queues."
			);
		}

		const results = await ClientService._limiter.schedule(() =>
			ClientService._client.getPlayerNumber(name)
		);

		if (results) {
			await Players.create({
				name,
				id: results.userNum
			});
		}

		return results.userNum;
	},
	getStats: async (id: number, seasonNumber = 0, message: Message): Promise<IUserRecord[]> => {
		const cachedData: IPlayer = await Players.find({ id });
		let record: IPlayerSeasonRecord;

		if (
			cachedData.seasonRecords &&
			cachedData.seasonRecords.find(({ season }) => season === seasonNumber)
		) {
			record = cachedData.seasonRecords.find(({ season }) => season === seasonNumber);

			if (new Date().valueOf() - record.lastUpdated.valueOf() < ClientService._cacheTime) {
				return record.info;
			}
		}

		message.reply(
			'[Update] The Research Centered has a lot of data, let me go find it for this unfortunate test subject'
		);

		const results = await ClientService._limiter.schedule(() =>
			ClientService._client.getPlayerRecord(id, seasonNumber)
		);

		if (!results) {
			return null;
		}

		if (record) {
			record.info = results;
			record.lastUpdated = new Date();
		} else {
			if (!cachedData.seasonRecords) {
				cachedData.seasonRecords = [];
			}

			cachedData.seasonRecords.push({
				season: seasonNumber,
				lastUpdated: new Date(),
				info: results
			});
		}

		await Players.findOneAndUpdate({ id }, { seasonRecords: cachedData.seasonRecords });

		return results;
	},
	getMatches: async (id: number) => {
		const cachedData: IPlayer = await Players.find({ id });

		if (new Date().valueOf() - cachedData.lastUpdated.valueOf() < ClientService._cacheTime) {
			return cachedData.matches;
		}

		const limited = ClientService._limiter.wrap(ClientService._client.getGamesForPlayer);
		const results = await limited(id);

		results.forEach((match) => {
			if (cachedData.matches.some((cachedMatch) => cachedMatch.gameId === match.gameId)) {
				return;
			}

			cachedData.matches.push(match);
		});

		await cachedData.save();

		return cachedData.matches;
	}
};
