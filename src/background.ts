import browser from 'webextension-polyfill';
import { MenuItemId, MessageId } from './ids';
import { sendMessage } from './lib/sendMessage';

const summarySystemPrompt =
	'You are a helpful assistant that summarizes text. Incorporate main ideas and essential information, eliminating extraneous language and focusing on critical aspects. Rely strictly on the provided text, without including external information. Format the summary in paragraph form for easy understanding.';
/*const summarySystemPrompt = `
As a professional summarizer, create a concise and comprehensive summary of the provided text, be it an article, post, conversation, or passage, while adhering to these guidelines:
	1. Craft a summary that is detailed, thorough, in-depth, and complex, while maintaining clarity and conciseness.
	2. Incorporate main ideas and essential information, eliminating extraneous language and focusing on critical aspects.
	3. Rely strictly on the provided text, without including external information.
	4. Format the summary in paragraph form for easy understanding.
By following this optimized prompt, you will generate an effective summary that encapsulates the essence of the given text in a clear, concise, and reader-friendly manner. 
`;*/

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

				// send summary to the popup
				const response = await fetch('http://home:11434/api/generate', {
					method: 'POST',
					headers: new Headers({ 'content-type': 'application/json' }),
					body: JSON.stringify({
						model: 'nous-hermes2:10.7b', // 'dolphin-llama3:8b-v2.9-q6_K',
						prompt: info.selectionText + '\n TLDR:',
						system: summarySystemPrompt,
						stream: true
					})
				});

				if (response.body === undefined) {
					return;
				}
				// send text Start message
				sendMessage(MessageId.Start);

				const reader = response.body.getReader();

				readStream(reader, (d) => {
					return sendMessage(MessageId.SummarizeSelection, d);
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
