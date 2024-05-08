<script lang="ts">
	import { createTabs, createCheckbox, melt } from '@melt-ui/svelte';
	import browser from 'webextension-polyfill';
	import { MessageId } from '../ids';

	const {
		elements: { root: tabRoot, list, content, trigger },
		states: { value }
	} = createTabs({
		defaultValue: 'tab-1'
	});
	const {
		elements: { root: checkRoot, input },
		states: { checked }
	} = createCheckbox();

	const triggers = [
		{ id: 'tab-1', title: 'Summary' },
		{ id: 'tab-2', title: 'Settings' }
	];

	console.log('Hello from the popup!');
	const selText = 'Select Text to get started';
	let text: string = selText;
	let originalText = '';
	browser.storage.session.get('summary').then((data) => {
		if (!data || !data.summary) {
			text = selText;
			return;
		}
		text = data.summary;
	});
	const setOriginalText = () => {
		browser.storage.session.get('original').then((data) => {
			if (!data || !data.original) {
				originalText = '';
				return;
			}
			originalText = data.original;
		});
	};

	const clearAll = () => {
		browser.storage.session.remove('original');
		browser.storage.session.remove('summary');
		text = 'Select Text to get started';
		originalText = '';
	};

	setOriginalText();
	browser.runtime.onMessage.addListener(async (request, sender, sendMessage) => {
		switch (request.type) {
			case MessageId.Start:
				text = '';
				setOriginalText();
				break;
			case MessageId.Update:
				text += request.data;
				break;
			case MessageId.Reset:
				text = 'Loading...';
				break;
			default:
				break;
		}
	});
</script>

<div use:melt={$tabRoot} class="flex h-full w-full flex-col">
	<!--<img src="/icon-with-shadow.svg" alt="" />
	<h1>vite-plugin-web-extension</h1>
	<p>
		Template: <code>svelte-ts</code>
	</p>
	<button on:click={() => console.log('hi')}>hi</button>-->
	<div class="flex grow overflow-scroll px-4 py-2">
		<div use:melt={$content('tab-1')} class="grow h-full">
			<div class="flex grow h-full flex-col">
				<div class="flex items-end justify-between">
					<h1 class="text-xl font-semibold">Summary:</h1>
					<div class="flex space-x-1.5">
						<div class="flex items-center justify-center">
							<label class="text-magnum-900 pr-2 font-medium" for="checkbox">Original text:</label>
							<button
								use:melt={$checkRoot}
								class="flex size-5 appearance-none items-center justify-center
									rounded-sm bg-white text-rose-600 shadow hover:opacity-75"
								id="checkbox"
							>
								{#if $checked}
									<svg
										class="size-4"
										viewBox="0 0 15 15"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
										><path
											d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
											fill="currentColor"
											fill-rule="evenodd"
											clip-rule="evenodd"
										></path></svg
									>
								{/if}
								<input use:melt={$input} />
							</button>
						</div>
						<div>|</div>
						<div>
							<button on:click={clearAll} class="flex font-semibold text-rose-600"> Clear </button>
						</div>
					</div>
				</div>
				<div class="flex grow pt-2">
					<textarea
						name="original-text"
						id="original-text"
						disabled
						class="box-border h-full w-full resize-none border-none bg-transparent outline-none"
						>{!$checked ? text : originalText}</textarea
					>
				</div>
			</div>
		</div>
		<div use:melt={$content('tab-2')}></div>
	</div>
	<div class="flex h-9 shrink-0 grow-0" use:melt={$list}>
		{#each triggers as triggerItem}
			<button
				use:melt={$trigger(triggerItem.id)}
				class="relative flex flex-1 items-center justify-center bg-slate-800 data-[data-state='active']:bg-transparent"
			>
				{triggerItem.title}
				{#if $value === triggerItem.id}
					<div
						class="absolute bottom-1 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-rose-400"
					/>
				{/if}
			</button>
		{/each}
	</div>
</div>
