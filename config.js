/**
 * Shared extension configuration.
 *
 * Change DEFAULT_MAX_MESSAGES in one place to update code defaults.
 * Users can still override via:
 *   chrome.storage.local.set({ maxMessages: <number> })
 */
(function () {
  const REFINERY_CONFIG = {
    DEFAULT_MAX_MESSAGES: 250,
  };

  globalThis.REFINERY_CONFIG = Object.freeze(REFINERY_CONFIG);
})();
