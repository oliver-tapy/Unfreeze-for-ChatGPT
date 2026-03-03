# Security Review — Unfreeze-for-ChatGPT

Date: 2026-03-01
Scope: `manifest.json`, `background.js`, `content.js`, `bridge.js`, `chatgpt-ui.js`, docs.

## Executive summary

Overall, the extension appears **low-risk for active data exfiltration** in its current state:
- No outbound requests to third-party servers were found.
- No analytics/tracking SDKs were found.
- Permissions are relatively narrow (`storage` + ChatGPT host access only).

However, there are important **privacy caveats**:
- Full conversation content is collected from ChatGPT API responses and forwarded to the extension background worker.
- Message previews and metadata are logged to extension console.
- The architecture uses `window.postMessage(..., '*')` bridge patterns, which are functional but broad.

## Findings

### 1) No obvious external exfiltration or tracking (Good)
- No `fetch`/XHR/WebSocket calls to external domains in extension code.
- No telemetry/analytics libraries observed.
- Host permissions limited to ChatGPT domains.

**Risk:** Low

### 2) Full conversation content is captured in-page and sent to extension worker (Privacy-sensitive)
`content.js` intercepts ChatGPT conversation API payloads, builds a `messages` array (including content), and posts it for relay to `background.js`.

`background.js` currently logs conversation metadata and content previews to console.

Implication:
- Data is not sent off-device now, but sensitive conversation text is processed and appears in extension logs.
- Anyone with local browser profile access / debugging access may read logs.

**Risk:** Medium (privacy), Low (network exfiltration)

### 3) Bridge messaging trust model is permissive
- `window.postMessage(..., '*')` is used between scripts.
- `bridge.js` forwards messages when `event.source === window` and `event.data.source === 'refinery-003'`.

Because `content.js` runs in MAIN world, page JS can potentially craft similar messages. This mainly enables spoofing/noise or DoS-style message flood to extension worker, not direct privilege escalation by itself.

**Risk:** Low–Medium

### 4) Dangerous permissions not present (Good)
Not present: `tabs`, `webRequestBlocking`, `<all_urls>`, `cookies`, native messaging, remote code execution constructs.

**Risk:** Low

### 5) Documentation inconsistencies (Trust signal issue)
`privacy-policy.md` still references old name/repo (“ChatGPT Speedup”). This is likely fork residue, not malware, but it is a trust/maintenance red flag.

**Risk:** Low (integrity/trust)

## Verdict

Based on static review of this repo snapshot:
- **No direct spyware behavior found** (no outbound exfiltration, no trackers).
- **Main concern is local privacy handling** (conversation data interception + debug logging).
- Safe to classify as **“generally trustworthy with caution”** if you are comfortable with the extension reading full chat payloads locally.

## Recommended hardening before production use

1. Remove or strictly gate all conversation-content console logs in `background.js`.
2. Add stronger message validation in `bridge.js` (strict type checks, schema checks, possible nonce/session token).
3. Minimize data passed to background script; avoid forwarding full message bodies unless absolutely needed.
4. Keep privacy docs consistent and accurate (`privacy-policy.md` naming/contact).
5. Consider moving from MAIN-world logic where possible, or isolate privileged actions further.
