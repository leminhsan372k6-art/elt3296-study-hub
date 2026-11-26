import { createAppState } from './core/state.js?v=5';
import { scrollTopInstant } from './core/dom.js';
import { TOPICS, ORDERED_TOPIC_IDS } from '../data/book/chapters-data.js';
import { renderTopBar, renderBookSidebar, renderSearchModal } from './ui/shell.js';
import { renderEbookView, bindEbookView, stepBookPage } from './ui/ebook-view.js';
import { renderMcqView, bindMcqView, startMcqForChapter, jumpToMcqById } from './ui/mcq-view.js';
import { renderCodeView, bindCodeView } from './ui/code-view.js?v=5';
import { renderExtrasView, bindExtrasView } from './ui/extras-view.js';

function isTypingTarget(el) {
  if (!el || !el.tagName) return false;
  const tag = el.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
}

async function boot() {
  let mcqBank = [];
  try {
    const res = await fetch('./data/mcq-bank-elt3296.json');
    if (res.ok) mcqBank = await res.json();
  } catch (err) {
    console.error('Failed to load MCQ bank:', err);
  }

  const { state, persist } = createAppState(ORDERED_TOPIC_IDS[0] || '1-1');
  if (!TOPICS[state.topicId]) state.topicId = ORDERED_TOPIC_IDS[0];
  document.documentElement.setAttribute('data-theme', state.theme);

  const root = document.getElementById('app');

  function renderMainContent() {
    if (state.activeTab === 'mcq') return renderMcqView(state, mcqBank);
    if (state.activeTab === 'code') return renderCodeView(state);
    if (state.activeTab === 'extras') return renderExtrasView(state);
    return renderEbookView(state);
  }

  let lastCodeKey = `${state.activeTab}:${state.sebSelectedId}`;

  function render() {
    // Capture pane scroll positions BEFORE re-rendering so F2 / Alt+A / Alt+E never jump to top!
    const nextCodeKey = `${state.activeTab}:${state.sebSelectedId}`;
    const keepPaneScroll = nextCodeKey === lastCodeKey && state.activeTab === 'code';
    const prevLeftScroll = keepPaneScroll ? (document.getElementById('paneLeftScroll')?.scrollTop ?? 0) : 0;
    const prevRightScroll = keepPaneScroll ? (document.querySelector('.code-scroll-body')?.scrollTop ?? 0) : 0;
    const prevSolScroll = keepPaneScroll ? (document.querySelector('.code-numbered')?.scrollTop ?? 0) : 0;
    lastCodeKey = nextCodeKey;

    root.innerHTML = `
      <div class="app-shell">
        ${renderTopBar(state, mcqBank.length)}
        <div class="workspace-body">
          ${renderBookSidebar(state)}
          <main class="main-stage">${renderMainContent()}</main>
        </div>
        ${renderSearchModal(state, mcqBank)}
      </div>
    `;

    bindShellEvents();

    if (state.activeTab === 'book') {
      bindEbookView(state, persist, render, (chNum) => {
        startMcqForChapter(mcqBank, chNum);
        state.activeTab = 'mcq';
        persist();
        render();
        scrollTopInstant();
      });
    } else if (state.activeTab === 'mcq') {
      bindMcqView(state, mcqBank, persist, render);
    } else if (state.activeTab === 'code') {
      bindCodeView(state, persist, render);
      if (keepPaneScroll) {
        const leftEl = document.getElementById('paneLeftScroll');
        if (leftEl) leftEl.scrollTop = prevLeftScroll;
        const rightEl = document.querySelector('.code-scroll-body');
        if (rightEl) rightEl.scrollTop = prevRightScroll;
        const solEl = document.querySelector('.code-numbered');
        if (solEl) solEl.scrollTop = prevSolScroll;
      }
    } else if (state.activeTab === 'extras') {
      bindExtrasView(state, persist, render);
    }

    if (state.searchOpen) {
      const inp = document.getElementById('globalSearchInput');
      if (inp) {
        inp.focus();
        inp.setSelectionRange(inp.value.length, inp.value.length);
      }
    }
  }

  function bindShellEvents() {
    document.querySelectorAll('[data-switch-tab]').forEach((b) => {
      b.addEventListener('click', () => {
        state.activeTab = b.dataset.switchTab;
        persist();
        render();
        scrollTopInstant();
      });
    });

    document.getElementById('btnToggleSidebar')?.addEventListener('click', () => {
      state.sidebarOpen = !state.sidebarOpen;
      persist();
      render();
    });

    document.querySelectorAll('[data-pick-topic]').forEach((b) => {
      b.addEventListener('click', () => {
        state.topicId = b.dataset.pickTopic;
        state.bookSubKind = 'topic';
        state.companionStep = 0;
        state.activeTab = 'book';
        persist();
        render();
        scrollTopInstant();
      });
    });

    document.querySelectorAll('[data-pick-boss]').forEach((b) => {
      b.addEventListener('click', () => {
        state.bossId = b.dataset.pickBoss;
        state.bookSubKind = 'synthesis';
        state.companionStep = 0;
        state.activeTab = 'book';
        persist();
        render();
        scrollTopInstant();
      });
    });

    document.querySelectorAll('[data-finish]').forEach((d) => {
      d.addEventListener('click', () => {
        state.theme = d.dataset.finish;
        document.documentElement.setAttribute('data-theme', state.theme);
        persist();
        document.querySelectorAll('[data-finish]').forEach((x) => x.classList.toggle('active', x.dataset.finish === state.theme));
      });
    });

    document.getElementById('btnOpenSearch')?.addEventListener('click', () => {
      state.searchOpen = true;
      render();
    });

    document.getElementById('btnCloseSearch')?.addEventListener('click', () => {
      state.searchOpen = false;
      render();
    });

    document.getElementById('searchModalBackdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'searchModalBackdrop') {
        state.searchOpen = false;
        render();
      }
    });

    document.getElementById('globalSearchInput')?.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      render();
    });

    document.querySelectorAll('[data-search-kind]').forEach((row) => {
      row.addEventListener('click', () => {
        const kind = row.dataset.searchKind;
        const id = row.dataset.searchId;
        state.searchOpen = false;
        if (kind === 'topic') {
          state.topicId = id;
          state.bookSubKind = 'topic';
          state.activeTab = 'book';
        } else if (kind === 'code') {
          state.sebSelectedId = id;
          state.sebPartFilter = 'all';
          state.sebDiffFilter = 'all';
          state.activeTab = 'code';
        } else if (kind === 'mcq') {
          jumpToMcqById(mcqBank, id, row.dataset.searchCh);
          state.activeTab = 'mcq';
        }
        persist();
        render();
        scrollTopInstant();
      });
    });
  }

  window.addEventListener('keydown', (e) => {
    // Ctrl + K global search
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      state.searchOpen = !state.searchOpen;
      render();
      return;
    }

    if (e.key === 'Escape' && state.searchOpen) {
      state.searchOpen = false;
      render();
      return;
    }

    // Alt + A or F2: Instant flip between Practice (blank editor) and Solution in right pane
    // Alt + E: Instant flip between Problem statement and 4-Layer Code Explanation in left pane
    // Both work EVEN WHILE typing inside the code textarea!
    if (state.activeTab === 'code' && !state.searchOpen) {
      if ((e.altKey && e.key.toLowerCase() === 'a') || e.key === 'F2') {
        e.preventDefault();
        state.sebMode = state.sebMode === 'practice' ? 'solution' : 'practice';
        persist();
        render();
        return;
      }
      if (e.altKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        state.sebLeftView = state.sebLeftView === 'explain' ? 'problem' : 'explain';
        persist();
        render();
        return;
      }
    }

    if (e.altKey || e.ctrlKey || e.metaKey || isTypingTarget(e.target) || state.searchOpen) return;

    // ArrowLeft / ArrowRight to turn e-book pages
    if (state.activeTab === 'book') {
      if (e.key === 'ArrowRight' && stepBookPage(state, 1)) {
        e.preventDefault();
        persist();
        render();
        scrollTopInstant();
      } else if (e.key === 'ArrowLeft' && stepBookPage(state, -1)) {
        e.preventDefault();
        persist();
        render();
        scrollTopInstant();
      }
    }
  });

  render();

  // Re-render KaTeX once deferred katex.min.js finishes loading if it wasn't ready on first paint
  window.addEventListener('load', () => {
    if (window.katex) render();
  });
}

boot();
