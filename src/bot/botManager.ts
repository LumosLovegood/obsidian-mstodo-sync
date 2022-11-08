import { Bot } from 'mirai-js';
import { Notice } from 'obsidian';
import MsTodoSync from '../main';
import * as botEvents from './botEvents';

export class BotManager {
	// eslint-disable-next-line @typescript-eslint/ban-types
	private allEvents: { [key: string]: Function };
	private readonly bot = new Bot();
	private actEvents = new Map<string, number>();
	private botOn = false;

	constructor(private readonly plugin: MsTodoSync) {
		// official events
		// eslint-disable-next-line @typescript-eslint/ban-types
		this.allEvents = botEvents as { [key: string]: Function };
		// TODO: UserScript events
	}

	async launch() {
		if (this.botOn) {
			new Notice('The Bot is ON.');
			return;
		}
		if (!this.plugin.settings.bot) {
			new Notice('Please complete the bot configuration first.');
			return;
		}

		// Open a session for bot
		await this.bot
			.open(this.plugin.settings.bot)
			.then(() => {
				new Notice('Bot has been started.');
				this.botOn = true;
			})
			.catch((err) => {
				new Notice('Mirai is not working');
				console.error(err);
			});

		// Events Initiation
		this.initEvents();
	}

	async stop() {
		if (this.botOn)
			await this.bot.close().then(() => {
				this.botOn = false;
				new Notice('The bot has been stopped.');
			});
	}

	// Get all functions from botEvents.ts and register them as events
	initEvents() {
		// TODO: add a setting for the default AutoStart events
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.allEvents.forEach((value: any, key: string) => {
			if (Object.prototype.hasOwnProperty.call(this.allEvents, key)) {
				this.addEvent(key);
			}
		});
	}

	removeEvent(eventName: string) {
		if (this.actEvents.get(eventName)) {
			this.bot.off('FriendMessage', this.actEvents.get(eventName));
			this.actEvents.delete(eventName);
		}
		console.log(this.actEvents);
	}

	addEvent(eventName: string) {
		if (!this.actEvents.get(eventName) && this.allEvents[eventName]) {
			this.actEvents.set(
				eventName,
				this.bot.on(
					'FriendMessage',
					async (data) => await this.allEvents[eventName](data, this.bot, this.plugin),
				),
			);
		}
	}
}
