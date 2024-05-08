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
export async function summarize(text: string) {
	const response = await fetch('http://home:11434/api/generate', {
		method: 'POST',
		headers: new Headers({ 'content-type': 'application/json' }),
		body: JSON.stringify({
			model: 'nous-hermes2:10.7b', // 'dolphin-llama3:8b-v2.9-q6_K',
			prompt: text + '\n TLDR:',
			system: summarySystemPrompt,
			stream: true
		})
	});

	if (response.body === undefined || response.body === null) {
		return null;
	}

	return response.body.getReader();
}
