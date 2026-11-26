// Real Linux GCC C11 Compiler & Test-Case Judge (Runs directly from GitHub Pages via Wandbox / Judge0 CE CORS API)

function toByteArray(spec) {
  if (Array.isArray(spec.bytes)) return spec.bytes;
  if (typeof spec.text === 'string') return [...new TextEncoder().encode(spec.text)];
  return [];
}

function escapeCString(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * Append a transparent C constructor/destructor AT THE BOTTOM of the student's code
 * so GCC line numbers for any compile error match the student's editor 1-to-1!
 */
function instrumentCode(studentCode, tc) {
  const needsSetup = Boolean(tc.setup && (tc.setup.dirs?.length || tc.setup.files?.length));
  const needsCheck = Boolean(tc.checkFile);
  if (!needsSetup && !needsCheck) return studentCode;

  const lines = [
    '',
    '/* === SANDBOX TEST HARNESS (AUTO-APPENDED AFTER STUDENT CODE) === */',
    '#include <fcntl.h>',
    '#include <unistd.h>',
    '#include <sys/stat.h>',
    '#include <stdio.h>',
  ];

  if (needsSetup) {
    lines.push('__attribute__((constructor)) static void __elt_setup(void) {');
    for (const d of tc.setup.dirs || []) {
      lines.push(`  mkdir("${escapeCString(d)}", 0755);`);
    }
    (tc.setup.files || []).forEach((f, idx) => {
      const bytes = toByteArray(f);
      const mode = f.mode ? `0${f.mode.toString(8)}` : '0644';
      lines.push(`  {`);
      lines.push(`    int __fd = open("${escapeCString(f.path)}", O_WRONLY | O_CREAT | O_TRUNC, ${mode});`);
      if (bytes.length > 0) {
        lines.push(`    unsigned char __d${idx}[] = {${bytes.join(',')}};`);
        lines.push(`    if (__fd >= 0) { ssize_t __w = write(__fd, __d${idx}, ${bytes.length}); (void)__w; }`);
      }
      lines.push(`    if (__fd >= 0) close(__fd);`);
      if (f.mode) {
        lines.push(`    chmod("${escapeCString(f.path)}", ${mode});`);
      }
      lines.push(`  }`);
    });
    lines.push('}');
  }

  if (needsCheck) {
    const expBytes = toByteArray(tc.checkFile);
    lines.push('__attribute__((destructor)) static void __elt_verify_file(void) {');
    lines.push(`  int __fd = open("${escapeCString(tc.checkFile.path)}", O_RDONLY);`);
    lines.push('  if (__fd < 0) { fprintf(stderr, "\\n__ELT_FILE_FAIL__:missing\\n"); return; }');
    lines.push('  struct stat __st; fstat(__fd, &__st);');
    lines.push(`  if ((long long)__st.st_size != ${expBytes.length}) { close(__fd); fprintf(stderr, "\\n__ELT_FILE_FAIL__:size=%lld_expected=${expBytes.length}\\n", (long long)__st.st_size); return; }`);
    if (expBytes.length > 0) {
      lines.push(`  unsigned char __exp[] = {${expBytes.join(',')}};`);
      lines.push(`  unsigned char __got[${expBytes.length}];`);
      lines.push(`  ssize_t __n = read(__fd, __got, ${expBytes.length});`);
      lines.push(`  int __ok = (__n == ${expBytes.length});`);
      lines.push(`  for (int __i = 0; __ok && __i < ${expBytes.length}; __i++) if (__got[__i] != __exp[__i]) __ok = 0;`);
      lines.push('  close(__fd);');
      lines.push('  fprintf(stderr, __ok ? "\\n__ELT_FILE_OK__\\n" : "\\n__ELT_FILE_FAIL__:content_mismatch\\n");');
    } else {
      lines.push('  close(__fd);');
      lines.push('  fprintf(stderr, "\\n__ELT_FILE_OK__\\n");');
    }
    lines.push('}');
  }

  return `${studentCode}\n${lines.join('\n')}\n`;
}

async function runViaWandbox(source, stdin) {
  const res = await fetch('https://wandbox.org/api/compile.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      compiler: 'gcc-head-c',
      code: source,
      stdin: stdin || '',
      'compiler-option-raw': '-O2\n-std=gnu11\n-pthread\n-lm',
    }),
    signal: AbortSignal.timeout(18000),
  });
  if (!res.ok) throw new Error(`Wandbox HTTP ${res.status}`);
  const data = await res.json();
  const compileErr = (data.compiler_error || '').trim();
  const exitStatus = data.status;
  const sig = data.signal || '';

  if (compileErr && (exitStatus === undefined || exitStatus === null || exitStatus === '' || exitStatus !== '0') && !data.program_output && !data.program_error) {
    return { engine: 'Wandbox GCC', compileError: compileErr, stdout: '', stderr: '', exitCode: 1, signal: '' };
  }
  return {
    engine: 'Wandbox GCC',
    compileError: compileErr && /error:/i.test(compileErr) ? compileErr : '',
    stdout: data.program_output || '',
    stderr: data.program_error || '',
    exitCode: Number(exitStatus ?? 0),
    signal: sig,
  };
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

async function runViaJudge0(source, stdin) {
  const res = await fetch('https://ce.judge0.com/submissions/?base64_encoded=true&wait=true', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_code: toBase64Utf8(source),
      language_id: 50,
      stdin: toBase64Utf8(stdin || ''),
      compiler_options: '-O2 -std=gnu11 -pthread -lm',
    }),
    signal: AbortSignal.timeout(18000),
  });
  if (!res.ok) throw new Error(`Judge0 HTTP ${res.status}`);
  const data = await res.json();
  const compileOut = fromBase64Utf8(data.compile_output);
  const stdout = fromBase64Utf8(data.stdout);
  const stderr = fromBase64Utf8(data.stderr);
  if (data.status?.id === 6) {
    return { engine: 'Judge0 GCC', compileError: compileOut || 'Compilation Error', stdout: '', stderr: '', exitCode: 1, signal: '' };
  }
  return {
    engine: 'Judge0 GCC',
    compileError: '',
    stdout,
    stderr,
    exitCode: data.status?.id === 3 ? 0 : 1,
    signal: data.status?.id > 6 ? data.status.description : '',
  };
}

async function compileAndRunOne(source, stdin, preferJudge0 = false) {
  if (preferJudge0) {
    try {
      return await runViaJudge0(source, stdin);
    } catch {
      return await runViaWandbox(source, stdin);
    }
  }
  try {
    return await runViaWandbox(source, stdin);
  } catch {
    return await runViaJudge0(source, stdin);
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

/**
 * Compile and run student's C11 code against ALL test cases (Sample + Hidden) on real Linux GCC.
 */
export async function runRealTestSuite(studentCode, testCases, onProgress) {
  const results = [];
  let engineName = 'Wandbox GCC';
  let preferJudge0 = false;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    if (onProgress) onProgress(i + 1, testCases.length, tc.name);

    const instrumented = instrumentCode(studentCode, tc);
    const run = await compileAndRunOne(instrumented, tc.stdin, preferJudge0);
    engineName = run.engine;
    if (engineName === 'Judge0 GCC') preferJudge0 = true;

    if (run.compileError) {
      return {
        engine: engineName,
        compileError: run.compileError,
        passed: 0,
        total: testCases.length,
        results: [],
      };
    }

    const actual = normalizeOut(run.stdout);
    const expected = normalizeOut(tc.expected);
    const stdoutMatch = actual === expected;

    let fileOk = true;
    let fileFailReason = '';
    if (tc.checkFile) {
      if (run.stderr.includes('__ELT_FILE_OK__')) {
        fileOk = true;
      } else {
        fileOk = false;
        const m = run.stderr.match(/__ELT_FILE_FAIL__:([^\n]+)/);
        fileFailReason = m ? m[1] : 'Tệp đích chưa khớp nội dung/kích thước yêu cầu';
      }
    }

    const crashed = Boolean(run.signal) || run.exitCode !== 0;
    const ok = !crashed && stdoutMatch && fileOk;

    results.push({
      name: tc.name,
      hidden: Boolean(tc.hidden),
      ok,
      status: crashed ? 'RUNTIME ERROR' : ok ? 'PASS' : !stdoutMatch ? 'SAI STDOUT' : 'SAI TỆP ĐÍCH',
      stdin: tc.stdin,
      expected,
      actual,
      fileFailReason,
      signal: run.signal,
      hint: tc.hint || '',
    });
  }

  return {
    engine: engineName,
    compileError: '',
    passed: results.filter((r) => r.ok).length,
    total: results.length,
    results,
  };
}
