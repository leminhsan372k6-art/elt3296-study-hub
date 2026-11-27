import { esc, highlightCodeSnippet, scrollTopInstant } from '../core/dom.js';
import { renderLatexInElement, formatRichInline } from '../core/latex.js';
import { getTopicProgress, getAllChaptersProgress, snapshotCompletions, notifyNewCompletions } from '../core/progress.js?v=11';
import { CHAPTERS, TOPICS, ORDERED_TOPIC_IDS, BOSSES } from '../../data/book/chapters-data.js';
import { ALL_CODE_STEPS } from '../../data/book/code-steps-data.js';
import { TOPIC_TO_SEB_QUESTIONS } from '../../data/code-50/index.js?v=11';

let autoReadTimer = null;

export function clearAutoReadTimer() {
  if (autoReadTimer) {
    clearTimeout(autoReadTimer);
    autoReadTimer = null;
  }
}

export function stepBookPage(state, delta, mcqBank = []) {
  const beforeSnap = snapshotCompletions(state, mcqBank);
  if (state.bookSubKind === 'topic' && state.topicId) {
    state.readTopicIds.add(state.topicId);
  }

  let moved = false;
  if (state.bookSubKind === 'synthesis') {
    const boss = BOSSES[state.bossId] || Object.values(BOSSES)[0];
    const chIdx = CHAPTERS.findIndex((c) => String(c.id) === String(boss?.chapterId));
    if (delta < 0 && chIdx >= 0) {
      const chTopics = CHAPTERS[chIdx].topics || [];
      if (chTopics.length) {
        state.topicId = chTopics[chTopics.length - 1].id;
        state.bookSubKind = 'topic';
        state.companionStep = 0;
        moved = true;
      }
    } else if (delta > 0 && chIdx >= 0 && chIdx + 1 < CHAPTERS.length) {
      const nextTopics = CHAPTERS[chIdx + 1].topics || [];
      if (nextTopics.length) {
        state.topicId = nextTopics[0].id;
        state.bookSubKind = 'topic';
        state.companionStep = 0;
        moved = true;
      }
    }
  } else {
    const cur = TOPICS[state.topicId] || TOPICS[ORDERED_TOPIC_IDS[0]];
    if (cur) {
      if (delta > 0 && cur.nextTopicId) {
        state.topicId = cur.nextTopicId;
        state.companionStep = 0;
        moved = true;
      } else if (delta < 0 && cur.prevTopicId) {
        state.topicId = cur.prevTopicId;
        state.companionStep = 0;
        moved = true;
      }
    }
  }

  if (moved) notifyNewCompletions(state, mcqBank, beforeSnap);
  return moved;
}

function renderCodeCompanion(spec, stepIdx) {
  if (!spec || !spec.steps?.length) return '';
  const safeIdx = Math.max(0, Math.min(stepIdx, spec.steps.length - 1));
  const step = spec.steps[safeIdx];

  return `
    <aside class="companion-col" aria-label="Cửa sổ Code minh họa và giải thích từng bước">
      <div class="companion-head">
        <span>🧩 ${esc(spec.title || 'Code minh họa & Giải thích')}</span>
        <span style="color:var(--code-mut);font-size:11.6px">Bước ${safeIdx + 1} / ${spec.steps.length}</span>
      </div>

      <div class="companion-tabs">
        ${spec.steps
          .map(
            (_, i) => `<button type="button" class="companion-step-btn ${i === safeIdx ? 'active' : ''}" data-cstep="${i}">Bước ${i + 1}</button>`
          )
          .join('')}
      </div>

      <div class="companion-body">
        <div style="font-family:var(--font-ui);font-size:14.2px;font-weight:700;color:#fff;margin-bottom:4px">${esc(step.head)}</div>
        ${step.sub ? `<div style="font-family:var(--font-ui);font-size:12.8px;color:#b8c2d4;line-height:1.55">${esc(step.sub)}</div>` : ''}

        <pre class="companion-code"><code>${highlightCodeSnippet(step.code || '')}</code></pre>

        ${
          step.explain
            ? `<div style="font-family:var(--font-ui);font-size:13px;line-height:1.62;color:#dbe4f3;padding:11px 13px;border-radius:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08)">${esc(step.explain)}</div>`
            : ''
        }

        <div style="display:flex;justify-content:space-between;margin-top:12px">
          <button type="button" class="win-btn" data-cstep="${Math.max(0, safeIdx - 1)}" ${safeIdx === 0 ? 'disabled style="opacity:0.45"' : ''}>‹ Bước trước</button>
          <button type="button" class="win-btn" data-cstep="${Math.min(spec.steps.length - 1, safeIdx + 1)}" ${safeIdx === spec.steps.length - 1 ? 'disabled style="opacity:0.45"' : ''}>Bước tiếp ›</button>
        </div>
      </div>
    </aside>
  `;
}

export function renderEbookView(state, mcqBank = []) {
  const isSynth = state.bookSubKind === 'synthesis';
  const topic = TOPICS[state.topicId] || TOPICS[ORDERED_TOPIC_IDS[0]];
  const boss = BOSSES[state.bossId] || Object.values(BOSSES)[0];
  const spec = ALL_CODE_STEPS[isSynth ? boss?.id : topic?.id];
  const chStats = getAllChaptersProgress(state, mcqBank);
  const completedTopicCount = ORDERED_TOPIC_IDS.filter((id) => getTopicProgress(state, id, mcqBank).completed).length;

  const spreadClass =
    state.bookMode === 'book-only'
      ? 'mode-book-only'
      : state.codeSide === 'left'
        ? 'code-left'
        : '';

  const toolbar = `
    <div class="ebook-toolbar">
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <button type="button" class="btn sm ${state.bookMode === 'split' ? 'active' : ''}" data-bookmode="split">Sách + Code</button>
        <button type="button" class="btn sm ${state.bookMode === 'book-only' ? 'active' : ''}" data-bookmode="book-only">Chỉ trang sách</button>
        ${
          state.bookMode === 'split'
            ? `<button type="button" class="btn sm" id="btnFlipBookCode">⇄ Đổi Code sang ${state.codeSide === 'left' ? 'Phải' : 'Trái'}</button>`
            : ''
        }
      </div>
      <div style="font-family:var(--font-ui);font-size:12.4px;color:var(--mut)">
        Phím <span class="kbd">←</span> <span class="kbd">→</span> lật trang · Hoàn thành <b>${completedTopicCount}/${ORDERED_TOPIC_IDS.length}</b> mục · <b>${chStats.completedChapters}/7</b> chương
      </div>
    </div>
  `;

  if (isSynth && boss) {
    const chIdx = CHAPTERS.findIndex((c) => String(c.id) === String(boss.chapterId));
    const prevT = chIdx >= 0 ? CHAPTERS[chIdx].topics.slice(-1)[0] : null;
    const nextT = chIdx >= 0 && chIdx + 1 < CHAPTERS.length ? CHAPTERS[chIdx + 1].topics[0] : null;

    return `
      ${toolbar}
      <div class="ebook-spread ${spreadClass}">
        <article class="book-sheet" id="bookSheetEl">
          <div class="sheet-running-head">
            <span>Chương ${esc(boss.chapterId)} · Bài toán Tổng hợp cuối chương</span>
            <span>Slide ${esc(boss.slides || '')}</span>
          </div>
          <h1 class="sheet-title">${esc(boss.cleanTitle)}</h1>
          <p class="book-prose">${esc(boss.story)}</p>

          <div style="display:grid;gap:14px;margin-top:16px">
            ${(boss.stages || [])
              .map(
                (st) => `
              <div style="padding:16px 18px;border-radius:13px;border:1px solid var(--bd);background:var(--surface-sub)">
                <div style="font-family:var(--font-ui);font-size:12px;color:var(--mut);margin-bottom:3px">Phần ${esc(st.stage)}</div>
                <div style="font-weight:700;margin-bottom:6px">${esc(st.title)}</div>
                <div style="font-size:15.2px;line-height:1.62;margin-bottom:10px">${formatRichInline(st.prompt)}</div>
                ${
                  st.type === 'mcq' && Array.isArray(st.options)
                    ? `<div class="boss-q-block" style="display:grid;gap:7px">
                        ${st.options
                          .map(
                            (o, oi) => `<button type="button" class="mcq-opt boss-opt" data-ans="${st.answer}" data-pick="${oi}">${formatRichInline(o)}</button>`
                          )
                          .join('')}
                        <div class="mcq-explain boss-exp" style="display:none">${formatRichInline(st.explain)}</div>
                      </div>`
                    : `<details class="smart-drawer" style="margin:6px 0 0"><summary>Xem lời giải tham khảo</summary><div class="smart-drawer-body"><pre style="margin:0;background:var(--code-bg);color:var(--code-fg);padding:12px;border-radius:9px;overflow-x:auto;font-size:12.8px">${esc(
                        st.solution || st.explain || (st.items || []).join('\n')
                      )}</pre></div></details>`
                }
              </div>`
              )
              .join('')}
          </div>

          <footer class="sheet-footer">
            <div>${prevT ? `<button type="button" class="btn sm" data-pick-topic="${esc(prevT.id)}">‹ Mục ${esc(prevT.code)}</button>` : ''}</div>
            <span>Tổng hợp Chương ${esc(boss.chapterId)}</span>
            <div>${nextT ? `<button type="button" class="btn sm primary" data-pick-topic="${esc(nextT.id)}">Sang Chương ${esc(nextT.chapterId)} ›</button>` : `<button type="button" class="btn sm primary" data-switch-tab="code">Luyện 40 câu Tự luận ›</button>`}</div>
          </footer>
        </article>
        ${state.bookMode === 'split' ? renderCodeCompanion(spec, state.companionStep) : ''}
      </div>
    `;
  }

  const pageNum = ORDERED_TOPIC_IDS.indexOf(topic.id) + 1;
  const totalPages = ORDERED_TOPIC_IDS.length;
  const prevT = topic.prevTopicId ? TOPICS[topic.prevTopicId] : null;
  const nextT = topic.nextTopicId ? TOPICS[topic.nextTopicId] : null;
  const tp = getTopicProgress(state, topic.id, mcqBank);
  const sebLinked = TOPIC_TO_SEB_QUESTIONS[topic.id] || [];

  return `
    ${toolbar}
    <div class="ebook-spread ${spreadClass}">
      <article class="book-sheet" id="bookSheetEl">
        <div class="sheet-running-head">
          <span>Chương ${esc(topic.chapterId)} · ${esc(topic.chapterTitle)}</span>
          <div style="display:flex;align-items:center;gap:8px">
            <span>Trang ${pageNum} / ${totalPages}</span>
            <button type="button" class="btn sm ${tp.read ? 'active' : ''}" id="btnMarkReadTopic">
              ${tp.read ? '✓ Đã đọc lý thuyết' : 'Đánh dấu đã đọc'}
            </button>
          </div>
        </div>

        <h1 class="sheet-title">${tp.completed ? '<span class="tick-badge">✓</span> ' : ''}${esc(topic.code)}. ${esc(topic.title)}</h1>

        <!-- Automatic Topic Mastery Progress Bar -->
        <div class="topic-progress-bar ${tp.completed ? 'is-done' : ''}" id="topicProgressBar">
          <div class="tp-pills">
            <span class="tp-pill ${tp.read ? 'is-ok' : ''}">
              📖 Lý thuyết: ${tp.read ? '✓ Đã đọc' : 'Đang đọc…'}
            </span>
            <span class="tp-pill ${tp.mcqOk ? 'is-ok' : ''}">
              📝 Trắc nghiệm mục này: <b>${tp.mcqDone}/${tp.mcqTotal}</b>${tp.mcqTotal > 0 && tp.mcqOk ? ' ✓' : ''}
            </span>
            <span class="tp-pill ${tp.codeOk ? 'is-ok' : ''}">
              💻 Code mục này: <b>${tp.codeDone}/${tp.codeTotal}</b>${tp.codeTotal > 0 && tp.codeOk ? ' ✓' : ''}
            </span>
            ${tp.completed ? `<span style="color:var(--ink-ok);font-weight:750">✓ Hoàn thành mục ${esc(topic.code)}!</span>` : ''}
          </div>
          ${
            tp.mcqTotal > 0
              ? `<button type="button" class="btn sm accent" data-jump-mcq-topic="${esc(topic.id)}" data-jump-mcq-ch-num="${esc(topic.chapterId)}">
                  📝 Trắc nghiệm Mục ${esc(topic.code)} (${tp.mcqDone}/${tp.mcqTotal}) →
                </button>`
              : `<button type="button" class="btn sm" data-jump-mcq-ch="${esc(topic.chapterId)}">📝 Trắc nghiệm Chương ${esc(topic.chapterId)} →</button>`
          }
        </div>

        ${
          spec?.steps?.[0]?.sub
            ? `<div class="curiosity-lead"><b>Điểm cốt lõi:</b> ${esc(spec.steps[0].sub)}</div>`
            : ''
        }

        ${
          topic.terms?.length
            ? `<details class="smart-drawer">
                <summary>Thuật ngữ trọng tâm trên trang (${topic.terms.length})</summary>
                <div class="smart-drawer-body" style="display:grid;gap:9px">
                  ${topic.terms
                    .map(
                      (tm) => `<div>
                        <code style="font-weight:700">${esc(tm.term)}</code> — ${esc(tm.vi)}
                        ${tm.analogy ? `<div style="color:var(--mut);font-size:13.4px"><i>Hình dung:</i> ${esc(tm.analogy)}</div>` : ''}
                      </div>`
                    )
                    .join('')}
                </div>
              </details>`
            : ''
        }

        <div class="book-prose">${topic.lessonHtml}</div>

        <section class="exam-bridge-card">
          <div style="font-family:var(--font-ui);font-size:12.6px;font-weight:700;color:var(--accent-strong);text-transform:uppercase;letter-spacing:0.04em">
            Liên kết trực tiếp với Đề thi Cuối kỳ
          </div>
          <div class="chip-wrap">
            ${
              tp.mcqTotal > 0
                ? `<button type="button" class="link-chip" data-jump-mcq-topic="${esc(topic.id)}" data-jump-mcq-ch-num="${esc(topic.chapterId)}">
                    📝 Trắc nghiệm Mục ${esc(topic.code)} (${tp.mcqDone}/${tp.mcqTotal}) →
                  </button>`
                : ''
            }
            <button type="button" class="link-chip" data-jump-mcq-ch="${esc(topic.chapterId)}">
              📝 Toàn bộ Trắc nghiệm Chương ${esc(topic.chapterId)} →
            </button>
            ${sebLinked
              .map(
                (sq) => `<button type="button" class="link-chip" data-jump-code="${esc(sq.id)}">
                  💻 <b>${esc(sq.id)}</b> (${esc(sq.difficulty)}) · ${esc(sq.title)} →
                </button>`
              )
              .join('')}
          </div>
        </section>

        <footer class="sheet-footer">
          <div>${prevT ? `<button type="button" class="btn sm" data-pick-topic="${esc(prevT.id)}">‹ ${esc(prevT.code)}. ${esc(prevT.title.slice(0, 28))}</button>` : '<span>Đầu sách</span>'}</div>
          <span>Mục ${esc(topic.code)} · ${pageNum}/${totalPages}</span>
          <div>${nextT ? `<button type="button" class="btn sm primary" data-pick-topic="${esc(nextT.id)}">${esc(nextT.code)}. ${esc(nextT.title.slice(0, 28))} ›</button>` : `<button type="button" class="btn sm primary" data-switch-tab="code">Sang 40 Câu Tự luận ›</button>`}</div>
        </footer>
      </article>

      ${state.bookMode === 'split' ? renderCodeCompanion(spec, state.companionStep) : ''}
    </div>
  `;
}

export function bindEbookView(state, mcqBank, persist, rerender, onJumpMcqChapter, onJumpMcqTopic) {
  clearAutoReadTimer();
  const sheet = document.getElementById('bookSheetEl');
  if (sheet) renderLatexInElement(sheet);

  const markCurrentRead = (shouldRerender = false) => {
    if (state.bookSubKind !== 'topic' || !state.topicId) return;
    if (state.readTopicIds.has(state.topicId)) return;
    const beforeSnap = snapshotCompletions(state, mcqBank);
    state.readTopicIds.add(state.topicId);
    persist();
    if (shouldRerender) rerender();
    notifyNewCompletions(state, mcqBank, beforeSnap);
  };

  // Auto-mark theory read after ~3 seconds of viewing this topic
  if (state.bookSubKind === 'topic' && state.topicId && !state.readTopicIds.has(state.topicId)) {
    const watchingId = state.topicId;
    autoReadTimer = setTimeout(() => {
      autoReadTimer = null;
      if (state.activeTab === 'book' && state.bookSubKind === 'topic' && state.topicId === watchingId) {
        markCurrentRead(true);
      }
    }, 3000);
  }

  document.querySelectorAll('[data-bookmode]').forEach((b) => {
    b.addEventListener('click', () => {
      state.bookMode = b.dataset.bookmode;
      persist();
      rerender();
    });
  });

  document.getElementById('btnFlipBookCode')?.addEventListener('click', () => {
    state.codeSide = state.codeSide === 'left' ? 'right' : 'left';
    persist();
    rerender();
  });

  document.getElementById('btnMarkReadTopic')?.addEventListener('click', () => {
    const beforeSnap = snapshotCompletions(state, mcqBank);
    if (state.readTopicIds.has(state.topicId)) {
      state.readTopicIds.delete(state.topicId);
      state.bookmarked.delete(state.topicId);
    } else {
      state.readTopicIds.add(state.topicId);
      state.bookmarked.add(state.topicId);
    }
    persist();
    rerender();
    notifyNewCompletions(state, mcqBank, beforeSnap);
  });

  document.querySelectorAll('[data-cstep]').forEach((b) => {
    b.addEventListener('click', () => {
      state.companionStep = Number(b.dataset.cstep);
      rerender();
    });
  });

  document.querySelectorAll('[data-jump-code]').forEach((b) => {
    b.addEventListener('click', () => {
      clearAutoReadTimer();
      markCurrentRead(false);
      state.sebSelectedId = b.dataset.jumpCode;
      state.sebPartFilter = 'all';
      state.sebDiffFilter = 'all';
      state.activeTab = 'code';
      persist();
      rerender();
      scrollTopInstant();
    });
  });

  document.querySelectorAll('[data-jump-mcq-topic]').forEach((b) => {
    b.addEventListener('click', () => {
      clearAutoReadTimer();
      markCurrentRead(false);
      if (onJumpMcqTopic) onJumpMcqTopic(b.dataset.jumpMcqTopic, Number(b.dataset.jumpMcqChNum));
    });
  });

  document.querySelectorAll('[data-jump-mcq-ch]').forEach((b) => {
    b.addEventListener('click', () => {
      clearAutoReadTimer();
      markCurrentRead(false);
      onJumpMcqChapter(Number(b.dataset.jumpMcqCh));
    });
  });

  document.querySelectorAll('.boss-opt').forEach((btn) => {
    btn.addEventListener('click', () => {
      const blk = btn.closest('.boss-q-block');
      if (!blk) return;
      const ans = Number(btn.dataset.ans);
      const pick = Number(btn.dataset.pick);
      blk.querySelectorAll('.boss-opt').forEach((o) => {
        o.classList.remove('correct', 'wrong');
        if (Number(o.dataset.pick) === ans) o.classList.add('correct');
      });
      if (pick !== ans) btn.classList.add('wrong');
      const exp = blk.querySelector('.boss-exp');
      if (exp) exp.style.display = 'block';
    });
  });
}
