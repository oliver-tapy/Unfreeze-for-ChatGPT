/**
 * Refinery 003 — service worker (message router)
 *
 * Receives conversation data from content script.
 * MVP: logs summary to console.
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

  const { conversation_id, title, url, messages } = message.data;

  console.log('[refinery-003] received conversation:', title);
  console.log('[refinery-003]   id:', conversation_id);
  console.log('[refinery-003]   url:', url);
  console.log('[refinery-003]   messages:', messages.length);

  // Log message breakdown by role
  const roles = {};
  for (const msg of messages) {
    const role = msg.role || 'unknown';
    roles[role] = (roles[role] || 0) + 1;
  }
  console.log('[refinery-003]   roles:', roles);

  // Log first and last user/assistant messages for verification
  const userMsgs = messages.filter(m => m.role === 'user');
  const assistantMsgs = messages.filter(m => m.role === 'assistant');

  if (userMsgs.length > 0) {
    const first = userMsgs[0];
    const preview = JSON.stringify(first.content?.parts?.[0] || '').slice(0, 80);
    console.log('[refinery-003]   first user msg:', preview);
  }

  if (assistantMsgs.length > 0) {
    const last = assistantMsgs[assistantMsgs.length - 1];
    const preview = JSON.stringify(last.content?.parts?.[0] || '').slice(0, 80);
    console.log('[refinery-003]   last assistant msg:', preview);
  }

  sendResponse({ ok: true });
});

console.log('[refinery-003] service worker started');
