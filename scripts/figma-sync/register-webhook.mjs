#!/usr/bin/env node
/**
 * Registers the Figma LIBRARY_PUBLISH webhook for the Hatari file.
 *
 *   FIGMA_ACCESS_TOKEN=… FIGMA_WEBHOOK_PASSCODE=… \
 *     node scripts/figma-sync/register-webhook.mjs https://figma-webhook-relay.<you>.workers.dev
 *
 * The token needs the webhooks:write scope. Pass --list to see existing webhooks.
 */
const FILE_KEY = '8jTvIjCa9YRiJQecaNxt1u';
const token = process.env.FIGMA_ACCESS_TOKEN;
const passcode = process.env.FIGMA_WEBHOOK_PASSCODE;
const arg = process.argv[2];
if (!token) throw new Error('FIGMA_ACCESS_TOKEN is not set');

const headers = { 'X-Figma-Token': token, 'Content-Type': 'application/json' };

if (arg === '--list') {
  const res = await fetch(`https://api.figma.com/v2/webhooks?context=file&context_id=${FILE_KEY}`, { headers });
  console.log(JSON.stringify(await res.json(), null, 2));
} else {
  if (!arg) throw new Error('Usage: register-webhook.mjs <relay endpoint URL> | --list');
  if (!passcode) throw new Error('FIGMA_WEBHOOK_PASSCODE is not set');
  const res = await fetch('https://api.figma.com/v2/webhooks', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      event_type: 'LIBRARY_PUBLISH',
      context: 'file',
      context_id: FILE_KEY,
      endpoint: arg,
      passcode,
      description: 'breeze-project: open a sync PR on library publish',
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Figma → ${res.status} ${JSON.stringify(body)}`);
  console.log(`Webhook ${body.id} created (status ${body.status}). Figma sent a PING to ${arg}.`);
}
