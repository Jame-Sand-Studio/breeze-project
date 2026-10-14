#!/usr/bin/env node
/**
 * Turns a Figma LIBRARY_PUBLISH event into a change bundle for the sync agent.
 *
 * Input (env):
 *   FIGMA_ACCESS_TOKEN  – PAT with file_content:read + library_content:read
 *   FIGMA_EVENT_PATH    – JSON file with { file_key, created_components, modified_components, deleted_components }
 *                          (the repository_dispatch client_payload), or
 *   FIGMA_FILE_KEY + FIGMA_NODE_IDS – manual run: comma-separated node ids to treat as modified
 *
 * Output (.figma-sync/):
 *   changes.json          – mapped + unmapped components, with node ids and the code files they map to
 *   nodes/<id>.json       – Figma node tree for each changed component (set)
 *   nodes/<id>.png        – 2x render of each changed component (set)
 *
 * Writes `has_changes=true|false` to $GITHUB_OUTPUT.
 */
import { appendFileSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const OUT = join(ROOT, '.figma-sync');
const API = 'https://api.figma.com/v1';
const token = process.env.FIGMA_ACCESS_TOKEN;
if (!token) throw new Error('FIGMA_ACCESS_TOKEN is not set');

const figma = async (path) => {
  const res = await fetch(`${API}${path}`, { headers: { 'X-Figma-Token': token } });
  if (!res.ok) throw new Error(`Figma ${path} → ${res.status} ${await res.text()}`);
  return res.json();
};

const setOutput = (key, value) => {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
};

// --- 1. Read the event -------------------------------------------------------
let event;
if (process.env.FIGMA_EVENT_PATH) {
  event = JSON.parse(readFileSync(process.env.FIGMA_EVENT_PATH, 'utf8'));
} else {
  event = {
    file_key: process.env.FIGMA_FILE_KEY,
    manual_node_ids: (process.env.FIGMA_NODE_IDS || '').split(',').map((s) => s.trim().replace('-', ':')).filter(Boolean),
  };
}
const fileKey = event.file_key;
if (!fileKey) throw new Error('No file_key in event');

// --- 2. Index the Code Connect templates (url comment → code file) ------------
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (name === 'node_modules' || name.startsWith('.')) return [];
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const templates = walk(join(ROOT, 'src'))
  .filter((p) => p.endsWith('.figma.ts'))
  .map((p) => {
    const src = readFileSync(p, 'utf8');
    const url = src.match(/^\/\/ url=(.+)$/m)?.[1] ?? '';
    const nodeId = new URL(url).searchParams.get('node-id')?.replace('-', ':');
    return {
      template: relative(ROOT, p),
      source: src.match(/^\/\/ source=(.+)$/m)?.[1],
      component: src.match(/^\/\/ component=(.+)$/m)?.[1],
      fileKey: url.match(/\/design\/([^/]+)/)?.[1],
      nodeId,
    };
  })
  .filter((t) => t.fileKey === fileKey && t.nodeId);

// --- 3. Resolve component keys → node ids → component set ids ----------------
// Variants are published individually, so a change to one variant must be matched
// to the template via its component set.
const { meta } = await figma(`/files/${fileKey}/components`);
const byKey = new Map(meta.components.map((c) => [c.key, c]));
const setOf = (nodeId) => {
  const c = meta.components.find((x) => x.node_id === nodeId);
  const frame = c?.containing_frame;
  return frame?.containingComponentSet?.nodeId ?? frame?.containingStateGroup?.nodeId ?? nodeId;
};

const resolve = (items = [], kind) =>
  items.map((item) => {
    const c = byKey.get(item.key);
    return { kind, name: item.name, key: item.key, nodeId: c?.node_id, setId: c ? setOf(c.node_id) : undefined };
  });

const changed = event.manual_node_ids
  ? event.manual_node_ids.map((id) => ({ kind: 'modified', name: id, nodeId: id, setId: setOf(id) }))
  : [
      ...resolve(event.created_components, 'created'),
      ...resolve(event.modified_components, 'modified'),
      ...resolve(event.deleted_components, 'deleted'),
    ];

// Group by component set so 60 changed Button variants become one Button update.
const groups = new Map();
for (const c of changed) {
  const id = c.setId ?? c.key;
  if (!groups.has(id)) groups.set(id, { setId: c.setId, kinds: new Set(), variants: [] });
  const g = groups.get(id);
  g.kinds.add(c.kind);
  g.variants.push(c.name);
}

const mapped = [];
const unmapped = [];
for (const g of groups.values()) {
  const t = templates.find((x) => setOf(x.nodeId) === g.setId || x.nodeId === g.setId);
  const entry = { setId: g.setId, kinds: [...g.kinds], variants: g.variants };
  if (t) mapped.push({ ...entry, ...t });
  else unmapped.push(entry);
}

// --- 4. Download node trees + renders for everything the agent should look at -
mkdirSync(join(OUT, 'nodes'), { recursive: true });
const liveIds = [...mapped, ...unmapped]
  .filter((g) => g.setId && !(g.kinds.length === 1 && g.kinds[0] === 'deleted'))
  .map((g) => g.setId);

if (liveIds.length) {
  const ids = liveIds.join(',');
  const nodes = await figma(`/files/${fileKey}/nodes?ids=${encodeURIComponent(ids)}`);
  const images = await figma(`/images/${fileKey}?ids=${encodeURIComponent(ids)}&format=png&scale=2`);
  for (const id of liveIds) {
    const safe = id.replace(':', '-');
    writeFileSync(join(OUT, 'nodes', `${safe}.json`), JSON.stringify(nodes.nodes[id], null, 2));
    const imgUrl = images.images[id];
    if (imgUrl) {
      const png = await fetch(imgUrl);
      writeFileSync(join(OUT, 'nodes', `${safe}.png`), Buffer.from(await png.arrayBuffer()));
    }
  }
}

const summary = { fileKey, fileName: event.file_name, triggeredBy: event.triggered_by?.handle, mapped, unmapped };
writeFileSync(join(OUT, 'changes.json'), JSON.stringify(summary, null, 2));

console.log(`Mapped: ${mapped.map((m) => m.component).join(', ') || 'none'}`);
console.log(`Unmapped: ${unmapped.length}`);
setOutput('has_changes', mapped.length + unmapped.length > 0 ? 'true' : 'false');
setOutput('components', mapped.map((m) => m.component).join(', ') || 'new components');
