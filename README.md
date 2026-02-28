# Unfreeze for ChatGPT

Chrome extension that makes long ChatGPT conversations load instantly.

## The problem

ChatGPT conversations with 1000+ messages freeze the browser tab — sometimes for minutes, sometimes permanently. Even reopening the tab doesn't help because ChatGPT tries to render all messages at once.

## How it works

Unfreeze intercepts the ChatGPT API response and shows only the last 250 messages. The full conversation stays cached in memory — click "Load more" to scroll back through earlier messages.

- Conversations that used to freeze now load in under 2 seconds
- "Load more" button at the top loads earlier messages in batches
- Footer shows message count: "Showing last 250 of 3870 messages"
- Inline status in the header area during loading

## Install

### From Chrome Web Store
*(Coming soon)*

### From source
1. Clone this repo
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" → select this folder

## Configuration

Default message limit is 250. To change:

1. Open DevTools on any ChatGPT page
2. Run: `chrome.storage.local.set({ maxMessages: 500 })`

## Privacy

No data leaves your browser. No analytics, no tracking, no external servers. See [privacy-policy.md](privacy-policy.md).

## How it works (technical)

The extension patches `window.fetch` at `document_start` to intercept calls to `/backend-api/conversation/[id]`. On first load, it fetches the full conversation, caches it in memory, and returns a truncated version (last N messages) to React. The "Load more" button prepends earlier messages from the cache.

Uses [chatgpt-ui.js](https://github.com/inem/chathpt-ui.js) for DOM manipulation.

## License

MIT
