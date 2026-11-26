import { esc, highlightCodeSnippet } from '../core/dom.js';
import { HEADER_MAP, TOP_10_TRAPS, ALL_LINUX_LABS, CONCEPT_MAPS } from '../../data/book/extras-data.js';

export function renderExtrasView(state) {
  const sub = state.extrasSub || 'cheatsheet';
  let content = '';

  if (sub === 'labs') {
    content = `
      <article class="book-sheet">
        <div class="sheet-running-head">
          <span>Phụ lục Thực hành Linux · ELT 3296</span>
          <span>Lab 1 – Lab 5</span>
        </div>
        <h1 class="sheet-title">Tuyển tập Bài thực hành Lab 1 – Lab 5</h1>
        ${ALL_LINUX_LABS.map(
          (lb) => `
          <div style="margin-bottom:24px">
            <h3 style="margin:0 0 10px;font-size:19px">${esc(lb.labNum)} — ${esc(lb.title)}</h3>
            ${lb.exercises
              .map(
                (ex) => `
              <div style="padding:15px 18px;border-radius:12px;border:1px solid var(--bd);margin-bottom:10px;background:var(--surface-sub)">
                <div style="font-weight:700;margin-bottom:6px">${esc(ex.code)}: ${esc(ex.title)}</div>
                <p style="margin:0 0 10px;font-size:14.8px;white-space:pre-line">${esc(ex.prompt)}</p>
                <details class="smart-drawer" style="margin:0">
                  <summary>Xem phân tích &amp; Code mẫu</summary>
                  <div class="smart-drawer-body">
                    <p style="margin:0 0 10px;white-space:pre-line">${esc(ex.keyInsight)}</p>
                    <pre class="mcq-code-block" style="margin:0"><code>${highlightCodeSnippet(ex.solution)}</code></pre>
                  </div>
                </details>
              </div>`
              )
              .join('')}
          </div>`
        ).join('')}
      </article>
    `;
  } else if (sub === 'concepts') {
    const cmap = CONCEPT_MAPS.find((m) => m.id === state.conceptId) || CONCEPT_MAPS[0];
    content = `
      <article class="book-sheet">
        <div class="sheet-running-head">
          <span>Sơ đồ Liên kết Khái niệm &amp; Đọc Code Hai Chiều</span>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${CONCEPT_MAPS.map(
              (m) => `<button type="button" class="btn sm ${m.id === cmap.id ? 'active' : ''}" data-pick-cmap="${esc(m.id)}">Chương ${esc(m.chapterId)}</button>`
            ).join('')}
          </div>
        </div>
        <h1 class="sheet-title">${esc(cmap.title)}</h1>
        <p style="color:var(--mut);margin:0 0 16px">${esc(cmap.subtitle)}</p>

        <div class="studio-split" id="cmapContainer">
          <div>
            <svg viewBox="0 0 550 280" style="width:100%;height:auto;border:1px solid var(--bd-strong);border-radius:12px;background:var(--surface-sub);padding:8px">
              ${cmap.edges
                .map((e) => {
                  const n1 = cmap.nodes.find((n) => n.id === e.from);
                  const n2 = cmap.nodes.find((n) => n.id === e.to);
                  return `<g>
                    <line x1="${n1.x}" y1="${n1.y}" x2="${n2.x}" y2="${n2.y}" stroke="var(--bd-strong)" stroke-width="1.5"/>
                    <text x="${(n1.x + n2.x) / 2}" y="${(n1.y + n2.y) / 2 - 4}" text-anchor="middle" fill="var(--mut)" font-size="10">${esc(e.rel)}</text>
                  </g>`;
                })
                .join('')}
              ${cmap.nodes
                .map(
                  (n) => `<g class="cm-node" data-nid="${esc(n.id)}" transform="translate(${n.x},${n.y})" style="cursor:pointer">
                    <rect x="-70" y="-20" width="140" height="40" rx="10" fill="var(--surface)" stroke="var(--accent)" stroke-width="1.5"/>
                    <text x="0" y="5" text-anchor="middle" fill="var(--fg)" font-size="12" font-weight="600">${esc(n.label)}</text>
                  </g>`
                )
                .join('')}
            </svg>
            <div id="cmExplainBox" style="margin-top:12px;padding:13px 15px;border-radius:11px;background:var(--surface-sub);font-size:14.6px">
              Bấm vào một nút khái niệm hoặc một dòng code C bên phải để xem mối liên kết.
            </div>
          </div>

          <div style="background:var(--code-bg);color:var(--code-fg);padding:14px 16px;border-radius:14px;font-family:var(--font-mono);font-size:12.6px;line-height:1.7">
            ${cmap.codeLines
              .map(
                (ln) => `<div class="cm-line" data-cid="${esc(ln.concept)}" style="padding:4px 8px;border-radius:6px;cursor:pointer">
                  <span style="color:#64748b;margin-right:8px">${ln.num}</span>${highlightCodeSnippet(ln.text)}
                </div>`
              )
              .join('')}
          </div>
        </div>
      </article>
    `;
  } else {
    content = `
      <article class="book-sheet">
        <div class="sheet-running-head">
          <span>Phụ lục Ôn Cấp Tốc Trước Giờ Thi SEB &amp; Trắc nghiệm</span>
          <span>Cheat Sheet 1 Trang</span>
        </div>
        <h1 class="sheet-title">Bản đồ Header C, Cờ Biên Dịch &amp; Top 10 Bẫy Phòng Thi</h1>

        <h3 style="margin:18px 0 10px">A. Bảng tra nhanh Header &amp; Lệnh chuẩn tài liệu</h3>
        <div style="overflow-x:auto">
          <table class="tc-table">
            <thead><tr><th>Chủ đề</th><th>Header / Cờ biên dịch</th><th>Hàm &amp; Macro trọng tâm</th></tr></thead>
            <tbody>
              ${HEADER_MAP.map(
                (r) => `<tr><td><b>${esc(r.topic)}</b></td><td><code>${esc(r.headers)}</code></td><td><code>${esc(r.funcs)}</code></td></tr>`
              ).join('')}
            </tbody>
          </table>
        </div>

        <h3 style="margin:24px 0 10px">B. Top 10 Bẫy Dễ Mất Điểm Nhất Trong Đề Thi</h3>
        <div style="display:grid;gap:10px">
          ${TOP_10_TRAPS.map(
            (t) => `<div style="padding:13px 16px;border-radius:11px;background:var(--surface-sub);border:1px solid var(--bd)">
              <div style="font-weight:700;margin-bottom:3px">${esc(t.num)}. ${esc(t.title)}</div>
              <div style="font-size:14.8px;color:var(--fg-body)">${esc(t.rule)}</div>
            </div>`
          ).join('')}
        </div>
      </article>
    `;
  }

  return `
    <div style="max-width:1100px;margin:0 auto;display:grid;gap:14px">
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button type="button" class="btn ${sub === 'cheatsheet' ? 'active' : ''}" data-extras-sub="cheatsheet">⚡ Cheat Sheet &amp; Top 10 Bẫy</button>
        <button type="button" class="btn ${sub === 'labs' ? 'active' : ''}" data-extras-sub="labs">🧪 Tuyển tập Lab 1–5</button>
        <button type="button" class="btn ${sub === 'concepts' ? 'active' : ''}" data-extras-sub="concepts">🧭 Sơ đồ Khái niệm SVG ↔ C</button>
      </div>
      ${content}
    </div>
  `;
}

export function bindExtrasView(state, persist, rerender) {
  document.querySelectorAll('[data-extras-sub]').forEach((b) => {
    b.addEventListener('click', () => {
      state.extrasSub = b.dataset.extrasSub;
      persist();
      rerender();
    });
  });

  document.querySelectorAll('[data-pick-cmap]').forEach((b) => {
    b.addEventListener('click', () => {
      state.conceptId = b.dataset.pickCmap;
      persist();
      rerender();
    });
  });

  const box = document.getElementById('cmapContainer');
  if (!box) return;
  const cmap = CONCEPT_MAPS.find((m) => m.id === state.conceptId) || CONCEPT_MAPS[0];
  const highlight = (nid) => {
    const node = cmap.nodes.find((n) => n.id === nid);
    if (!node) return;
    box.querySelectorAll('.cm-node').forEach((el) => (el.style.opacity = el.dataset.nid === nid ? '1' : '0.35'));
    box.querySelectorAll('.cm-line').forEach((el) => (el.style.background = el.dataset.cid === nid ? 'rgba(207,169,126,0.22)' : 'transparent'));
    const exp = document.getElementById('cmExplainBox');
    if (exp) exp.innerHTML = `<b>${esc(node.label)}:</b> ${esc(node.def)}`;
  };
  box.querySelectorAll('.cm-node').forEach((el) => el.addEventListener('click', () => highlight(el.dataset.nid)));
  box.querySelectorAll('.cm-line').forEach((el) => el.addEventListener('click', () => highlight(el.dataset.cid)));
}
