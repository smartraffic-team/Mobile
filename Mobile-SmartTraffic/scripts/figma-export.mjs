#!/usr/bin/env node
/**
 * Exporta telas do Figma (PNG + JSON simplificado) para o Copilot ler no workspace.
 * Não usa MCP: só a API REST do Figma.
 *
 * Uso (na raiz do projeto, Node 20.6+):
 *   node --env-file=.env scripts/figma-export.mjs list   <URL-ou-FILE_KEY>
 *   node --env-file=.env scripts/figma-export.mjs export <URL-ou-FILE_KEY> <id|url> [<id|url> ...]
 *
 * O token fica em .env (FIGMA_TOKEN=...), que NUNCA entra no Git.
 * Saída: docs/figma/<id>-<nome-da-tela>.json e .png (@2x)
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const API = 'https://api.figma.com/v1';
const OUT_DIR = path.resolve('docs/figma');
const CHUNK = 10; // nós por requisição
const FRAME_TYPES = new Set(['FRAME', 'COMPONENT', 'COMPONENT_SET']);
const LEAF_TYPES = new Set(['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'LINE', 'REGULAR_POLYGON']);

const USAGE = `Uso:
  node --env-file=.env scripts/figma-export.mjs list   <URL-ou-FILE_KEY>
  node --env-file=.env scripts/figma-export.mjs export <URL-ou-FILE_KEY> <id|url> [<id|url> ...]`;

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

/* ---------- utilitários ---------- */

export const parseFileKey = (input) =>
  input.match(/figma\.com\/(?:design|file|board)\/([A-Za-z0-9]+)/)?.[1] ?? input;

/** Aceita "12-34", "12:34" ou uma URL com node-id=12-34 e devolve "12:34". */
export const normalizeId = (input) => {
  const fromUrl = input.match(/node-id=([^&#]+)/)?.[1];
  return decodeURIComponent(fromUrl ?? input).replace(/-/g, ':');
};

const slug = (text) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const to2 = (v) => Math.round(v * 255).toString(16).padStart(2, '0');

const hex = (c, opacity = 1) => {
  const a = +((c.a ?? 1) * opacity).toFixed(2);
  return `#${to2(c.r)}${to2(c.g)}${to2(c.b)}`.toUpperCase() + (a < 1 ? ` @${a}` : '');
};

const paint = (p) => {
  if (p.visible === false) return undefined;
  if (p.type === 'SOLID') return hex(p.color, p.opacity ?? 1);
  if (p.type.startsWith('GRADIENT')) {
    return {
      gradient: p.type,
      stops: p.gradientStops.map((s) => `${hex(s.color)} ${Math.round(s.position * 100)}%`),
    };
  }
  return p.type; // IMAGE etc.
};

/** Remove campos vazios do JSON final. */
const clean = (_key, value) =>
  value === undefined || value === null || (Array.isArray(value) && value.length === 0)
    ? undefined
    : value;

/* ---------- reduz o nó do Figma ao que importa para implementar ---------- */

export function simplify(n) {
  const out = { id: n.id, name: n.name, type: n.type };
  if (n.visible === false) out.hidden = true;

  if (n.absoluteBoundingBox) {
    out.size = [Math.round(n.absoluteBoundingBox.width), Math.round(n.absoluteBoundingBox.height)];
  }

  if (n.layoutMode && n.layoutMode !== 'NONE') {
    const padding = [n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft].map((v) => v ?? 0);
    out.layout = {
      direction: n.layoutMode === 'HORIZONTAL' ? 'row' : 'column',
      gap: n.itemSpacing ?? 0,
      padding: padding.some(Boolean) ? padding : undefined, // [top, right, bottom, left]
      mainAlign: n.primaryAxisAlignItems,
      crossAlign: n.counterAxisAlignItems,
      wrap: n.layoutWrap === 'WRAP' || undefined,
    };
  }
  if (n.layoutSizingHorizontal || n.layoutSizingVertical) {
    out.sizing = { h: n.layoutSizingHorizontal, v: n.layoutSizingVertical };
  }
  if (n.layoutPositioning === 'ABSOLUTE') out.absolute = true;

  out.fills = n.fills?.map(paint).filter(Boolean);
  out.strokes = n.strokes?.map(paint).filter(Boolean);
  if (out.strokes?.length) out.strokeWidth = n.strokeWeight;
  out.radius = n.rectangleCornerRadii ?? n.cornerRadius;
  if (n.opacity !== undefined && n.opacity < 1) out.opacity = +n.opacity.toFixed(2);
  out.effects = n.effects
    ?.filter((e) => e.visible !== false)
    .map((e) => ({
      type: e.type,
      radius: e.radius,
      offset: e.offset && [e.offset.x, e.offset.y],
      color: e.color && hex(e.color),
    }));

  if (n.type === 'TEXT') {
    const s = n.style ?? {};
    out.text = n.characters;
    out.font = {
      family: s.fontFamily,
      weight: s.fontWeight,
      size: s.fontSize,
      lineHeight: s.lineHeightPx && Math.round(s.lineHeightPx),
      letterSpacing: s.letterSpacing && +s.letterSpacing.toFixed(2),
      align: s.textAlignHorizontal,
    };
  }

  if (n.type === 'INSTANCE') {
    out.componentId = n.componentId;
    if (n.componentProperties) {
      out.properties = Object.fromEntries(
        Object.entries(n.componentProperties).map(([k, v]) => [k, v.value]),
      );
    }
  }

  if (n.children && !LEAF_TYPES.has(n.type)) out.children = n.children.map(simplify);
  return out;
}

/* ---------- API do Figma ---------- */

async function api(endpoint) {
  const res = await fetch(`${API}${endpoint}`, {
    headers: { 'X-Figma-Token': process.env.FIGMA_TOKEN },
  });
  if (res.status === 429) {
    fail(`Limite de requisições do Figma atingido. Aguarde ${res.headers.get('retry-after') ?? 'alguns'} s e tente de novo.`);
  }
  if (res.status === 403) {
    fail('Acesso negado (403): token inválido, sem escopo de leitura de arquivos ou sem acesso a este arquivo.');
  }
  if (res.status === 404) fail('Arquivo ou nó não encontrado (404). Confira o FILE_KEY e os IDs.');
  if (!res.ok) fail(`Erro ${res.status} da API do Figma: ${await res.text()}`);
  return res.json();
}

/** Lista os frames do arquivo (ID, tipo, caminho) para preencher o docs/screens.md. */
async function list(key) {
  const { document } = await api(`/files/${key}?depth=3`);
  const rows = [];
  const walk = (node, trail) => {
    for (const child of node.children ?? []) {
      if (FRAME_TYPES.has(child.type)) rows.push([child.id, child.type, [...trail, child.name].join(' / ')]);
      else if (child.type === 'SECTION' || child.type === 'CANVAS') walk(child, [...trail, child.name]);
    }
  };
  walk(document, []);
  console.log('ID\tTIPO\tCAMINHO');
  console.log(rows.map((r) => r.join('\t')).join('\n'));
  console.log(`\n${rows.length} frames encontrados.`);
}

/** Baixa o PNG (@2x) e o JSON simplificado de cada nó. */
async function exportNodes(key, rawIds) {
  const ids = rawIds.map(normalizeId);
  await mkdir(OUT_DIR, { recursive: true });

  for (let i = 0; i < ids.length; i += CHUNK) {
    const batch = ids.slice(i, i + CHUNK);
    const query = encodeURIComponent(batch.join(','));
    const [{ nodes }, { images }] = await Promise.all([
      api(`/files/${key}/nodes?ids=${query}`),
      api(`/images/${key}?ids=${query}&format=png&scale=2`),
    ]);

    for (const id of batch) {
      const doc = nodes[id]?.document;
      if (!doc) {
        console.warn(`! ${id}: nó não encontrado, pulando`);
        continue;
      }
      const base = `${id.replace(/:/g, '-')}-${slug(doc.name)}`;
      await writeFile(path.join(OUT_DIR, `${base}.json`), JSON.stringify(simplify(doc), clean, 2));
      if (images[id]) {
        const png = await fetch(images[id]);
        await writeFile(path.join(OUT_DIR, `${base}.png`), Buffer.from(await png.arrayBuffer()));
      }
      console.log(`✔ ${id}  ${doc.name}`);
    }
  }
  console.log(`\nSalvo em ${path.relative(process.cwd(), OUT_DIR)}`);
}

/* ---------- entrada ---------- */

async function main() {
  const [command, fileArg, ...rest] = process.argv.slice(2);
  if (!process.env.FIGMA_TOKEN) {
    fail('FIGMA_TOKEN não definido. Crie um arquivo .env (fora do Git) com FIGMA_TOKEN=seu_token e rode com --env-file=.env.');
  }
  if (!['list', 'export'].includes(command) || !fileArg) fail(USAGE);

  const key = parseFileKey(fileArg);
  if (command === 'list') return list(key);
  if (!rest.length) fail('Informe ao menos um ID de nó ou uma URL com node-id.');
  return exportNodes(key, rest);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
