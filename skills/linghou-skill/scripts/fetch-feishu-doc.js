// 在飞书文档页面的 MAIN world 中运行。
// 用法：lh exec --browser-id <browser-id> --tab-id <tab-id> \
//   --frame-url '*://*.feishu.cn/*' \
//   --script-file ./skills/linghou-skill/scripts/fetch-feishu-doc.js evaluate

const options = {
  mode: Number.isFinite(Number(params?.mode)) ? Number(params.mode) : 7,
  limit: Number.isFinite(Number(params?.limit)) ? Number(params.limit) : 239,
  concurrency: Number.isFinite(Number(params?.concurrency))
    ? Math.max(1, Math.min(10, Number(params.concurrency)))
    : 3,
  maxPages: Number.isFinite(Number(params?.maxPages))
    ? Math.max(1, Number(params.maxPages))
    : 200,
  includeContent: params?.includeContent !== false,
  cacheOnWindow: params?.cacheOnWindow !== false,
};

for (let index = 0; index < 100 && !window.DATA?.meta?.token; index += 1) {
  await new Promise(resolve => setTimeout(resolve, 100));
}

const token = window.DATA?.meta?.token;
if (!token) {
  throw new Error('当前页面没有可用的飞书文档 token');
}
if (window.DATA?.meta?.isPermitted === false) {
  throw new Error('当前飞书会话没有文档访问权限');
}

const jsSdkSession =
  window.__opendoc_state__?.authConfig?.jssdkSession ||
  window.__jssdkSession__ ||
  '';
const csrfToken =
  document.cookie.match(/(?:^|;\s*)_csrf_token=([^;]+)/)?.[1] || '';
const headers = {
  ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
  ...(jsSdkSession ? { 'JsSDK-Session': jsSdkSession } : {}),
};

async function fetchClientVars(cursor) {
  const query = new URLSearchParams({
    id: token,
    mode: String(options.mode),
    limit: String(options.limit),
  });
  if (cursor) query.set('cursor', cursor);

  const response = await fetch(`/space/api/docx/pages/client_vars?${query}`, {
    method: 'GET',
    credentials: 'include',
    headers,
  });
  const payload = await response.json();
  if (!response.ok || payload?.code !== 0) {
    const error = new Error(payload?.msg || `HTTP ${response.status}`);
    error.status = response.status;
    error.code = payload?.code;
    throw error;
  }
  return payload;
}

const blockMap = {};
const blockSequence = [];
const blockSequenceSet = new Set();
const cursorQueue = [];
const seenCursors = new Set();
const errors = [];
const skipBlocks = new Set();
let pageCount = 0;
let structureVersion;

function enqueueCursor(cursor) {
  if (cursor && !seenCursors.has(cursor) && !cursorQueue.includes(cursor)) {
    cursorQueue.push(cursor);
  }
}

function mergePage(payload) {
  const data = payload?.data || {};
  Object.assign(blockMap, data.block_map || {});
  structureVersion = data.structure_version ?? structureVersion;

  for (const blockId of data.block_sequence || []) {
    if (!blockSequenceSet.has(blockId)) {
      blockSequenceSet.add(blockId);
      blockSequence.push(blockId);
    }
  }
  for (const blockId of data.skip_blocks || []) skipBlocks.add(blockId);
  for (const cursor of data.next_cursors || []) enqueueCursor(cursor);
  if (!(data.next_cursors || []).length && data.has_more) {
    enqueueCursor(data.cursor);
  }
}

const firstPage = await fetchClientVars();
pageCount += 1;
mergePage(firstPage);

while (cursorQueue.length > 0 && pageCount < options.maxPages) {
  const cursors = cursorQueue.splice(0, options.concurrency).filter(cursor => {
    if (seenCursors.has(cursor)) return false;
    seenCursors.add(cursor);
    return true;
  });
  if (cursors.length === 0) continue;

  const pages = await Promise.all(
    cursors.map(async cursor => {
      try {
        return { cursor, payload: await fetchClientVars(cursor) };
      } catch (error) {
        return {
          cursor,
          error: {
            message: error instanceof Error ? error.message : String(error),
            status: error?.status,
            code: error?.code,
          },
        };
      }
    }),
  );

  for (const page of pages) {
    pageCount += 1;
    if (page.error) errors.push(page.error);
    else mergePage(page.payload);
  }
}

function getBlockText(data) {
  const textMap = data?.text?.initialAttributedTexts?.text;
  if (!textMap || typeof textMap !== 'object') return '';
  return Object.keys(textMap)
    .sort((left, right) => Number(left) - Number(right))
    .map(key => (typeof textMap[key] === 'string' ? textMap[key] : ''))
    .join('')
    .trim();
}

const rootId =
  Object.keys(blockMap).find(blockId => blockMap[blockId]?.data?.type === 'page') ||
  token;
const visitedBlocks = new Set();
const contentLines = [];

function appendBlock(blockId) {
  if (!blockId || visitedBlocks.has(blockId)) return;
  visitedBlocks.add(blockId);

  const data = blockMap[blockId]?.data || {};
  const type = data.type || 'unknown';
  const text = getBlockText(data);

  if (text) {
    let prefix = '';
    if (/^heading[1-6]$/.test(type)) {
      prefix = `${'#'.repeat(Number(type.slice(7)))} `;
    } else if (type === 'bullet') {
      prefix = '- ';
    } else if (type === 'ordered') {
      prefix = '1. ';
    } else if (type === 'quote_container') {
      prefix = '> ';
    } else if (type === 'code') {
      contentLines.push(`\`\`\`\n${text}\n\`\`\``);
    }
    if (type !== 'code') contentLines.push(`${prefix}${text}`);
  } else if (type === 'image' && data.image?.name) {
    contentLines.push(`[图片: ${data.image.name}]`);
  } else if (type === 'file' && data.file?.name) {
    contentLines.push(`[文件: ${data.file.name}]`);
  }

  for (const childId of data.children || []) appendBlock(childId);
}

appendBlock(rootId);
const content = contentLines.join('\n\n');
const complete =
  cursorQueue.length === 0 &&
  errors.length === 0 &&
  skipBlocks.size === 0 &&
  pageCount < options.maxPages;

const rawResult = {
  token,
  structureVersion,
  blockMap,
  blockSequence,
};
if (options.cacheOnWindow) {
  window.__lhFeishuDocApiFull = rawResult;
  window.__lhFeishuDocText = content;
}

return {
  title: document.title.replace(/\s*-\s*飞书云文档\s*$/, ''),
  complete,
  pageCount,
  cursorCount: seenCursors.size,
  remainingCursorCount: cursorQueue.length,
  errorCount: errors.length,
  errors,
  skipBlockCount: skipBlocks.size,
  structureVersion,
  totalBlockCount: Object.keys(blockMap).length,
  visitedBlockCount: visitedBlocks.size,
  textLength: content.length,
  lineCount: contentLines.length,
  ...(options.includeContent ? { content } : {}),
};
