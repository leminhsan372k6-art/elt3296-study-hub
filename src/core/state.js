import { idbReadState, idbWriteStateDebounced, requestDurableStorage } from './storage.js';

const STORAGE_KEY = 'elt3296.studio.v1';
export const VALID_THEMES = ['white-titanium', 'natural-titanium', 'desert-titanium', 'black-titanium'];

function loadLocalSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function normalizeRealRuns(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    if (!v || typeof v !== 'object') continue;
    out[k] = {
      engine: v.engine || '',
      elapsedMs: Number(v.elapsedMs || 0),
      compileError: typeof v.compileError === 'string' ? v.compileError.slice(0, 3000) : '',
      networkError: v.networkError || '',
      passed: Number(v.passed || 0),
      total: Number(v.total || 0),
      results: Array.isArray(v.results)
        ? v.results.slice(0, 10).map((r) => ({
            name: r.name || '',
            hidden: Boolean(r.hidden),
            ok: Boolean(r.ok),
            status: r.status || '',
            expected: String(r.expected ?? '').slice(0, 500),
            actual: String(r.actual ?? '').slice(0, 500),
            fileFailReason: r.fileFailReason || '',
            signal: r.signal || '',
            hint: r.hint || '',
          }))
        : [],
    };
  }
  return out;
}

function hydrateStateFromData(state, saved, defaultTopicId) {
  if (!saved || typeof saved !== 'object') return;
  if (VALID_THEMES.includes(saved.theme)) state.theme = saved.theme;
  if (saved.activeTab) state.activeTab = saved.activeTab;
  if (typeof saved.sidebarOpen === 'boolean') state.sidebarOpen = saved.sidebarOpen;
  if (saved.bookSubKind) state.bookSubKind = saved.bookSubKind;
  if (saved.topicId) state.topicId = saved.topicId || defaultTopicId;
  if (saved.bossId) state.bossId = saved.bossId;
  if (saved.bookMode) state.bookMode = saved.bookMode;
  if (saved.codeSide === 'left' || saved.codeSide === 'right') state.codeSide = saved.codeSide;
  if (Array.isArray(saved.bookmarked)) state.bookmarked = new Set(saved.bookmarked);
  if (Array.isArray(saved.readTopicIds)) state.readTopicIds = new Set(saved.readTopicIds);

  if (saved.sebMode === 'solution' || saved.sebMode === 'practice') state.sebMode = saved.sebMode;
  if (saved.sebLeftView === 'explain' || saved.sebLeftView === 'problem') state.sebLeftView = saved.sebLeftView;
  if (saved.sebSelectedId) {
    const m = String(saved.sebSelectedId).match(/^CR-(\d+)$/);
    state.sebSelectedId = m && Number(m[1]) <= 40 ? saved.sebSelectedId : 'CR-01';
  }
  if (saved.sebPartFilter && saved.sebPartFilter !== 'Tổng hợp') state.sebPartFilter = saved.sebPartFilter;
  if (saved.sebDiffFilter) state.sebDiffFilter = saved.sebDiffFilter;
  if (saved.codeDrafts && typeof saved.codeDrafts === 'object') state.codeDrafts = { ...saved.codeDrafts };
  if (saved.codeSubmissions && typeof saved.codeSubmissions === 'object') state.codeSubmissions = { ...saved.codeSubmissions };
  if (saved.sebScores && typeof saved.sebScores === 'object') state.sebScores = { ...saved.sebScores };
  if (saved.sebRealRuns && typeof saved.sebRealRuns === 'object') state.sebRealRuns = normalizeRealRuns(saved.sebRealRuns);
  if (Array.isArray(saved.solvedCodeIds)) state.solvedCodeIds = new Set(saved.solvedCodeIds);

  if (Array.isArray(saved.wrongMcqIds)) state.wrongMcqIds = new Set(saved.wrongMcqIds);
  if (Array.isArray(saved.mcqMasteredIds)) state.mcqMasteredIds = new Set(saved.mcqMasteredIds);
  if (saved.mcqPracticePicks && typeof saved.mcqPracticePicks === 'object') state.mcqPracticePicks = { ...saved.mcqPracticePicks };
  if (Array.isArray(saved.mcqExamHistory)) state.mcqExamHistory = saved.mcqExamHistory.slice(0, 30);
  if (Array.isArray(saved.mockExamHistory)) state.mockExamHistory = saved.mockExamHistory.slice(0, 20);

  if (saved.extrasSub) state.extrasSub = saved.extrasSub;
  if (saved.conceptId) state.conceptId = saved.conceptId;
  if (saved.updatedAt) state.lastSavedAt = Number(saved.updatedAt);
}

export function createAppState(defaultTopicId = '1-1') {
  const saved = loadLocalSaved();
  const state = {
    theme: 'white-titanium',
    activeTab: 'book', // 'book' | 'mcq' | 'code' | 'extras'
    sidebarOpen: true,

    // Book state
    bookSubKind: 'topic', // 'topic' | 'synthesis'
    topicId: defaultTopicId,
    bossId: '1-T',
    bookMode: 'split', // 'split' | 'book-only'
    codeSide: 'right',
    companionStep: 0,
    bookmarked: new Set(),
    readTopicIds: new Set(),

    // Code 50 state
    sebMode: 'practice', // 'practice' | 'solution'
    sebLeftView: 'problem', // 'problem' | 'explain'
    sebSelectedId: 'CR-01',
    sebPartFilter: 'all',
    sebDiffFilter: 'all',
    codeDrafts: {},
    codeSubmissions: {}, // { [crId]: [{ id, savedAt, code, source, statusLabel, passed, total, score10, lines }] }
    sebScores: {},
    sebLastReports: {},
    sebRealRuns: {},
    sebRunningId: null,
    sebRunStatus: '',
    sebGradeCollapsed: false,
    sebBottomTab: 'judge', // 'judge' | 'history'
    solvedCodeIds: new Set(),

    // MCQ state (persisted practice picks, wrong/mastered sets, and 20-question exam history)
    wrongMcqIds: new Set(),
    mcqMasteredIds: new Set(),
    mcqPracticePicks: {}, // { [mcqId]: optionIdx }
    mcqExamHistory: [], // [{ id, submittedAt, correct, total, score10, score4, elapsedSec, items }]
    mockExamHistory: [], // Full 90-min Mock Exams (20 MCQ + 3 Code)

    // Extras tab ('cheatsheet' | 'labs' | 'concepts')
    extrasSub: 'cheatsheet',
    conceptId: 'ch4-threads',

    // Overlays & persistence metadata
    searchOpen: false,
    searchQuery: '',
    vaultOpen: false,
    vaultTab: 'code', // 'code' | 'mcq'
    lastSavedAt: 0,
  };

  hydrateStateFromData(state, saved, defaultTopicId);

  function serializeState() {
    const now = Date.now();
    state.lastSavedAt = now;
    return {
      schemaVersion: 2,
      updatedAt: now,
      theme: state.theme,
      activeTab: state.activeTab,
      sidebarOpen: state.sidebarOpen,
      bookSubKind: state.bookSubKind,
      topicId: state.topicId,
      bossId: state.bossId,
      bookMode: state.bookMode,
      codeSide: state.codeSide,
      bookmarked: [...state.bookmarked],
      readTopicIds: [...state.readTopicIds],
      sebMode: state.sebMode,
      sebLeftView: state.sebLeftView,
      sebSelectedId: state.sebSelectedId,
      sebPartFilter: state.sebPartFilter,
      sebDiffFilter: state.sebDiffFilter,
      codeDrafts: state.codeDrafts,
      codeSubmissions: state.codeSubmissions,
      sebScores: state.sebScores,
      sebRealRuns: normalizeRealRuns(state.sebRealRuns),
      solvedCodeIds: [...state.solvedCodeIds],
      wrongMcqIds: [...state.wrongMcqIds],
      mcqMasteredIds: [...state.mcqMasteredIds],
      mcqPracticePicks: state.mcqPracticePicks,
      mcqExamHistory: state.mcqExamHistory.slice(0, 30),
      mockExamHistory: state.mockExamHistory.slice(0, 20),
      extrasSub: state.extrasSub,
      conceptId: state.conceptId,
    };
  }

  function persist() {
    const payload = serializeState();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Fallback: trim sebRealRuns if localStorage quota is tight
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...payload, sebRealRuns: {} }));
      } catch {
        /* ignore */
      }
    }
    idbWriteStateDebounced(payload);
  }

  /**
   * Save a versioned code snapshot for a problem (CR-01..CR-50).
   * Deduplicates consecutive identical manual/auto saves unless result improved.
   */
  function saveCodeSnapshot(crId, code, meta = {}) {
    const trimmed = String(code || '');
    if (!trimmed.trim()) return null;
    if (!Array.isArray(state.codeSubmissions[crId])) state.codeSubmissions[crId] = [];
    const list = state.codeSubmissions[crId];
    const top = list[0];
    const source = meta.source || 'manual';
    const statusLabel = meta.statusLabel || '💾 Lưu thủ công';
    const passed = typeof meta.passed === 'number' ? meta.passed : null;
    const total = typeof meta.total === 'number' ? meta.total : null;
    const score10 = typeof meta.score10 === 'number' ? meta.score10 : null;
    const lines = trimmed.trimEnd().split('\n').length;

    if (top && top.code === trimmed && top.statusLabel === statusLabel && source !== 'manual') {
      top.savedAt = Date.now();
      persist();
      return top;
    }

    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      savedAt: Date.now(),
      code: trimmed,
      source,
      statusLabel,
      passed,
      total,
      score10,
      lines,
    };

    list.unshift(entry);
    // Keep up to 15 snapshots per problem (preserve PASS 100% snapshots when trimming)
    if (list.length > 15) {
      const idxToDrop = list.findLastIndex((x, i) => i >= 5 && !(x.total > 0 && x.passed === x.total));
      list.splice(idxToDrop !== -1 ? idxToDrop : list.length - 1, 1);
    }
    persist();
    return entry;
  }

  function deleteCodeSnapshot(crId, snapId) {
    const list = state.codeSubmissions[crId];
    if (!Array.isArray(list)) return;
    state.codeSubmissions[crId] = list.filter((x) => x.id !== snapId);
    if (state.codeSubmissions[crId].length === 0) delete state.codeSubmissions[crId];
    persist();
  }

  function exportBackup() {
    return JSON.stringify(serializeState(), null, 2);
  }

  function importBackup(rawJson) {
    const parsed = JSON.parse(rawJson);
    if (!parsed || typeof parsed !== 'object') throw new Error('Tệp sao lưu không hợp lệ.');
    hydrateStateFromData(state, parsed, defaultTopicId);
    persist();
  }

  async function hydrateFromIndexedDb() {
    requestDurableStorage();
    const idbData = await idbReadState();
    if (!idbData || typeof idbData !== 'object') return false;
    const localTs = Number(saved.updatedAt || 0);
    const idbTs = Number(idbData.updatedAt || 0);
    const localEmpty = Object.keys(saved).length === 0;
    if (localEmpty || idbTs > localTs) {
      hydrateStateFromData(state, idbData, defaultTopicId);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(idbData));
      } catch {
        /* ignore */
      }
      return true;
    }
    return false;
  }

  return {
    state,
    persist,
    saveCodeSnapshot,
    deleteCodeSnapshot,
    exportBackup,
    importBackup,
    hydrateFromIndexedDb,
  };
}
