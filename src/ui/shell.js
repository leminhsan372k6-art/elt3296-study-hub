import { esc } from '../core/dom.js';
import { CHAPTERS } from '../../data/book/chapters-data.js';
import { OFFICIAL_SEB_50 } from '../../data/code-50/index.js';

export function renderTopBar(state, mcqCount) {
  const wrongCount = state.wrongMcqIds.size;
  const solvedCount = state.solvedCodeIds.size;

  return `
    <header class="topbar">
      <div class="topbar-left">
        ${
          state.activeTab === 'book'
            ? `<button type="button" class="btn sm ghost" id="btnToggleSidebar" title="Ẩn/hiện Mục lục 7 Chương">☰ Mục lục</button>`
            : ''
        }
        <button type="button" class="brand-pill" data-switch-tab="book" title="Về trang đọc sách">
          <span class="brand-dot">C</span>
          <span>
            <div class="brand-title">ELT 3296 Studio</div>
            <div class="brand-sub">UET-VNU · LaTeX Edition</div>
          </span>
        </button>
      </div>

      <nav class="nav-tabs" aria-label="Điều hướng chính">
        <button type="button" class="nav-tab ${state.activeTab === 'book' ? 'active' : ''}" data-switch-tab="book">
          📖 Đọc sách
          <span class="tab-badge">7 Chương</span>
        </button>
        <button type="button" class="nav-tab ${state.activeTab === 'mcq' ? 'active' : ''}" data-switch-tab="mcq">
          📝 Trắc nghiệm
          <span class="tab-badge is-new">${mcqCount} câu${wrongCount ? ` · ${wrongCount} sai` : ''}</span>
        </button>
        <button type="button" class="nav-tab ${state.activeTab === 'code' ? 'active' : ''}" data-switch-tab="code">
          💻 50 Câu Tự luận
          <span class="tab-badge">${solvedCount}/50</span>
        </button>
        <button type="button" class="nav-tab ${state.activeTab === 'extras' ? 'active' : ''}" data-switch-tab="extras">
          ⚡ Phụ lục &amp; Lab
        </button>
      </nav>

      <div class="topbar-right">
        <button type="button" class="btn sm ghost" id="btnOpenSearch" title="Tìm kiếm nhanh bài học, câu code, câu trắc nghiệm (Ctrl + K)">
          🔍 Tìm <span class="kbd">Ctrl K</span>
        </button>

        <div class="finish-picker" role="group" aria-label="Chọn màu vỏ Titanium">
          <button type="button" class="finish-dot ${state.theme === 'white-titanium' ? 'active' : ''}" data-finish="white-titanium" style="background:#f5f4f0" title="White Titanium"></button>
          <button type="button" class="finish-dot ${state.theme === 'natural-titanium' ? 'active' : ''}" data-finish="natural-titanium" style="background:#d6d3cb" title="Natural Titanium"></button>
          <button type="button" class="finish-dot ${state.theme === 'desert-titanium' ? 'active' : ''}" data-finish="desert-titanium" style="background:#e3d2c1" title="Desert Titanium"></button>
          <button type="button" class="finish-dot ${state.theme === 'black-titanium' ? 'active' : ''}" data-finish="black-titanium" style="background:#1c1c1f" title="Black Titanium"></button>
        </div>
      </div>
    </header>
  `;
}

export function renderBookSidebar(state) {
  if (state.activeTab !== 'book') return '';

  return `
    <aside class="book-sidebar ${state.sidebarOpen ? '' : 'collapsed'}" aria-label="Mục lục 7 Chương">
      <div class="sb-section-title">Mục lục 7 Chương · 61 Bài học</div>
      ${CHAPTERS.map((ch) => {
        const isCurrentCh =
          (state.bookSubKind === 'topic' && ch.topics.some((t) => t.id === state.topicId)) ||
          (state.bookSubKind === 'synthesis' && ch.boss?.id === state.bossId);

        return `
          <details class="sb-chapter" ${isCurrentCh ? 'open' : ''}>
            <summary>
              <span>Ch.${esc(ch.id)} · ${esc(ch.title)}</span>
              <span style="font-size:11px;color:var(--mut)">${ch.topics.length}</span>
            </summary>
            <div class="sb-topic-list">
              ${ch.topics
                .map((t) => {
                  const active = state.bookSubKind === 'topic' && state.topicId === t.id;
                  const marked = state.bookmarked.has(t.id);
                  return `
                    <button type="button" class="sb-topic-btn ${active ? 'active' : ''}" data-pick-topic="${esc(t.id)}">
                      <span class="sb-topic-code">${esc(t.code)}</span>
                      <span style="flex:1">${esc(t.title)}</span>
                      ${marked ? `<span title="Đã đánh dấu nắm vững" style="color:var(--ink-ok)">✓</span>` : ''}
                    </button>
                  `;
                })
                .join('')}
              ${
                ch.boss
                  ? `<button type="button" class="sb-topic-btn ${state.bookSubKind === 'synthesis' && state.bossId === ch.boss.id ? 'active' : ''}" data-pick-boss="${esc(ch.boss.id)}">
                      <span class="sb-topic-code">★</span>
                      <span>Tổng hợp Chương ${esc(ch.id)}</span>
                    </button>`
                  : ''
              }
            </div>
          </details>
        `;
      }).join('')}
    </aside>
  `;
}

export function renderSearchModal(state, mcqBank) {
  if (!state.searchOpen) return '';
  const q = state.searchQuery.trim().toLowerCase();

  const results = [];
  for (const ch of CHAPTERS) {
    for (const t of ch.topics) {
      const hay = `${t.code} ${t.title} ${ch.title}`.toLowerCase();
      if (!q || hay.includes(q)) {
        results.push({ kind: 'topic', id: t.id, title: `📖 ${t.code} · ${t.title}`, sub: `Chương ${ch.id}: ${ch.title}` });
      }
    }
  }
  for (const item of OFFICIAL_SEB_50) {
    const hay = `${item.id} cau ${item.num} ${item.title} ${item.part} ${(item.graderSpec?.requiredApis || []).join(' ')}`.toLowerCase();
    if (!q || hay.includes(q)) {
      results.push({ kind: 'code', id: item.id, title: `💻 ${item.id} (${item.difficulty}) · ${item.title}`, sub: item.partLabel });
    }
  }
  if (q.length >= 2) {
    for (const m of mcqBank) {
      const hay = `${m.id} ${m.question} ${m.explain} ${m.source || ''}`.toLowerCase();
      if (hay.includes(q)) {
        results.push({ kind: 'mcq', id: m.id, chapter: m.chapter, title: `📝 ${m.id} · ${m.question.slice(0, 76)}…`, sub: `Trắc nghiệm Chương ${m.chapter} · ${m.source || ''}` });
      }
    }
  }

  const top = results.slice(0, 28);

  return `
    <div class="modal-backdrop" id="searchModalBackdrop">
      <div class="modal-card" role="dialog" aria-label="Tìm kiếm nhanh">
        <div class="search-input-wrap">
          <span>🔍</span>
          <input type="text" id="globalSearchInput" value="${esc(state.searchQuery)}" placeholder="Tìm bài học, lệnh C (mmap, fork, pipe, pthread...), câu CR-01..50, câu trắc nghiệm…" autocomplete="off" />
          <button type="button" class="btn sm ghost" id="btnCloseSearch">Esc</button>
        </div>
        <div class="search-results">
          ${
            top.length
              ? top
                  .map(
                    (r) => `
                <button type="button" class="search-row" data-search-kind="${esc(r.kind)}" data-search-id="${esc(r.id)}" data-search-ch="${esc(r.chapter || '')}">
                  <span class="search-row-title">${esc(r.title)}</span>
                  <span class="search-row-sub">${esc(r.sub)}</span>
                </button>`
                  )
                  .join('')
              : `<div style="padding:24px;text-align:center;color:var(--mut);font-family:var(--font-ui)">Không tìm thấy kết quả phù hợp.</div>`
          }
        </div>
      </div>
    </div>
  `;
}
