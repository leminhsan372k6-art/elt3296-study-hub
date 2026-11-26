const STORAGE_KEY = 'elt3296.studio.v1';
export const VALID_THEMES = ['white-titanium', 'natural-titanium', 'desert-titanium', 'black-titanium'];

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function createAppState(defaultTopicId = '1-1') {
  const saved = loadSaved();
  const state = {
    theme: VALID_THEMES.includes(saved.theme) ? saved.theme : 'white-titanium',
    activeTab: saved.activeTab || 'book', // 'book' | 'mcq' | 'code' | 'extras'
    sidebarOpen: saved.sidebarOpen !== false,

    // Book state
    bookSubKind: saved.bookSubKind || 'topic', // 'topic' | 'synthesis'
    topicId: saved.topicId || defaultTopicId,
    bossId: saved.bossId || '1-T',
    bookMode: saved.bookMode || 'split', // 'split' | 'book-only'
    codeSide: saved.codeSide === 'left' ? 'left' : 'right',
    companionStep: 0,
    bookmarked: new Set(Array.isArray(saved.bookmarked) ? saved.bookmarked : []),

    // Code 50 state
    sebMode: saved.sebMode === 'solution' ? 'solution' : 'practice', // 'practice' | 'solution'
    sebLeftView: saved.sebLeftView === 'explain' ? 'explain' : 'problem', // 'problem' | 'explain'
    sebSelectedId: saved.sebSelectedId || 'CR-01',
    sebPartFilter: saved.sebPartFilter || 'all',
    sebDiffFilter: saved.sebDiffFilter || 'all',
    codeDrafts: saved.codeDrafts && typeof saved.codeDrafts === 'object' ? saved.codeDrafts : {},
    sebScores: saved.sebScores && typeof saved.sebScores === 'object' ? saved.sebScores : {},
    sebLastReports: {},
    sebRealRuns: {},
    sebRunningId: null,
    sebRunStatus: '',
    solvedCodeIds: new Set(Array.isArray(saved.solvedCodeIds) ? saved.solvedCodeIds : []),

    // MCQ state (persisted wrong questions for focused review)
    wrongMcqIds: new Set(Array.isArray(saved.wrongMcqIds) ? saved.wrongMcqIds : []),
    mcqMasteredIds: new Set(Array.isArray(saved.mcqMasteredIds) ? saved.mcqMasteredIds : []),

    // Extras tab ('cheatsheet' | 'labs' | 'concepts')
    extrasSub: saved.extrasSub || 'cheatsheet',
    conceptId: saved.conceptId || 'ch4-threads',

    // Overlays
    searchOpen: false,
    searchQuery: '',
  };

  function persist() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          theme: state.theme,
          activeTab: state.activeTab,
          sidebarOpen: state.sidebarOpen,
          bookSubKind: state.bookSubKind,
          topicId: state.topicId,
          bossId: state.bossId,
          bookMode: state.bookMode,
          codeSide: state.codeSide,
          bookmarked: [...state.bookmarked],
          sebMode: state.sebMode,
          sebLeftView: state.sebLeftView,
          sebSelectedId: state.sebSelectedId,
          sebPartFilter: state.sebPartFilter,
          sebDiffFilter: state.sebDiffFilter,
          codeDrafts: state.codeDrafts,
          sebScores: state.sebScores,
          solvedCodeIds: [...state.solvedCodeIds],
          wrongMcqIds: [...state.wrongMcqIds],
          mcqMasteredIds: [...state.mcqMasteredIds],
          extrasSub: state.extrasSub,
          conceptId: state.conceptId,
        })
      );
    } catch {
      /* ignore storage quota */
    }
  }

  return { state, persist };
}
