import { MessageId } from './ids';
import { sendMessage } from './lib/sendMessage';
import Popup from './pages/Popup.svelte';

try {
	sendMessage(MessageId.Handshake);
} catch (e) {
	console.log(e);
}
new Popup({ target: document.body });
