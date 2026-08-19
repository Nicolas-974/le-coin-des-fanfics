import i18next from 'i18next';

let currentLang = 'fr';

export async function initI18n(fanficId, chapterNumber, lang = 'fr') {
  currentLang = lang;
  const translations = await loadTranslations(fanficId, chapterNumber, lang);

  await i18next.init({
    lng: lang,
    fallbackLng: 'fr',
    resources: {
      [lang]: { translation: translations },
    },
  });
}

async function loadTranslations(fanficId, chapterNumber, lang) {
  const response = await fetch(`/fanfics/${fanficId}/lang/${lang}/chapter${chapterNumber}.json`);
  return response.json();
}

// Portée "site" : traductions de la page d'accueil (hors chapitres de fanfic).
export async function initSiteI18n(lang = 'fr') {
  currentLang = lang;
  const translations = await loadSiteTranslations(lang);

  await i18next.init({
    lng: lang,
    fallbackLng: 'fr',
    resources: {
      [lang]: { translation: translations },
    },
  });
}

async function loadSiteTranslations(lang) {
  const response = await fetch(`/lang/${lang}.json`);
  return response.json();
}

export async function switchSiteLanguage(lang) {
  await initSiteI18n(lang);
  applyTranslations();
}

// Certaines traductions contiennent des balises inline littérales (<br>, <i>, <b>,
// <a href="...">) pour mettre en forme un mot au milieu d'une phrase (ex: nom de
// sort, lien externe). On les convertit en vrais éléments DOM sans jamais passer
// par innerHTML brut. Le href d'un lien vient uniquement de la balise elle-même
// (capturée par la regex), jamais interprété comme du HTML additionnel.
const INLINE_TAG_REGEX = /<br>|<\/?i>|<\/?b>|<a href="([^"]*)">|<\/a>/g;

function renderInlineText(el, text) {
  if (typeof text !== 'string') text = '';
  el.textContent = '';
  let parent = el;
  const stack = [el];
  let lastIndex = 0;
  let match;

  INLINE_TAG_REGEX.lastIndex = 0;
  while ((match = INLINE_TAG_REGEX.exec(text)) !== null) {
    const chunk = text.slice(lastIndex, match.index);
    if (chunk) parent.appendChild(document.createTextNode(chunk));

    const tag = match[0];
    if (tag === '<br>') {
      parent.appendChild(document.createElement('br'));
    } else if (tag === '<i>' || tag === '<b>') {
      const node = document.createElement(tag === '<i>' ? 'i' : 'b');
      parent.appendChild(node);
      stack.push(node);
      parent = node;
    } else if ((tag === '</i>' || tag === '</b>') && stack.length > 1) {
      stack.pop();
      parent = stack[stack.length - 1];
    } else if (tag.startsWith('<a href="')) {
      const node = document.createElement('a');
      node.href = match[1];
      node.target = '_blank';
      node.rel = 'noopener noreferrer';
      parent.appendChild(node);
      stack.push(node);
      parent = node;
    } else if (tag === '</a>' && stack.length > 1) {
      stack.pop();
      parent = stack[stack.length - 1];
    }

    lastIndex = INLINE_TAG_REGEX.lastIndex;
  }

  const rest = text.slice(lastIndex);
  if (rest) parent.appendChild(document.createTextNode(rest));
}

export function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    renderInlineText(el, i18next.t(el.dataset.i18n));
  });
  document.querySelectorAll('[data-href-en]').forEach((el) => {
    el.href = currentLang === 'en' ? el.dataset.hrefEn : el.dataset.hrefFr;
  });
}

export async function switchLanguage(fanficId, chapterNumber, lang) {
  await initI18n(fanficId, chapterNumber, lang);
  applyTranslations();
}

export function getCurrentLang() {
  return currentLang;
}
