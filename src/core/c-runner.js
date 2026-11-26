// Fast Single-Compile Linux GCC C11 Judge (Compiles ONCE, executes all Sample + Hidden tests via fork/waitpid in 1 HTTP call!)

function toByteArray(spec) {
  if (!spec) return [];
  if (Array.isArray(spec.bytes)) return spec.bytes;
  if (typeof spec.text === 'string') return [...new TextEncoder().encode(spec.text)];
  return [];
}

function escapeCString(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * Append a transparent batch test harness AT THE BOTTOM of the student's code.
 * - Because it is appended AFTER the student's code, GCC compile error line numbers match the editor 1-to-1.
 * - Compiles ONCE instead of N times, running every test case inside an isolated fork() + chdir() sandbox!
 */
function buildBatchSource(studentCode, testCases) {
  const L = [
    '',
    '/* === ELT3296 SINGLE-COMPILE BATCH SANDBOX HARNESS === */',
    '#include <fcntl.h>',
    '#include <unistd.h>',
    '#include <sys/stat.h>',
    '#include <sys/wait.h>',
    '#include <stdio.h>',
    '#include <stdlib.h>',
    '#include <string.h>',
    '',
    'static void __elt_write_file(const char *path, const unsigned char *data, size_t len, int mode) {',
    '  int fd = open(path, O_WRONLY | O_CREAT | O_TRUNC, mode ? mode : 0644);',
    '  if (fd >= 0) {',
    '    size_t off = 0;',
    '    while (off < len) {',
    '      ssize_t w = write(fd, data + off, len - off);',
    '      if (w <= 0) break;',
    '      off += (size_t)w;',
    '    }',
    '    close(fd);',
    '    if (mode) chmod(path, mode);',
    '  }',
    '}',
    '',
    '__attribute__((constructor)) static void __elt_batch_runner(void) {',
    '  if (getenv("__ELT_CHILD_RUN")) return;',
    '  setenv("__ELT_CHILD_RUN", "1", 1);',
    '  char __base[1024];',
    '  if (!getcwd(__base, sizeof(__base))) strcpy(__base, ".");',
  ];

  testCases.forEach((tc, idx) => {
    const dirName = `__elt_tc_${idx}`;
    const stdinBytes = toByteArray({ text: tc.stdin || '' });
    L.push(`  {`);
    L.push(`    chdir(__base);`);
    L.push(`    mkdir("${dirName}", 0755);`);
    L.push(`    chdir("${dirName}");`);

    if (tc.setup?.dirs?.length) {
      for (const d of tc.setup.dirs) {
        L.push(`    mkdir("${escapeCString(d)}", 0755);`);
      }
    }
    if (tc.setup?.files?.length) {
      tc.setup.files.forEach((f, fIdx) => {
        const b = toByteArray(f);
        const mode = f.mode ? `0${f.mode.toString(8)}` : '0';
        if (b.length > 0) {
          L.push(`    static const unsigned char __sf_${idx}_${fIdx}[] = {${b.join(',')}};`);
          L.push(`    __elt_write_file("${escapeCString(f.path)}", __sf_${idx}_${fIdx}, ${b.length}, ${mode});`);
        } else {
          L.push(`    __elt_write_file("${escapeCString(f.path)}", (const unsigned char*)"", 0, ${mode});`);
        }
      });
    }

    if (stdinBytes.length > 0) {
      L.push(`    static const unsigned char __in_${idx}[] = {${stdinBytes.join(',')}};`);
      L.push(`    __elt_write_file("__elt_in.tmp", __in_${idx}, ${stdinBytes.length}, 0644);`);
    } else {
      L.push(`    __elt_write_file("__elt_in.tmp", (const unsigned char*)"", 0, 0644);`);
    }

    L.push(`    int __op[2]; pipe(__op);`);
    L.push(`    fflush(stdout); fflush(stderr);`);
    L.push(`    pid_t __pid = fork();`);
    L.push(`    if (__pid == 0) {`);
    L.push(`      int __ifd = open("__elt_in.tmp", O_RDONLY);`);
    L.push(`      if (__ifd >= 0) { dup2(__ifd, STDIN_FILENO); close(__ifd); }`);
    L.push(`      dup2(__op[1], STDOUT_FILENO);`);
    L.push(`      close(__op[0]); close(__op[1]);`);
    L.push(`      alarm(4);`);
    L.push(`      return;`);
    L.push(`    }`);
    L.push(`    close(__op[1]);`);
    L.push(`    printf("__ELT_TC_START_%d__\\n", ${idx});`);
    L.push(`    fflush(stdout);`);
    L.push(`    char __rb[4096]; ssize_t __rn;`);
    L.push(`    while ((__rn = read(__op[0], __rb, sizeof(__rb))) > 0) {`);
    L.push(`      ssize_t __wo = 0; while (__wo < __rn) { ssize_t __ww = write(STDOUT_FILENO, __rb + __wo, (size_t)(__rn - __wo)); if (__ww <= 0) break; __wo += __ww; }`);
    L.push(`    }`);
    L.push(`    close(__op[0]);`);
    L.push(`    int __st = 0; waitpid(__pid, &__st, 0);`);
    L.push(`    int __ec = WIFEXITED(__st) ? WEXITSTATUS(__st) : -1;`);
    L.push(`    int __sg = WIFSIGNALED(__st) ? WTERMSIG(__st) : 0;`);

    if (tc.checkFile) {
      const expB = toByteArray(tc.checkFile);
      L.push(`    int __fok = 0; char __fmsg[64] = "missing";`);
      L.push(`    int __cfd = open("${escapeCString(tc.checkFile.path)}", O_RDONLY);`);
      L.push(`    if (__cfd >= 0) {`);
      L.push(`      struct stat __cst; fstat(__cfd, &__cst);`);
      L.push(`      if ((long long)__cst.st_size != ${expB.length}) {`);
      L.push(`        snprintf(__fmsg, sizeof(__fmsg), "size=%lld_expected=${expB.length}", (long long)__cst.st_size);`);
      L.push(`      } else {`);
      if (expB.length > 0) {
        L.push(`        static const unsigned char __cexp_${idx}[] = {${expB.join(',')}};`);
        L.push(`        unsigned char __cgot[${expB.length}];`);
        L.push(`        ssize_t __cn = read(__cfd, __cgot, ${expB.length});`);
        L.push(`        if (__cn == ${expB.length} && memcmp(__cgot, __cexp_${idx}, ${expB.length}) == 0) { __fok = 1; strcpy(__fmsg, "ok"); }`);
        L.push(`        else strcpy(__fmsg, "content_mismatch");`);
      } else {
        L.push(`        __fok = 1; strcpy(__fmsg, "ok");`);
      }
      L.push(`      }`);
      L.push(`      close(__cfd);`);
      L.push(`    }`);
      L.push(`    printf("\\n__ELT_TC_END_%d__:%d:%d:%d:%s\\n", ${idx}, __ec, __sg, __fok, __fmsg);`);
    } else {
      L.push(`    printf("\\n__ELT_TC_END_%d__:%d:%d:1:ok\\n", ${idx}, __ec, __sg);`);
    }
    L.push(`    fflush(stdout);`);
    L.push(`  }`);
  });

  L.push('  _exit(0);');
  L.push('}');
  return `${studentCode}\n${L.join('\n')}\n`;
}

function toBase64Utf8(str) {
  const bytes = new TextEncoder().encode(String(str || ''));
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function fromBase64Utf8(b64) {
  if (!b64) return '';
  const bin = atob(String(b64).replace(/\s+/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}

async function runViaWandbox(source, signal) {
  const res = await fetch('https://wandbox.org/api/compile.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      compiler: 'gcc-head-c',
      code: source,
      stdin: '',
      'compiler-option-raw': '-O0\n-std=gnu11\n-pthread\n-lm',
    }),
    signal: signal || AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Wandbox HTTP ${res.status}`);
  const data = await res.json();
  const compileErr = (data.compiler_error || '').trim();
  const exitStatus = data.status;

  if (compileErr && (!data.program_output || /error:/i.test(compileErr))) {
    return { engine: 'Wandbox GCC', compileError: compileErr, stdout: '', stderr: '' };
  }
  return {
    engine: 'Wandbox GCC',
    compileError: '',
    stdout: data.program_output || '',
    stderr: data.program_error || '',
    exitCode: Number(exitStatus ?? 0),
  };
}

async function runViaJudge0(source, signal) {
  const res = await fetch('https://ce.judge0.com/submissions/?base64_encoded=true&wait=true', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_code: toBase64Utf8(source),
      language_id: 50,
      stdin: '',
      compiler_options: '-O0 -std=gnu11 -pthread -lm',
    }),
    signal: signal || AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Judge0 HTTP ${res.status}`);
  const data = await res.json();
  const compileOut = fromBase64Utf8(data.compile_output);
  if (data.status?.id === 6) {
    return { engine: 'Judge0 GCC', compileError: compileOut || 'Compilation Error', stdout: '', stderr: '' };
  }
  return {
    engine: 'Judge0 GCC',
    compileError: '',
    stdout: fromBase64Utf8(data.stdout),
    stderr: fromBase64Utf8(data.stderr),
    exitCode: data.status?.id === 3 ? 0 : 1,
  };
}

async function compileAndRunBatch(source) {
  // Hedged parallel race: Judge0 CE & Wandbox race in parallel; fastest server wins immediately and cancels the slower request!
  const ac1 = new AbortController();
  const ac2 = new AbortController();
  const timer = setTimeout(() => { ac1.abort(); ac2.abort(); }, 12000);
  try {
    const winner = await Promise.any([
      runViaJudge0(source, ac1.signal).then((r) => { ac2.abort(); return r; }),
      runViaWandbox(source, ac2.signal).then((r) => { ac1.abort(); return r; }),
    ]);
    return winner;
  } finally {
    clearTimeout(timer);
  }
}

function normalizeOut(s) {
  return String(s || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trimEnd())
    .join('\n')
    .trim();
}

function signalLabel(sig) {
  if (sig === 14) return 'TIME LIMIT EXCEEDED (SIGALRM)';
  if (sig === 11) return 'SEGMENTATION FAULT (SIGSEGV)';
  if (sig === 9) return 'KILLED (SIGKILL)';
  if (sig === 6) return 'ABORTED (SIGABRT)';
  if (sig === 8) return 'FLOATING POINT ERROR (SIGFPE)';
  return sig ? `SIGNAL ${sig}` : '';
}

/**
 * Compile ONCE and run student's C11 code against ALL test cases (Sample + Hidden) in a single HTTP round-trip!
 */
export async function runRealTestSuite(studentCode, testCases, onProgress) {
  const t0 = Date.now();
  if (onProgress) onProgress(1, testCases.length, `Biên dịch 1 lần & chạy đồng loạt ${testCases.length} test case…`);

  const batchSource = buildBatchSource(studentCode, testCases);
  const run = await compileAndRunBatch(batchSource);
  const elapsedMs = Date.now() - t0;

  if (run.compileError) {
    return {
      engine: run.engine,
      elapsedMs,
      compileError: run.compileError,
      passed: 0,
      total: testCases.length,
      results: [],
    };
  }

  const rawOut = run.stdout || '';
  const results = testCases.map((tc, idx) => {
    const startTag = `__ELT_TC_START_${idx}__\n`;
    const endRe = new RegExp(`\\n__ELT_TC_END_${idx}__:(-?\\d+):(\\d+):(\\d+):([^\\n]*)`);
    const sPos = rawOut.indexOf(startTag);
    let actualRaw = '';
    let exitCode = 1;
    let sigNum = 0;
    let fileOk = true;
    let fileFailReason = '';

    if (sPos !== -1) {
      const afterStart = rawOut.slice(sPos + startTag.length);
      const m = afterStart.match(endRe);
      if (m) {
        actualRaw = afterStart.slice(0, m.index);
        exitCode = Number(m[1]);
        sigNum = Number(m[2]);
        fileOk = m[3] === '1';
        fileFailReason = fileOk ? '' : m[4] || 'Tệp đích chưa khớp';
      }
    }

    const actual = normalizeOut(actualRaw);
    const expected = normalizeOut(tc.expected);
    const stdoutMatch = actual === expected;
    const sigText = signalLabel(sigNum);
    const crashed = sigNum !== 0 || exitCode !== 0;
    const ok = !crashed && stdoutMatch && fileOk;

    return {
      name: tc.name,
      hidden: Boolean(tc.hidden),
      ok,
      status: sigNum === 14 ? 'QUÁ THỜI GIAN' : crashed ? 'RUNTIME ERROR' : ok ? 'PASS' : !stdoutMatch ? 'SAI STDOUT' : 'SAI TỆP ĐÍCH',
      stdin: tc.stdin,
      expected,
      actual,
      fileFailReason,
      signal: sigText,
      hint: tc.hint || '',
    };
  });

  return {
    engine: run.engine,
    elapsedMs,
    compileError: '',
    passed: results.filter((r) => r.ok).length,
    total: results.length,
    results,
  };
}
