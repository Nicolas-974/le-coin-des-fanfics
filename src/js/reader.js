const FADE_DURATION = 200;
const LOADER_DELAY = 150;

let loaderEl = null;
let loaderTimer = null;

// Le spinner n'apparaît qu'après un court délai, pour ne pas clignoter
// inutilement lors des changements de chapitre déjà préchargés.
export function showLoader() {
  clearTimeout(loaderTimer);
  loaderTimer = setTimeout(() => {
    ensureLoader().classList.add('is-visible');
  }, LOADER_DELAY);
}

export function hideLoader() {
  clearTimeout(loaderTimer);
  loaderEl?.classList.remove('is-visible');
}

function ensureLoader() {
  if (loaderEl) return loaderEl;
  loaderEl = document.createElement('div');
  loaderEl.className = 'page-loader';
  loaderEl.innerHTML = '<div class="spinner"></div>';
  document.body.appendChild(loaderEl);
  return loaderEl;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function renderChapter(fanficId, chapterNumber) {
  const container = document.querySelector('#reader');

  container.classList.add('is-loading');
  await new Promise((resolve) => setTimeout(resolve, FADE_DURATION));

  const contentUrl = `/fanfics/${fanficId}/chapters/${String(chapterNumber).padStart(2, '0')}/content.json`;
  const response = await fetch(contentUrl);
  const { meta, content } = await response.json();

  const titleHtml = meta?.title_key
    ? `<p class="chapter-title"><u data-i18n="${meta.title_key}"></u></p>`
    : '';
  container.innerHTML = titleHtml + content.map((block) => renderBlock(block, fanficId)).join('');

  window.scrollTo(0, 0);

  requestAnimationFrame(() => container.classList.remove('is-loading'));
}

function renderBlock(block, fanficId) {
  switch (block.type) {
    case 'paragraph':
      return renderParagraph(block);
    case 'paragraph_with_characters':
      return renderParagraphWithCharacters(block, fanficId);
    case 'dialogue':
      return renderDialogue(block, fanficId);
    case 'audio':
      return renderAudio(block, fanficId);
    case 'audio_link':
      return renderAudioLink(block);
    case 'reveal_image':
      return renderRevealImage(block, fanficId);
    case 'reveal_video':
      return renderRevealVideo(block);
    case 'reveal_group':
      return renderRevealGroup(block, fanficId);
    case 'stat_box':
      return renderStatBox(block);
    case 'info_box':
      return renderInfoBox(block);
    case 'list':
      return renderList(block);
    case 'separator':
      return '<hr />';
    default:
      return '';
  }
}

function wrapStyle(style, html) {
  switch (style) {
    case 'bold':
      return `<b>${html}</b>`;
    case 'italic':
      return `<i>${html}</i>`;
    case 'bold-italic':
      return `<i><b>${html}</b></i>`;
    case 'underline':
      return `<u>${html}</u>`;
    case 'italic-underline':
      return `<i><u>${html}</u></i>`;
    case 'bold-underline':
      return `<u><b>${html}</b></u>`;
    default:
      return html;
  }
}

function renderParagraph(block) {
  const classAttr = block.align === 'center' ? ' class="text-center"' : '';
  if (block.text) {
    return `<p${classAttr}>${wrapStyle(block.style, escapeHtml(block.text))}</p>`;
  }
  const span = `<span data-i18n="${block.key}"></span>`;
  if (!block.style && !block.align) return `<p data-i18n="${block.key}"></p>`;
  return `<p${classAttr}>${wrapStyle(block.style, span)}</p>`;
}

function isPunctuationOnly(part) {
  if (part.no_space_before) return true;
  return typeof part.text === 'string' && /^[.,;:!?…]+$/.test(part.text);
}

function joinParts(parts, renderFn) {
  return parts.reduce((acc, part, i) => {
    const rendered = renderFn(part);
    if (i === 0) return rendered;
    return acc + (isPunctuationOnly(part) ? '' : ' ') + rendered;
  }, '');
}

function renderParagraphWithCharacters(block, fanficId) {
  return `<p>${joinParts(block.parts, (part) => renderPart(part, fanficId, block.style))}</p>`;
}

function renderPart(part, fanficId, blockStyle) {
  if (part.text_key) {
    const span = wrapStyle(part.style || blockStyle, `<span data-i18n="${part.text_key}"></span>`);
    return part.break_after ? `${span}<br>` : span;
  }
  if (part.text) {
    const span = wrapStyle(part.style || blockStyle, escapeHtml(part.text));
    return part.break_after ? `${span}<br>` : span;
  }

  return `<a class="imag card" data-character="${part.character}"><i data-i18n="${part.name_key}"></i><span><img src="/fanfics/${fanficId}/assets/img/${part.img}" alt="" /></span></a>`;
}

function renderDialogue(block, fanficId) {
  const speaker = block.speaker_parts
    ? joinParts(block.speaker_parts, (part) => renderPart(part, fanficId, block.style || 'bold'))
    : wrapStyle(block.style || 'bold', `<span data-i18n="${block.speaker_key}"></span>`);
  const line = block.line_parts
    ? `<br>${joinParts(block.line_parts, (part) => renderPart(part, fanficId))}`
    : block.line_key
      ? `<br><span data-i18n="${block.line_key}"></span>`
      : '';
  return `<p class="dialogue">${speaker}${line}</p>`;
}

function renderAudio(block, fanficId) {
  const srcEnAttr = block.src_en
    ? ` data-src-en="/fanfics/${fanficId}/assets/audio/${block.src_en}"`
    : '';
  // Par défaut la piste boucle en continu (ambiance) ; block.loop:false pour
  // les pistes qui ne doivent jouer qu'une fois (ex: générique/OP).
  const loopAttr = block.loop === false ? ` data-loop="false"` : '';
  return `
    <div class="audio-zone">
      <div class="custom-player" data-src="/fanfics/${fanficId}/assets/audio/${block.src}"${srcEnAttr}${loopAttr}>
        <button class="play-pause" type="button" aria-label="Lecture">▶️</button>
        <input class="progress" type="range" value="0" step="1" />
        <input class="volume" type="range" min="0" max="1" step="0.01" value="1" />
        <div class="audio-title-wrapper hidden">
          <span class="audio-title" data-i18n="${block.title_key}"></span>
        </div>
      </div>
    </div>
  `;
}

// Bouton vers la vidéo YouTube d'origine, plutôt qu'un fichier audio hébergé
// directement (droits d'auteur sur les chansons Disney/officielles).
function renderAudioLink(block) {
  const urlFr = block.url;
  const urlEn = block.url_en || block.url;
  return `
    <div class="audio-zone">
      <a class="audio-link-btn" href="${urlFr}" data-href-fr="${urlFr}" data-href-en="${urlEn}" target="_blank" rel="noopener noreferrer" data-i18n="${block.button_key}"></a>
    </div>
  `;
}

function renderRevealImage(block, fanficId) {
  return `
    <div class="reveal-image">
      <button class="reveal-btn" type="button" data-img="/fanfics/${fanficId}/assets/img/${block.img}" data-i18n="${block.button_key}"></button>
    </div>
  `;
}

function renderRevealVideo(block) {
  return `
    <div class="reveal-image">
      <a class="revealed-video-link" href="${block.watch_url}" target="_blank" rel="noopener noreferrer" data-i18n="${block.link_key}"></a>
    </div>
  `;
}

// Bloc de contenu masqué par défaut (ex: générique/OP en tête de chapitre),
// révélé en entier au clic sur un bouton plutôt qu'une simple image.
function renderRevealGroup(block, fanficId) {
  const inner = block.items.map((item) => renderBlock(item, fanficId)).join('');
  return `
    <div class="reveal-group">
      <button class="reveal-group-btn" type="button" data-i18n="${block.button_key}"></button>
      <div class="reveal-group-content hidden">${inner}</div>
    </div>
  `;
}

function renderList(block) {
  return `<ol>${block.items.map((k) => `<li data-i18n="${k}"></li>`).join('')}</ol>`;
}

function renderStatBox(block) {
  const skills = block.skills_keys
    ? `
      <h4 data-i18n="${block.skills_title_key}"></h4>
      <ul>${block.skills_keys.map((k) => `<li data-i18n="${k}"></li>`).join('')}</ul>
    `
    : '';

  const magic = block.magic_keys
    ? `
      <h4 data-i18n="${block.magic_title_key}"></h4>
      <ul>${block.magic_keys.map((k) => `<li data-i18n="${k}"></li>`).join('')}</ul>
    `
    : '';

  const note = block.note_key
    ? `
      <hr class="stat-box-divider" />
      <p class="stat-box-note"><i data-i18n="${block.note_key}"></i></p>
    `
    : '';

  const stats =
    block.stats_style === 'pre-line'
      ? `<p class="stat-box-preline" data-i18n="${block.stats_key}"></p>`
      : `<p data-i18n="${block.stats_key}"></p>`;

  return `
    <div class="stat-box">
      <h3 class="stat-box-title" data-i18n="${block.title_key}"></h3>
      ${stats}
      ${skills}
      ${magic}
      ${note}
    </div>
  `;
}

function renderInfoBox(block) {
  const variant = block.variant === 'gold' ? 'info-box--gold' : 'info-box--dashed';

  const body = block.desc_keys
    ? `<ul>${block.desc_keys.map((k) => `<li data-i18n="${k}"></li>`).join('')}</ul>`
    : `<p data-i18n="${block.desc_key}"></p>`;

  return `
    <div class="info-box ${variant}">
      <h4 class="info-box-title" data-i18n="${block.title_key}"></h4>
      ${body}
    </div>
  `;
}
