// Automatic Learning Progress Tracker (Theory Reading + Topic MCQ + Topic Code -> Auto Tick ✓)
import { CHAPTERS } from '../../data/book/chapters-data.js';
import { OFFICIAL_SEB_40, TOPIC_TO_SEB_QUESTIONS } from '../../data/code-50/index.js?v=11';

export function isValidCodeId(id) {
  return OFFICIAL_SEB_40.some((q) => q.id === id);
}

export function isCodeSolved(state, id) {
  return state.solvedCodeIds.has(id) || state.sebScores?.[id]?.tier === 'mastered';
}

export function getSolvedCodeCount(state) {
  let cnt = 0;
  for (const q of OFFICIAL_SEB_40) {
    if (isCodeSolved(state, q.id)) cnt++;
  }
  return cnt;
}

export function getTopicProgress(state, topicId, mcqBank = []) {
  const read = Boolean(state.readTopicIds?.has(topicId) || state.bookmarked?.has(topicId));
  const topicMcqs = mcqBank.filter((q) => q.topicId === topicId);
  const mcqTotal = topicMcqs.length;
  const mcqDone = topicMcqs.filter((q) => state.mcqMasteredIds.has(q.id)).length;

  const topicCodes = TOPIC_TO_SEB_QUESTIONS[topicId] || [];
  const codeTotal = topicCodes.length;
  const codeDone = topicCodes.filter((sq) => isCodeSolved(state, sq.id)).length;

  const mcqOk = mcqTotal === 0 || mcqDone === mcqTotal;
  const codeOk = codeTotal === 0 || codeDone === codeTotal;
  const completed = read && mcqOk && codeOk;

  return { read, mcqDone, mcqTotal, mcqOk, codeDone, codeTotal, codeOk, completed };
}

export function getChapterProgress(state, chapterId, mcqBank = []) {
  const ch = CHAPTERS.find((c) => String(c.id) === String(chapterId));
  if (!ch) return { topicsDone: 0, topicsTotal: 0, mcqDone: 0, mcqTotal: 0, codeDone: 0, codeTotal: 0, completed: false };

  const topics = ch.topics || [];
  let topicsDone = 0;
  const linkedCodeIds = new Set();

  for (const t of topics) {
    const tp = getTopicProgress(state, t.id, mcqBank);
    if (tp.completed) topicsDone++;
    for (const sq of TOPIC_TO_SEB_QUESTIONS[t.id] || []) {
      linkedCodeIds.add(sq.id);
    }
  }

  const chMcqs = mcqBank.filter((q) => String(q.chapter) === String(chapterId));
  const mcqTotal = chMcqs.length;
  const mcqDone = chMcqs.filter((q) => state.mcqMasteredIds.has(q.id)).length;

  const codeTotal = linkedCodeIds.size;
  let codeDone = 0;
  for (const cid of linkedCodeIds) {
    if (isCodeSolved(state, cid)) codeDone++;
  }

  const completed =
    topics.length > 0 &&
    topicsDone === topics.length &&
    (mcqTotal === 0 || mcqDone === mcqTotal) &&
    (codeTotal === 0 || codeDone === codeTotal);

  return {
    topicsDone,
    topicsTotal: topics.length,
    mcqDone,
    mcqTotal,
    codeDone,
    codeTotal,
    completed,
  };
}

export function getAllChaptersProgress(state, mcqBank = []) {
  const byChapter = {};
  let completedChapters = 0;
  for (const ch of CHAPTERS) {
    const cp = getChapterProgress(state, ch.id, mcqBank);
    byChapter[String(ch.id)] = cp;
    if (cp.completed) completedChapters++;
  }
  return { completedChapters, totalChapters: CHAPTERS.length, byChapter };
}

export function getMcqChapterProgress(state, chapterNum, mcqBank = []) {
  const list = chapterNum === 'all'
    ? mcqBank
    : mcqBank.filter((q) => String(q.chapter) === String(chapterNum));
  const total = list.length;
  const done = list.filter((q) => state.mcqMasteredIds.has(q.id)).length;
  return { done, total, completed: total > 0 && done === total };
}

export function getCodePartProgress(state, partId) {
  const list = partId === 'all'
    ? OFFICIAL_SEB_40
    : OFFICIAL_SEB_40.filter((q) => q.part === partId);
  const total = list.length;
  const done = list.filter((q) => isCodeSolved(state, q.id)).length;
  return { done, total, completed: total > 0 && done === total };
}

export function snapshotCompletions(state, mcqBank = []) {
  const topics = new Set();
  const chapters = new Set();
  for (const ch of CHAPTERS) {
    for (const t of ch.topics || []) {
      if (getTopicProgress(state, t.id, mcqBank).completed) topics.add(t.id);
    }
    if (getChapterProgress(state, ch.id, mcqBank).completed) chapters.add(String(ch.id));
  }
  return { topics, chapters };
}

let toastTimer = null;
export function showProgressToast(message) {
  if (typeof document === 'undefined' || !message) return;
  let el = document.getElementById('eltProgressToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'eltProgressToast';
    el.className = 'progress-toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('is-visible');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('is-visible');
  }, 3400);
}

export function notifyNewCompletions(state, mcqBank, beforeSnap) {
  if (!beforeSnap) return;
  const afterSnap = snapshotCompletions(state, mcqBank);
  const newChapters = [...afterSnap.chapters].filter((c) => !beforeSnap.chapters.has(c));
  if (newChapters.length > 0) {
    const ch = CHAPTERS.find((x) => String(x.id) === newChapters[0]);
    showProgressToast(`🏆 Hoàn thành 100% Chương ${newChapters[0]}${ch ? ` · ${ch.title}` : ''} ✓`);
    return;
  }
  const newTopics = [...afterSnap.topics].filter((t) => !beforeSnap.topics.has(t));
  if (newTopics.length > 0) {
    const codeLabel = newTopics[0].replace('-', '.');
    showProgressToast(`🎉 Hoàn thành trọn vẹn Mục ${codeLabel} (Lý thuyết + Trắc nghiệm + Code) ✓`);
  }
}
