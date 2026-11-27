import { esc } from '../core/dom.js';
import { formatSavedTime } from '../core/storage.js';
import { CHAPTERS } from '../../data/book/chapters-data.js';
import { OFFICIAL_SEB_50 } from '../../data/code-50/index.js';

function countSavedWork(state) {
  const codeIds = new Set([
    ...Object.keys(state.codeSubmissions || {}).filter((id) => (state.codeSubmissions[id] || []).length > 0),
    ...Object.keys(state.codeDrafts || {}).filter((id) => String(state.codeDrafts[id] || '').trim().length > 0),
  ]);
  const totalSnaps = Object.values(state.codeSubmissions || {}).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0);
  const examCount = Array.isArray(state.mcqExamHistory) ? state.mcqExamHistory.length : 0;
  return { codeCount: codeIds.size, totalSnaps, examCount, totalBadge: codeIds.size + examCount };
}

export function renderTopBar(state, mcqCount) {
  const wrongCount = state.wrongMcqIds.size;
  const solvedCount = state.solvedCodeIds.size;
  const savedStats = countSavedWork(state);

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
        <button type="button" class="btn sm ghost" id="btnOpenVault" title="Xem tất cả bài làm đã lưu trên máy & Sao lưu/Khôi phục không cần tài khoản">
          💾 Đã lưu${savedStats.totalBadge ? ` <span class="tab-badge is-new">${savedStats.totalBadge}</span>` : ''}
        </button>

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

export function renderVaultModal(state, mcqBank) {
  if (!state.vaultOpen) return '';
  const stats = countSavedWork(state);
  const codeRows = OFFICIAL_SEB_50.map((q) => {
    const snaps = Array.isArray(state.codeSubmissions?.[q.id]) ? state.codeSubmissions[q.id] : [];
    const draft = String(state.codeDrafts?.[q.id] || '');
    if (snaps.length === 0 && !draft.trim()) return null;
    const latest = snaps[0] || null;
    const score = state.sebScores?.[q.id];
    const latestCode = latest?.code || draft;
    const lineCnt = latestCode.trimEnd().split('\n').length;
    return { q, snaps, latest, draft, score, lineCnt };
  }).filter(Boolean);

  const exams = Array.isArray(state.mcqExamHistory) ? state.mcqExamHistory : [];
  const activeTab = state.vaultTab === 'mcq' ? 'mcq' : 'code';

  return `
    <div class="modal-backdrop" id="vaultModalBackdrop">
      <div class="modal-card vault-modal-card" role="dialog" aria-label="Kho bài làm đã lưu">
        <div class="vault-head">
          <div>
            <div style="font-size:16px;font-weight:750;color:var(--fg)">💾 Kho Bài Làm Đã Lưu (Không Cần Tài Khoản)</div>
            <div style="font-size:12.4px;color:var(--mut);margin-top:2px">
              Tự động lưu kép trên trình duyệt (<code>localStorage</code> + <code>IndexedDB</code>) — đóng tab, tắt máy hay F5 đều giữ nguyên bài làm.
            </div>
          </div>
          <button type="button" class="btn sm ghost" id="btnCloseVault">Đóng · Esc</button>
        </div>

        <div class="vault-stats-grid">
          <div class="vault-stat">
            <div class="vault-stat-val">${stats.codeCount} / 50</div>
            <div class="vault-stat-lbl">Câu Tự luận đã làm</div>
          </div>
          <div class="vault-stat">
            <div class="vault-stat-val">${stats.totalSnaps}</div>
            <div class="vault-stat-lbl">Bản nộp Code đã lưu</div>
          </div>
          <div class="vault-stat">
            <div class="vault-stat-val">${state.mcqMasteredIds.size} / ${mcqBank.length}</div>
            <div class="vault-stat-lbl">Trắc nghiệm đã vững · ${exams.length} đề thi</div>
          </div>
        </div>

        <div class="vault-tabs">
          <button type="button" class="btn sm ${activeTab === 'code' ? 'active' : ''}" data-vault-tab="code">
            💻 Bài Code đã lưu (${codeRows.length})
          </button>
          <button type="button" class="btn sm ${activeTab === 'mcq' ? 'active' : ''}" data-vault-tab="mcq">
            📝 Lịch sử Thi thử 20 câu (${exams.length})
          </button>
        </div>

        <div class="vault-list">
          ${
            activeTab === 'code'
              ? codeRows.length
                ? codeRows
                    .map(({ q, snaps, latest, score, lineCnt }) => {
                      const badge = latest
                        ? latest.statusLabel
                        : score
                          ? `Điểm ${Number(score.score10).toFixed(1)}/10`
                          : '✍ Bản nháp tự lưu';
                      const timeStr = latest ? formatSavedTime(latest.savedAt) : 'Tự lưu nháp';
                      return `
                        <div class="vault-item">
                          <div style="min-width:0;flex:1">
                            <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap">
                              <span class="mono" style="font-size:11.6px;font-weight:700;padding:1px 7px;border-radius:6px;background:var(--fg);color:var(--surface)">${esc(q.id)}</span>
                              <strong style="font-size:13.6px;color:var(--fg)">${esc(q.title)}</strong>
                            </div>
                            <div style="font-size:12px;color:var(--mut);margin-top:3px">
                              ${esc(badge)} · ${snaps.length} bản lưu · ${lineCnt} dòng · ${esc(timeStr)}
                            </div>
                          </div>
                          <div style="display:flex;gap:6px;flex-shrink:0">
                            <button type="button" class="btn sm" data-vault-dl-cr="${esc(q.id)}" title="Tải mã nguồn .c về máy">⬇ .c</button>
                            <button type="button" class="btn sm primary" data-vault-open-cr="${esc(q.id)}">Mở bài →</button>
                          </div>
                        </div>`;
                    })
                    .join('')
                : `<div class="vault-empty">Chưa có bài Code nào được lưu. Khi bạn gõ code hoặc bấm <b>💾 Lưu bài</b> / <b>▶ Biên dịch &amp; Chấm Test ẩn</b>, bài làm sẽ tự động lưu tại đây!</div>`
              : exams.length
                ? exams
                    .map(
                      (ex) => `
                        <div class="vault-item">
                          <div style="min-width:0;flex:1">
                            <div style="font-size:13.8px;font-weight:700;color:var(--fg)">
                              Đề Thi thử 20 câu · Đúng ${ex.correct}/${ex.total} (${Number(ex.score10).toFixed(1)}/10 · ${Number(ex.score4).toFixed(2)}/4.0)
                            </div>
                            <div style="font-size:12px;color:var(--mut);margin-top:3px">
                              Nộp lúc ${esc(formatSavedTime(ex.submittedAt))} · Thời gian làm: ${Math.floor((ex.elapsedSec || 0) / 60)}p ${String((ex.elapsedSec || 0) % 60).padStart(2, '0')}s
                            </div>
                          </div>
                          <button type="button" class="btn sm primary" data-vault-open-exam="${esc(ex.id)}">Xem lại bài →</button>
                        </div>`
                    )
                    .join('')
                : `<div class="vault-empty">Chưa có lượt Thi thử 20 câu nào được nộp. Hãy vào tab <b>Trắc nghiệm → Thi thử Đề thật (20 câu)</b> để làm thử và lưu điểm!</div>`
          }
        </div>

        <div class="vault-foot">
          <div style="font-size:12px;color:var(--mut)" id="vaultBackupMsg">
            Muốn chuyển bài làm sang máy tính khác? Xuất 1 file sao lưu <code>.json</code> rồi nhập lại trên máy mới.
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button type="button" class="btn sm" id="btnExportBackup">⬇ Xuất sao lưu (.json)</button>
            <button type="button" class="btn sm" id="btnImportBackup">⬆ Khôi phục (.json)</button>
            <input type="file" id="inputImportBackup" accept="application/json,.json" style="display:none" />
          </div>
        </div>
      </div>
    </div>
  `;
}
