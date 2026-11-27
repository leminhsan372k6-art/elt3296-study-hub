import { createAppState } from './core/state.js?v=11';
import { scrollTopInstant } from './core/dom.js';
import { snapshotCompletions, notifyNewCompletions } from './core/progress.js?v=11';
import { TOPICS, ORDERED_TOPIC_IDS } from '../data/book/chapters-data.js';
import { renderTopBar, renderBookSidebar, renderSearchModal, renderVaultModal } from './ui/shell.js?v=11';
import { renderEbookView, bindEbookView, stepBookPage, clearAutoReadTimer } from './ui/ebook-view.js?v=11';
import { renderMcqView, bindMcqView, startMcqForChapter, startMcqForTopic, jumpToMcqById, openSavedMcqExam } from './ui/mcq-view.js?v=11';
import { renderCodeView, bindCodeView } from './ui/code-view.js?v=11';
import { renderMockExamView, bindMockExamView, openSavedFullMockExam } from './ui/mock-exam-view.js?v=11';
import { renderExtrasView, bindExtrasView } from './ui/extras-view.js';

function isTypingTarget(el) {
  if (!el || !el.tagName) return false;
  const tag = el.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
}

function downloadTextFile(filename, content, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content || ''], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

async function boot() {
  let mcqBank = [];
  try {
    const res = await fetch('./data/mcq-bank-elt3296.json');
    if (res.ok) mcqBank = await res.json();
  } catch (err) {
    console.error('Failed to load MCQ bank:', err);
  }

  const {
    state,
    persist,
    saveCodeSnapshot,
    deleteCodeSnapshot,
    exportBackup,
    importBackup,
    hydrateFromIndexedDb,
  } = createAppState(ORDERED_TOPIC_IDS[0] || '1-1');

  if (!TOPICS[state.topicId]) state.topicId = ORDERED_TOPIC_IDS[0];
  document.documentElement.setAttribute('data-theme', state.theme);

  const root = document.getElementById('app');

  function renderMainContent() {
    if (state.activeTab === 'mcq') return renderMcqView(state, mcqBank);
    if (state.activeTab === 'code') return renderCodeView(state);
    if (state.activeTab === 'mock') return renderMockExamView(state);
    if (state.activeTab === 'extras') return renderExtrasView(state);
    return renderEbookView(state, mcqBank);
  }

  let lastCodeKey = `${state.activeTab}:${state.sebSelectedId}`;

  function render() {
    clearAutoReadTimer();
    // Capture pane scroll positions BEFORE re-rendering so F2 / Alt+A / Alt+E never jump to top!
    const nextCodeKey = `${state.activeTab}:${state.sebSelectedId}`;
    const keepPaneScroll = nextCodeKey === lastCodeKey && state.activeTab === 'code';
    const prevLeftScroll = keepPaneScroll ? (document.getElementById('paneLeftScroll')?.scrollTop ?? 0) : 0;
    const prevRightScroll = keepPaneScroll ? (document.querySelector('.code-scroll-body')?.scrollTop ?? 0) : 0;
    const prevEdScroll = keepPaneScroll ? (document.getElementById('codePracticeInput')?.scrollTop ?? 0) : 0;
    const prevSolScroll = keepPaneScroll ? (document.querySelector('.code-numbered')?.scrollTop ?? 0) : 0;
    lastCodeKey = nextCodeKey;

    root.innerHTML = `
      <div class="app-shell">
        ${renderTopBar(state, mcqBank)}
        <div class="workspace-body">
          ${renderBookSidebar(state, mcqBank)}
          <main class="main-stage">${renderMainContent()}</main>
        </div>
        ${renderSearchModal(state, mcqBank)}
        ${renderVaultModal(state, mcqBank)}
      </div>
    `;

    bindShellEvents();

    if (state.activeTab === 'book') {
      bindEbookView(
        state,
        mcqBank,
        persist,
        render,
        (chNum) => {
          startMcqForChapter(mcqBank, chNum);
          state.activeTab = 'mcq';
          persist();
          render();
          scrollTopInstant();
        },
        (topicId, chNum) => {
          startMcqForTopic(mcqBank, topicId, chNum);
          state.activeTab = 'mcq';
          persist();
          render();
          scrollTopInstant();
        }
      );
    } else if (state.activeTab === 'mcq') {
      bindMcqView(state, mcqBank, persist, render);
    } else if (state.activeTab === 'code') {
      bindCodeView(state, persist, render, { saveCodeSnapshot, deleteCodeSnapshot, mcqBank });
      if (keepPaneScroll) {
        const leftEl = document.getElementById('paneLeftScroll');
        if (leftEl) leftEl.scrollTop = prevLeftScroll;
        const rightEl = document.querySelector('.code-scroll-body');
        if (rightEl) rightEl.scrollTop = prevRightScroll;
        const edEl = document.getElementById('codePracticeInput');
        if (edEl) {
          edEl.scrollTop = prevEdScroll;
          const gut = document.getElementById('codeEditorGutter');
          if (gut) gut.scrollTop = prevEdScroll;
        }
        const solEl = document.querySelector('.code-numbered');
        if (solEl) solEl.scrollTop = prevSolScroll;
      }
    } else if (state.activeTab === 'mock') {
      bindMockExamView(state, mcqBank, persist, render);
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
        const beforeSnap = snapshotCompletions(state, mcqBank);
        if (state.activeTab === 'book' && state.bookSubKind === 'topic' && state.topicId && state.topicId !== b.dataset.pickTopic) {
          state.readTopicIds.add(state.topicId);
        }
        state.topicId = b.dataset.pickTopic;
        state.bookSubKind = 'topic';
        state.companionStep = 0;
        state.activeTab = 'book';
        persist();
        render();
        notifyNewCompletions(state, mcqBank, beforeSnap);
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

    // Global Search Modal
    document.getElementById('btnOpenSearch')?.addEventListener('click', () => {
      state.vaultOpen = false;
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

    // Saved Work Vault Modal (Zero Account)
    document.getElementById('btnOpenVault')?.addEventListener('click', () => {
      state.searchOpen = false;
      state.vaultOpen = true;
      render();
    });

    document.getElementById('btnCloseVault')?.addEventListener('click', () => {
      state.vaultOpen = false;
      render();
    });

    document.getElementById('vaultModalBackdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'vaultModalBackdrop') {
        state.vaultOpen = false;
        render();
      }
    });

    document.querySelectorAll('[data-vault-tab]').forEach((b) => {
      b.addEventListener('click', () => {
        state.vaultTab = b.dataset.vaultTab === 'mcq' ? 'mcq' : 'code';
        render();
      });
    });

    document.querySelectorAll('[data-vault-open-cr]').forEach((b) => {
      b.addEventListener('click', () => {
        const id = b.dataset.vaultOpenCr;
        state.vaultOpen = false;
        state.sebSelectedId = id;
        state.sebPartFilter = 'all';
        state.sebDiffFilter = 'all';
        state.sebMode = 'practice';
        state.sebBottomTab = 'history';
        state.sebGradeCollapsed = false;
        state.activeTab = 'code';
        persist();
        render();
        scrollTopInstant();
      });
    });

    document.querySelectorAll('[data-vault-dl-cr]').forEach((b) => {
      b.addEventListener('click', () => {
        const id = b.dataset.vaultDlCr;
        const latest = state.codeSubmissions?.[id]?.[0]?.code || state.codeDrafts?.[id] || '';
        downloadTextFile(`${id.toLowerCase()}.c`, latest);
      });
    });

    document.querySelectorAll('[data-vault-open-exam]').forEach((b) => {
      b.addEventListener('click', () => {
        const rec = (state.mcqExamHistory || []).find((x) => x.id === b.dataset.vaultOpenExam);
        if (rec) {
          state.vaultOpen = false;
          state.activeTab = 'mcq';
          openSavedMcqExam(rec);
          persist();
          render();
          scrollTopInstant();
        }
      });
    });

    document.querySelectorAll('[data-vault-open-fullmock]').forEach((b) => {
      b.addEventListener('click', () => {
        const rec = (state.mockExamHistory || []).find((x) => x.id === b.dataset.vaultOpenFullmock);
        if (rec) {
          state.vaultOpen = false;
          state.activeTab = 'mock';
          openSavedFullMockExam(rec);
          persist();
          render();
          scrollTopInstant();
        }
      });
    });

    document.getElementById('btnExportBackup')?.addEventListener('click', () => {
      const today = new Date().toISOString().slice(0, 10);
      downloadTextFile(`elt3296-bai-lam-${today}.json`, exportBackup(), 'application/json;charset=utf-8');
      const msg = document.getElementById('vaultBackupMsg');
      if (msg) msg.textContent = '✓ Đã tải xuống tệp sao lưu toàn bộ bài làm (.json)!';
    });

    document.getElementById('btnImportBackup')?.addEventListener('click', () => {
      document.getElementById('inputImportBackup')?.click();
    });

    document.getElementById('inputImportBackup')?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        importBackup(text);
        document.documentElement.setAttribute('data-theme', state.theme);
        render();
        const msg = document.getElementById('vaultBackupMsg');
        if (msg) msg.textContent = '✓ Đã khôi phục thành công toàn bộ bài làm từ tệp sao lưu!';
      } catch (err) {
        const msg = document.getElementById('vaultBackupMsg');
        if (msg) msg.textContent = `⚠ Lỗi khôi phục: ${err?.message || 'Tệp JSON không hợp lệ'}`;
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    // Ctrl + K global search
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      state.vaultOpen = false;
      state.searchOpen = !state.searchOpen;
      render();
      return;
    }

    if (e.key === 'Escape' && (state.searchOpen || state.vaultOpen)) {
      state.searchOpen = false;
      state.vaultOpen = false;
      render();
      return;
    }

    // Alt + A or F2: Instant flip between Practice (blank editor) and Solution in right pane
    // Alt + E: Instant flip between Problem statement and 5-Layer Code Explanation in left pane
    if (state.activeTab === 'code' && !state.searchOpen && !state.vaultOpen) {
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

    if (e.altKey || e.ctrlKey || e.metaKey || isTypingTarget(e.target) || state.searchOpen || state.vaultOpen) return;

    // ArrowLeft / ArrowRight to turn e-book pages
    if (state.activeTab === 'book') {
      if (e.key === 'ArrowRight' && stepBookPage(state, 1, mcqBank)) {
        e.preventDefault();
        persist();
        render();
        scrollTopInstant();
      } else if (e.key === 'ArrowLeft' && stepBookPage(state, -1, mcqBank)) {
        e.preventDefault();
        persist();
        render();
        scrollTopInstant();
      }
    }
  });

  render();

  // Async mirror recovery from IndexedDB (if localStorage was cleared or older)
  const recovered = await hydrateFromIndexedDb();
  if (recovered) {
    if (!TOPICS[state.topicId]) state.topicId = ORDERED_TOPIC_IDS[0];
    document.documentElement.setAttribute('data-theme', state.theme);
    render();
  }
}

boot();
