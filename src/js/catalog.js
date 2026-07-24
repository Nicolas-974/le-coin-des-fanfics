import i18next from 'i18next';

let fanficsById = new Map();
let currentLang = 'fr';
let modalEl = null;
let lastFocusedEl = null;

export function renderCatalog(fanfics, lang = 'fr') {
  const container = document.querySelector('#catalog');
  if (!container) return;

  currentLang = lang;
  fanficsById = new Map(fanfics.map((f) => [f.id, f]));

  container.innerHTML = fanfics.map((f) => createFanficCard(f, lang)).join('');
  container.querySelectorAll('.cover').forEach(handleCoverFallback);
  container.querySelectorAll('.fanfic-card').forEach((card) => {
    card.addEventListener('click', () => openModal(card.dataset.id));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openModal(card.dataset.id);
      }
    });
  });

  ensureModal();
}

function statusLabel(status) {
  return i18next.t(`status_${status}`);
}

function createFanficCard(fanfic, lang) {
  return `
    <article class="fanfic-card" data-id="${fanfic.id}" tabindex="0" role="button" aria-haspopup="dialog">
      <img class="cover" src="${fanfic.cover}" alt="${fanfic.title}" loading="lazy" />
      <div class="card-body">
        <span class="status">${statusLabel(fanfic.status)}</span>
        <h2>${fanfic.title}</h2>
        <p>${fanfic.summary[lang] ?? fanfic.summary.fr}</p>
        <ul class="tags">
          ${fanfic.tags.map((tag) => `<li>${tag}</li>`).join('')}
        </ul>
      </div>
    </article>
  `;
}

function handleCoverFallback(img) {
  img.addEventListener(
    'error',
    () => {
      const placeholder = document.createElement('div');
      placeholder.className = 'cover-placeholder';
      placeholder.textContent = img.alt.charAt(0);
      img.replaceWith(placeholder);
    },
    { once: true },
  );
}

function ensureModal() {
  if (modalEl) return;

  modalEl = document.createElement('div');
  modalEl.id = 'fanfic-modal';
  modalEl.className = 'modal-overlay hidden';
  modalEl.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true">
      <button type="button" class="modal-close" aria-label="Fermer">✕</button>
      <div class="modal-body"></div>
    </div>
  `;
  document.body.appendChild(modalEl);

  modalEl.addEventListener('click', (event) => {
    if (event.target === modalEl) closeModal();
  });
  modalEl.querySelector('.modal-close').addEventListener('click', closeModal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modalEl.classList.contains('hidden')) closeModal();
  });
}

function openModal(id) {
  const fanfic = fanficsById.get(id);
  if (!fanfic || !modalEl) return;

  modalEl.querySelector('.modal-body').innerHTML = createModalContent(fanfic, currentLang);
  modalEl.querySelector('.modal-close').setAttribute('aria-label', i18next.t('close'));
  modalEl.classList.remove('hidden');
  document.body.classList.add('modal-open');

  lastFocusedEl = document.activeElement;
  modalEl.querySelector('.modal-close').focus();
}

function closeModal() {
  if (!modalEl) return;
  modalEl.classList.add('hidden');
  document.body.classList.remove('modal-open');
  lastFocusedEl?.focus();
}

function createModalContent(fanfic, lang) {
  const franchises = (fanfic.franchises ?? [])
    .map(
      (f) => `
        <p class="modal-franchise">
          <strong>${f.name}</strong> — ${f.description[lang] ?? f.description.fr}
          ${f.wikiUrl ? `<a href="${f.wikiUrl}" target="_blank" rel="noopener noreferrer">${i18next.t('official_wiki')} ↗</a>` : ''}
        </p>
      `,
    )
    .join('');

  const authorLine = fanfic.authorUrl
    ? `${i18next.t('written_by')} <strong>${fanfic.author}</strong> — <a href="${fanfic.authorUrl}" target="_blank" rel="noopener noreferrer">${i18next.t('author_profile_link')} ↗</a>`
    : `${i18next.t('written_by')} <strong>${fanfic.author}</strong>`;

  const sourceLine = fanfic.sourceUrl
    ? `<p class="modal-source"><a href="${fanfic.sourceUrl}" target="_blank" rel="noopener noreferrer">${i18next.t('read_original')} ↗</a></p>`
    : '';

  return `
    <div class="modal-header">
      <img class="modal-cover" src="${fanfic.cover}" alt="${fanfic.title}" />
      <div class="modal-header-text">
        <span class="status">${statusLabel(fanfic.status)}</span>
        <h2>${fanfic.title}</h2>
        <ul class="tags">
          ${fanfic.tags.map((tag) => `<li>${tag}</li>`).join('')}
        </ul>
      </div>
    </div>

    <p class="modal-summary">${fanfic.summary[lang] ?? fanfic.summary.fr}</p>

    <div class="modal-section">
      <h3>${i18next.t('modal_universes_title')}</h3>
      ${franchises}
    </div>

    <div class="modal-section modal-credit">
      <h3>${i18next.t('modal_original_title')}</h3>
      <p>${authorLine}</p>
      ${sourceLine}
    </div>

    <a class="modal-read-btn" href="fanfics/${fanfic.id}/index.html">${i18next.t('start_reading')} →</a>
  `;
}
