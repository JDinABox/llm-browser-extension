import { MessageId } from './ids';
import { sendMessage } from './lib/sendMessage';
import Popup from './pages/Popup.svelte';

sendMessage(MessageId.Handshake);
new Popup({ target: document.body });
