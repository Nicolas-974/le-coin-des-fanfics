import { initRouter, loadChapter, getChapterFromUrl } from './router.js';

const fanficId = document.body.dataset.fanficId;

initRouter(fanficId);
loadChapter(fanficId, getChapterFromUrl(), { updateHistory: false });
