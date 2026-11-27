import { esc, formatInlineCode, highlightCodeSnippet, scrollTopInstant } from '../core/dom.js?v=12';
import { renderLatexInElement } from '../core/latex.js';
import { attachIdeEditor } from '../core/code-editor-ide.js?v=12';
import { formatSavedTime, formatSavedClock } from '../core/storage.js';
import { getCodePartProgress, snapshotCompletions, notifyNewCompletions } from '../core/progress.js?v=11';
import { OFFICIAL_SEB_50, SEB_PARTS, gradeSubmission } from '../../data/code-50/index.js?v=11';
import { REAL_TEST_CASES } from '../../data/code-50/test-cases.js?v=11';
import { runRealTestSuite } from '../core/c-runner.js?v=7';

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

function downloadCFile(filename, content) {
  const blob = new Blob([content || ''], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function renderSavedHistoryHtml(snaps, q) {
  if (!snaps.length) {
    return `
      <div style="padding:10px 4px;font-size:12.6px;color:#94a3b8;line-height:1.55">
        Chưa có bản nộp nào cho <b>${esc(q.id)}</b>. Code bạn gõ vẫn được <b>tự động lưu nháp</b> liên tục; hãy bấm <b>💾 Lưu bài</b> (hoặc <code>Ctrl+S</code>) hoặc <b>▶ Biên dịch &amp; Chấm Test ẩn</b> để lưu thành từng phiên bản cố định tại đây!
      </div>
    `;
  }
  return `
    <div class="snap-list">
      ${snaps
        .map((sp, i) => {
          const isPass = sp.total > 0 && sp.passed === sp.total;
          const preview = String(sp.code || '')
            .split('\n')
            .find((l) => l.trim() && !l.trim().startsWith('#include')) || String(sp.code || '').split('\n')[0] || '';
          return `
            <div class="snap-row ${isPass ? 'is-pass' : ''}">
              <div style="min-width:0;flex:1">
                <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;font-size:12.5px">
                  <span style="color:#94a3b8;font-family:var(--font-mono)">#${snaps.length - i}</span>
                  <strong style="color:${isPass ? '#6ee7b7' : '#f1f5f9'}">${esc(sp.statusLabel)}</strong>
                  <span style="color:#94a3b8">· ${sp.lines || 0} dòng · ${esc(formatSavedTime(sp.savedAt))}</span>
                </div>
                <div class="snap-preview">${esc(preview.trim().slice(0, 96))}</div>
              </div>
              <div style="display:flex;gap:5px;flex-shrink:0">
                <button type="button" class="grade-toggle-btn" data-load-snap="${esc(sp.id)}" title="Nạp lại bản này vào khung gõ code">↺ Nạp lại</button>
                <button type="button" class="grade-toggle-btn" data-dl-snap="${esc(sp.id)}" title="Tải xuống file .c">⬇ .c</button>
                <button type="button" class="grade-toggle-btn is-del" data-del-snap="${esc(sp.id)}" title="Xóa bản lưu này">✕</button>
              </div>
            </div>`;
        })
        .join('')}
    </div>
  `;
}

function renderGradeBox(state, q) {
  const rep = state.sebLastReports?.[q.id];
  const realRun = state.sebRealRuns?.[q.id];
  const isRunning = state.sebRunningId === q.id;
  const tcList = REAL_TEST_CASES[q.id] || [];
  const hiddenCnt = tcList.filter((t) => t.hidden).length;
  const prev = state.sebScores?.[q.id];
  const snaps = Array.isArray(state.codeSubmissions?.[q.id]) ? state.codeSubmissions[q.id] : [];
  const bottomTab = state.sebBottomTab === 'history' ? 'history' : 'judge';

  if (isRunning) {
    return `
      <section class="grade-box grade-panel-bottom" id="gradeResultBox">
        <div style="font-size:13.8px;font-weight:700;color:#fbbf24">⏳ ${esc(state.sebRunStatus || 'Đang biên dịch GCC Linux & chạy test ẩn…')}</div>
        <div style="font-size:12.4px;color:#94a3b8;margin-top:4px">
          Đang biên dịch <b>1 lần duy nhất</b> (<code>gcc -std=gnu11 -pthread</code>) và chạy đồng loạt ${tcList.length} test case (${hiddenCnt} test ẩn) trên máy chủ Linux song song…
        </div>
      </section>
    `;
  }

  if (!rep && !realRun && bottomTab !== 'history') {
    return `
      <section class="grade-box grade-panel-bottom is-collapsed" id="gradeResultBox">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <strong style="font-size:13px;color:#f8fafc">🖥 Bảng Biên Dịch GCC Thật (${tcList.length} Test · ${hiddenCnt} Ẩn)</strong>
            <span style="font-size:12px;color:#94a3b8">Bấm <b>▶ Biên dịch &amp; Chấm Test ẩn</b> hoặc <code>Ctrl+Enter</code> (~1s).</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            ${
              prev
                ? `<span style="font-size:12px;color:#4cc38a;font-weight:700">Điểm gần nhất: ${Number(prev.score10).toFixed(1)} / 10.0</span>`
                : ''
            }
            <button type="button" class="grade-toggle-btn" data-bottom-tab="history">🗂 Bài đã lưu (${snaps.length})</button>
          </div>
        </div>
      </section>
    `;
  }

  if (state.sebGradeCollapsed) {
    const summaryText = realRun?.compileError
      ? `🔴 Lỗi biên dịch GCC (${realRun.engine})`
      : realRun && !realRun.networkError && realRun.total > 0
        ? `${realRun.passed === realRun.total ? '✅' : '⚠'} Đạt ${realRun.passed}/${realRun.total} Test Case (${realRun.engine}${realRun.elapsedMs ? ` · ${(realRun.elapsedMs / 1000).toFixed(2)}s` : ''})`
        : rep
          ? `Kiểm tra tĩnh: ${rep.score10.toFixed(1)} / 10.0 — ${rep.badge}`
          : `🗂 Đang có ${snaps.length} bản bài làm đã lưu cho ${q.id}`;
    return `
      <section class="grade-box grade-panel-bottom is-collapsed" id="gradeResultBox">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
          <strong style="font-size:13px;color:#f8fafc">${esc(summaryText)}</strong>
          <div style="display:flex;align-items:center;gap:6px">
            <button type="button" class="grade-toggle-btn" data-bottom-tab="history">🗂 Bài đã lưu (${snaps.length})</button>
            <button type="button" class="grade-toggle-btn" id="btnToggleGradePanel">▴ Mở rộng</button>
          </div>
        </div>
      </section>
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
      const secLabel = realRun.elapsedMs ? ` · ${(realRun.elapsedMs / 1000).toFixed(2)}s` : '';
      realHtml = `
        <div class="tc-run-row is-fail" style="margin-bottom:10px">
          <div style="font-size:13.4px;font-weight:700;color:#f06a6a">🔴 Lỗi Biên Dịch GCC (Compile Error · ${esc(realRun.engine)}${secLabel})</div>
          <pre class="gcc-err-pre">${esc(realRun.compileError)}</pre>
        </div>
      `;
    } else {
      const allPass = realRun.passed === realRun.total && realRun.total > 0;
      const missingNames = realRun.results.filter((r) => !r.ok).map((r) => r.name);
      const secLabel = realRun.elapsedMs ? ` · ${(realRun.elapsedMs / 1000).toFixed(2)}s` : '';
      realHtml = `
        <div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
            <div>
              <div style="font-size:11.2px;color:#94a3b8;text-transform:uppercase">Biên dịch 1 lần &amp; Chạy thật · ${esc(realRun.engine)}${secLabel}</div>
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

  const judgeBody =
    realHtml || staticHtml
      ? `${realHtml}${staticHtml}`
      : `<div style="padding:10px 4px;font-size:12.6px;color:#94a3b8">Chưa có kết quả chạy GCC nào cho ${esc(q.id)}. Bấm <b>▶ Biên dịch &amp; Chấm Test ẩn</b> để chấm ngay (~1s).</div>`;

  return `
    <section class="grade-box grade-panel-bottom" id="gradeResultBox">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px">
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button type="button" class="bottom-tab-pill ${bottomTab === 'judge' ? 'active' : ''}" data-bottom-tab="judge">🖥 Kết quả GCC &amp; Test ẩn</button>
          <button type="button" class="bottom-tab-pill ${bottomTab === 'history' ? 'active' : ''}" data-bottom-tab="history">🗂 Bài đã lưu (${snaps.length})</button>
        </div>
        <button type="button" class="grade-toggle-btn" id="btnToggleGradePanel">▾ Thu gọn để mở rộng khung code</button>
      </div>
      ${bottomTab === 'history' ? renderSavedHistoryHtml(snaps, q) : judgeBody}
    </section>
  `;
}

function renderDetailGuideInline(q) {
  const g = q.detailGuide;
  if (!g) return '';
  const idea = g.idea || null;

  return `
    <div class="academic-guide">
      <!-- Tầng 1 -->
      <section class="guide-section">
        <h3 class="guide-block-title"><span class="guide-num">1</span> Bản chất &amp; Nguồn Kiến Thức</h3>
        <p class="guide-prose">${formatInlineCode(g.origin)}</p>
        ${
          q.relatedTopics?.length
            ? `<div class="chip-wrap">
                ${q.relatedTopics
                  .map((rt) => `<button type="button" class="link-chip" data-goto-book-topic="${esc(rt.id)}">📖 Mở bài ${esc(rt.label)} →</button>`)
                  .join('')}
              </div>`
            : ''
        }
      </section>

      ${
        idea
          ? `<!-- Tầng 2: Ý tưởng cốt lõi cho người mới / mất gốc -->
      <section class="guide-section">
        <h3 class="guide-block-title"><span class="guide-num">2</span> Ý Tưởng Cốt Lõi &amp; Tư Duy Giải Bài</h3>
        <div class="idea-card">
          <div class="idea-summary-label">Bức tranh tổng thể</div>
          <p class="guide-prose" style="margin:0 0 12px">${formatInlineCode(idea.summary)}</p>

          ${
            Array.isArray(idea.steps) && idea.steps.length
              ? `<div class="idea-summary-label">Các bước tư duy từ đầu đến cuối</div>
                 <ol class="idea-step-list">
                   ${idea.steps.map((st) => `<li>${formatInlineCode(st)}</li>`).join('')}
                 </ol>`
              : ''
          }

          ${
            idea.whyThisWay
              ? `<div class="idea-why-box">
                   <div class="idea-why-head">💡 Tại sao phải làm theo cách này?</div>
                   <div class="guide-prose" style="margin:0;font-size:14.4px">${formatInlineCode(idea.whyThisWay)}</div>
                 </div>`
              : ''
          }

          ${
            idea.complexity
              ? `<div class="idea-meta-bar">⏱ ${formatInlineCode(idea.complexity)}</div>`
              : ''
          }
        </div>
      </section>`
          : ''
      }

      <!-- Tầng 3: Giải phẫu mã lệnh -->
      <section class="guide-section">
        <h3 class="guide-block-title"><span class="guide-num">${idea ? '3' : '2'}</span> Giải Phẫu Chi Tiết Từng Khối Mã Lệnh (Từ Dòng 1 Đến Hết)</h3>
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
              <div class="guide-prose" style="font-size:14.5px;margin:0">${formatInlineCode(row.explain)}</div>
            </div>`
            )
            .join('')}
        </div>
      </section>

      <!-- Tầng 4: Test Case & Biên -->
      <section class="guide-section">
        <h3 class="guide-block-title"><span class="guide-num">${idea ? '4' : '3'}</span> Kiểm Chứng Test Case &amp; Trường Hợp Biên</h3>
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
                  <td>${formatInlineCode(tc.howHandled)}</td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </section>

      <!-- Tầng 5: Khung sườn phòng thi -->
      <section class="guide-section">
        <h3 class="guide-block-title"><span class="guide-num">${idea ? '5' : '4'}</span> Khung Sườn Nhớ Nhanh Vào Phòng Thi SEB</h3>
        <ol class="recipe-list">
          ${(g.examRecipe || []).map((step) => `<li>${formatInlineCode(step)}</li>`).join('')}
        </ol>
      </section>
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
            ${SEB_PARTS.map((p) => {
              const pr = getCodePartProgress(state, p.id);
              return `<button type="button" class="btn sm ${state.sebPartFilter === p.id ? 'active' : ''}" data-seb-part="${esc(p.id)}">${pr.completed ? '<span class="tick-badge">✓</span> ' : ''}${esc(p.label)}</button>`;
            }).join('')}
          </div>

          <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
            ${DIFFICULTIES.map(
              (d) => `<button type="button" class="btn sm ${state.sebDiffFilter === d ? 'active' : ''}" data-seb-diff="${esc(d)}">${d === 'all' ? 'Mọi mức độ' : esc(d)}</button>`
            ).join('')}
            <button type="button" class="btn sm accent" id="btnRandomCode">🎲 Bốc ngẫu nhiên</button>
            <button type="button" class="btn sm" id="btnFlipStudioSide">⇄ Code ${state.codeSide === 'left' ? 'Trái' : 'Phải'}</button>
          </div>
        </div>

        <div class="matrix-50" aria-label="Chọn câu từ 01 đến 40">
          ${pool
            .map((q) => {
              const cls = getCellClass(state, q.id);
              return `<button type="button" class="m50-cell ${cls} ${q.id === activeQ.id ? 'active' : ''}" data-pick-cr="${esc(q.id)}" title="${esc(q.id)} (${esc(q.difficulty)}): ${esc(q.title)}">${String(q.num).padStart(2, '0')}</button>`;
            })
            .join('')}
        </div>
      </section>

      <div class="studio-deck" id="studioDeck">
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
            <button type="button" class="left-explain-toggle ${state.sebLeftView === 'explain' ? 'is-open' : ''}" id="btnToggleLeftExplain" title="Bật/tắt Giải thích chuẩn học thuật (Ý tưởng + Chi tiết từng dòng lệnh) ngay bên trái để vừa đọc vừa đối chiếu code (Alt + E)">
              ${state.sebLeftView === 'explain' ? '📄 Đóng giải thích · Xem Đề bài' : '📘 Mở giải thích (Ý tưởng & Code)'}
            </button>
          </div>

          <h1 style="margin:0 0 10px;font-size:22px;line-height:1.3">${esc(activeQ.title)}</h1>

          ${state.sebLeftView === 'explain' ? renderDetailGuideInline(activeQ) : renderProblemBody(activeQ, spec)}
        </section>

        <!-- Right Independent Scroll Pane: Blank Code Editor OR Clean Simplified C11 Solution -->
        <div class="pane-code">
          <div class="code-window">
            <div class="code-win-bar">
              <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
                <div class="dev-dots" aria-hidden="true"><span class="dd-r"></span><span class="dd-y"></span><span class="dd-g"></span></div>
                <span class="dev-file-pill">main.c</span>
                <div class="win-tabs" role="tablist">
                  <button type="button" class="win-tab ${state.sebMode === 'practice' ? 'active' : ''}" data-seb-mode="practice">✍ Tự viết Code</button>
                  <button type="button" class="win-tab ${state.sebMode === 'solution' ? 'active' : ''}" data-seb-mode="solution">📖 Đáp án chuẩn</button>
                </div>
              </div>

              <div class="win-actions">
                ${
                  state.sebMode === 'practice'
                    ? `<button type="button" class="win-btn" id="btnClearEditor" title="Xóa trắng khung gõ hiện tại (các bản đã lưu trong Lịch sử vẫn giữ nguyên)">Xóa trắng</button>
                       <button type="button" class="win-btn" id="btnCopyEditor">Chép</button>
                       <button type="button" class="win-btn save" id="btnSaveCodeSnap" title="Lưu phiên bản bài làm này vào lịch sử trên máy (Ctrl + S)">💾 Lưu bài</button>
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
                  ? `<div class="editor-ide-wrap">
                       <div class="editor-gutter" id="codeEditorGutter" aria-hidden="true"><div class="eg-ln is-active">1</div></div>
                       <div class="editor-stage">
                         <div class="editor-active-line" aria-hidden="true"></div>
                         <pre class="editor-highlight-layer" aria-hidden="true"><code class="editor-highlight-code"></code></pre>
                         <textarea class="code-editor-area is-live-color" id="codePracticeInput" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" wrap="off" placeholder="// Khung trống chuẩn IDE — tô màu cú pháp C trực tiếp, tự thụt lề Enter, tự đóng ngoặc, Tab/Shift+Tab, Ctrl+/!&#10;// Bấm Alt+A (hoặc F2) để đảo sang Đáp án chuẩn · Alt+E để mở Giải thích Ý tưởng &amp; từng dòng lệnh bên trái.&#10;// Bấm Ctrl+S để lưu bản nộp · Ctrl+Enter để biên dịch GCC thật &amp; chấm test ẩn (~1 giây).">${esc(draftVal)}</textarea>
                       </div>
                     </div>`
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
              <span style="display:inline-flex;align-items:center;gap:10px;flex-wrap:wrap">
                ${state.sebMode === 'practice' ? `<span class="mono" id="codeCursorPos" style="color:#cbd5e1;font-weight:600">Dòng 1, Cột 1</span><span>·</span><span class="autosave-pill" id="codeAutoSaveBadge">${draftVal.trim() ? `✓ Tự lưu${state.lastSavedAt ? ` ${formatSavedClock(state.lastSavedAt)}` : ''}` : '✓ Sẵn sàng tự lưu'}</span><span>·</span>` : ''}
                <span>Sandbox: <code style="color:#e5eaf2">${esc(spec.compileFlags || 'gcc -O2 -Wall -Wextra -std=c11 -pthread')}</code></span>
              </span>
              ${(() => {
                const rr = state.sebRealRuns?.[activeQ.id];
                if (state.sebRunningId === activeQ.id) {
                  return `<button type="button" class="foot-status-pill is-warn" id="btnJumpGradeBox">⏳ Đang biên dịch GCC… ↓</button>`;
                }
                if (rr?.compileError) {
                  return `<button type="button" class="foot-status-pill is-fail" id="btnJumpGradeBox">🔴 Lỗi biên dịch GCC · Xem lỗi bên dưới ↓</button>`;
                }
                if (rr && !rr.networkError && rr.total > 0) {
                  const allOk = rr.passed === rr.total;
                  const s = rr.elapsedMs ? ` (${(rr.elapsedMs / 1000).toFixed(1)}s)` : '';
                  return `<button type="button" class="foot-status-pill ${allOk ? 'is-pass' : 'is-warn'}" id="btnJumpGradeBox">${allOk ? '✅' : '⚠'} ${rr.passed}/${rr.total} PASS${s} · Xem chi tiết ↓</button>`;
                }
                return `<button type="button" class="foot-status-pill" id="btnJumpGradeBox">${solLines.length} dòng chuẩn · Kết quả biên dịch ở cuối trang ↓</button>`;
              })()}
            </div>
          </div>
        </div>
      </div>

      <!-- Full-width GCC Compiler Output, Error Log & Hidden Test Results locked inside viewport deck -->
      ${renderGradeBox(state, activeQ)}
      </div>
    </div>
  `;
}

export function bindCodeView(state, persist, rerender, actions = {}) {
  const { saveCodeSnapshot, deleteCodeSnapshot, mcqBank = [] } = actions;
  if (state.sebLeftView === 'explain') {
    renderLatexInElement(document.getElementById('paneLeftScroll'));
  }
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
    const beforeSnap = snapshotCompletions(state, mcqBank);
    if (state.solvedCodeIds.has(activeQ.id)) state.solvedCodeIds.delete(activeQ.id);
    else state.solvedCodeIds.add(activeQ.id);
    persist();
    rerender();
    notifyNewCompletions(state, mcqBank, beforeSnap);
  });

  const runStaticOnly = () => {
    const ed = document.getElementById('codePracticeInput');
    const code = ed ? ed.value : state.codeDrafts[activeQ.id] ?? '';
    state.codeDrafts[activeQ.id] = code;
    const rep = gradeSubmission(activeQ, code);
    state.sebLastReports[activeQ.id] = rep;
    state.sebScores[activeQ.id] = { score10: rep.score10, tier: rep.tier };
    state.sebGradeCollapsed = false;
    state.sebBottomTab = 'judge';
    persist();
    rerender();
    document.getElementById('studioDeck')?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  const handleManualSave = () => {
    const ed = document.getElementById('codePracticeInput');
    const code = ed ? ed.value : state.codeDrafts[activeQ.id] ?? '';
    state.codeDrafts[activeQ.id] = code;
    if (!code.trim()) {
      const btn = document.getElementById('btnSaveCodeSnap');
      if (btn) {
        const old = btn.textContent;
        btn.textContent = 'Chưa có code!';
        setTimeout(() => { btn.textContent = old; }, 1100);
      }
      return;
    }
    if (saveCodeSnapshot) {
      const prevRun = state.sebRealRuns?.[activeQ.id];
      const statusLabel =
        prevRun && !prevRun.compileError && !prevRun.networkError && prevRun.total > 0
          ? `${prevRun.passed === prevRun.total ? '✅' : '💾'} Lưu tay · ${prevRun.passed}/${prevRun.total} PASS`
          : '💾 Lưu thủ công';
      saveCodeSnapshot(activeQ.id, code, {
        source: 'manual',
        statusLabel,
        passed: prevRun?.passed ?? null,
        total: prevRun?.total ?? null,
        score10: state.sebScores?.[activeQ.id]?.score10 ?? null,
      });
    } else {
      persist();
    }
    state.sebBottomTab = 'history';
    state.sebGradeCollapsed = false;
    rerender();
    const btn = document.getElementById('btnSaveCodeSnap');
    if (btn) {
      btn.textContent = '✓ Đã lưu bài!';
      setTimeout(() => { btn.textContent = '💾 Lưu bài'; }, 1400);
    }
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

    const beforeSnap = snapshotCompletions(state, mcqBank);
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
        if (saveCodeSnapshot) {
          saveCodeSnapshot(activeQ.id, code, {
            source: 'gcc',
            statusLabel: ratio === 1 ? `✅ ${realRes.passed}/${realRes.total} PASS` : `⚠ ${realRes.passed}/${realRes.total} PASS`,
            passed: realRes.passed,
            total: realRes.total,
            score10: finalScore,
          });
        }
      } else {
        state.sebScores[activeQ.id] = { score10: 0, tier: 'fail' };
        if (saveCodeSnapshot && realRes.compileError) {
          saveCodeSnapshot(activeQ.id, code, {
            source: 'gcc',
            statusLabel: '🔴 Lỗi biên dịch GCC',
            passed: 0,
            total: tcList.length,
            score10: 0,
          });
        }
      }
    } catch (err) {
      state.sebRealRuns[activeQ.id] = { networkError: err?.message || 'Timeout' };
    } finally {
      state.sebRunningId = null;
      state.sebRunStatus = '';
      state.sebGradeCollapsed = false;
      state.sebBottomTab = 'judge';
      persist();
      rerender();
      notifyNewCompletions(state, mcqBank, beforeSnap);
      document.getElementById('studioDeck')?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  document.getElementById('btnSaveCodeSnap')?.addEventListener('click', handleManualSave);
  document.getElementById('btnStaticCheck')?.addEventListener('click', runStaticOnly);
  document.getElementById('btnRunRealGcc')?.addEventListener('click', runRealCompiler);
  document.getElementById('btnToggleGradePanel')?.addEventListener('click', () => {
    state.sebGradeCollapsed = !state.sebGradeCollapsed;
    rerender();
  });
  document.getElementById('btnJumpGradeBox')?.addEventListener('click', () => {
    state.sebGradeCollapsed = false;
    state.sebBottomTab = 'judge';
    rerender();
    document.getElementById('studioDeck')?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  });

  document.querySelectorAll('[data-bottom-tab]').forEach((b) => {
    b.addEventListener('click', () => {
      state.sebBottomTab = b.dataset.bottomTab === 'history' ? 'history' : 'judge';
      state.sebGradeCollapsed = false;
      rerender();
    });
  });

  document.querySelectorAll('[data-load-snap]').forEach((b) => {
    b.addEventListener('click', () => {
      const snaps = state.codeSubmissions?.[activeQ.id] || [];
      const found = snaps.find((x) => x.id === b.dataset.loadSnap);
      if (found) {
        state.codeDrafts[activeQ.id] = found.code;
        state.sebMode = 'practice';
        persist();
        rerender();
      }
    });
  });

  document.querySelectorAll('[data-dl-snap]').forEach((b) => {
    b.addEventListener('click', () => {
      const snaps = state.codeSubmissions?.[activeQ.id] || [];
      const found = snaps.find((x) => x.id === b.dataset.dlSnap);
      if (found) downloadCFile(`${activeQ.id.toLowerCase()}.c`, found.code);
    });
  });

  document.querySelectorAll('[data-del-snap]').forEach((b) => {
    b.addEventListener('click', () => {
      if (deleteCodeSnapshot) deleteCodeSnapshot(activeQ.id, b.dataset.delSnap);
      rerender();
    });
  });

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
    attachIdeEditor(
      ed,
      document.getElementById('codeEditorGutter'),
      document.getElementById('codeCursorPos'),
      (val) => {
        state.codeDrafts[activeQ.id] = val;
        persist();
        const badge = document.getElementById('codeAutoSaveBadge');
        if (badge) badge.textContent = val.trim() ? `✓ Tự lưu ${formatSavedClock(state.lastSavedAt)}` : '✓ Sẵn sàng tự lưu';
      },
      runRealCompiler,
      handleManualSave
    );
  }
}
