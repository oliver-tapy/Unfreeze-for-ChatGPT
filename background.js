/**
 * Refinery 003 — service worker (message router)
 *
 * Receives conversation data from content script.
 * MVP: accepts conversation sync messages without logging content.
 * Future: syncs to Supabase (phase 2).
 *
 * Source: step-008/findings.edn lines 52-57
 *   [:service-worker :reduces-to :message-router]
 *   [:sync-conversation-msg :depends-on :message-router]
 *   [:conversation-parsing :depends-on :sync-conversation-msg]
 *   [:message-extraction :depends-on :conversation-parsing]
 *   [:console-log-mvp :depends-on :message-extraction]
 */

// Content script runs in MAIN world, so it uses window.postMessage.
// We need a bridge: a separate content script in ISOLATED world
// that listens for postMessage and forwards via chrome.runtime.sendMessage.
// But for MVP, the service worker just listens for messages from the bridge.

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== 'SYNC_CONVERSATION') return;

  if (!message.data || !Array.isArray(message.data.messages)) {
    sendResponse({ ok: false, error: 'invalid payload' });
    return;
  }

  sendResponse({ ok: true });
});
