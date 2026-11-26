function stripComments(src) {
  return String(src || '')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ');
}

function stripCommentsAndStrings(src) {
  return stripComments(src)
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/'(?:\\.|[^'\\])*'/g, "''");
}

function hasBalancedDelimiters(codeNoStr) {
  let braces = 0;
  let parens = 0;
  for (let i = 0; i < codeNoStr.length; i++) {
    const ch = codeNoStr[i];
    if (ch === '{') braces++;
    else if (ch === '}') {
      braces--;
      if (braces < 0) return false;
    } else if (ch === '(') parens++;
    else if (ch === ')') {
      parens--;
      if (parens < 0) return false;
    }
  }
  return braces === 0 && parens === 0;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasToken(code, token) {
  if (/^[A-Za-z_]\w*$/.test(token)) {
    return new RegExp(`\\b${escapeRegex(token)}\\b`).test(code);
  }
  return code.includes(token);
}

/**
 * Simulated Moodle CodeRunner Multi-Criteria Grader (10.0 scale).
 */
export function gradeSubmission(question, rawCode) {
  const raw = String(rawCode || '').trim();
  if (!raw) {
    return {
      score10: 0,
      percent: 0,
      tier: 'fail',
      badge: 'Chưa viết bài',
      summary: 'Khung bài làm đang trống. Hãy tự gõ lại toàn bộ chương trình C11 rồi bấm Chấm điểm (Ctrl + Enter), hoặc bấm Alt+A / F2 để xem Đáp án & Giải thích.',
      criteria: [],
      feedback: [
        'Bắt đầu bằng các thư viện #include bắt buộc của đề bài.',
        'Viết hàm main(), đọc input đúng định dạng, xử lý thuật toán / system call và in đúng output (không in lời nhắc).',
      ],
    };
  }

  const noComments = stripComments(raw);
  const cleanCode = stripCommentsAndStrings(raw);
  const subCleanCompact = cleanCode.replace(/\s+/g, '');

  if (subCleanCompact.length < 35) {
    return {
      score10: 0.5,
      percent: 5,
      tier: 'fail',
      badge: 'Code còn quá ngắn',
      summary: 'Bài làm mới chỉ có vài dòng sơ khai, chưa đủ cấu trúc chương trình C hoàn chỉnh.',
      criteria: [],
      feedback: ['Hãy hoàn thiện hàm main() và các lời gọi hệ thống / thuật toán yêu cầu.'],
    };
  }

  const spec = question.graderSpec || {};
  const feedback = [];
  const criteria = [];

  // 1. C11 structure & clean I/O (1.5)
  let c1 = 1.5;
  const c1Notes = [];
  if (!hasBalancedDelimiters(cleanCode)) {
    c1 -= 1.0;
    c1Notes.push('Dấu ngoặc nhọn {} hoặc ngoặc tròn () bị lệch — GCC sẽ báo lỗi cú pháp.');
  }
  if (!/\bmain\s*\(/.test(cleanCode)) {
    c1 -= 0.8;
    c1Notes.push('Thiếu hàm int main().');
  }
  const reqHeaders = spec.requiredHeaders || [];
  const missingHeaders = reqHeaders.filter(
    (h) => !new RegExp(`#\\s*include\\s*[<"]${escapeRegex(h)}[>"]`).test(noComments)
  );
  if (missingHeaders.length > 0) {
    c1 -= Math.min(0.6, missingHeaders.length * 0.3);
    c1Notes.push(`Thiếu header bắt buộc: ${missingHeaders.map((h) => `<${h}>`).join(', ')}.`);
  }
  if (/printf\s*\(\s*"[^"]*(?:Nhap|nhap|Enter|Input\s*:|Moi\s+ban)/i.test(noComments)) {
    c1 -= 0.7;
    c1Notes.push('Đang in lời nhắc nhập dữ liệu ("Nhap...") — CodeRunner so khớp từng ký tự stdout nên sẽ chấm sai!');
  }
  c1 = Math.max(0, Number(c1.toFixed(2)));
  criteria.push({
    name: '1. Cấu trúc C11, Thư viện & Chuẩn I/O sạch',
    score: c1,
    max: 1.5,
    status: c1 >= 1.4 ? 'ok' : c1 >= 0.8 ? 'warn' : 'err',
    detail: c1Notes.length ? c1Notes.join(' ') : 'Đầy đủ header bắt buộc, ngoặc cân bằng và không in lời nhắc thừa.',
  });
  feedback.push(...c1Notes);

  // 2. Static API check & forbidden APIs (3.5)
  let c2 = 3.5;
  const c2Notes = [];
  const reqApis = spec.requiredApis || [];
  const missingApis = reqApis.filter((api) => !hasToken(noComments, api));
  if (missingApis.length > 0) {
    const ratio = (reqApis.length - missingApis.length) / Math.max(1, reqApis.length);
    c2 = Number((3.5 * ratio).toFixed(2));
    c2Notes.push(`Thiếu hàm / từ khóa bắt buộc: ${missingApis.join(', ')}.`);
  }
  const forbiddenApis = spec.forbiddenApis || [];
  const usedForbidden = forbiddenApis.filter((api) => hasToken(cleanCode, api));
  if (usedForbidden.length > 0) {
    c2 = 0;
    c2Notes.push(`VI PHẠM LỆNH CẤM: Phát hiện ${usedForbidden.join(', ')} (CodeRunner sẽ loại bài ngay!).`);
  }
  criteria.push({
    name: '2. Kiểm tra Tĩnh API Bắt buộc & Không dùng Hàm cấm',
    score: c2,
    max: 3.5,
    status: c2 >= 3.4 ? 'ok' : c2 >= 1.8 ? 'warn' : 'err',
    detail: c2Notes.length ? c2Notes.join(' ') : 'Đạt 100% kiểm tra tĩnh của Sandbox (đủ API yêu cầu, không chạm hàm cấm).',
  });
  feedback.push(...c2Notes);

  // 3. Edge cases & algorithm logic (2.5)
  const qRules = spec.qualityRules || [];
  let c3 = 2.5;
  const c3Notes = [];
  if (qRules.length > 0) {
    let passed = 0;
    for (const r of qRules) {
      const re = r.regex instanceof RegExp ? r.regex : new RegExp(r.regex, r.flags || '');
      if (re.test(noComments)) passed++;
      else c3Notes.push(`Cần bổ sung / kiểm tra: ${r.desc}.`);
    }
    c3 = Number(((2.5 * passed) / qRules.length).toFixed(2));
  }
  criteria.push({
    name: '3. Logic Thuật toán & Xử lý Test Biên',
    score: c3,
    max: 2.5,
    status: c3 >= 2.3 ? 'ok' : c3 >= 1.3 ? 'warn' : 'err',
    detail: c3Notes.length ? c3Notes.join(' ') : 'Đảm bảo đầy đủ logic cốt lõi và các trường hợp biên quan trọng.',
  });
  feedback.push(...c3Notes);

  // 4. Performance & simplicity (1.5)
  let c4 = 1.5;
  const c4Notes = [];
  for (const ap of spec.antiPatterns || []) {
    const re = ap.regex instanceof RegExp ? ap.regex : new RegExp(ap.regex, ap.flags || '');
    if (re.test(noComments)) {
      c4 -= 0.9;
      c4Notes.push(`Cảnh báo bẫy hiệu năng / logic: ${ap.desc}`);
    }
  }
  const lineCount = raw.split('\n').length;
  if (lineCount > 210) {
    c4 -= 0.4;
    c4Notes.push(`Code hơi dài (${lineCount} dòng) — nên rút gọn cho dễ kiểm soát trong phòng thi.`);
  }
  c4 = Math.max(0, Number(c4.toFixed(2)));
  criteria.push({
    name: '4. Độ Tối ưu & Tránh Bẫy Phổ biến',
    score: c4,
    max: 1.5,
    status: c4 >= 1.35 ? 'ok' : c4 >= 0.75 ? 'warn' : 'err',
    detail: c4Notes.length ? c4Notes.join(' ') : 'Code ngắn gọn, đúng trọng tâm và tránh được các bẫy thường gặp.',
  });
  feedback.push(...c4Notes);

  // 5. Resource cleanup (1.0)
  let c5 = 1.0;
  const c5Notes = [];
  if (hasToken(cleanCode, 'open') && !hasToken(cleanCode, 'close')) {
    c5 -= 0.5;
    c5Notes.push('Có open() nhưng quên close().');
  }
  if (hasToken(cleanCode, 'opendir') && !hasToken(cleanCode, 'closedir')) {
    c5 -= 0.5;
    c5Notes.push('Có opendir() nhưng quên closedir().');
  }
  if (hasToken(cleanCode, 'mmap') && !hasToken(cleanCode, 'munmap')) {
    c5 -= 0.5;
    c5Notes.push('Có mmap() nhưng quên munmap().');
  }
  if ((hasToken(cleanCode, 'malloc') || hasToken(cleanCode, 'calloc')) && !hasToken(cleanCode, 'free')) {
    c5 -= 0.4;
    c5Notes.push('Có malloc/calloc nhưng chưa thấy free().');
  }
  if (hasToken(cleanCode, 'fork') && !hasToken(cleanCode, 'waitpid') && !hasToken(cleanCode, 'wait')) {
    c5 -= 0.5;
    c5Notes.push('Có fork() nhưng chưa gọi waitpid()/wait() thu dọn tiến trình con.');
  }
  if (hasToken(cleanCode, 'pthread_create') && !hasToken(cleanCode, 'pthread_join')) {
    c5 -= 0.5;
    c5Notes.push('Có pthread_create() nhưng chưa gọi pthread_join().');
  }
  c5 = Math.max(0, Number(c5.toFixed(2)));
  criteria.push({
    name: '5. Thu hồi Tài nguyên (FD, Heap, Process, Thread)',
    score: c5,
    max: 1.0,
    status: c5 >= 0.9 ? 'ok' : c5 >= 0.5 ? 'warn' : 'err',
    detail: c5Notes.length ? c5Notes.join(' ') : 'Thu hồi sạch mọi tài nguyên hệ thống đã cấp phát.',
  });
  feedback.push(...c5Notes);

  let total = Number((c1 + c2 + c3 + c4 + c5).toFixed(1));
  if (usedForbidden.length > 0) total = Math.min(total, 3.5);

  let tier = 'mastered';
  let badge = 'Đạt Chuẩn Tối Ưu (10/10 Sẵn sàng thi SEB)';
  let summary = 'Tuyệt vời! Bài code đáp ứng đủ kiểm tra tĩnh, xử lý chặt điều kiện biên và thu hồi sạch tài nguyên.';

  if (usedForbidden.length > 0 || total < 4.5) {
    tier = 'fail';
    badge = 'Chưa Đạt Kiểm Tra Tĩnh / Thiếu Cơ Chế Chính';
    summary = 'Bài làm vi phạm hàm cấm hoặc thiếu các lệnh bắt buộc. Bấm Alt+A để đối chiếu đáp án và xem giải thích chi tiết.';
  } else if (total < 7.0) {
    tier = 'weak';
    badge = 'Cần Củng Cố Thêm Điều Kiện Biên';
    summary = 'Hướng đi đã rõ nhưng còn thiếu xử lý biên hoặc đóng/thu hồi tài nguyên dễ gây sai test ẩn.';
  } else if (total < 9.0) {
    tier = 'good';
    badge = 'Khá Tốt — Tinh Chỉnh Thêm Để Đạt 10/10';
    summary = 'Khung code chính đã đúng! Xem thêm các gạch đầu dòng báo vàng để đạt điểm tuyệt đối.';
  }

  return { score10: total, percent: Math.round(total * 10), tier, badge, summary, criteria, feedback };
}
