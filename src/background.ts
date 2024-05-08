import browser from 'webextension-polyfill';
import { MenuItemId, MessageId } from './ids';
import { sendMessage } from './lib/sendMessage';
import { summarize } from './lib/summarize';



interface generateStream {
	model: string;
	created_at: string;
	response: string;
	done: boolean;
	total_duration?: number;
	load_duration?: number;
	prompt_eval_count?: number;
	prompt_eval_duration?: number;
	eval_count?: number;
	eval_duration?: number;
	context?: number[];
}

console.log('Hello from the background!');

async function readStream(
	stream: ReadableStreamDefaultReader<Uint8Array>,
	callback: (data: any) => Promise<any>
) {
	// buffer for the last chunk of data
	let buffer: string = '';
	// doneFound used
	let doneFound: boolean = false;

	// parseText
	const parseText = (text: string): string => {
		text = text.trim();
		console.log(text);
		
		if (doneFound) {
			buffer += text;
			return '';
		}

		let resp: string = '';
		try {
			let respStream: generateStream = JSON.parse(text);
			resp += respStream.response;
		} catch (e) {
			text.split('\n').forEach((line) => {
				// stream is done but data may be split because of large context
				if (line.includes('"done":true')) {
					buffer += line;
					doneFound = true;
					return;
				}
				if (line) {
					resp += parseText(line);
				}
			});
		}
		return resp;
	};

	while (true) {
		const { done, value } = await stream.read();
		if (done) {
			callback(parseText(buffer));
			break;
		}
		// decode array to utf-8
		let text = await new Response(value).text();

		callback(parseText(text));
	}
}

function openPopupHandshake(callback: () => void) {
	return browser.browserAction.openPopup().then(() => {
		browser.runtime.onMessage.addListener(function handshake(message, sender, sendResponse) {
			// destroy listener
			browser.runtime.onMessage.removeListener(handshake);
			return callback();
		});
	});
}

browser.runtime.onInstalled.addListener((details) => {
	browser.menus.onClicked.addListener((info, tab) => {
		if (info.menuItemId === MenuItemId.Summarize) {
			openPopupHandshake(async () => {
				if (info.selectionText === undefined) return;
				sendMessage(MessageId.Reset);
				
				// get text summary stream
				const reader = await summarize(info.selectionText);
				if (reader === null) return;

				// clear old summary
				browser.storage.session.remove('summary');
				
				// set original text
				browser.storage.session.set({ original: info.selectionText });
				
				// send text Start message
				sendMessage(MessageId.Start);

				readStream(reader, async (d) => {
					const data = await browser.storage.session.get('summary');
					if (!data || !data.summary) {
						browser.storage.session.set({ summary: d });
					} else {
						browser.storage.session.set({ summary: data.summary + d });
					}

					return sendMessage(MessageId.Update, d);
				});
			});
		}
	});
	browser.menus.create({
		id: MenuItemId.Summarize,
		title: 'Summarize selection',
		contexts: ['selection']
	});

	console.log('Extension installed:', details);
});
