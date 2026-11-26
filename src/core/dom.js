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
  const comments = [];
  html = html.replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/|^#[^\n]*)/gm, (m) => {
    comments.push(`<span class="kc-cm">${m}</span>`);
    return `\u0000CM${comments.length - 1}\u0000`;
  });
  const strings = [];
  html = html.replace(/("(?:\\.|[^"\\])*")/g, (m) => {
    strings.push(`<span class="kc-st">${m}</span>`);
    return `\u0000ST${strings.length - 1}\u0000`;
  });

  html = html.replace(
    /\b(if|else|for|while|do|switch|case|break|continue|return|typedef|struct|static|const|volatile|sizeof|then|fi|in|done|local)\b/g,
    '<span class="kc-kw">$1</span>'
  );
  html = html.replace(
    /\b(int|long|unsigned|char|void|double|float|int32_t|pid_t|ssize_t|size_t|off_t|sig_atomic_t|sigset_t|pthread_t|pthread_mutex_t|pthread_cond_t|DIR|FILE)\b/g,
    '<span class="kc-ty">$1</span>'
  );
  html = html.replace(
    /\b(fork|wait|waitpid|exit|_exit|open|read|write|close|lseek|dup|dup2|stat|lstat|fstat|opendir|readdir|closedir|fflush|mmap|munmap|pipe|execlp|execvp|execv|signal|sigaction|sigprocmask|sigsuspend|sigemptyset|sigaddset|kill|getpid|getppid|pthread_create|pthread_join|pthread_detach|pthread_exit|pthread_mutex_init|pthread_mutex_destroy|pthread_mutex_lock|pthread_mutex_unlock|pthread_cond_wait|pthread_cond_signal|pthread_cond_broadcast|printf|scanf|sscanf|snprintf|malloc|free|memset|strlen|strcmp|qsort|S_ISREG|S_ISDIR|WIFEXITED|WEXITSTATUS|WIFSIGNALED|WTERMSIG)\b/g,
    '<span class="kc-fn">$1</span>'
  );
  html = html.replace(
    /\b(NULL|EOF|O_RDONLY|O_WRONLY|O_RDWR|O_CREAT|O_TRUNC|O_APPEND|SEEK_SET|SEEK_CUR|SEEK_END|STDIN_FILENO|STDOUT_FILENO|SIGINT|SIGKILL|SIGUSR1|SIGUSR2|SIG_BLOCK|MAP_SHARED|MAP_PRIVATE|MAP_FAILED|PROT_READ|PROT_WRITE|PTHREAD_MUTEX_INITIALIZER|PTHREAD_COND_INITIALIZER|0644|0777|\d+)\b/g,
    '<span class="kc-nu">$1</span>'
  );

  html = html.replace(/\u0000ST(\d+)\u0000/g, (_, i) => strings[Number(i)]);
  html = html.replace(/\u0000CM(\d+)\u0000/g, (_, i) => comments[Number(i)]);
  return html;
}
