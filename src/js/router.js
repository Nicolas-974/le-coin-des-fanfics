import { renderChapter, showLoader, hideLoader } from './reader.js';
import { initI18n, applyTranslations, getCurrentLang, switchLanguage } from './i18n.js';
import { stopCurrentAudio, initAudioPlayers, updateAudioLanguage } from './audio.js';
import { initHoverImages, initRevealSpoiler, initRevealGroup, initThemePanel } from './widget.js';
import { initHelpButton } from './help.js';

export async function loadChapter(fanficId, chapterNumber, { updateHistory = true } = {}) {
  stopCurrentAudio();
  showLoader();

  try {
    await Promise.all([
      renderChapter(fanficId, chapterNumber),
      initI18n(fanficId, chapterNumber, getCurrentLang()),
    ]);

    applyTranslations();
    initAudioPlayers();
    initHoverImages();
    initRevealSpoiler();
    initRevealGroup();
    syncChapterNav(chapterNumber);

    if (updateHistory) {
      const url = new URL(window.location.href);
      url.searchParams.set('chapter', chapterNumber);
      history.pushState({ chapter: chapterNumber }, '', url);
    }

    preloadNextChapter(fanficId, chapterNumber);
  } finally {
    hideLoader();
  }
}

function preloadNextChapter(fanficId, chapterNumber) {
  const nextChapter = chapterNumber + 1;
  const nextChapterPadded = String(nextChapter).padStart(2, '0');

  fetch(`/fanfics/${fanficId}/chapters/${nextChapterPadded}/content.json`).catch(() => {});
  fetch(`/fanfics/${fanficId}/lang/${getCurrentLang()}/chapter${nextChapter}.json`).catch(() => {});
}

export async function initRouter(fanficId) {
  window.addEventListener('popstate', (event) => {
    const chapterNumber = event.state?.chapter ?? getChapterFromUrl();
    loadChapter(fanficId, chapterNumber, { updateHistory: false });
  });

  const response = await fetch(`/fanfics/${fanficId}/meta.json`);
  const meta = await response.json();
  initThemePanel(meta.themes);
  initHelpButton(fanficId, meta.demoCharacter);
  chaptersMeta = meta.chapters;
  renderChapterNav(fanficId);

  const langBtn = document.querySelector('#lang-toggle');
  langBtn?.addEventListener('click', async (event) => {
    event.stopPropagation();
    const nextLang = getCurrentLang() === 'fr' ? 'en' : 'fr';
    langBtn.disabled = true;
    showLoader();
    try {
      await switchLanguage(fanficId, getChapterFromUrl(), nextLang);
      updateAudioLanguage(nextLang);
      renderChapterNav(fanficId);
    } finally {
      hideLoader();
      langBtn.disabled = false;
    }
  });
}

export function getChapterFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('chapter');
  return raw === null ? 1 : Number(raw);
}

let chaptersMeta = [];

const NAV_LABELS = {
  fr: { prev: 'Précédent', next: 'Suivant' },
  en: { prev: 'Previous', next: 'Next' },
};

const CHAPTER_LABEL_MAX_LENGTH = 24;

function chapterLabel(chapter, lang) {
  const num = String(chapter.number).padStart(2, '0');
  const title = chapter.title[lang] ?? chapter.title.fr;
  return `${num}. ${title}`;
}

function truncateLabel(label, maxLength = CHAPTER_LABEL_MAX_LENGTH) {
  if (label.length <= maxLength) return label;
  return `${label.slice(0, maxLength).trimEnd()}…`;
}

function renderChapterNavHtml(lang) {
  const labels = NAV_LABELS[lang] ?? NAV_LABELS.fr;
  const options = chaptersMeta
    .map((c) => {
      const label = chapterLabel(c, lang);
      return `<option value="${c.number}" title="${label}">${truncateLabel(label)}</option>`;
    })
    .join('');

  return `
    <div class="chapter-select-wrapper">
      <span data-i18n="chapter_list"></span>
      <select class="chapter-select">${options}</select>
    </div>
    <div class="chapter-buttons">
      <button type="button" class="chapter-prev">‹ ${labels.prev}</button>
      <button type="button" class="chapter-next">${labels.next} ›</button>
    </div>
  `;
}

function wireChapterNav(nav, fanficId) {
  const select = nav.querySelector('.chapter-select');
  const prevBtn = nav.querySelector('.chapter-prev');
  const nextBtn = nav.querySelector('.chapter-next');

  select?.addEventListener('change', () => {
    loadChapter(fanficId, Number(select.value));
  });

  prevBtn?.addEventListener('click', () => {
    if (!prevBtn.disabled) loadChapter(fanficId, getChapterFromUrl() - 1);
  });

  nextBtn?.addEventListener('click', () => {
    if (!nextBtn.disabled) loadChapter(fanficId, getChapterFromUrl() + 1);
  });
}

function renderChapterNav(fanficId) {
  const html = renderChapterNavHtml(getCurrentLang());

  document.querySelectorAll('.chapter-nav').forEach((nav) => {
    nav.innerHTML = html;
    wireChapterNav(nav, fanficId);
  });

  applyTranslations();
  syncChapterNav(getChapterFromUrl());
}

function syncChapterNav(chapterNumber) {
  if (!chaptersMeta.length) return;

  const min = chaptersMeta[0].number;
  const max = chaptersMeta[chaptersMeta.length - 1].number;

  document.querySelectorAll('.chapter-nav').forEach((nav) => {
    const select = nav.querySelector('.chapter-select');
    if (select) select.value = String(chapterNumber);

    const prevBtn = nav.querySelector('.chapter-prev');
    if (prevBtn) prevBtn.disabled = chapterNumber <= min;

    const nextBtn = nav.querySelector('.chapter-next');
    if (nextBtn) nextBtn.disabled = chapterNumber >= max;
  });
}
