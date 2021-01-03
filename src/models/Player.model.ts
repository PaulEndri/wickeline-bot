import { IUserGameHistory } from 'erbs-client/dist/interfaces/IUserGameHistory';
import { IUserRecord } from 'erbs-client/dist/interfaces/IUserRecord';
import { Document, model, Model, Schema } from 'mongoose';

export interface IPlayerSeasonRecord {
	season?: number;
	lastUpdated?: Date;
	info?: IUserRecord[];
}

export interface IPlayer extends Document {
	name: string;
	id: number;
	seasonRecords?: IPlayerSeasonRecord[];
	matches?: IUserGameHistory[];
	lastUpdated?: Date;
}

const PlayerSchema: Schema<IPlayer> = new Schema({
	name: Schema.Types.String,
	id: Schema.Types.Number,
	seasonRecords: [
		{
			lastUpdated: Schema.Types.Date,
			season: Schema.Types.Number,
			info: Schema.Types.Array
		}
	],
	matches: Schema.Types.Array,
	lastUpdated: Schema.Types.Date
});

PlayerSchema.pre('save', function(next) {
	const now = new Date();

	this.lastUpdated = now;

	next();
});

export const Players: Model<IPlayer> = model<IPlayer>('Players', PlayerSchema);
