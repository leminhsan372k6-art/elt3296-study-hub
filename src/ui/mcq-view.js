import { esc, formatInlineCode, highlightCodeSnippet, shuffleArray, scrollTopInstant } from '../core/dom.js';
import { formatSavedTime } from '../core/storage.js';
import { renderLatexInElement } from '../core/latex.js';

const CH_NAMES = {
  1: 'Ch.1 Linux & Shell',
  2: 'Ch.2 File I/O',
  3: 'Ch.3 Process & Pipe',
  4: 'Ch.4 Thread & Sync',
  5: 'Ch.5 Song song',
  6: 'Ch.6 Cache & QSort',
  7: 'Ch.7 Quy hoạch động',
};

const mcqSession = {
  mode: 'practice', // 'practice' | 'exam' | 'wrong' | 'history'
  chapterFilter: 'all', // 'all' | '1'..'7'
  tagFilter: 'all', // 'all' | 'real-exam' | 'extended'
  practiceList: [],
  wrongPicks: {},
  // Exam 20-question simulator state
  examQuestions: [],
  examPicks: {},
  examFlags: new Set(),
  examSubmitted: false,
  examReviewingRecord: null,
  examSecondsLeft: 30 * 60,
  timerId: null,
};

function stopExamTimer() {
  if (mcqSession.timerId) {
    clearInterval(mcqSession.timerId);
    mcqSession.timerId = null;
  }
}

function shuffleQuestionOptions(q) {
  const tagged = q.options.map((text, idx) => ({ text, ok: idx === q.answer }));
  const mixed = shuffleArray(tagged);
  return {
    ...q,
    options: mixed.map((m) => m.text),
    answer: mixed.findIndex((m) => m.ok),
  };
}

function buildRealistic20Exam(bank) {
  // Mirror real UET exam weights: Ch1: 7, Ch2: 3, Ch3: 3, Ch4: 3, Ch5: 2, Ch6: 1, Ch7: 1 = 20
  const quotas = { 1: 7, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 };
  const picked = [];
  for (const [ch, need] of Object.entries(quotas)) {
    const pool = shuffleArray(bank.filter((q) => String(q.chapter) === ch));
    picked.push(...pool.slice(0, need));
  }
  return picked.map(shuffleQuestionOptions);
}

export function startMcqForChapter(bank, chapterNum) {
  stopExamTimer();
  mcqSession.mode = 'practice';
  mcqSession.chapterFilter = String(chapterNum);
  mcqSession.tagFilter = 'all';
  rebuildPracticeList(bank);
}

export function jumpToMcqById(bank, id, chapterNum) {
  stopExamTimer();
  mcqSession.mode = 'practice';
  mcqSession.chapterFilter = String(chapterNum || 'all');
  mcqSession.tagFilter = 'all';
  rebuildPracticeList(bank, id);
}

export function openSavedMcqExam(record) {
  if (!record || !Array.isArray(record.items)) return;
  stopExamTimer();
  mcqSession.mode = 'exam';
  mcqSession.examQuestions = record.items.map((it) => ({
    id: it.id,
    chapter: it.chapter,
    tag: it.tag || '',
    source: it.source || it.id,
    topicId: it.topicId || '',
    question: it.question,
    code: it.code || '',
    options: it.options,
    answer: it.answer,
    explain: it.explain,
  }));
  mcqSession.examPicks = {};
  record.items.forEach((it, idx) => {
    if (typeof it.picked === 'number') mcqSession.examPicks[idx] = it.picked;
  });
  mcqSession.examFlags = new Set();
  mcqSession.examSubmitted = true;
  mcqSession.examReviewingRecord = record;
  mcqSession.examSecondsLeft = Math.max(0, 30 * 60 - (record.elapsedSec || 0));
}

function recordSubmittedExam(state) {
  if (mcqSession.examReviewingRecord) return;
  const qs = mcqSession.examQuestions;
  if (!qs.length) return;
  let correct = 0;
  const items = qs.map((q, idx) => {
    const picked = mcqSession.examPicks[idx];
    if (picked === q.answer) {
      correct++;
      state.mcqMasteredIds.add(q.id);
      state.wrongMcqIds.delete(q.id);
    } else {
      state.wrongMcqIds.add(q.id);
    }
    return {
      id: q.id,
      chapter: q.chapter,
      tag: q.tag || '',
      source: q.source || q.id,
      topicId: q.topicId || '',
      question: q.question,
      code: q.code || '',
      options: q.options,
      answer: q.answer,
      picked: typeof picked === 'number' ? picked : null,
      explain: q.explain,
    };
  });
  const total = qs.length;
  const entry = {
    id: `exam-${Date.now()}`,
    submittedAt: Date.now(),
    correct,
    total,
    score10: Number(((correct / Math.max(1, total)) * 10).toFixed(2)),
    score4: Number(((correct / Math.max(1, total)) * 4).toFixed(2)),
    elapsedSec: Math.max(0, 30 * 60 - mcqSession.examSecondsLeft),
    items,
  };
  if (!Array.isArray(state.mcqExamHistory)) state.mcqExamHistory = [];
  state.mcqExamHistory.unshift(entry);
  if (state.mcqExamHistory.length > 30) state.mcqExamHistory.length = 30;
  mcqSession.examReviewingRecord = entry;
}

function rebuildPracticeList(bank, pinId = null) {
  let list = bank.filter((q) => {
    const okCh = mcqSession.chapterFilter === 'all' || String(q.chapter) === mcqSession.chapterFilter;
    const okTag = mcqSession.tagFilter === 'all' || q.tag === mcqSession.tagFilter;
    return okCh && okTag;
  });
  if (pinId) {
    const idx = list.findIndex((x) => x.id === pinId);
    if (idx > 0) {
      const [item] = list.splice(idx, 1);
      list = [item, ...list];
    }
  }
  mcqSession.practiceList = list;
}

function startNewExam(bank, state, persist, rerender) {
  stopExamTimer();
  mcqSession.mode = 'exam';
  mcqSession.examQuestions = buildRealistic20Exam(bank);
  mcqSession.examPicks = {};
  mcqSession.examFlags = new Set();
  mcqSession.examSubmitted = false;
  mcqSession.examReviewingRecord = null;
  mcqSession.examSecondsLeft = 30 * 60;
  mcqSession.timerId = setInterval(() => {
    if (mcqSession.mode !== 'exam' || mcqSession.examSubmitted) {
      stopExamTimer();
      return;
    }
    mcqSession.examSecondsLeft--;
    const timerEl = document.getElementById('mcqExamTimer');
    if (timerEl) timerEl.textContent = formatClock(mcqSession.examSecondsLeft);
    if (mcqSession.examSecondsLeft <= 0) {
      mcqSession.examSubmitted = true;
      stopExamTimer();
      recordSubmittedExam(state);
      persist();
      rerender();
    }
  }, 1000);
}

function formatClock(sec) {
  const s = Math.max(0, sec);
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function renderQuestionCard(q, idx, total, { picked, reveal, isExam, flagged }) {
  const letters = ['A', 'B', 'C', 'D'];
  return `
    <article class="mcq-card" id="mcqCard-${idx}">
      <div class="mcq-card-head">
        <div class="mcq-badges">
          <span style="font-weight:700;color:var(--fg)">Câu ${idx + 1} / ${total}</span>
          <span class="pill-tag ch">${esc(CH_NAMES[q.chapter] || `Ch.${q.chapter}`)}</span>
          ${q.tag === 'real-exam' ? `<span class="pill-tag real">★ Đề thi thật UET</span>` : ''}
          <span class="pill-tag">${esc(q.source || q.id)}</span>
        </div>

        <div style="display:flex;align-items:center;gap:6px">
          ${
            q.topicId && !isExam
              ? `<button type="button" class="btn sm ghost" data-goto-book-topic="${esc(q.topicId)}" title="Mở bài học gốc trong sách">📖 Xem lý thuyết</button>`
              : ''
          }
          ${
            isExam
              ? `<button type="button" class="flag-btn ${flagged ? 'flagged' : ''}" data-flag-idx="${idx}">${flagged ? '🚩 Đã đặt cờ' : '⚑ Đặt cờ'}</button>`
              : ''
          }
        </div>
      </div>

      <div class="mcq-question-text">${formatInlineCode(q.question)}</div>
      ${q.code ? `<pre class="mcq-code-block"><code>${highlightCodeSnippet(q.code)}</code></pre>` : ''}

      <div class="mcq-opts">
        ${q.options
          .map((opt, oi) => {
            let cls = '';
            if (reveal) {
              if (oi === q.answer) cls = 'correct';
              else if (picked === oi) cls = 'wrong';
            } else if (picked === oi) {
              cls = 'selected';
            }
            return `
              <button type="button" class="mcq-opt ${cls}" data-mcq-idx="${idx}" data-mcq-opt="${oi}" data-mcq-id="${esc(q.id)}">
                <span class="mcq-letter">${letters[oi]}.</span>
                <span>${formatInlineCode(opt)}</span>
              </button>`;
          })
          .join('')}
      </div>

      ${
        reveal
          ? `<div class="mcq-explain">
              <b>Giải thích chi tiết (${letters[q.answer]} đúng):</b> ${formatInlineCode(q.explain)}
              ${
                q.topicId
                  ? `<div style="margin-top:8px"><button type="button" class="btn sm" data-goto-book-topic="${esc(q.topicId)}">📖 Ôn lại bài học gốc (${esc(q.topicId)}) →</button></div>`
                  : ''
              }
            </div>`
          : ''
      }
    </article>
  `;
}

export function renderMcqView(state, bank) {
  if (mcqSession.practiceList.length === 0 && bank.length > 0 && mcqSession.mode === 'practice') {
    rebuildPracticeList(bank);
  }

  const realCount = bank.filter((q) => q.tag === 'real-exam').length;
  const wrongList = bank.filter((q) => state.wrongMcqIds.has(q.id));

  let bodyHtml = '';

  if (mcqSession.mode === 'exam') {
    const qs = mcqSession.examQuestions;
    let correct = 0;
    qs.forEach((q, i) => {
      if (mcqSession.examPicks[i] === q.answer) correct++;
    });
    const answered = Object.keys(mcqSession.examPicks).length;

    bodyHtml = `
      ${
        mcqSession.examSubmitted
          ? `<div class="score-summary-banner">
              <div>
                <div style="font-size:15.5px;font-weight:700">Kết quả Thi thử Chuẩn Đề thật (20 câu · 40% cuối kỳ)</div>
                <div style="font-size:13.8px;margin-top:3px">
                  Đúng <b>${correct} / ${qs.length}</b> câu (${Math.round((correct / Math.max(1, qs.length)) * 100)}%) ·
                  Quy đổi hệ 4.0: <b>${((correct / Math.max(1, qs.length)) * 4.0).toFixed(2)} / 4.00 điểm</b>
                  ${qs.length - correct > 0 ? ` · Đã tự động lưu ${qs.length - correct} câu sai vào mục "Ôn câu làm sai".` : ' · Xuất sắc 100%!'}
                </div>
              </div>
              <button type="button" class="btn primary" id="btnStartNewExam">↻ Bốc đề 20 câu mới</button>
            </div>`
          : ''
      }

      <div class="mcq-exam-grid">
        <div class="mcq-list">
          ${qs
            .map((q, idx) =>
              renderQuestionCard(q, idx, qs.length, {
                picked: mcqSession.examPicks[idx],
                reveal: mcqSession.examSubmitted,
                isExam: true,
                flagged: mcqSession.examFlags.has(idx),
              })
            )
            .join('')}
        </div>

        <aside class="exam-panel">
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--mut);letter-spacing:0.05em">
            Phòng thi mô phỏng Moodle SEB
          </div>
          <div class="exam-timer" id="mcqExamTimer">${formatClock(mcqSession.examSecondsLeft)}</div>
          <div style="font-size:12.5px;color:var(--mut);margin-bottom:10px">
            Đã chọn: <b>${answered}/${qs.length}</b> · Đặt cờ: <b>${mcqSession.examFlags.size}</b>
          </div>

          <div class="exam-nav-grid">
            ${qs
              .map((q, idx) => {
                const picked = mcqSession.examPicks[idx];
                const hasPick = typeof picked === 'number';
                let cls = '';
                if (mcqSession.examSubmitted) {
                  cls = picked === q.answer ? 'is-ok' : 'is-err';
                } else if (hasPick) {
                  cls = 'answered';
                }
                if (mcqSession.examFlags.has(idx)) cls += ' flagged';
                return `<button type="button" class="exam-nav-cell ${cls}" data-scroll-mcq="${idx}">${idx + 1}</button>`;
              })
              .join('')}
          </div>

          <div style="display:grid;gap:8px">
            ${
              !mcqSession.examSubmitted
                ? `<button type="button" class="btn primary" id="btnSubmitMcqExam">Nộp bài &amp; Chấm điểm (${answered}/${qs.length})</button>`
                : `<button type="button" class="btn primary" id="btnStartNewExamSide">↻ Làm đề mới (20 câu)</button>`
            }
            <button type="button" class="btn sm ghost" id="btnBackPractice">← Quay lại Luyện theo Chương</button>
          </div>
        </aside>
      </div>
    `;
  } else if (mcqSession.mode === 'history') {
    const exams = Array.isArray(state.mcqExamHistory) ? state.mcqExamHistory : [];
    bodyHtml = `
      <div class="mcq-exam-grid single-col">
        <div class="mcq-list">
          ${
            exams.length === 0
              ? `<div class="mcq-card" style="text-align:center;padding:42px 24px">
                  <div style="font-size:20px;font-weight:700;margin-bottom:6px">Chưa có bài thi thử nào được lưu.</div>
                  <div style="color:var(--mut);font-family:var(--font-ui);font-size:14px;margin-bottom:14px">
                    Mỗi khi bạn nộp bài ở chế độ <b>Thi thử Đề thật (20 câu)</b>, kết quả &amp; toàn bộ đáp án bạn đã chọn sẽ tự động lưu bền vững trên máy để xem lại bất cứ lúc nào.
                  </div>
                  <button type="button" class="btn primary" data-mcq-mode="exam">Bắt đầu Thi thử 20 câu ngay →</button>
                </div>`
              : exams
                  .map(
                    (ex, i) => `
                  <article class="mcq-card" style="display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap">
                    <div>
                      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                        <span class="pill-tag ch">Lượt #${exams.length - i}</span>
                        <strong style="font-size:16px">Đúng ${ex.correct} / ${ex.total} câu · ${Number(ex.score10).toFixed(1)} / 10 điểm (Hệ 4: ${Number(ex.score4).toFixed(2)}/4.00)</strong>
                      </div>
                      <div style="font-family:var(--font-ui);font-size:13px;color:var(--mut);margin-top:5px">
                        Nộp lúc <b>${esc(formatSavedTime(ex.submittedAt))}</b> · Thời gian làm: ${Math.floor((ex.elapsedSec || 0) / 60)} phút ${String((ex.elapsedSec || 0) % 60).padStart(2, '0')} giây
                      </div>
                    </div>
                    <button type="button" class="btn primary" data-review-exam-id="${esc(ex.id)}">📖 Xem lại bài làm →</button>
                  </article>`
                  )
                  .join('')
          }
        </div>
      </div>
    `;
  } else if (mcqSession.mode === 'wrong') {
    bodyHtml = `
      <div class="mcq-exam-grid single-col">
        <div class="mcq-list">
          ${
            wrongList.length === 0
              ? `<div class="mcq-card" style="text-align:center;padding:42px 24px">
                  <div style="font-size:20px;font-weight:700;margin-bottom:6px">Tuyệt vời! Bạn chưa có câu sai nào cần ôn lại.</div>
                  <div style="color:var(--mut);font-family:var(--font-ui);font-size:14px;margin-bottom:14px">
                    Bất kỳ câu nào bạn chọn nhầm khi Luyện tập hoặc Thi thử 20 câu sẽ tự động gom vào đây để ôn lại cho tới khi chọn đúng.
                  </div>
                  <button type="button" class="btn primary" data-mcq-mode="exam">Bắt đầu Thi thử 20 câu ngay →</button>
                </div>`
              : `<div style="display:flex;justify-content:space-between;align-items:center;font-family:var(--font-ui);font-size:13.5px;color:var(--mut)">
                  <span>Đang có <b>${wrongList.length}</b> câu từng làm sai — chọn đúng đáp án câu đó sẽ tự động được gỡ khỏi danh sách.</span>
                  <button type="button" class="btn sm ghost" id="btnClearWrong">Xóa toàn bộ danh sách sai</button>
                </div>` +
                wrongList
                  .map((q, idx) =>
                    renderQuestionCard(q, idx, wrongList.length, {
                      picked: mcqSession.wrongPicks[q.id],
                      reveal: typeof mcqSession.wrongPicks[q.id] === 'number',
                      isExam: false,
                      flagged: false,
                    })
                  )
                  .join('')
          }
        </div>
      </div>
    `;
  } else {
    const list = mcqSession.practiceList;
    const savedPicks = state.mcqPracticePicks || {};
    bodyHtml = `
      <div class="mcq-exam-grid single-col">
        <div class="mcq-list">
          ${
            list.length === 0
              ? `<div class="mcq-card" style="text-align:center;color:var(--mut)">Không có câu hỏi nào khớp bộ lọc hiện tại.</div>`
              : list
                  .map((q, idx) =>
                    renderQuestionCard(q, idx, list.length, {
                      picked: savedPicks[q.id],
                      reveal: typeof savedPicks[q.id] === 'number',
                      isExam: false,
                      flagged: false,
                    })
                  )
                  .join('')
          }
        </div>
      </div>
    `;
  }

  return `
    <div class="mcq-shell" id="mcqRootEl">
      <section class="mcq-hero">
        <div class="mcq-hero-top">
          <div>
            <div style="font-family:var(--font-ui);font-size:12px;font-weight:700;color:var(--accent-strong);text-transform:uppercase;letter-spacing:0.05em">
              Kho Trắc Nghiệm Mở Rộng · 40% Điểm Cuối Kỳ (data/mcq-bank-elt3296.json)
            </div>
            <h1 style="margin:4px 0 6px;font-size:25px;line-height:1.25">
              ${bank.length} Câu Trắc Nghiệm Phủ Trọn 7 Chương (${realCount} câu Đề thi thật + ${bank.length - realCount} câu Mở rộng)
            </h1>
            <div style="font-family:var(--font-ui);font-size:13.6px;color:var(--mut)">
              Đã thành thạo <b>${state.mcqMasteredIds.size}/${bank.length}</b> câu · Cần ôn lại: <b>${state.wrongMcqIds.size}</b> câu.
            </div>
          </div>

          <div class="mcq-mode-bar" role="tablist">
            <button type="button" class="mcq-mode-btn ${mcqSession.mode === 'practice' ? 'active' : ''}" data-mcq-mode="practice">
              📚 Luyện theo Chương
            </button>
            <button type="button" class="mcq-mode-btn ${mcqSession.mode === 'exam' ? 'active' : ''}" data-mcq-mode="exam">
              ⏱ Thi thử Đề thật (20 câu)
            </button>
            <button type="button" class="mcq-mode-btn ${mcqSession.mode === 'wrong' ? 'active' : ''}" data-mcq-mode="wrong">
              🎯 Ôn câu sai (${state.wrongMcqIds.size})
            </button>
            <button type="button" class="mcq-mode-btn ${mcqSession.mode === 'history' ? 'active' : ''}" data-mcq-mode="history">
              📜 Lịch sử thi (${(state.mcqExamHistory || []).length})
            </button>
          </div>
        </div>

        ${
          mcqSession.mode === 'practice'
            ? `<div class="mcq-filters">
                <button type="button" class="btn sm ${mcqSession.chapterFilter === 'all' ? 'active' : ''}" data-mcq-ch="all">Tất cả 7 Chương (${bank.length})</button>
                ${[1, 2, 3, 4, 5, 6, 7]
                  .map((c) => {
                    const cnt = bank.filter((q) => q.chapter === c).length;
                    return `<button type="button" class="btn sm ${mcqSession.chapterFilter === String(c) ? 'active' : ''}" data-mcq-ch="${c}">${esc(CH_NAMES[c])} (${cnt})</button>`;
                  })
                  .join('')}
              </div>
              <div class="mcq-filters" style="margin-top:8px;padding-top:10px">
                <button type="button" class="btn sm ${mcqSession.tagFilter === 'all' ? 'active' : ''}" data-mcq-tag="all">Mọi nguồn</button>
                <button type="button" class="btn sm ${mcqSession.tagFilter === 'real-exam' ? 'active' : ''}" data-mcq-tag="real-exam">★ Chỉ Đề thi thật UET (${realCount})</button>
                <button type="button" class="btn sm ${mcqSession.tagFilter === 'extended' ? 'active' : ''}" data-mcq-tag="extended">Mở rộng chuyên sâu (${bank.length - realCount})</button>
                <button type="button" class="btn sm accent" id="btnShufflePractice">🔀 Xáo trộn</button>
                <button type="button" class="btn sm ghost" id="btnResetPracticePicks" title="Xóa lựa chọn đã lưu của các câu đang hiển thị để làm lại từ đầu">↺ Làm lại bộ câu này</button>
              </div>`
            : ''
        }
      </section>

      ${bodyHtml}
    </div>
  `;
}

export function bindMcqView(state, bank, persist, rerender) {
  const root = document.getElementById('mcqRootEl');
  if (root) renderLatexInElement(root);

  document.querySelectorAll('[data-mcq-mode]').forEach((b) => {
    b.addEventListener('click', () => {
      const m = b.dataset.mcqMode;
      if (m === 'exam') {
        if (mcqSession.examQuestions.length === 0 || mcqSession.examSubmitted) {
          startNewExam(bank, state, persist, rerender);
        } else {
          mcqSession.mode = 'exam';
        }
      } else {
        stopExamTimer();
        mcqSession.mode = m;
        if (m === 'practice' && mcqSession.practiceList.length === 0) rebuildPracticeList(bank);
      }
      rerender();
      scrollTopInstant();
    });
  });

  document.querySelectorAll('[data-mcq-ch]').forEach((b) => {
    b.addEventListener('click', () => {
      mcqSession.chapterFilter = b.dataset.mcqCh;
      rebuildPracticeList(bank);
      rerender();
    });
  });

  document.querySelectorAll('[data-mcq-tag]').forEach((b) => {
    b.addEventListener('click', () => {
      mcqSession.tagFilter = b.dataset.mcqTag;
      rebuildPracticeList(bank);
      rerender();
    });
  });

  document.getElementById('btnShufflePractice')?.addEventListener('click', () => {
    mcqSession.practiceList = shuffleArray(mcqSession.practiceList);
    rerender();
  });

  document.getElementById('btnResetPracticePicks')?.addEventListener('click', () => {
    for (const q of mcqSession.practiceList) {
      delete state.mcqPracticePicks[q.id];
    }
    persist();
    rerender();
  });

  document.querySelectorAll('[data-review-exam-id]').forEach((b) => {
    b.addEventListener('click', () => {
      const rec = (state.mcqExamHistory || []).find((x) => x.id === b.dataset.reviewExamId);
      if (rec) {
        openSavedMcqExam(rec);
        rerender();
        scrollTopInstant();
      }
    });
  });

  const handleNewExam = () => {
    startNewExam(bank, state, persist, rerender);
    rerender();
    scrollTopInstant();
  };
  document.getElementById('btnStartNewExam')?.addEventListener('click', handleNewExam);
  document.getElementById('btnStartNewExamSide')?.addEventListener('click', handleNewExam);

  document.getElementById('btnBackPractice')?.addEventListener('click', () => {
    stopExamTimer();
    mcqSession.mode = 'practice';
    rerender();
  });

  document.getElementById('btnSubmitMcqExam')?.addEventListener('click', () => {
    stopExamTimer();
    mcqSession.examSubmitted = true;
    recordSubmittedExam(state);
    persist();
    rerender();
    scrollTopInstant();
  });

  document.getElementById('btnClearWrong')?.addEventListener('click', () => {
    state.wrongMcqIds.clear();
    mcqSession.wrongPicks = {};
    persist();
    rerender();
  });

  document.querySelectorAll('[data-flag-idx]').forEach((b) => {
    b.addEventListener('click', () => {
      const idx = Number(b.dataset.flagIdx);
      if (mcqSession.examFlags.has(idx)) mcqSession.examFlags.delete(idx);
      else mcqSession.examFlags.add(idx);
      rerender();
    });
  });

  document.querySelectorAll('[data-scroll-mcq]').forEach((b) => {
    b.addEventListener('click', () => {
      document.getElementById(`mcqCard-${b.dataset.scrollMcq}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.querySelectorAll('[data-mcq-opt]').forEach((b) => {
    b.addEventListener('click', () => {
      const idx = Number(b.dataset.mcqIdx);
      const opt = Number(b.dataset.mcqOpt);
      const qid = b.dataset.mcqId;

      if (mcqSession.mode === 'exam') {
        if (mcqSession.examSubmitted) return;
        mcqSession.examPicks[idx] = opt;
        rerender();
        return;
      }

      if (mcqSession.mode === 'wrong') {
        mcqSession.wrongPicks[qid] = opt;
      } else {
        state.mcqPracticePicks[qid] = opt;
      }
      const targetList = mcqSession.mode === 'wrong' ? bank.filter((q) => state.wrongMcqIds.has(q.id)) : mcqSession.practiceList;
      const q = targetList.find((x) => x.id === qid) || bank.find((x) => x.id === qid);
      if (q) {
        if (opt === q.answer) {
          state.mcqMasteredIds.add(q.id);
          state.wrongMcqIds.delete(q.id);
        } else {
          state.wrongMcqIds.add(q.id);
        }
        persist();
      }
      rerender();
    });
  });

  document.querySelectorAll('[data-goto-book-topic]').forEach((b) => {
    b.addEventListener('click', () => {
      stopExamTimer();
      state.topicId = b.dataset.gotoBookTopic;
      state.bookSubKind = 'topic';
      state.activeTab = 'book';
      persist();
      rerender();
      scrollTopInstant();
    });
  });
}
