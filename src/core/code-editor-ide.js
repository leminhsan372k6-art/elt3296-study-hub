// Lightweight Pure-JS IDE Behavior for <textarea> (Zero dependencies, 0 node_modules)
// Supports: real-time VS Code syntax highlighting overlay, active line highlight bar,
// synced line-number gutter, smart Enter auto-indent, auto-close brackets/quotes + skip-over,
// auto-outdent '}', Tab/Shift+Tab multi-line indent, smart Backspace, Ctrl+/ comment toggle, Ctrl+S & Ctrl+Z.
import { highlightCodeSnippet } from './dom.js?v=12';

const OPEN_TO_CLOSE = { '{': '}', '(': ')', '[': ']', '"': '"', "'": "'" };
const CLOSERS = new Set(['}', ')', ']', '"', "'"]);

function replaceRange(ed, start, end, text, selStart = start + text.length, selEnd = selStart) {
  ed.focus();
  ed.setSelectionRange(start, end);
  let ok = false;
  try {
    ok = document.execCommand('insertText', false, text);
  } catch {
    ok = false;
  }
  if (!ok) {
    ed.setRangeText(text, start, end, 'end');
  }
  ed.setSelectionRange(selStart, selEnd);
}

export function attachIdeEditor(ed, gutterEl, cursorEl, onChange, onRun, onSave) {
  if (!ed) return;

  const stageEl = ed.closest('.editor-stage');
  const hlCodeEl = stageEl?.querySelector('.editor-highlight-code') || null;
  const hlPreEl = stageEl?.querySelector('.editor-highlight-layer') || null;
  const activeLineBar = stageEl?.querySelector('.editor-active-line') || null;

  let lastLineCount = -1;
  let lastActiveLine = -1;
  let lastHighlightedValue = null;

  const syncScrollOnly = () => {
    if (gutterEl) gutterEl.scrollTop = ed.scrollTop;
    if (hlPreEl) {
      hlPreEl.scrollTop = ed.scrollTop;
      hlPreEl.scrollLeft = ed.scrollLeft;
    }
    if (activeLineBar && lastActiveLine >= 1) {
      const linePx = parseFloat(getComputedStyle(ed).lineHeight) || 22.275;
      activeLineBar.style.transform = `translateY(${Math.round((lastActiveLine - 1) * linePx - ed.scrollTop)}px)`;
    }
  };

  const syncGutterAndCursor = () => {
    const val = ed.value;
    const pos = ed.selectionStart || 0;
    const before = val.slice(0, pos);
    const activeLine = before.split('\n').length;
    const lastNl = before.lastIndexOf('\n');
    const col = pos - lastNl;

    if (cursorEl) cursorEl.textContent = `Dòng ${activeLine}, Cột ${col}`;

    if (hlCodeEl && val !== lastHighlightedValue) {
      // Append trailing newline+space so last empty line aligns 1:1 with textarea scrollHeight
      hlCodeEl.innerHTML = val ? `${highlightCodeSnippet(val)}\n ` : '';
      lastHighlightedValue = val;
    }

    if (gutterEl) {
      const lineCount = Math.max(val.split('\n').length, 1);
      if (lineCount !== lastLineCount || activeLine !== lastActiveLine) {
        let html = '';
        for (let i = 1; i <= lineCount; i++) {
          html += `<div class="eg-ln${i === activeLine ? ' is-active' : ''}">${i}</div>`;
        }
        gutterEl.innerHTML = html;
        lastLineCount = lineCount;
        lastActiveLine = activeLine;
      }
    } else {
      lastActiveLine = activeLine;
    }
    syncScrollOnly();
  };

  ed.addEventListener('scroll', syncScrollOnly);

  ed.addEventListener('input', () => {
    syncGutterAndCursor();
    onChange(ed.value);
  });

  ed.addEventListener('click', syncGutterAndCursor);
  ed.addEventListener('keyup', syncGutterAndCursor);

  ed.addEventListener('keydown', (e) => {
    if (e.isComposing) return;
    const val = ed.value;
    const s = ed.selectionStart;
    const end = ed.selectionEnd;

    // Ctrl + S -> Save explicit code snapshot (prevent browser Save Page dialog)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (onSave) onSave();
      return;
    }

    // Ctrl + Enter -> Compile & Run Hidden Tests
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (onRun) onRun();
      return;
    }

    // Ctrl + / -> Toggle // line comment (single or multi-line)
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      const lineStart = val.lastIndexOf('\n', s - 1) + 1;
      const lineEndIdx = val.indexOf('\n', end);
      const blockEnd = lineEndIdx === -1 ? val.length : lineEndIdx;
      const block = val.slice(lineStart, blockEnd);
      const lines = block.split('\n');
      const allCommented = lines.every((l) => /^\s*\/\//.test(l) || l.trim() === '');
      const nextLines = lines.map((l) => {
        if (l.trim() === '') return l;
        return allCommented ? l.replace(/^(\s*)\/\/\s?/, '$1') : l.replace(/^(\s*)/, '$1// ');
      });
      const joined = nextLines.join('\n');
      replaceRange(ed, lineStart, blockEnd, joined, lineStart, lineStart + joined.length);
      syncGutterAndCursor();
      onChange(ed.value);
      return;
    }

    // Tab / Shift + Tab -> Indent / Outdent (single line or multi-line selection)
    if (e.key === 'Tab') {
      e.preventDefault();
      if (s !== end && val.slice(s, end).includes('\n')) {
        const lineStart = val.lastIndexOf('\n', s - 1) + 1;
        const block = val.slice(lineStart, end);
        const lines = block.split('\n');
        const nextLines = e.shiftKey
          ? lines.map((l) => l.replace(/^ {1,4}/, ''))
          : lines.map((l) => '    ' + l);
        const joined = nextLines.join('\n');
        replaceRange(ed, lineStart, end, joined, lineStart, lineStart + joined.length);
      } else if (e.shiftKey) {
        const lineStart = val.lastIndexOf('\n', s - 1) + 1;
        const lineBefore = val.slice(lineStart, s);
        const m = lineBefore.match(/^ {1,4}/);
        if (m) {
          const cut = m[0].length;
          replaceRange(ed, lineStart, lineStart + cut, '', Math.max(lineStart, s - cut), Math.max(lineStart, end - cut));
        }
      } else {
        replaceRange(ed, s, end, '    ', s + 4, s + 4);
      }
      syncGutterAndCursor();
      onChange(ed.value);
      return;
    }

    // Enter -> Smart IDE Auto-Indent (including {|} expansion!)
    if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      const lineStart = val.lastIndexOf('\n', s - 1) + 1;
      const lineBefore = val.slice(lineStart, s);
      const indent = (lineBefore.match(/^[ \t]*/) || [''])[0];
      const prevNonSpace = lineBefore.trimEnd().slice(-1);
      const nextCh = val[end] || '';

      if (prevNonSpace === '{' && nextCh === '}') {
        const ins = `\n${indent}    \n${indent}`;
        replaceRange(ed, s, end, ins, s + indent.length + 5, s + indent.length + 5);
      } else if (prevNonSpace === '{' || (prevNonSpace === ':' && /^\s*(case\b|default\b)/.test(lineBefore))) {
        const ins = `\n${indent}    `;
        replaceRange(ed, s, end, ins, s + ins.length, s + ins.length);
      } else {
        const ins = `\n${indent}`;
        replaceRange(ed, s, end, ins, s + ins.length, s + ins.length);
      }
      syncGutterAndCursor();
      onChange(ed.value);
      return;
    }

    // Backspace -> Delete empty auto-closed pair OR unindent 4-space tab stop
    if (e.key === 'Backspace' && s === end && s > 0 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const prevCh = val[s - 1];
      const nextCh = val[s];
      if (OPEN_TO_CLOSE[prevCh] && OPEN_TO_CLOSE[prevCh] === nextCh) {
        e.preventDefault();
        replaceRange(ed, s - 1, s + 1, '', s - 1, s - 1);
        syncGutterAndCursor();
        onChange(ed.value);
        return;
      }
      const lineStart = val.lastIndexOf('\n', s - 1) + 1;
      const lineBefore = val.slice(lineStart, s);
      if (/^ +$/.test(lineBefore) && lineBefore.length >= 2) {
        e.preventDefault();
        const rem = lineBefore.length % 4 || 4;
        const del = Math.min(rem, lineBefore.length);
        replaceRange(ed, s - del, s, '', s - del, s - del);
        syncGutterAndCursor();
        onChange(ed.value);
        return;
      }
    }

    // Auto-outdent '}' when typed on an all-whitespace line, or skip-over existing closer
    if (!e.ctrlKey && !e.metaKey && !e.altKey && CLOSERS.has(e.key)) {
      if (s === end && val[s] === e.key) {
        e.preventDefault();
        ed.setSelectionRange(s + 1, s + 1);
        syncGutterAndCursor();
        return;
      }
      if (e.key === '}' && s === end) {
        const lineStart = val.lastIndexOf('\n', s - 1) + 1;
        const lineBefore = val.slice(lineStart, s);
        if (/^ {4,}$/.test(lineBefore)) {
          e.preventDefault();
          replaceRange(ed, s - 4, s, '}', s - 3, s - 3);
          syncGutterAndCursor();
          onChange(ed.value);
          return;
        }
      }
    }

    // Auto-close brackets & quotes ({}, (), [], "", '')
    if (!e.ctrlKey && !e.metaKey && !e.altKey && OPEN_TO_CLOSE[e.key]) {
      const closeCh = OPEN_TO_CLOSE[e.key];
      const isQuote = e.key === '"' || e.key === "'";
      const nextCh = val[end] || '';
      const prevCh = s > 0 ? val[s - 1] : '';

      if (s !== end) {
        // Wrap selected text in matching pair
        e.preventDefault();
        const selected = val.slice(s, end);
        replaceRange(ed, s, end, e.key + selected + closeCh, s + 1, end + 1);
        syncGutterAndCursor();
        onChange(ed.value);
        return;
      }

      const canAutoQuote = !isQuote || ((!nextCh || /[\s)\]},;]/.test(nextCh)) && !/[A-Za-z0-9_\\]/.test(prevCh));
      if (canAutoQuote) {
        e.preventDefault();
        replaceRange(ed, s, end, e.key + closeCh, s + 1, s + 1);
        syncGutterAndCursor();
        onChange(ed.value);
        return;
      }
    }
  });

  // Initial sync
  syncGutterAndCursor();
}
