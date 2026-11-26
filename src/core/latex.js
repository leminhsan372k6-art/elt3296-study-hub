import { esc } from './dom.js';

const SKIP_TAGS = new Set(['CODE', 'PRE', 'SCRIPT', 'STYLE', 'TEXTAREA', 'OPTION', 'SVG']);

function renderMathSegment(tex, displayMode) {
  if (typeof window !== 'undefined' && window.katex) {
    try {
      return window.katex.renderToString(tex.trim(), {
        displayMode,
        throwOnError: false,
        strict: false,
        output: 'html',
      });
    } catch {
      return esc(tex);
    }
  }
  return esc(tex);
}

export function renderLatexInElement(container) {
  if (!container || typeof document === 'undefined' || !window.katex) return;

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.includes('$')) return NodeFilter.FILTER_SKIP;
      let p = node.parentElement;
      while (p && p !== container) {
        if (SKIP_TAGS.has(p.tagName) || p.classList?.contains('katex')) {
          return NodeFilter.FILTER_REJECT;
        }
        p = p.parentElement;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes = [];
  let cur;
  while ((cur = walker.nextNode())) textNodes.push(cur);

  const mathRegex = /\$\$([\s\S]+?)\$\$|\$(?!\s)([^$\n]+?)(?<!\s)\$/g;

  for (const tNode of textNodes) {
    const raw = tNode.nodeValue;
    mathRegex.lastIndex = 0;
    if (!mathRegex.test(raw)) continue;

    mathRegex.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let lastIdx = 0;
    let match;

    while ((match = mathRegex.exec(raw)) !== null) {
      if (match.index > lastIdx) {
        frag.appendChild(document.createTextNode(raw.slice(lastIdx, match.index)));
      }
      const isDisplay = match[1] !== undefined;
      const expr = isDisplay ? match[1] : match[2];
      const holder = document.createElement(isDisplay ? 'div' : 'span');
      if (isDisplay) {
        holder.className = 'math-display-block';
        holder.innerHTML = renderMathSegment(expr, true);
      } else {
        const afterChar = raw[mathRegex.lastIndex] || '';
        if (/^[,.;:)!?]$/.test(afterChar)) {
          holder.style.whiteSpace = 'nowrap';
          holder.innerHTML = renderMathSegment(expr, false) + esc(afterChar);
          mathRegex.lastIndex += 1;
        } else {
          holder.innerHTML = renderMathSegment(expr, false);
        }
      }
      frag.appendChild(holder);
      lastIdx = mathRegex.lastIndex;
    }

    if (lastIdx < raw.length) {
      frag.appendChild(document.createTextNode(raw.slice(lastIdx)));
    }
    tNode.parentNode?.replaceChild(frag, tNode);
  }
}

export function formatRichInline(str) {
  const s = String(str || '');
  const safeTags = [];
  const withPlaceholders = s.replace(/<\/?(?:b|i|code|sub|sup|br)\s*\/?>/gi, (tag) => {
    const idx = safeTags.length;
    safeTags.push(tag);
    return `\u0000TAG_${idx}\u0000`;
  });

  const codeParts = [];
  const noTicks = withPlaceholders.replace(/`([^`\n]+?)`/g, (_, inner) => {
    const idx = codeParts.length;
    codeParts.push(`<code>${esc(inner)}</code>`);
    return `\u0000CODE_${idx}\u0000`;
  });

  return esc(noTicks)
    .replace(/\u0000CODE_(\d+)\u0000/g, (_, idx) => codeParts[Number(idx)])
    .replace(/\u0000TAG_(\d+)\u0000/g, (_, idx) => safeTags[Number(idx)]);
}
