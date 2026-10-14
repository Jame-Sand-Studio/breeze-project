/**
 * Cloudflare Worker: Figma webhook → GitHub repository_dispatch.
 *
 * Figma can't call the GitHub API directly (it can't send an auth header), so this
 * relay checks Figma's passcode and forwards component changes to the repo, which
 * starts .github/workflows/figma-sync.yml.
 *
 * Secrets (wrangler secret put …): FIGMA_WEBHOOK_PASSCODE, GITHUB_TOKEN
 * Vars (wrangler.toml): GITHUB_REPO, FIGMA_FILE_KEY
 */
const pick = (items = []) => items.map(({ key, name }) => ({ key, name }));

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

    let event;
    try {
      event = await request.json();
    } catch {
      return new Response('Bad JSON', { status: 400 });
    }

    if (event.passcode !== env.FIGMA_WEBHOOK_PASSCODE) return new Response('Forbidden', { status: 403 });
    if (event.event_type === 'PING') return new Response('pong');
    if (event.event_type !== 'LIBRARY_PUBLISH') return new Response('ignored');
    if (env.FIGMA_FILE_KEY && event.file_key !== env.FIGMA_FILE_KEY) return new Response('ignored: other file');

    // Figma sends one LIBRARY_PUBLISH per asset type; only component changes need a code update.
    const created = pick(event.created_components);
    const modified = pick(event.modified_components);
    const deleted = pick(event.deleted_components);
    if (!created.length && !modified.length && !deleted.length) return new Response('ignored: no component changes');

    const res = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/dispatches`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'figma-webhook-relay',
      },
      body: JSON.stringify({
        event_type: 'figma-library-publish',
        client_payload: {
          file_key: event.file_key,
          file_name: event.file_name,
          description: event.description,
          triggered_by: { handle: event.triggered_by?.handle },
          created_components: created,
          modified_components: modified,
          deleted_components: deleted,
        },
      }),
    });

    if (!res.ok) return new Response(`GitHub dispatch failed: ${res.status} ${await res.text()}`, { status: 502 });
    return new Response('dispatched');
  },
};
