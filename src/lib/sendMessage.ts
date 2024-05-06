import browser from "webextension-polyfill";

export function sendMessage(type: string, data?: any) {
  return browser.runtime.sendMessage({
    type: type,
    data: data !== undefined ? data : null
  });
}
