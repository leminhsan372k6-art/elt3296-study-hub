// Full 90-Minute Realistic Final Exam Simulator: Part I (20 MCQs · 4.0đ) + Part II (3 Code Problems: Easy/Medium/Hard · 6.0đ)
import { esc, formatInlineCode, highlightCodeSnippet, shuffleArray, scrollTopInstant } from '../core/dom.js?v=12';
import { renderLatexInElement } from '../core/latex.js';
import { attachIdeEditor } from '../core/code-editor-ide.js?v=12';
import { runRealTestSuite } from '../core/c-runner.js?v=13';
import { formatSavedTime } from '../core/storage.js';
import { snapshotCompletions, notifyNewCompletions } from '../core/progress.js?v=11';
import { OFFICIAL_SEB_40, gradeSubmission } from '../../data/code-50/index.js?v=11';
import { REAL_TEST_CASES } from '../../data/code-50/test-cases.js?v=13';

const CH_NAMES = {
  1: 'Ch.1 Linux & Shell',
  2: 'Ch.2 File I/O',
  3: 'Ch.3 Process & Pipe',
  4: 'Ch.4 Thread & Sync',
  5: 'Ch.5 Song song',
  6: 'Ch.6 Cache & QSort',
  7: 'Ch.7 Quy hoạch động',
};

const mockSession = {
  active: false,
  mcqStrategy: 'uet', // 'uet' (7-3-3-3-2-1-1) | 'uniform' (random across 170)
  section: 'mcq', // 'mcq' | 'code-0' | 'code-1' | 'code-2'
  secondsLeft: 90 * 60,
  timerId: null,
  submitted: false,
  submittingAll: false,
  reviewingId: null,

  mcqQuestions: [],
  mcqPicks: {},
  mcqFlags: new Set(),

  codeQuestions: [], // [Easy, Medium, Hard]
  codeDrafts: ['', '', ''],
  codeRuns: [null, null, null],
  codeStatic: [null, null, null],
  codeScores2: [0, 0, 0], // each out of 2.0 -> sum = 6.0
  codeRunningIdx: -1,
  codeRightView: ['editor', 'editor', 'editor'], // post-submit: 'editor' | 'solution'
  codeLeftView: ['problem', 'problem', 'problem'], // post-submit: 'problem' | 'explain'
};

function stopTimer() {
  if (mockSession.timerId) {
    clearInterval(mockSession.timerId);
    mockSession.timerId = null;
  }
}

function formatClock(sec) {
  const s = Math.max(0, sec);
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
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

function pick20Mcqs(bank, strategy) {
  if (strategy === 'uniform') {
    return shuffleArray(bank).slice(0, 20).map(shuffleQuestionOptions);
  }
  const quotas = { 1: 7, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 };
  const picked = [];
  for (const [ch, need] of Object.entries(quotas)) {
    const pool = shuffleArray(bank.filter((q) => String(q.chapter) === ch));
    picked.push(...pool.slice(0, need));
  }
  return picked.map(shuffleQuestionOptions);
}

function pick3CodeProblems() {
  const easyPool = shuffleArray(OFFICIAL_SEB_40.filter((q) => q.difficulty === 'Dễ'));
  const medPool = shuffleArray(OFFICIAL_SEB_40.filter((q) => q.difficulty === 'Trung bình'));
  const hardPool = shuffleArray(OFFICIAL_SEB_40.filter((q) => q.difficulty === 'Khó'));

  const q1 = easyPool[0];
  const usedParts = new Set([q1?.part]);

  const q2 = medPool.find((q) => !usedParts.has(q.part)) || medPool[0];
  if (q2) usedParts.add(q2.part);

  const q3 = hardPool.find((q) => !usedParts.has(q.part)) || hardPool[0];
  return [q1, q2, q3].filter(Boolean);
}

function computeCodeScore2(q, code, realRes, staticRep) {
  if (!String(code || '').trim()) return 0;
  if (realRes && !realRes.networkError) {
    if (realRes.compileError) return 0;
    if (realRes.total > 0) {
      const ratio = realRes.passed / realRes.total;
      const forbiddenPenalty = staticRep?.criteria?.[1]?.score === 0 ? 0.35 : 1.0;
      return Number((2.0 * ratio * forbiddenPenalty).toFixed(2));
    }
  }
  // Fallback to static score if compiler network failed
  if (staticRep) return Number(((staticRep.score10 / 10) * 2.0).toFixed(2));
  return 0;
}

function startNewMockExam(bank, state, persist, rerender) {
  stopTimer();
  mockSession.active = true;
  mockSession.section = 'mcq';
  mockSession.secondsLeft = 90 * 60;
  mockSession.submitted = false;
  mockSession.submittingAll = false;
  mockSession.reviewingId = null;

  mockSession.mcqQuestions = pick20Mcqs(bank, mockSession.mcqStrategy);
  mockSession.mcqPicks = {};
  mockSession.mcqFlags = new Set();

  mockSession.codeQuestions = pick3CodeProblems();
  mockSession.codeDrafts = ['', '', ''];
  mockSession.codeRuns = [null, null, null];
  mockSession.codeStatic = [null, null, null];
  mockSession.codeScores2 = [0, 0, 0];
  mockSession.codeRunningIdx = -1;
  mockSession.codeRightView = ['editor', 'editor', 'editor'];
  mockSession.codeLeftView = ['problem', 'problem', 'problem'];

  mockSession.timerId = setInterval(() => {
    if (!mockSession.active || mockSession.submitted) {
      stopTimer();
      return;
    }
    mockSession.secondsLeft--;
    const el = document.getElementById('mockExamTimer');
    if (el) el.textContent = formatClock(mockSession.secondsLeft);
    if (mockSession.secondsLeft <= 0) {
      submitFullMockExam(state, bank, persist, rerender);
    }
  }, 1000);
}

async function gradeSingleMockCode(idx, rerender) {
  const q = mockSession.codeQuestions[idx];
  if (!q) return;
  const code = mockSession.codeDrafts[idx] || '';
  const staticRep = gradeSubmission(q, code);
  mockSession.codeStatic[idx] = staticRep;

  if (!code.trim()) {
    mockSession.codeRuns[idx] = null;
    mockSession.codeScores2[idx] = 0;
    return;
  }

  mockSession.codeRunningIdx = idx;
  if (rerender) rerender();
  try {
    const tcList = REAL_TEST_CASES[q.id] || [];
    const realRes = await runRealTestSuite(code, tcList);
    mockSession.codeRuns[idx] = realRes;
    mockSession.codeScores2[idx] = computeCodeScore2(q, code, realRes, staticRep);
  } catch (err) {
    mockSession.codeRuns[idx] = { networkError: err?.message || 'Timeout' };
    mockSession.codeScores2[idx] = computeCodeScore2(q, code, null, staticRep);
  } finally {
    if (mockSession.codeRunningIdx === idx) mockSession.codeRunningIdx = -1;
  }
}

async function submitFullMockExam(state, bank, persist, rerender) {
  if (mockSession.submitted || mockSession.submittingAll) return;
  stopTimer();
  mockSession.submittingAll = true;
  rerender();

  const beforeSnap = snapshotCompletions(state, bank);

  // Grade any code problem with code in parallel via Linux GCC
  await Promise.all(
    mockSession.codeQuestions.map(async (q, idx) => {
      const code = mockSession.codeDrafts[idx] || '';
      const staticRep = gradeSubmission(q, code);
      mockSession.codeStatic[idx] = staticRep;
      if (!code.trim()) {
        mockSession.codeRuns[idx] = null;
        mockSession.codeScores2[idx] = 0;
        return;
      }
      try {
        const tcList = REAL_TEST_CASES[q.id] || [];
        const realRes = await runRealTestSuite(code, tcList);
        mockSession.codeRuns[idx] = realRes;
        mockSession.codeScores2[idx] = computeCodeScore2(q, code, realRes, staticRep);
      } catch (err) {
        mockSession.codeRuns[idx] = { networkError: err?.message || 'Timeout' };
        mockSession.codeScores2[idx] = computeCodeScore2(q, code, null, staticRep);
      }
    })
  );

  // Update mastery sets (MCQs + solved Codes)
  let mcqCorrect = 0;
  const mcqSnapshot = mockSession.mcqQuestions.map((q, idx) => {
    const picked = mockSession.mcqPicks[idx];
    if (picked === q.answer) {
      mcqCorrect++;
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

  const codeSnapshot = mockSession.codeQuestions.map((q, idx) => {
    const run = mockSession.codeRuns[idx];
    const score2 = mockSession.codeScores2[idx];
    const isFullPass = run && !run.compileError && !run.networkError && run.total > 0 && run.passed === run.total && score2 >= 1.99;
    if (isFullPass) {
      state.solvedCodeIds.add(q.id);
      state.sebScores[q.id] = { score10: 10, tier: 'mastered' };
    }
    return {
      id: q.id,
      difficulty: q.difficulty,
      part: q.part,
      title: q.title,
      draft: mockSession.codeDrafts[idx] || '',
      score2,
      passed: run?.passed ?? 0,
      total: run?.total ?? (REAL_TEST_CASES[q.id]?.length || 0),
      compileError: run?.compileError ? String(run.compileError).slice(0, 1200) : '',
    };
  });

  const mcqScore4 = Number(((mcqCorrect / Math.max(1, mockSession.mcqQuestions.length)) * 4.0).toFixed(2));
  const codeScore6 = Number((mockSession.codeScores2.reduce((a, b) => a + b, 0)).toFixed(2));
  const total10 = Number((mcqScore4 + codeScore6).toFixed(2));

  const record = {
    id: `mock-${Date.now()}`,
    submittedAt: Date.now(),
    strategy: mockSession.mcqStrategy,
    elapsedSec: Math.max(0, 90 * 60 - mockSession.secondsLeft),
    mcqCorrect,
    mcqTotal: mockSession.mcqQuestions.length,
    mcqScore4,
    codeScore6,
    total10,
    mcqItems: mcqSnapshot,
    codeItems: codeSnapshot,
  };

  if (!Array.isArray(state.mockExamHistory)) state.mockExamHistory = [];
  state.mockExamHistory.unshift(record);
  if (state.mockExamHistory.length > 20) state.mockExamHistory.length = 20;

  mockSession.submitted = true;
  mockSession.submittingAll = false;
  mockSession.reviewingId = record.id;
  persist();
  rerender();
  notifyNewCompletions(state, bank, beforeSnap);
  scrollTopInstant();
}

export function openSavedFullMockExam(record) {
  if (!record) return;
  stopTimer();
  mockSession.active = true;
  mockSession.submitted = true;
  mockSession.submittingAll = false;
  mockSession.reviewingId = record.id;
  mockSession.mcqStrategy = record.strategy || 'uet';
  mockSession.secondsLeft = Math.max(0, 90 * 60 - (record.elapsedSec || 0));
  mockSession.section = 'mcq';

  mockSession.mcqQuestions = (record.mcqItems || []).map((it) => ({ ...it }));
  mockSession.mcqPicks = {};
  (record.mcqItems || []).forEach((it, idx) => {
    if (typeof it.picked === 'number') mockSession.mcqPicks[idx] = it.picked;
  });
  mockSession.mcqFlags = new Set();

  mockSession.codeQuestions = (record.codeItems || [])
    .map((ci) => OFFICIAL_SEB_40.find((q) => q.id === ci.id))
    .filter(Boolean);
  mockSession.codeDrafts = (record.codeItems || []).map((ci) => ci.draft || '');
  mockSession.codeScores2 = (record.codeItems || []).map((ci) => Number(ci.score2 || 0));
  mockSession.codeRuns = (record.codeItems || []).map((ci) =>
    ci.draft?.trim()
      ? {
          engine: 'Saved Exam',
          compileError: ci.compileError || '',
          passed: ci.passed || 0,
          total: ci.total || 0,
          results: [],
        }
      : null
  );
  mockSession.codeStatic = mockSession.codeQuestions.map((q, idx) => gradeSubmission(q, mockSession.codeDrafts[idx] || ''));
  mockSession.codeRightView = ['editor', 'editor', 'editor'];
  mockSession.codeLeftView = ['problem', 'problem', 'problem'];
}

function renderCodeGuideUnlocked(q) {
  const g = q.detailGuide;
  if (!g) return '';
  const idea = g.idea;
  return `
    <div class="academic-guide">
      <section class="guide-section">
        <h3 class="guide-block-title"><span class="guide-num">1</span> Bản chất &amp; Nguồn Kiến Thức</h3>
        <p class="guide-prose">${formatInlineCode(g.origin)}</p>
      </section>
      ${
        idea
          ? `<section class="guide-section">
              <h3 class="guide-block-title"><span class="guide-num">2</span> Ý Tưởng Cốt Lõi &amp; Tư Duy Giải Bài</h3>
              <div class="idea-card">
                <p class="guide-prose" style="margin:0 0 8px">${formatInlineCode(idea.summary)}</p>
                ${idea.steps?.length ? `<ol class="idea-step-list">${idea.steps.map((s) => `<li>${formatInlineCode(s)}</li>`).join('')}</ol>` : ''}
                ${idea.whyThisWay ? `<div class="idea-why-box"><div class="idea-why-head">💡 Tại sao phải làm cách này?</div><div class="guide-prose" style="font-size:14px">${formatInlineCode(idea.whyThisWay)}</div></div>` : ''}
                ${idea.complexity ? `<div class="idea-meta-bar">⏱ ${formatInlineCode(idea.complexity)}</div>` : ''}
              </div>
            </section>`
          : ''
      }
      <section class="guide-section">
        <h3 class="guide-block-title"><span class="guide-num">3</span> Giải Phẫu Từng Khối Mã Lệnh</h3>
        <div class="line-explain-list">
          ${(g.lineByLine || [])
            .map(
              (row) => `
            <div class="line-explain-row">
              <div class="line-explain-top">
                <span class="line-badge">${esc(row.lines)}</span>
                ${row.title ? `<span class="line-explain-title">${esc(row.title)}</span>` : ''}
              </div>
              <pre class="line-code-strip"><code>${highlightCodeSnippet(row.code || '')}</code></pre>
              <div class="guide-prose" style="font-size:14px">${formatInlineCode(row.explain)}</div>
            </div>`
            )
            .join('')}
        </div>
      </section>
      <section class="guide-section">
        <h3 class="guide-block-title"><span class="guide-num">4</span> Khung Sườn Nhớ Nhanh Phòng Thi</h3>
        <ol class="recipe-list">${(g.examRecipe || []).map((s) => `<li>${formatInlineCode(s)}</li>`).join('')}</ol>
      </section>
    </div>
  `;
}

function renderLanding(state) {
  const hist = Array.isArray(state.mockExamHistory) ? state.mockExamHistory : [];
  return `
    <div class="mock-shell" id="mockExamRoot">
      <section class="mock-hero-card">
        <div style="font-family:var(--font-ui);font-size:12px;font-weight:750;color:var(--accent-strong);text-transform:uppercase;letter-spacing:0.05em">
          Phòng Thi Cuối Kỳ Mô Phỏng Chuẩn UET-VNU · Moodle SEB (90 Phút · Thang 10.0)
        </div>
        <h1 style="margin:6px 0 8px;font-size:27px;line-height:1.25">
          🎯 Thi Thử Đề Thi Toàn Diện (20 Trắc Nghiệm + 3 Câu Code)
        </h1>
        <p style="margin:0 0 18px;font-size:15.2px;line-height:1.65;color:var(--fg-body)">
          Cấu trúc sát đề thi cuối kỳ học phần <b>ELT 3296</b>: chuyển qua lại mượt giữa Phần I và 3 bài Code không mất bài, ẩn toàn bộ đáp án &amp; giải thích cho đến khi nộp bài, chấm Linux GCC thật và mở khóa lời giải 5 tầng để rút kinh nghiệm ngay.
        </p>

        <div class="mock-blueprint-grid">
          <div class="mock-bp-box">
            <div class="mock-bp-head">📝 Phần I · 20 Câu Trắc Nghiệm (4,0 điểm)</div>
            <div style="font-size:13.4px;color:var(--mut);line-height:1.55;margin-bottom:10px">
              Bốc từ kho 170 câu, tự xáo trộn đáp án A/B/C/D, hỗ trợ đặt cờ câu phân vân. Chọn cách bốc đề:
            </div>
            <div style="display:grid;gap:7px">
              <button type="button" class="mock-strat-btn ${mockSession.mcqStrategy === 'uet' ? 'active' : ''}" data-mock-strategy="uet">
                <strong>Phân bố đề chuẩn UET (7-3-3-3-2-1-1)</strong>
                <span>Ch.1: 7 · Ch.2–4: mỗi chương 3 · Ch.5: 2 · Ch.6–7: mỗi chương 1</span>
              </button>
              <button type="button" class="mock-strat-btn ${mockSession.mcqStrategy === 'uniform' ? 'active' : ''}" data-mock-strategy="uniform">
                <strong>Ngẫu nhiên đều trên cả 170 câu</strong>
                <span>Bốc hoàn toàn ngẫu nhiên không cố định tỷ trọng từng chương</span>
              </button>
            </div>
          </div>

          <div class="mock-bp-box">
            <div class="mock-bp-head">💻 Phần II · 3 Câu Tự Luận Code (6,0 điểm)</div>
            <div style="font-size:13.4px;color:var(--mut);line-height:1.6">
              Bốc ngẫu nhiên từ <b>40 câu trọng tâm (CR-01 → CR-40)</b> thuộc 5 phần (File, Process, Thread, Song song, DP):
              <ul style="margin:8px 0 0;padding-left:18px;display:grid;gap:4px">
                <li><b>Câu Code 1 (Dễ · 2,0đ)</b></li>
                <li><b>Câu Code 2 (Trung bình · 2,0đ)</b></li>
                <li><b>Câu Code 3 (Khó · 2,0đ)</b></li>
              </ul>
              <div style="margin-top:8px;color:var(--accent-strong);font-weight:600">★ Ưu tiên 3 chuyên đề khác nhau · Biên dịch GCC Linux thật ngay trong phòng thi!</div>
            </div>
          </div>
        </div>

        <div style="margin-top:18px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <button type="button" class="btn primary" id="btnStartFullMock" style="padding:11px 22px;font-size:14.8px">
            🚀 Bắt đầu Thi thử Toàn đề (90:00)
          </button>
          <span style="font-family:var(--font-ui);font-size:13px;color:var(--mut)">
            Đồng hồ đếm ngược 90 phút · Tự chấm điểm hệ 10.0 &amp; tự lưu lịch sử thi
          </span>
        </div>
      </section>

      <section class="mock-history-card">
        <h2 style="margin:0 0 10px;font-size:18px">📜 Lịch sử Đề Thi Thử Toàn Diện (${hist.length})</h2>
        ${
          hist.length === 0
            ? `<div style="font-family:var(--font-ui);font-size:13.6px;color:var(--mut)">Bạn chưa nộp đề thi thử toàn diện nào. Bấm <b>Bắt đầu Thi thử Toàn đề</b> ở trên để luyện thi thật!</div>`
            : `<div style="display:grid;gap:8px">
                ${hist
                  .map(
                    (h, i) => `
                  <div class="mock-hist-row">
                    <div>
                      <div style="font-size:14.5px;font-weight:700">
                        Đề #${hist.length - i} · Tổng điểm dự kiến: <span style="color:var(--accent-strong)">${Number(h.total10).toFixed(2)} / 10.00</span>
                      </div>
                      <div style="font-family:var(--font-ui);font-size:12.6px;color:var(--mut);margin-top:3px">
                        Trắc nghiệm: <b>${h.mcqCorrect}/${h.mcqTotal}</b> (${Number(h.mcqScore4).toFixed(2)}/4.0) ·
                        Code: <b>${Number(h.codeScore6).toFixed(2)}/6.0</b> [${(h.codeItems || []).map((c) => `${c.id}: ${Number(c.score2).toFixed(1)}đ`).join(' · ')}] ·
                        Nộp lúc ${esc(formatSavedTime(h.submittedAt))}
                      </div>
                    </div>
                    <button type="button" class="btn sm primary" data-open-mock-hist="${esc(h.id)}">📖 Xem lại đề →</button>
                  </div>`
                  )
                  .join('')}
              </div>`
        }
      </section>
    </div>
  `;
}

function renderMcqPart() {
  const qs = mockSession.mcqQuestions;
  const letters = ['A', 'B', 'C', 'D'];
  const answered = Object.keys(mockSession.mcqPicks).length;
  return `
    <div class="mcq-exam-grid">
      <div class="mcq-list">
        ${qs
          .map((q, idx) => {
            const picked = mockSession.mcqPicks[idx];
            const flagged = mockSession.mcqFlags.has(idx);
            const reveal = mockSession.submitted;
            return `
              <article class="mcq-card" id="mockMcqCard-${idx}">
                <div class="mcq-card-head">
                  <div class="mcq-badges">
                    <span style="font-weight:700;color:var(--fg)">Câu ${idx + 1} / ${qs.length}</span>
                    <span class="pill-tag ch">${esc(CH_NAMES[q.chapter] || `Ch.${q.chapter}`)}</span>
                    ${q.tag === 'real-exam' ? `<span class="pill-tag real">★ Đề thật UET</span>` : ''}
                  </div>
                  <button type="button" class="flag-btn ${flagged ? 'flagged' : ''}" data-mock-flag="${idx}">${flagged ? '🚩 Đã đặt cờ' : '⚑ Đặt cờ'}</button>
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
                      return `<button type="button" class="mcq-opt ${cls}" data-mock-mcq-idx="${idx}" data-mock-mcq-opt="${oi}">
                        <span class="mcq-letter">${letters[oi]}.</span>
                        <span>${formatInlineCode(opt)}</span>
                      </button>`;
                    })
                    .join('')}
                </div>
                ${
                  reveal
                    ? `<div class="mcq-explain"><b>Giải thích (${letters[q.answer]} đúng):</b> ${formatInlineCode(q.explain)}</div>`
                    : ''
                }
              </article>`;
          })
          .join('')}
      </div>

      <aside class="exam-panel">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--mut)">Điều hướng Phần I (20 câu)</div>
        <div style="font-size:12.6px;color:var(--mut);margin:6px 0 10px">
          Đã chọn: <b>${answered}/${qs.length}</b> · Đặt cờ: <b>${mockSession.mcqFlags.size}</b>
        </div>
        <div class="exam-nav-grid">
          ${qs
            .map((q, idx) => {
              const picked = mockSession.mcqPicks[idx];
              let cls = '';
              if (mockSession.submitted) cls = picked === q.answer ? 'is-ok' : 'is-err';
              else if (typeof picked === 'number') cls = 'answered';
              if (mockSession.mcqFlags.has(idx)) cls += ' flagged';
              return `<button type="button" class="exam-nav-cell ${cls}" data-mock-scroll-mcq="${idx}">${idx + 1}</button>`;
            })
            .join('')}
        </div>
        <div style="display:grid;gap:7px">
          <button type="button" class="btn sm" data-mock-sec="code-0">Sang Phần II · Code 1 (Dễ) →</button>
          ${
            !mockSession.submitted
              ? `<button type="button" class="btn primary" id="btnSubmitMockSide" ${mockSession.submittingAll ? 'disabled' : ''}>${mockSession.submittingAll ? '⏳ Đang chấm toàn đề…' : 'Nộp bài & Chấm toàn đề'}</button>`
              : ''
          }
        </div>
      </aside>
    </div>
  `;
}

function renderCodePart(idx) {
  const q = mockSession.codeQuestions[idx];
  if (!q) return '';
  const draft = mockSession.codeDrafts[idx] || '';
  const run = mockSession.codeRuns[idx];
  const isRunning = mockSession.codeRunningIdx === idx;
  const submitted = mockSession.submitted;
  const rightView = submitted ? mockSession.codeRightView[idx] : 'editor';
  const leftView = submitted ? mockSession.codeLeftView[idx] : 'problem';
  const solLines = String(q.solution || '').trimEnd().split('\n');
  const spec = q.graderSpec || {};
  const tcList = REAL_TEST_CASES[q.id] || [];
  const hiddenCnt = tcList.filter((t) => t.hidden).length;

  let runBoxHtml = '';
  if (isRunning) {
    runBoxHtml = `<div style="font-size:13.2px;font-weight:700;color:#fbbf24">⏳ Đang biên dịch GCC Linux &amp; chạy ${tcList.length} test case (${hiddenCnt} test ẩn)…</div>`;
  } else if (run?.networkError) {
    runBoxHtml = `<div style="font-size:13px;color:#fca5a5">⚠ Lỗi kết nối máy chủ GCC (${esc(run.networkError)}). Điểm tạm tính theo kiểm tra tĩnh.</div>`;
  } else if (run?.compileError) {
    runBoxHtml = `
      <div style="font-size:13px;font-weight:700;color:#f06a6a">🔴 Lỗi Biên Dịch GCC (${esc(run.engine)}${run.elapsedMs ? ` · ${(run.elapsedMs / 1000).toFixed(2)}s` : ''})</div>
      <pre class="gcc-err-pre">${esc(run.compileError)}</pre>
    `;
  } else if (run && run.total > 0) {
    const allPass = run.passed === run.total;
    runBoxHtml = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
        <strong style="font-size:13.8px;color:${allPass ? '#4cc38a' : '#f0ab4c'}">
          ${allPass ? '✅ PASS 100% TEST MẪU & TEST ẨN!' : `⚠ Đạt ${run.passed}/${run.total} Test Case`}
          (${esc(run.engine)}${run.elapsedMs ? ` · ${(run.elapsedMs / 1000).toFixed(2)}s` : ''})
        </strong>
        <span style="font-family:var(--font-mono);font-size:13.5px;font-weight:700;color:#e5eaf2">Điểm câu này: ${mockSession.codeScores2[idx].toFixed(2)} / 2.00</span>
      </div>
      ${
        run.results?.length
          ? `<div class="tc-run-list">
              ${run.results
                .map(
                  (r) => `
                <div class="tc-run-row ${r.ok ? 'is-pass' : 'is-fail'}">
                  <div style="display:flex;justify-content:space-between;font-size:12.4px;font-weight:650">
                    <span style="color:#f1f5f9">${r.ok ? '✅' : '❌'} ${esc(r.name)} ${r.hidden ? '<span style="color:#94a3b8">(Ẩn)</span>' : ''}</span>
                    <span style="font-family:var(--font-mono);color:${r.ok ? '#4cc38a' : '#f06a6a'}">${esc(r.status)}</span>
                  </div>
                  ${!r.ok && r.hint ? `<div style="font-size:11.8px;color:#fde68a;margin-top:3px">💡 ${esc(r.hint)}</div>` : ''}
                </div>`
                )
                .join('')}
            </div>`
          : ''
      }
    `;
  } else {
    runBoxHtml = `<div style="font-size:12.5px;color:#94a3b8">🖥 <b>Biên dịch GCC Linux thật (${tcList.length} test · ${hiddenCnt} ẩn):</b> Bấm <b>▶ Chạy thử GCC</b> (hoặc <code>Ctrl+Enter</code>) để kiểm tra ngay trong phòng thi.</div>`;
  }

  return `
    <div class="studio-deck" id="mockStudioDeck">
      <div class="studio-split">
        <section class="pane-problem" id="mockLeftScroll">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px">
            <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap">
              <span class="mono" style="font-size:12px;font-weight:700;padding:2px 9px;border-radius:6px;background:var(--fg);color:var(--surface)">Câu Code ${idx + 1} · ${esc(q.id)}</span>
              <span class="diff-pill ${q.difficulty === 'Dễ' ? 'easy' : q.difficulty === 'Khó' ? 'hard' : 'medium'}">${esc(q.difficulty)} · 2,0đ</span>
              ${
                submitted
                  ? `<button type="button" class="left-explain-toggle ${leftView === 'explain' ? 'is-open' : ''}" id="btnMockToggleExplain">
                      ${leftView === 'explain' ? '📄 Xem Đề bài' : '📘 Mở Giải thích 5 tầng'}
                    </button>`
                  : `<span style="font-size:12px;color:var(--mut);font-family:var(--font-ui)">🔒 Giải thích mở sau khi nộp đề</span>`
              }
            </div>
            <span style="font-size:12px;color:var(--mut);font-family:var(--font-ui)">${esc(q.partLabel)}</span>
          </div>

          <h2 style="margin:0 0 10px;font-size:20px;line-height:1.3">${esc(q.title)}</h2>

          ${
            leftView === 'explain' && submitted
              ? renderCodeGuideUnlocked(q)
              : `<div class="static-rule-box">
                  <div><b>Kiểm tra tĩnh:</b> ${esc(q.staticSummary)}</div>
                  ${spec.requiredApis?.length ? `<div style="margin-top:4px"><b>API bắt buộc:</b> ${spec.requiredApis.map((a) => `<code>${esc(a)}</code>`).join(' ')}</div>` : ''}
                  ${spec.forbiddenApis?.length ? `<div style="margin-top:4px;color:var(--ink-err)"><b>Hàm bị cấm:</b> ${spec.forbiddenApis.map((a) => `<code>${esc(a)}</code>`).join(' ')}</div>` : ''}
                </div>
                <p style="margin:0 0 12px;font-size:15px;line-height:1.68;color:var(--fg-body)">${esc(q.prompt)}</p>
                <h3 style="font-size:15px;margin:10px 0 6px">Yêu cầu bắt buộc</h3>
                <ul style="margin:0 0 12px;padding-left:20px;font-size:14.4px;line-height:1.6;color:var(--fg-body)">
                  ${(q.requirements || []).map((r) => `<li>${esc(r)}</li>`).join('')}
                </ul>
                <div style="padding:11px 13px;border-radius:10px;background:var(--surface-sub);border:1px solid var(--bd);font-size:14px;display:grid;gap:4px">
                  <div><b>Input:</b> ${esc(q.inputSpec)}</div>
                  <div><b>Output:</b> ${esc(q.outputSpec)}</div>
                  ${q.constraints?.length ? `<div><b>Ràng buộc:</b> ${q.constraints.map((c) => `<code>${esc(c)}</code>`).join(' · ')}</div>` : ''}
                </div>
                ${
                  q.example
                    ? `<div style="margin-top:12px">
                        <div class="io-grid">
                          <div class="io-box"><div class="io-label">stdin</div><pre class="io-pre">${esc(q.example.input || '(rỗng)')}</pre></div>
                          <div class="io-box"><div class="io-label">stdout</div><pre class="io-pre">${esc(q.example.output || '')}</pre></div>
                        </div>
                      </div>`
                    : ''
                }`
          }
        </section>

        <div class="pane-code">
          <div class="code-window">
            <div class="code-win-bar">
              <div class="win-tabs">
                <button type="button" class="win-tab ${rightView === 'editor' ? 'active' : ''}" data-mock-rview="editor">✍ Bài làm của bạn</button>
                ${
                  submitted
                    ? `<button type="button" class="win-tab ${rightView === 'solution' ? 'active' : ''}" data-mock-rview="solution">📖 Đáp án chuẩn</button>`
                    : `<span style="padding:5px 10px;font-size:11.8px;color:#94a3b8">🔒 Đáp án ẩn trong giờ thi</span>`
                }
              </div>
              <div class="win-actions">
                ${
                  rightView === 'editor'
                    ? `<button type="button" class="win-btn grade" id="btnMockRunGcc" ${isRunning || mockSession.submittingAll ? 'disabled' : ''}>${isRunning ? '⏳ Đang chạy GCC…' : '▶ Chạy thử GCC'}</button>`
                    : ''
                }
              </div>
            </div>

            <div class="code-scroll-body">
              ${
                rightView === 'editor'
                  ? `<div class="editor-ide-wrap">
                       <div class="editor-gutter" id="mockEditorGutter" aria-hidden="true"><div class="eg-ln is-active">1</div></div>
                       <div class="editor-stage">
                         <div class="editor-active-line" aria-hidden="true"></div>
                         <pre class="editor-highlight-layer" aria-hidden="true"><code class="editor-highlight-code"></code></pre>
                         <textarea class="code-editor-area is-live-color" id="mockCodeInput" spellcheck="false" autocomplete="off" wrap="off" ${submitted ? 'readonly' : ''} placeholder="// Gõ lời giải C11 cho ${esc(q.id)} (${esc(q.difficulty)}) tại đây (tô màu cú pháp trực tiếp)...&#10;// Chuyển qua lại Phần I / Code 1 / Code 2 / Code 3 KHÔNG bị mất bài!&#10;// Bấm Ctrl+Enter để chạy thử GCC Linux ngay trong phòng thi.">${esc(draft)}</textarea>
                       </div>
                     </div>`
                  : `<div class="code-numbered">
                       ${solLines.map((ln, i) => `<div class="code-ln"><span class="code-ln-num">${i + 1}</span><span class="code-ln-src">${highlightCodeSnippet(ln)}</span></div>`).join('')}
                     </div>`
              }
            </div>

            <div class="code-win-foot">
              <span class="mono" id="mockCursorPos" style="color:#cbd5e1;font-weight:600">Dòng 1, Cột 1</span>
              <span>Điểm câu ${idx + 1}: <b style="color:#e5eaf2">${mockSession.codeScores2[idx].toFixed(2)} / 2.00</b></span>
            </div>
          </div>
        </div>
      </div>

      <section class="grade-box grade-panel-bottom" id="mockGradeBox">${runBoxHtml}</section>
    </div>
  `;
}

export function renderMockExamView(state) {
  if (!mockSession.active) return renderLanding(state);

  const mcqAnswered = Object.keys(mockSession.mcqPicks).length;
  let mcqCorrect = 0;
  mockSession.mcqQuestions.forEach((q, i) => {
    if (mockSession.mcqPicks[i] === q.answer) mcqCorrect++;
  });
  const mcqScore4 = Number(((mcqCorrect / Math.max(1, mockSession.mcqQuestions.length)) * 4.0).toFixed(2));
  const codeScore6 = Number(mockSession.codeScores2.reduce((a, b) => a + b, 0).toFixed(2));
  const total10 = Number((mcqScore4 + codeScore6).toFixed(2));

  return `
    <div class="mock-shell" id="mockExamRoot">
      <div class="mock-room-bar">
        <div class="mock-sec-tabs" role="tablist">
          <button type="button" class="mock-sec-btn ${mockSession.section === 'mcq' ? 'active' : ''}" data-mock-sec="mcq">
            📝 Phần I · 20 Trắc nghiệm <span class="tab-badge">${mcqAnswered}/20</span>
          </button>
          ${mockSession.codeQuestions
            .map((cq, i) => {
              const hasCode = Boolean((mockSession.codeDrafts[i] || '').trim());
              const sc = mockSession.codeScores2[i];
              return `
                <button type="button" class="mock-sec-btn ${mockSession.section === `code-${i}` ? 'active' : ''}" data-mock-sec="code-${i}">
                  💻 Code ${i + 1} (${esc(cq.difficulty)}) · ${esc(cq.id)}
                  <span class="tab-badge ${sc >= 1.99 ? 'is-new' : ''}">${mockSession.submitted || sc > 0 ? `${sc.toFixed(1)}đ` : hasCode ? 'Đã viết' : 'Trống'}</span>
                </button>`;
            })
            .join('')}
        </div>

        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <div class="mock-timer-pill" id="mockExamTimer">⏱ ${formatClock(mockSession.secondsLeft)}</div>
          ${
            !mockSession.submitted
              ? `<button type="button" class="btn primary" id="btnSubmitMockTop" ${mockSession.submittingAll ? 'disabled' : ''}>${mockSession.submittingAll ? '⏳ Đang chấm GCC toàn đề…' : '✅ Nộp bài & Chấm toàn đề'}</button>`
              : `<button type="button" class="btn primary" id="btnMockNewExam">↻ Bốc đề mới</button>`
          }
          <button type="button" class="btn sm ghost" id="btnMockExitRoom">← Thoát phòng thi</button>
        </div>
      </div>

      ${
        mockSession.submitted
          ? `<div class="score-summary-banner" style="margin-bottom:12px">
              <div>
                <div style="font-size:16px;font-weight:750">
                  🏁 Kết Quả Thi Thử Toàn Diện — Dự kiến: <span style="font-size:19px">${total10.toFixed(2)} / 10.00 điểm</span>
                </div>
                <div style="font-size:13.6px;margin-top:4px">
                  <b>Phần I (Trắc nghiệm):</b> ${mcqCorrect}/20 câu → <b>${mcqScore4.toFixed(2)} / 4.00đ</b> &nbsp;·&nbsp;
                  <b>Phần II (3 câu Code):</b> <b>${codeScore6.toFixed(2)} / 6.00đ</b>
                  (${mockSession.codeQuestions.map((cq, i) => `${cq.id}: ${mockSession.codeScores2[i].toFixed(2)}đ`).join(' · ')})
                </div>
                <div style="font-size:12.6px;margin-top:3px;opacity:0.9">
                  Đã mở khóa toàn bộ Đáp án &amp; Giải thích Trắc nghiệm + Đáp án chuẩn &amp; Giải thích 5 tầng cho cả 3 câu Code!
                </div>
              </div>
            </div>`
          : ''
      }

      ${
        mockSession.section === 'mcq'
          ? renderMcqPart()
          : renderCodePart(Number(mockSession.section.split('-')[1]) || 0)
      }
    </div>
  `;
}

export function bindMockExamView(state, bank, persist, rerender) {
  const root = document.getElementById('mockExamRoot');
  if (root) renderLatexInElement(root);

  document.querySelectorAll('[data-mock-strategy]').forEach((b) => {
    b.addEventListener('click', () => {
      mockSession.mcqStrategy = b.dataset.mockStrategy === 'uniform' ? 'uniform' : 'uet';
      rerender();
    });
  });

  document.getElementById('btnStartFullMock')?.addEventListener('click', () => {
    startNewMockExam(bank, state, persist, rerender);
    rerender();
    scrollTopInstant();
  });

  document.querySelectorAll('[data-open-mock-hist]').forEach((b) => {
    b.addEventListener('click', () => {
      const rec = (state.mockExamHistory || []).find((x) => x.id === b.dataset.openMockHist);
      if (rec) {
        openSavedFullMockExam(rec);
        rerender();
        scrollTopInstant();
      }
    });
  });

  document.getElementById('btnMockNewExam')?.addEventListener('click', () => {
    startNewMockExam(bank, state, persist, rerender);
    rerender();
    scrollTopInstant();
  });

  document.getElementById('btnMockExitRoom')?.addEventListener('click', () => {
    stopTimer();
    mockSession.active = false;
    rerender();
    scrollTopInstant();
  });

  document.querySelectorAll('[data-mock-sec]').forEach((b) => {
    b.addEventListener('click', () => {
      mockSession.section = b.dataset.mockSec;
      rerender();
      scrollTopInstant();
    });
  });

  const doSubmit = () => submitFullMockExam(state, bank, persist, rerender);
  document.getElementById('btnSubmitMockTop')?.addEventListener('click', doSubmit);
  document.getElementById('btnSubmitMockSide')?.addEventListener('click', doSubmit);

  // Part I MCQ handlers
  document.querySelectorAll('[data-mock-flag]').forEach((b) => {
    b.addEventListener('click', () => {
      const idx = Number(b.dataset.mockFlag);
      if (mockSession.mcqFlags.has(idx)) mockSession.mcqFlags.delete(idx);
      else mockSession.mcqFlags.add(idx);
      rerender();
    });
  });

  document.querySelectorAll('[data-mock-scroll-mcq]').forEach((b) => {
    b.addEventListener('click', () => {
      document.getElementById(`mockMcqCard-${b.dataset.mockScrollMcq}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.querySelectorAll('[data-mock-mcq-opt]').forEach((b) => {
    b.addEventListener('click', () => {
      if (mockSession.submitted) return;
      const idx = Number(b.dataset.mockMcqIdx);
      const opt = Number(b.dataset.mockMcqOpt);
      mockSession.mcqPicks[idx] = opt;
      rerender();
    });
  });

  // Part II Code handlers
  if (mockSession.section.startsWith('code-')) {
    const cIdx = Number(mockSession.section.split('-')[1]) || 0;

    document.querySelectorAll('[data-mock-rview]').forEach((b) => {
      b.addEventListener('click', () => {
        if (!mockSession.submitted) return;
        mockSession.codeRightView[cIdx] = b.dataset.mockRview === 'solution' ? 'solution' : 'editor';
        rerender();
      });
    });

    document.getElementById('btnMockToggleExplain')?.addEventListener('click', () => {
      if (!mockSession.submitted) return;
      mockSession.codeLeftView[cIdx] = mockSession.codeLeftView[cIdx] === 'explain' ? 'problem' : 'explain';
      rerender();
    });

    const runOne = async () => {
      await gradeSingleMockCode(cIdx, rerender);
      rerender();
    };
    document.getElementById('btnMockRunGcc')?.addEventListener('click', runOne);

    const ed = document.getElementById('mockCodeInput');
    if (ed) {
      attachIdeEditor(
        ed,
        document.getElementById('mockEditorGutter'),
        document.getElementById('mockCursorPos'),
        (val) => {
          mockSession.codeDrafts[cIdx] = val;
        },
        mockSession.submitted ? null : runOne
      );
    }
  }
}
