/**
 * Refinery 003 — bridge between MAIN world and service worker
 *
 * content.js runs in MAIN world (to patch window.fetch).
 * MAIN world has no access to chrome.runtime or chrome.storage.
 * This script runs in ISOLATED world (default) and bridges:
 *   window.postMessage → chrome.runtime.sendMessage
 *   chrome.storage → window.postMessage (settings)
 *
 * Source: step-009/code/bridge.js (base)
 * Change: sends settings (maxMessages) to MAIN world on load
 */

// Send settings to MAIN world
const DEFAULT_MAX_MESSAGES = globalThis.REFINERY_CONFIG?.DEFAULT_MAX_MESSAGES ?? 250;

chrome.storage.local.get({ maxMessages: DEFAULT_MAX_MESSAGES }, (settings) => {
  window.postMessage({
    source: 'refinery-003-settings',
    maxMessages: settings.maxMessages,
  }, '*');
});

// Relay conversation data from MAIN → service worker
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (!event.data || event.data.source !== 'refinery-003') return;

  chrome.runtime.sendMessage({
    type: event.data.type,
    data: event.data.data,
  }).catch(err => {
    console.debug('[refinery-003-bridge] sendMessage failed:', err.message);
  });
});
