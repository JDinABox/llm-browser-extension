import browser from 'webextension-polyfill';

console.log('Hello from the background!');

browser.runtime.onInstalled.addListener((details) => {
	browser.menus.create({
		id: 'summarize-selection',
		title: 'Summarize',
		contexts: ['selection']
	});
	console.log('Extension installed:', details);
});
