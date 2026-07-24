import '../css/global.css';
import { renderCatalog } from './catalog.js';
import { initSiteI18n, switchSiteLanguage, applyTranslations, getCurrentLang } from './i18n.js';
import { initLightDarkToggle } from './widget.js';

async function init() {
  await initSiteI18n('fr');
  applyTranslations();
  initLightDarkToggle();

  const response = await fetch('/catalog.json');
  const { fanfics } = await response.json();
  renderCatalog(fanfics, getCurrentLang());

  document.querySelector('#lang-toggle')?.addEventListener('click', async (event) => {
    event.stopPropagation();
    const nextLang = getCurrentLang() === 'fr' ? 'en' : 'fr';
    await switchSiteLanguage(nextLang);
    renderCatalog(fanfics, nextLang);
  });
}

init();
