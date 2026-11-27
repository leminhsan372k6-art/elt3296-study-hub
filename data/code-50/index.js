import { PART1_FILE_QUESTIONS } from './part1-file.js?v=11';
import { PART2_PROCESS_QUESTIONS } from './part2-process.js?v=11';
import { PART3_THREAD_QUESTIONS } from './part3-thread.js?v=11';
import { PART4_PARALLEL_QUESTIONS } from './part4-parallel.js?v=11';
import { PART5_DP_QUESTIONS } from './part5-dp.js?v=11';

export { gradeSubmission } from './grader.js';

export const OFFICIAL_SEB_40 = [
  ...PART1_FILE_QUESTIONS,
  ...PART2_PROCESS_QUESTIONS,
  ...PART3_THREAD_QUESTIONS,
  ...PART4_PARALLEL_QUESTIONS,
  ...PART5_DP_QUESTIONS,
];

// Keep alias for internal backward compatibility
export const OFFICIAL_SEB_50 = OFFICIAL_SEB_40;

export const SEB_PARTS = [
  { id: 'all', label: 'Tất cả 40 câu' },
  { id: 'File', label: 'Phần 1 · File (01–08)' },
  { id: 'Process', label: 'Phần 2 · Process (09–16)' },
  { id: 'Thread', label: 'Phần 3 · Thread (17–24)' },
  { id: 'Song song', label: 'Phần 4 · Song song (25–32)' },
  { id: 'Quy hoạch động', label: 'Phần 5 · DP (33–40)' },
];

export const TOPIC_TO_SEB_QUESTIONS = {};
for (const q of OFFICIAL_SEB_40) {
  for (const rt of q.relatedTopics || []) {
    if (!TOPIC_TO_SEB_QUESTIONS[rt.id]) TOPIC_TO_SEB_QUESTIONS[rt.id] = [];
    if (!TOPIC_TO_SEB_QUESTIONS[rt.id].some((x) => x.id === q.id)) {
      TOPIC_TO_SEB_QUESTIONS[rt.id].push({
        id: q.id,
        num: q.num,
        title: q.title,
        difficulty: q.difficulty,
        part: q.part,
      });
    }
  }
}
