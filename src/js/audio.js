let currentAudio = null;

export function initAudioPlayers() {
  const zones = Array.from(document.querySelectorAll('.audio-zone'));
  const players = zones.map((zone) => setupPlayer(zone)).filter(Boolean);

  players.forEach(({ audio }) => {
    audio.addEventListener('play', () => {
      players.forEach((other) => {
        if (other.audio !== audio && !other.audio.paused) other.audio.pause();
      });
    });
  });
}

function setupPlayer(zone) {
  const playerEl = zone.querySelector('.custom-player');
  if (!playerEl) return null;

  const audio = new Audio(playerEl.dataset.src);
  audio.loop = true;

  const playPauseBtn = playerEl.querySelector('.play-pause');
  const progress = playerEl.querySelector('.progress');
  const volume = playerEl.querySelector('.volume');
  const titleWrapper = playerEl.querySelector('.audio-title-wrapper');
  const title = playerEl.querySelector('.audio-title');

  audio.volume = Number(volume?.value ?? 1);

  playPauseBtn?.addEventListener('click', () => togglePlayback(audio, playPauseBtn));

  audio.addEventListener('loadedmetadata', () => {
    if (progress) progress.max = String(audio.duration || 0);
  });

  audio.addEventListener('timeupdate', () => updateProgress(audio, progress));

  progress?.addEventListener('input', () => {
    audio.currentTime = Number(progress.value) || 0;
  });

  volume?.addEventListener('input', () => {
    audio.volume = Math.min(1, Math.max(0, Number(volume.value)));
  });

  audio.addEventListener('play', () => {
    currentAudio = audio;
    zone.classList.add('audio-fixed');
    titleWrapper?.classList.remove('hidden');
    if (title && titleWrapper && title.scrollWidth > titleWrapper.clientWidth) {
      title.classList.add('scroll');
    }
    if (playPauseBtn) playPauseBtn.textContent = '⏸️';
  });

  const reset = () => {
    zone.classList.remove('audio-fixed');
    titleWrapper?.classList.add('hidden');
    title?.classList.remove('scroll');
    if (playPauseBtn) playPauseBtn.textContent = '▶️';
  };

  audio.addEventListener('pause', reset);
  audio.addEventListener('ended', () => {
    reset();
    if (progress) progress.value = '0';
  });

  return { audio };
}

function togglePlayback(audio) {
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}

function updateProgress(audio, progressEl) {
  if (!progressEl || !isFinite(audio.duration)) return;
  progressEl.max = String(audio.duration);
  progressEl.value = String(audio.currentTime);
}

export function stopCurrentAudio() {
  if (!currentAudio) return;
  currentAudio.pause();
  currentAudio.currentTime = 0;
  currentAudio = null;
}
