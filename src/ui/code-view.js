import { esc, highlightCodeSnippet, scrollTopInstant } from '../core/dom.js';
import { OFFICIAL_SEB_50, SEB_PARTS, gradeSubmission } from '../../data/code-50/index.js';
import { REAL_TEST_CASES } from '../../data/code-50/test-cases.js';
import { runRealTestSuite } from '../core/c-runner.js';

const DIFFICULTIES = ['all', 'Dễ', 'Trung bình', 'Khó'];

function diffClass(d) {
  if (d === 'Dễ') return 'easy';
  if (d === 'Khó') return 'hard';
  return 'medium';
}

function getFiltered(state) {
  return OFFICIAL_SEB_50.filter((q) => {
    const okPart = state.sebPartFilter === 'all' || q.part === state.sebPartFilter;
    const okDiff = state.sebDiffFilter === 'all' || q.difficulty === state.sebDiffFilter;
    return okPart && okDiff;
  });
}

function getCellClass(state, id) {
  if (state.solvedCodeIds.has(id)) return 'is-mastered';
  const rec = state.sebScores?.[id];
  if (!rec) return '';
  if (rec.tier === 'mastered') return 'is-mastered';
  if (rec.tier === 'good') return 'is-good';
  if (rec.tier === 'fail') return 'is-fail';
  return '';
}

function renderGradeBox(state, q) {
  const rep = state.sebLastReports?.[q.id];
  const realRun = state.sebRealRuns?.[q.id];
  const isRunning = state.sebRunningId === q.id;
  const tcList = REAL_TEST_CASES[q.id] || [];
  const hiddenCnt = tcList.filter((t) => t.hidden).length;
  const prev = state.sebScores?.[q.id];

  if (isRunning) {
    return `
      <div class="grade-box" id="gradeResultBox">
        <div style="font-size:13.6px;font-weight:700;color:#fbbf24">⏳ ${esc(state.sebRunStatus || 'Đang biên dịch GCC Linux & chạy test ẩn…')}</div>
        <div style="font-size:12.2px;color:#94a3b8;margin-top:4px">
          Mã nguồn của bạn đang được biên dịch thật bằng <code>gcc -O2 -std=c11 -pthread</code> trên máy chủ Linux và chạy lần lượt ${tcList.length} test case (gồm ${hiddenCnt} test ẩn).
        </div>
      </div>
    `;
  }

  if (!rep && !realRun) {
    return `
      <div class="grade-box">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
          <strong style="font-size:13.4px;color:#f8fafc">Trình Biên Dịch GCC Thật + ${tcList.length} Test Case (${hiddenCnt} Test Ẩn)</strong>
          ${
            prev
              ? `<span style="font-size:12px;color:#4cc38a;font-weight:700">Điểm gần nhất: ${Number(prev.score10).toFixed(1)} / 10.0</span>`
              : `<span style="font-size:12px;color:#94a3b8">Ctrl + Enter: Biên dịch GCC &amp; Chạy test ẩn</span>`
          }
        </div>
        <div style="font-size:12.4px;color:#94a3b8;margin-top:5px;line-height:1.55">
          Bấm <b>▶ Biên dịch &amp; Chấm Test ẩn</b> để biên dịch C thật trên Linux (<code>gcc -std=c11 -pthread</code>), tự tạo tệp sandbox và kiểm tra chi tiết từng test case bạn còn thiếu!
        </div>
      </div>
    `;
  }

  let realHtml = '';
  if (realRun) {
    if (realRun.networkError) {
      realHtml = `
        <div class="tc-run-row is-fail" style="margin-bottom:10px">
          <div style="font-size:13px;font-weight:700;color:#f06a6a">⚠ Không kết nối được máy chủ biên dịch GCC (${esc(realRun.networkError)})</div>
          <div style="font-size:12.2px;color:#cbd5e1;margin-top:3px">Hệ thống vẫn hiển thị kết quả Kiểm tra tĩnh 5 tiêu chí bên dưới. Hãy kiểm tra kết nối mạng rồi thử lại.</div>
        </div>
      `;
    } else if (realRun.compileError) {
      realHtml = `
        <div class="tc-run-row is-fail" style="margin-bottom:10px">
          <div style="font-size:13.4px;font-weight:700;color:#f06a6a">🔴 Lỗi Biên Dịch GCC (Compile Error · ${esc(realRun.engine)})</div>
          <pre class="gcc-err-pre">${esc(realRun.compileError)}</pre>
        </div>
      `;
    } else {
      const allPass = realRun.passed === realRun.total && realRun.total > 0;
      const missingNames = realRun.results.filter((r) => !r.ok).map((r) => r.name);
      realHtml = `
        <div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
            <div>
              <div style="font-size:11.2px;color:#94a3b8;text-transform:uppercase">Biên dịch &amp; Chạy thật · ${esc(realRun.engine)}</div>
              <div style="font-size:14.8px;font-weight:700;color:${allPass ? '#4cc38a' : '#f0ab4c'}">
                ${allPass ? '✅ PASS 100% TẤT CẢ TEST MẪU & TEST ẨN!' : `⚠ Đạt ${realRun.passed}/${realRun.total} Test Case — Còn thiếu ${realRun.total - realRun.passed} test`}
              </div>
            </div>
            <div style="font-family:var(--font-mono);font-size:16px;font-weight:700;padding:4px 11px;border-radius:8px;background:${allPass ? 'rgba(76,195,138,0.2)' : 'rgba(240,171,76,0.2)'};color:${allPass ? '#4cc38a' : '#f0ab4c'}">
              ${realRun.passed} / ${realRun.total} PASS
            </div>
          </div>

          ${
            missingNames.length
              ? `<div style="margin-top:6px;font-size:12.4px;color:#fecaca"><b>Test còn sai/thiếu:</b> ${missingNames.map((n) => esc(n)).join(' · ')}</div>`
              : ''
          }

          <div class="tc-run-list">
            ${realRun.results
              .map(
                (r) => `
              <div class="tc-run-row ${r.ok ? 'is-pass' : 'is-fail'}">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12.8px;font-weight:650">
                  <span style="color:#f1f5f9">${r.ok ? '✅' : '❌'} ${esc(r.name)} ${r.hidden ? '<span style="font-size:11px;color:#94a3b8;font-weight:500">(Ẩn)</span>' : ''}</span>
                  <span style="font-family:var(--font-mono);font-size:11.6px;color:${r.ok ? '#4cc38a' : '#f06a6a'}">${esc(r.status)}${r.signal ? ` (${esc(r.signal)})` : ''}</span>
                </div>
                ${
                  !r.ok
                    ? `${r.hint ? `<div style="font-size:12.2px;color:#fde68a;margin-top:4px">💡 Gợi ý sửa: ${esc(r.hint)}</div>` : ''}
                       ${r.fileFailReason ? `<div style="font-size:12.2px;color:#fca5a5;margin-top:4px">📁 Kiểm tra tệp đích: ${esc(r.fileFailReason)}</div>` : ''}
                       <div class="tc-diff-grid">
                         <div>
                           <div style="font-size:11px;color:#94a3b8;margin-bottom:2px">Kỳ vọng (Expected)</div>
                           <div class="tc-diff-box">${esc(r.expected || '(rỗng)')}</div>
                         </div>
                         <div>
                           <div style="font-size:11px;color:#94a3b8;margin-bottom:2px">Chương trình in ra (Actual)</div>
                           <div class="tc-diff-box">${esc(r.actual || '(không in gì)')}</div>
                         </div>
                       </div>`
                    : ''
                }
              </div>`
              )
              .join('')}
          </div>
        </div>
      `;
    }
  }

  let staticHtml = '';
  if (rep) {
    staticHtml = `
      <details ${!realRun ? 'open' : ''} style="margin-top:6px">
        <summary style="cursor:pointer;font-size:12.6px;font-weight:650;color:#cbd5e1">
          Kiểm tra tĩnh Precheck (API bắt buộc &amp; Hàm cấm): <b style="color:${rep.score10 >= 9 ? '#4cc38a' : '#f0ab4c'}">${rep.score10.toFixed(1)} / 10.0</b> — ${esc(rep.badge)}
        </summary>
        ${
          rep.criteria?.length
            ? rep.criteria
                .map(
                  (c) => `
                <div class="grade-crit">
                  <div style="display:flex;justify-content:space-between;font-size:12.2px;font-weight:650">
                    <span style="color:#f1f5f9">${esc(c.name)}</span>
                    <span style="color:${c.status === 'ok' ? '#4cc38a' : c.status === 'warn' ? '#f0ab4c' : '#f06a6a'}">
                      ${c.status === 'ok' ? '✓' : c.status === 'warn' ? '⚠' : '✕'} ${c.score.toFixed(2)}/${c.max.toFixed(1)}đ
                    </span>
                  </div>
                  <div style="font-size:11.8px;color:#94a3b8;margin-top:2px">${esc(c.detail)}</div>
                </div>`
                )
                .join('')
            : ''
        }
      </details>
    `;
  }

  return `<div class="grade-box" id="gradeResultBox">${realHtml}${staticHtml}</div>`;
}

function renderDetailGuideInline(q) {
  const g = q.detailGuide;
  if (!g) return '';

  return `
    <div style="display:grid;gap:18px;margin-top:8px">
      <!-- Tầng 1 -->
      <div>
        <h3 class="guide-block-title"><span class="guide-num">1</span> Bản chất &amp; Thuộc Chương / Bài học nào</h3>
        <p style="margin:0;font-size:15.2px;line-height:1.68;color:var(--fg-body)">${esc(g.origin)}</p>
        ${
          q.relatedTopics?.length
            ? `<div class="chip-wrap">
                ${q.relatedTopics
                  .map((rt) => `<button type="button" class="link-chip" data-goto-book-topic="${esc(rt.id)}">📖 Mở bài ${esc(rt.label)} →</button>`)
                  .join('')}
              </div>`
            : ''
        }
      </div>

      <!-- Tầng 2 -->
      <div>
        <h3 class="guide-block-title"><span class="guide-num">2</span> Giải thích Chi tiết Từng Dòng Lệnh &amp; Hàm Sử Dụng</h3>
        <div class="line-explain-list">
          ${(g.lineByLine || [])
            .map(
              (row) => `
            <div class="line-explain-row">
              <div class="line-explain-top">
                <span class="line-badge">${esc(row.lines)}</span>
                <span class="line-cmd">${esc(row.code)}</span>
              </div>
              <div style="font-size:14.6px;line-height:1.62;color:var(--fg-body)">${esc(row.explain)}</div>
            </div>`
            )
            .join('')}
        </div>
      </div>

      <!-- Tầng 3 -->
      <div>
        <h3 class="guide-block-title"><span class="guide-num">3</span> Bảng Bảo Đảm Toàn Bộ Test Case &amp; Trường Hợp Biên</h3>
        <div style="overflow-x:auto">
          <table class="tc-table">
            <thead>
              <tr>
                <th style="width:24%">Nhóm Test Case</th>
                <th style="width:28%">Tình huống / Dữ liệu mẫu</th>
                <th>Cách đoạn code xử lý chính xác</th>
              </tr>
            </thead>
            <tbody>
              ${(g.testCases || [])
                .map(
                  (tc) => `
                <tr>
                  <td><b>${esc(tc.name)}</b></td>
                  <td><code>${esc(tc.caseDesc)}</code></td>
                  <td>${esc(tc.howHandled)}</td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tầng 4 -->
      <div>
        <h3 class="guide-block-title"><span class="guide-num">4</span> Công Thức Nhớ Nhanh Vào Phòng Thi SEB</h3>
        <ol class="recipe-list">
          ${(g.examRecipe || []).map((step) => `<li>${esc(step)}</li>`).join('')}
        </ol>
      </div>
    </div>
  `;
}

function renderProblemBody(activeQ, spec) {
  return `
    <div class="static-rule-box">
      <div><b>Kiểm tra tĩnh CodeRunner:</b> ${esc(activeQ.staticSummary)}</div>
      ${spec.requiredApis?.length ? `<div style="margin-top:4px"><b>API bắt buộc:</b> ${spec.requiredApis.map((a) => `<code>${esc(a)}</code>`).join(' ')}</div>` : ''}
      ${spec.forbiddenApis?.length ? `<div style="margin-top:4px;color:var(--ink-err)"><b>Hàm bị cấm:</b> ${spec.forbiddenApis.map((a) => `<code>${esc(a)}</code>`).join(' ')}</div>` : ''}
    </div>

    <h3 style="font-size:16px;margin:14px 0 6px">Đề bài</h3>
    <p style="margin:0 0 14px;font-size:15.5px;line-height:1.68;color:var(--fg-body)">${esc(activeQ.prompt)}</p>

    <h3 style="font-size:16px;margin:12px 0 6px">Yêu cầu bắt buộc</h3>
    <ul style="margin:0 0 14px;padding-left:20px;font-size:14.8px;line-height:1.62;color:var(--fg-body)">
      ${(activeQ.requirements || []).map((r) => `<li>${esc(r)}</li>`).join('')}
    </ul>

    <div style="padding:12px 14px;border-radius:11px;background:var(--surface-sub);border:1px solid var(--bd);font-size:14.4px;display:grid;gap:5px">
      <div><b>Input:</b> ${esc(activeQ.inputSpec)}</div>
      <div><b>Output:</b> ${esc(activeQ.outputSpec)}</div>
      ${activeQ.constraints?.length ? `<div><b>Ràng buộc:</b> ${activeQ.constraints.map((c) => `<code>${esc(c)}</code>`).join(' · ')}</div>` : ''}
    </div>

    ${
      activeQ.example
        ? `<div style="margin-top:14px">
            <div style="font-family:var(--font-ui);font-size:13.2px;font-weight:700;margin-bottom:4px">Ví dụ kiểm thử chuẩn</div>
            ${activeQ.example.note ? `<div style="font-size:13.6px;color:var(--mut);margin-bottom:6px"><i>${esc(activeQ.example.note)}</i></div>` : ''}
            <div class="io-grid">
              <div class="io-box"><div class="io-label">stdin</div><pre class="io-pre">${esc(activeQ.example.input || '(rỗng)')}</pre></div>
              <div class="io-box"><div class="io-label">stdout</div><pre class="io-pre">${esc(activeQ.example.output || '')}</pre></div>
            </div>
          </div>`
        : ''
    }

    ${
      activeQ.relatedQuestions?.length
        ? `<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--bd)">
            <div style="font-family:var(--font-ui);font-size:12.4px;font-weight:700;color:var(--mut)">Câu cùng dạng để luyện liền mạch:</div>
            <div class="chip-wrap">
              ${activeQ.relatedQuestions
                .map((rqId) => {
                  const rq = OFFICIAL_SEB_50.find((x) => x.id === rqId);
                  return rq ? `<button type="button" class="link-chip" data-pick-cr="${esc(rq.id)}">${esc(rq.id)} · ${esc(rq.title)}</button>` : '';
                })
                .join('')}
            </div>
          </div>`
        : ''
    }
  `;
}

export function renderCodeView(state) {
  const filtered = getFiltered(state);
  const pool = filtered.length ? filtered : OFFICIAL_SEB_50;
  const activeQ = pool.find((q) => q.id === state.sebSelectedId) || pool[0];
  const idx = pool.findIndex((q) => q.id === activeQ.id);
  const prevQ = idx > 0 ? pool[idx - 1] : null;
  const nextQ = idx >= 0 && idx + 1 < pool.length ? pool[idx + 1] : null;

  const isSolved = state.solvedCodeIds.has(activeQ.id) || state.sebScores?.[activeQ.id]?.tier === 'mastered';
  const draftVal = state.codeDrafts[activeQ.id] ?? ''; // Blank 100% by default!
  const solLines = String(activeQ.solution || '').trimEnd().split('\n');
  const spec = activeQ.graderSpec || {};

  return `
    <div class="code-studio">
      <section class="studio-header">
        <div class="studio-row">
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${SEB_PARTS.map(
              (p) => `<button type="button" class="btn sm ${state.sebPartFilter === p.id ? 'active' : ''}" data-seb-part="${esc(p.id)}">${esc(p.label)}</button>`
            ).join('')}
          </div>

          <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
            ${DIFFICULTIES.map(
              (d) => `<button type="button" class="btn sm ${state.sebDiffFilter === d ? 'active' : ''}" data-seb-diff="${esc(d)}">${d === 'all' ? 'Mọi mức độ' : esc(d)}</button>`
            ).join('')}
            <button type="button" class="btn sm accent" id="btnRandomCode">🎲 Bốc ngẫu nhiên</button>
            <button type="button" class="btn sm" id="btnFlipStudioSide">⇄ Code ${state.codeSide === 'left' ? 'Trái' : 'Phải'}</button>
          </div>
        </div>

        <div class="matrix-50" aria-label="Chọn câu từ 01 đến 50">
          ${pool
            .map((q) => {
              const cls = getCellClass(state, q.id);
              return `<button type="button" class="m50-cell ${cls} ${q.id === activeQ.id ? 'active' : ''}" data-pick-cr="${esc(q.id)}" title="${esc(q.id)} (${esc(q.difficulty)}): ${esc(q.title)}">${String(q.num).padStart(2, '0')}</button>`;
            })
            .join('')}
        </div>
      </section>

      <div class="studio-split ${state.codeSide === 'left' ? 'is-code-left' : ''}">
        <!-- Left Independent Scroll Pane: Problem Statement OR 4-Layer Detailed Code Explanation -->
        <section class="pane-problem" id="paneLeftScroll">
          <div class="sheet-running-head" style="margin-bottom:10px">
            <span>${esc(activeQ.partLabel)}</span>
            <div style="display:flex;gap:6px;align-items:center">
              ${prevQ ? `<button type="button" class="btn sm" data-pick-cr="${esc(prevQ.id)}">‹ ${esc(prevQ.id)}</button>` : ''}
              ${nextQ ? `<button type="button" class="btn sm" data-pick-cr="${esc(nextQ.id)}">${esc(nextQ.id)} ›</button>` : ''}
              <button type="button" class="btn sm ${isSolved ? 'active' : ''}" id="btnToggleSolved">${isSolved ? '✓ Đã thuộc' : 'Đánh dấu đã thuộc'}</button>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px">
            <span class="mono" style="font-size:12.8px;font-weight:700;padding:3px 10px;border-radius:7px;background:var(--fg);color:var(--surface)">${esc(activeQ.id)}</span>
            <span class="diff-pill ${diffClass(activeQ.difficulty)}">${esc(activeQ.difficulty)}</span>
            <button type="button" class="left-explain-toggle ${state.sebLeftView === 'explain' ? 'is-open' : ''}" id="btnToggleLeftExplain" title="Bật/tắt Giải thích code 4 tầng ngay bên trái để vừa xem giải thích vừa đối chiếu code bên phải (Alt + E)">
              ${state.sebLeftView === 'explain' ? '📄 Đóng giải thích · Xem Đề bài' : '📘 Mở giải thích code (4 tầng)'}
            </button>
          </div>

          <h1 style="margin:0 0 10px;font-size:22px;line-height:1.3">${esc(activeQ.title)}</h1>

          ${state.sebLeftView === 'explain' ? renderDetailGuideInline(activeQ) : renderProblemBody(activeQ, spec)}
        </section>

        <!-- Right Independent Scroll Pane: Blank Code Editor OR Clean Simplified C11 Solution -->
        <div class="pane-code">
          <div class="code-window">
            <div class="code-win-bar">
              <div class="win-tabs" role="tablist">
                <button type="button" class="win-tab ${state.sebMode === 'practice' ? 'active' : ''}" data-seb-mode="practice">✍ Tự viết Code</button>
                <button type="button" class="win-tab ${state.sebMode === 'solution' ? 'active' : ''}" data-seb-mode="solution">📖 Đáp án chuẩn</button>
              </div>

              <div class="win-actions">
                ${
                  state.sebMode === 'practice'
                    ? `<button type="button" class="win-btn" id="btnClearEditor" title="Xóa trắng khung để gõ lại từ đầu">Xóa trắng</button>
                       <button type="button" class="win-btn" id="btnCopyEditor">Chép</button>
                       <button type="button" class="win-btn" id="btnStaticCheck" title="Kiểm tra nhanh API bắt buộc & hàm cấm (không cần mạng)">Kiểm tra tĩnh</button>
                       <button type="button" class="win-btn grade" id="btnRunRealGcc" ${state.sebRunningId === activeQ.id ? 'disabled' : ''}>${state.sebRunningId === activeQ.id ? '⏳ Đang chạy GCC…' : '▶ Biên dịch & Chấm Test ẩn'}</button>`
                    : `<button type="button" class="win-btn" id="btnCopyEditor">Sao chép Code</button>
                       <button type="button" class="win-btn" data-seb-mode="practice">← Quay lại tự gõ</button>`
                }
              </div>
            </div>

            <div class="hotkey-ribbon">
              <span>⚡ <kbd class="kbd" style="background:#262b38;color:#fff;border-color:#444d63">Alt+A</kbd>/<kbd class="kbd" style="background:#262b38;color:#fff;border-color:#444d63">F2</kbd> Tự gõ ⇄ Đáp án &nbsp;·&nbsp; <kbd class="kbd" style="background:#262b38;color:#fff;border-color:#444d63">Alt+E</kbd> Đề bài ⇄ Giải thích bên trái</span>
              <button type="button" class="win-btn" id="btnQuickFlipAnswer" style="padding:3px 9px;font-size:11.6px">
                ${state.sebMode === 'practice' ? 'Xem Đáp án ngay →' : '← Về khung Tự gõ'}
              </button>
            </div>

            <div class="code-scroll-body">
              ${
                state.sebMode === 'practice'
                  ? `<textarea class="code-editor-area" id="codePracticeInput" spellcheck="false" placeholder="// Khung trống hoàn toàn — hãy tự gõ lại toàn bộ #include, hàm main() và lời giải C11 ở đây để ghi nhớ chắc chắn!&#10;// Bấm Alt+A (hoặc F2) bất cứ lúc nào để đảo sang Đáp án chuẩn bên phải.&#10;// Bấm Alt+E (hoặc nút 'Mở giải thích code' cạnh chữ Dễ) để xem giải thích 4 tầng ngay bên trái!&#10;// Bấm Ctrl+Enter để chấm điểm mô phỏng CodeRunner.">${esc(draftVal)}</textarea>
                     ${renderGradeBox(state, activeQ)}`
                  : `<div class="code-numbered">
                      ${solLines
                        .map(
                          (ln, i) => `<div class="code-ln"><span class="code-ln-num">${i + 1}</span><span class="code-ln-src">${highlightCodeSnippet(ln)}</span></div>`
                        )
                        .join('')}
                    </div>`
              }
            </div>

            <div class="code-win-foot">
              <span>Biên dịch Sandbox: <code style="color:#e5eaf2">${esc(spec.compileFlags || 'gcc -O2 -Wall -Wextra -std=c11 -pthread')}</code></span>
              <span>${solLines.length} dòng code chuẩn đơn giản · Cuộn độc lập 2 bên</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function bindCodeView(state, persist, rerender) {
  const filtered = getFiltered(state);
  const pool = filtered.length ? filtered : OFFICIAL_SEB_50;
  const activeQ = pool.find((q) => q.id === state.sebSelectedId) || pool[0];

  const flipMode = () => {
    state.sebMode = state.sebMode === 'practice' ? 'solution' : 'practice';
    persist();
    rerender();
  };

  document.querySelectorAll('[data-seb-mode]').forEach((b) => {
    b.addEventListener('click', () => {
      state.sebMode = b.dataset.sebMode === 'solution' ? 'solution' : 'practice';
      persist();
      rerender();
    });
  });

  document.getElementById('btnQuickFlipAnswer')?.addEventListener('click', flipMode);

  document.getElementById('btnToggleLeftExplain')?.addEventListener('click', () => {
    state.sebLeftView = state.sebLeftView === 'explain' ? 'problem' : 'explain';
    persist();
    rerender();
  });

  document.querySelectorAll('[data-seb-part]').forEach((b) => {
    b.addEventListener('click', () => {
      state.sebPartFilter = b.dataset.sebPart;
      const nf = getFiltered(state);
      if (nf.length && !nf.some((x) => x.id === state.sebSelectedId)) state.sebSelectedId = nf[0].id;
      persist();
      rerender();
    });
  });

  document.querySelectorAll('[data-seb-diff]').forEach((b) => {
    b.addEventListener('click', () => {
      state.sebDiffFilter = b.dataset.sebDiff;
      const nf = getFiltered(state);
      if (nf.length && !nf.some((x) => x.id === state.sebSelectedId)) state.sebSelectedId = nf[0].id;
      persist();
      rerender();
    });
  });

  document.querySelectorAll('[data-pick-cr]').forEach((b) => {
    b.addEventListener('click', () => {
      const id = b.dataset.pickCr;
      state.sebSelectedId = id;
      if (!getFiltered(state).some((x) => x.id === id)) {
        state.sebPartFilter = 'all';
        state.sebDiffFilter = 'all';
      }
      persist();
      rerender();
      scrollTopInstant();
    });
  });

  document.getElementById('btnRandomCode')?.addEventListener('click', () => {
    const cands = pool.length > 1 ? pool.filter((q) => q.id !== activeQ.id) : OFFICIAL_SEB_50;
    state.sebSelectedId = cands[Math.floor(Math.random() * cands.length)].id;
    persist();
    rerender();
  });

  document.getElementById('btnFlipStudioSide')?.addEventListener('click', () => {
    state.codeSide = state.codeSide === 'left' ? 'right' : 'left';
    persist();
    rerender();
  });

  document.getElementById('btnToggleSolved')?.addEventListener('click', () => {
    if (state.solvedCodeIds.has(activeQ.id)) state.solvedCodeIds.delete(activeQ.id);
    else state.solvedCodeIds.add(activeQ.id);
    persist();
    rerender();
  });

  const runStaticOnly = () => {
    const ed = document.getElementById('codePracticeInput');
    const code = ed ? ed.value : state.codeDrafts[activeQ.id] ?? '';
    state.codeDrafts[activeQ.id] = code;
    const rep = gradeSubmission(activeQ, code);
    state.sebLastReports[activeQ.id] = rep;
    state.sebScores[activeQ.id] = { score10: rep.score10, tier: rep.tier };
    persist();
    rerender();
  };

  const runRealCompiler = async () => {
    if (state.sebRunningId) return;
    const ed = document.getElementById('codePracticeInput');
    const code = ed ? ed.value : state.codeDrafts[activeQ.id] ?? '';
    state.codeDrafts[activeQ.id] = code;

    const rep = gradeSubmission(activeQ, code);
    state.sebLastReports[activeQ.id] = rep;

    if (!code.trim()) {
      delete state.sebRealRuns[activeQ.id];
      persist();
      rerender();
      return;
    }

    const tcList = REAL_TEST_CASES[activeQ.id] || [];
    state.sebRunningId = activeQ.id;
    state.sebRunStatus = `Đang biên dịch GCC Linux cho ${activeQ.id}…`;
    rerender();

    try {
      const realRes = await runRealTestSuite(code, tcList, (idx, total, name) => {
        state.sebRunStatus = `Đang chạy Test ${idx}/${total}: ${name}…`;
        const box = document.getElementById('gradeResultBox');
        if (box) {
          const firstDiv = box.querySelector('div');
          if (firstDiv) firstDiv.textContent = `⏳ ${state.sebRunStatus}`;
        }
      });
      state.sebRealRuns[activeQ.id] = realRes;

      if (!realRes.compileError && realRes.total > 0) {
        const ratio = realRes.passed / realRes.total;
        const staticPenalty = rep.criteria?.[1]?.score === 0 ? 0.35 : 1.0;
        const finalScore = Number((10 * ratio * staticPenalty).toFixed(1));
        const tier = ratio === 1 && staticPenalty === 1 ? 'mastered' : ratio >= 0.7 ? 'good' : 'fail';
        state.sebScores[activeQ.id] = { score10: finalScore, tier };
        if (tier === 'mastered') state.solvedCodeIds.add(activeQ.id);
      } else {
        state.sebScores[activeQ.id] = { score10: 0, tier: 'fail' };
      }
    } catch (err) {
      state.sebRealRuns[activeQ.id] = { networkError: err?.message || 'Timeout' };
    } finally {
      state.sebRunningId = null;
      state.sebRunStatus = '';
      persist();
      rerender();
      document.getElementById('gradeResultBox')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  document.getElementById('btnStaticCheck')?.addEventListener('click', runStaticOnly);
  document.getElementById('btnRunRealGcc')?.addEventListener('click', runRealCompiler);

  document.getElementById('btnClearEditor')?.addEventListener('click', () => {
    state.codeDrafts[activeQ.id] = '';
    delete state.sebLastReports[activeQ.id];
    delete state.sebRealRuns[activeQ.id];
    persist();
    rerender();
  });

  document.getElementById('btnCopyEditor')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const txt = state.sebMode === 'practice' ? state.codeDrafts[activeQ.id] ?? '' : activeQ.solution || '';
    try {
      await navigator.clipboard.writeText(txt);
      const old = btn.textContent;
      btn.textContent = 'Đã chép ✓';
      setTimeout(() => { btn.textContent = old; }, 1200);
    } catch { /* ignore */ }
  });

  document.querySelectorAll('[data-goto-book-topic]').forEach((b) => {
    b.addEventListener('click', () => {
      state.topicId = b.dataset.gotoBookTopic;
      state.bookSubKind = 'topic';
      state.activeTab = 'book';
      persist();
      rerender();
      scrollTopInstant();
    });
  });

  const ed = document.getElementById('codePracticeInput');
  if (ed) {
    ed.addEventListener('input', () => {
      state.codeDrafts[activeQ.id] = ed.value;
      persist();
    });
    ed.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runRealCompiler();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const s = ed.selectionStart, end = ed.selectionEnd;
        ed.value = ed.value.slice(0, s) + '    ' + ed.value.slice(end);
        ed.selectionStart = ed.selectionEnd = s + 4;
        state.codeDrafts[activeQ.id] = ed.value;
        persist();
      }
    });
  }
}
