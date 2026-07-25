import i18next from 'i18next';

let themeIndex = 0;
let isLightTheme = false;

function initThemePanelShell(onCycle) {
  const panel = document.querySelector('#theme-panel');
  const handle = document.querySelector('#theme-handle');
  const content = document.querySelector('#theme-content');
  const cycleBtn = document.querySelector('#theme-cycle');

  if (!panel || !handle) return;

  initPanelHint(panel, handle);

  handle.addEventListener('click', () => {
    const isOpening = !panel.classList.contains('open');

    // La largeur "ouverte" dépend du nombre de boutons réellement présents
    // dans #theme-content (2 sur la page d'accueil, 3 sur les fanfics avec
    // l'aide, etc.) : on la mesure à chaque ouverture plutôt que de fixer
    // une valeur en dur, pour éviter tout écart vide selon la page.
    if (isOpening && content) {
      panel.style.setProperty('--panel-open-width', `${handle.offsetWidth + content.scrollWidth}px`);
    }

    panel.classList.toggle('open');
    const isOpen = panel.classList.contains('open');
    panel.setAttribute('aria-expanded', String(isOpen));
    handle.textContent = isOpen ? '»»' : '««';
  });

  document.addEventListener('click', (event) => {
    if (!panel.contains(event.target) && panel.classList.contains('open')) {
      panel.classList.remove('open');
      panel.setAttribute('aria-expanded', 'false');
      handle.textContent = '««';
    }
  });

  cycleBtn?.addEventListener('click', (event) => {
    event.stopPropagation();
    onCycle();
  });
}

// Petite flèche jaune attirant l'attention sur le panneau : disparaît dès
// qu'on clique dessus (ce qui ouvre aussi le panneau) ou sur le panneau lui-même.
function initPanelHint(panel, handle) {
  const hint = document.querySelector('#panel-hint');
  if (!hint) return;

  function hideHint() {
    hint.classList.add('panel-hint--hidden');
  }

  hint.addEventListener('click', (event) => {
    event.stopPropagation();
    hideHint();
    handle.click();
  });

  panel.addEventListener('click', hideHint);
}

// Fanfics : cycle parmi plusieurs thèmes (dégradés définis dans meta.json).
export function initThemePanel(themes) {
  themeIndex = themes?.default ?? 0;
  if (themes) applyTheme(themes.backgrounds[themeIndex]);

  initThemePanelShell(() => {
    if (!themes) return;
    cycleTheme(themes);
  });
}

function cycleTheme(themes) {
  themeIndex = (themeIndex + 1) % themes.backgrounds.length;
  const theme = themes.backgrounds[themeIndex];
  applyTheme(theme);
  showToast('Thème : ' + theme.name);
}

function applyTheme(theme) {
  document.body.style.background = theme.css;
  document.body.style.color = theme.textColor;
}

// Page d'accueil : simple bascule clair/sombre (déjà sombre par défaut).
export function initLightDarkToggle() {
  initThemePanelShell(() => {
    isLightTheme = !isLightTheme;
    document.documentElement.dataset.theme = isLightTheme ? 'light' : 'dark';
    showToast(i18next.t(isLightTheme ? 'theme_light' : 'theme_dark'));
  });
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

export function initHoverImages(root = document) {
  const isTouchDevice = 'ontouchstart' in window;

  root.querySelectorAll('a.imag').forEach((link) => {
    const imgSpan = link.querySelector('span');
    if (!imgSpan) return;

    if (isTouchDevice) {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        document.querySelectorAll('a.imag span.show-mobile').forEach((span) => {
          if (span !== imgSpan) span.classList.remove('show-mobile');
        });

        imgSpan.classList.toggle('show-mobile');
        if (imgSpan.classList.contains('show-mobile')) repositionImage(imgSpan);
      });
    } else {
      link.addEventListener('mouseenter', () => repositionImage(imgSpan));
    }
  });

  if (isTouchDevice) {
    document.addEventListener('click', () => {
      document.querySelectorAll('a.imag span.show-mobile').forEach((span) => {
        span.classList.remove('show-mobile');
      });
    });
  }
}

function repositionImage(spanEl) {
  requestAnimationFrame(() => {
    const rect = spanEl.getBoundingClientRect();

    if (rect.right > window.innerWidth) {
      const overflow = rect.right - window.innerWidth + 10;
      spanEl.style.left = (parseInt(getComputedStyle(spanEl).left, 10) || 0) - overflow + 'px';
    }

    if (rect.left < 0) {
      spanEl.style.left = (parseInt(getComputedStyle(spanEl).left, 10) || 0) - rect.left + 10 + 'px';
    }

    if (rect.top < 0) {
      spanEl.style.top = (parseInt(getComputedStyle(spanEl).top, 10) || 0) - rect.top + 10 + 'px';
    }
  });
}

export function initRevealSpoiler(root = document) {
  root.querySelectorAll('.reveal-btn').forEach((btn) => {
    btn.addEventListener('click', () => revealImage(btn), { once: true });
  });
}

function revealImage(btn) {
  const img = document.createElement('img');
  img.className = 'revealed-img';
  img.src = btn.dataset.img;
  btn.replaceWith(img);
}
