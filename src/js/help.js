import { getCurrentLang } from './i18n.js';
import { initHoverImages, initRevealSpoiler } from './widget.js';

const COPY = {
  fr: {
    title: 'Comment lire ce site',
    panel_title: 'Le panneau en haut à droite',
    panel_text:
      "Cliquez sur la poignée « ‹‹ » pour ouvrir un petit panneau : 🎨 change le thème visuel de la page, 🌐 bascule entre français et anglais.",
    hover_title: 'Survolez les noms',
    hover_text:
      "Certains noms de personnages utilisent une police spéciale. Survolez-les (ou touchez-les sur mobile) pour voir apparaître une image du personnage. Essayez avec l'exemple ci-dessous :",
    reveal_title: 'Images cachées',
    reveal_text:
      "Certains passages cachent une image, souvent un spoiler visuel. Cliquez sur le bouton pour la révéler.",
    audio_title: 'Ambiance sonore',
    audio_text:
      "Quand une piste audio joue, le lecteur reste fixé en haut de la page pendant que vous lisez. Les pistes bouclent automatiquement — mettez en pause pour les arrêter.",
    demo_reveal_btn: 'Cliquez ici',
    close: 'Fermer',
  },
  en: {
    title: 'How to read this site',
    panel_title: 'The top-right panel',
    panel_text:
      'Click the "‹‹" handle to open a small panel: 🎨 changes the page\'s visual theme, 🌐 switches between French and English.',
    hover_title: 'Hover over names',
    hover_text:
      "Some character names use a special font. Hover over them (or tap on mobile) to reveal an image of the character. Try it with the example below:",
    reveal_title: 'Hidden images',
    reveal_text: "Some passages hide an image, often a visual spoiler. Click the button to reveal it.",
    audio_title: 'Ambient soundtrack',
    audio_text:
      "While a track is playing, the player stays fixed at the top of the page as you read. Tracks loop automatically — pause to stop them.",
    demo_reveal_btn: 'Click here',
    close: 'Close',
  },
};

let modalEl = null;

export function initHelpButton(fanficId, demoCharacter) {
  const btn = document.querySelector('#help-toggle');
  if (!btn || !demoCharacter) return;

  btn.addEventListener('click', (event) => {
    event.stopPropagation();
    openHelpModal(fanficId, demoCharacter);
  });
}

function ensureModal() {
  if (modalEl) return modalEl;

  modalEl = document.createElement('div');
  modalEl.id = 'help-modal';
  modalEl.className = 'modal-overlay hidden';
  modalEl.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true">
      <button type="button" class="modal-close" aria-label="Fermer">✕</button>
      <div class="modal-body"></div>
    </div>
  `;
  document.body.appendChild(modalEl);

  modalEl.addEventListener('click', (event) => {
    if (event.target === modalEl) closeHelpModal();
  });
  modalEl.querySelector('.modal-close').addEventListener('click', closeHelpModal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modalEl.classList.contains('hidden')) closeHelpModal();
  });

  return modalEl;
}

function openHelpModal(fanficId, demoCharacter) {
  const lang = getCurrentLang();
  const t = COPY[lang] ?? COPY.fr;
  ensureModal();

  const imgUrl = `/fanfics/${fanficId}/assets/img/${demoCharacter.img}`;

  modalEl.querySelector('.modal-body').innerHTML = `
    <h2>${t.title}</h2>

    <div class="help-item">
      <h3>${t.panel_title}</h3>
      <p>${t.panel_text}</p>
    </div>

    <div class="help-item">
      <h3>${t.hover_title}</h3>
      <p>${t.hover_text}</p>
      <p class="help-demo">
        <a class="imag card">
          <i>${demoCharacter.name}</i>
          <span><img src="${imgUrl}" alt="${demoCharacter.name}" /></span>
        </a>
      </p>
    </div>

    <div class="help-item">
      <h3>${t.reveal_title}</h3>
      <p>${t.reveal_text}</p>
      <div class="help-demo">
        <div class="reveal-image">
          <button type="button" class="reveal-btn" data-img="${imgUrl}">${t.demo_reveal_btn}</button>
        </div>
      </div>
    </div>

    <div class="help-item">
      <h3>${t.audio_title}</h3>
      <p>${t.audio_text}</p>
    </div>
  `;

  modalEl.querySelector('.modal-close').setAttribute('aria-label', t.close);

  const body = modalEl.querySelector('.modal-body');
  initHoverImages(body);
  initRevealSpoiler(body);

  modalEl.classList.remove('hidden');
  document.body.classList.add('modal-open');
  modalEl.querySelector('.modal-close').focus();
}

function closeHelpModal() {
  if (!modalEl) return;
  modalEl.classList.add('hidden');
  document.body.classList.remove('modal-open');
}
