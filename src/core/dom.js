export function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function scrollTopInstant() {
  window.scrollTo({ top: 0, behavior: 'instant' });
}

export function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function formatInlineCode(str) {
  return esc(str || '').replace(/`([^`]+)`/g, '<code>$1</code>');
}

export function highlightCodeSnippet(raw) {
  let html = esc(raw);
  const saved = [];
  const stash = (markup) => {
    saved.push(markup);
    return `\u0000TK${saved.length - 1}\u0000`;
  };

  // 1. Comments (// ... and /* ... */)
  html = html.replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g, (m) => stash(`<span class="kc-cm">${m}</span>`));

  // 2. Preprocessor directives (#include <...>, #define ...)
  html = html.replace(/^([ \t]*)(#[a-zA-Z_]\w*)([ \t]*)(&lt;[^&\n]+&gt;|&quot;[^&\n]+&quot;)?([^\n]*)/gm, (full, sp, dir, gap, hdr, rest) => {
    // Only treat C preprocessor directives cleanly; keep shell comments (# ...) as comments
    if (!/^#(include|define|undef|ifdef|ifndef|if|else|elif|endif|pragma|error)\b/.test(dir)) {
      return stash(`<span class="kc-cm">${full}</span>`);
    }
    const hdrPart = hdr ? `<span class="kc-hd">${hdr}</span>` : '';
    const restPart = rest ? rest.replace(/\b(\d+(?:[uUlL]*)|0x[0-9a-fA-F]+)\b/g, '<span class="kc-nu">$1</span>') : '';
    return `${sp}${stash(`<span class="kc-pp">${dir}</span>${gap}${hdrPart}${restPart}`)}`;
  });

  // 3. String & char literals
  html = html.replace(/(&quot;(?:\\.|(?!&quot;).)*&quot;|&#39;(?:\\.|(?!&#39;).)*&#39;)/g, (m) => stash(`<span class="kc-st">${m}</span>`));

  // 4. Control & storage keywords
  html = html.replace(
    /\b(if|else|for|while|do|switch|case|default|break|continue|return|typedef|struct|union|enum|static|const|volatile|extern|register|inline|sizeof|goto|then|fi|in|done|local)\b/g,
    '<span class="kc-kw">$1</span>'
  );

  // 5. Data types & POSIX structs
  html = html.replace(
    /\b(int|long|short|unsigned|signed|char|void|double|float|bool|_Bool|int8_t|int16_t|int32_t|int64_t|uint8_t|uint16_t|uint32_t|uint64_t|pid_t|ssize_t|size_t|off_t|mode_t|sig_atomic_t|sigset_t|pthread_t|pthread_mutex_t|pthread_cond_t|pthread_attr_t|DIR|FILE)\b/g,
    '<span class="kc-ty">$1</span>'
  );

  // 6. Standard / POSIX / user-defined function calls (any identifier followed by '(')
  html = html.replace(
    /\b([a-zA-Z_]\w*)(?=\s*\()/g,
    (m, fn) => {
      if (/^(if|else|for|while|switch|return|sizeof|typeof)$/.test(fn)) return m;
      return `<span class="kc-fn">${fn}</span>`;
    }
  );

  // 7. Numbers (hex, octal, decimal, float) & POSIX/C constants
  html = html.replace(
    /(?<!&#)\b(NULL|EOF|true|false|O_RDONLY|O_WRONLY|O_RDWR|O_CREAT|O_TRUNC|O_APPEND|SEEK_SET|SEEK_CUR|SEEK_END|STDIN_FILENO|STDOUT_FILENO|STDERR_FILENO|SIGINT|SIGTERM|SIGKILL|SIGUSR1|SIGUSR2|SIGALRM|SIG_BLOCK|SIG_UNBLOCK|SIG_SETMASK|MAP_SHARED|MAP_PRIVATE|MAP_ANONYMOUS|MAP_FAILED|PROT_READ|PROT_WRITE|PTHREAD_MUTEX_INITIALIZER|PTHREAD_COND_INITIALIZER|INT_MAX|INT_MIN|LLONG_MAX|LLONG_MIN|0x[0-9a-fA-F]+|\d+(?:\.\d+)?[uUlLfF]*)\b/g,
    '<span class="kc-nu">$1</span>'
  );

  // 8. Multi-char operators (avoiding HTML entities)
  html = html.replace(/(-&gt;|==|!=|&lt;=|&gt;=|&amp;&amp;|\|\||\+=|-=|\*=|\/=|%=|\+\+|--)/g, '<span class="kc-op">$1</span>');

  // 9. Restore stashed tokens (reverse order in case of nesting)
  for (let i = saved.length - 1; i >= 0; i--) {
    html = html.replace(`\u0000TK${i}\u0000`, () => saved[i]);
  }
  return html;
}
