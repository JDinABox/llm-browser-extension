<script lang="ts">
	import browser from 'webextension-polyfill';
	import { MessageId } from '../ids';

	console.log('Hello from the popup!');
	let l: string = 'Loading...';
	browser.runtime.onMessage.addListener(async (request, sender, sendMessage) => {
		switch (request.type) {
			case MessageId.Start:
				l = '';
				break;
			case MessageId.SummarizeSelection:
				l += request.data;
				break;
			default:
				break;
		}
	});
</script>

<div>
	<!--<img src="/icon-with-shadow.svg" alt="" />
	<h1>vite-plugin-web-extension</h1>
	<p>
		Template: <code>svelte-ts</code>
	</p>
	<button on:click={() => console.log('hi')}>hi</button>-->
	<div class="px-4 py-2">{l}</div>
</div>

<style>
</style>
