# Le Coin des Fanfics

## Description du projet

Site personnel statique de lecture de fanfictions traduites. L'auteur trouve des fanfics en anglais, les traduit en français, et les publie avec une expérience de lecture enrichie : images de personnages au survol, pistes audio d'ambiance, et bascule FR/EN.

Le projet s'inspire directement de "Fate Genesis", un projet précédent en HTML/CSS/JS vanilla avec i18next, dont l'architecture est conservée et améliorée pour supporter plusieurs fanfics.

## Stack technique

- **Langage** : HTML / CSS vanilla / JavaScript ES Modules
- **Outil de dev & build** : Vite
- **Internationalisation** : i18next (installé via npm, pas de CDN)
- **Thèmes** : CSS custom properties (variables) — un theme.css par fanfic
- **Hébergement** : Vercel (déploiement auto depuis GitHub)
- **Assets lourds** : Cloudflare R2 (si nécessaire, quand les audio/images dépassent les limites)
- **Versioning** : Git + GitHub

**Pas de framework frontend** (pas de React, Vue, Angular).
**Pas de framework CSS** (pas de Tailwind, SASS, Bootstrap).
**Pas de base de données.**
**Pas de backend** — tout est côté client, les JSON sont servis comme fichiers statiques.

## Architecture

### Principe : Single Page par fanfic

Chaque fanfic a **une seule page HTML** qui sert à la fois de page de présentation et de lecteur de chapitres. Le changement de chapitre se fait **dynamiquement via JS** sans rechargement de page :
1. L'utilisateur clique sur "Chapitre suivant" ou sélectionne un chapitre
2. Le JS fetch le `content.json` + le fichier de langue du nouveau chapitre
3. L'audio en cours est stoppé et les ressources libérées
4. Le contenu du `<div id="reader">` est remplacé par le nouveau chapitre
5. `window.scrollTo(0, 0)` ramène en haut de page
6. `history.pushState()` met à jour l'URL (ex: `?chapter=3`) pour que le lien reste partageable et que le bouton retour fonctionne

### Preloading

Quand l'utilisateur lit le chapitre N, le JS pré-charge en arrière-plan le `content.json` et le fichier de langue du chapitre N+1 pour un changement instantané.

### Structure des fichiers

```
le-coin-des-fanfics/
├── CLAUDE.md
├── package.json
├── vite.config.js
├── index.html                        ← page d'accueil / catalogue
├── catalog.json                      ← liste de toutes les fanfics
├── src/
│   ├── css/
│   │   └── global.css                ← styles partagés (lecteur audio, layout, hover images)
│   ├── js/
│   │   ├── main.js                   ← point d'entrée page d'accueil
│   │   ├── reader.js                 ← moteur de rendu des chapitres (lit content.json → génère le HTML)
│   │   ├── audio.js                  ← lecteur audio custom (play/pause, progress, volume, barre fixe)
│   │   ├── i18n.js                   ← initialisation i18next + bascule de langue
│   │   ├── widget.js                 ← panneau de thème, hover images, reveal spoiler
│   │   ├── catalog.js                ← génération dynamique de la page d'accueil depuis catalog.json
│   │   └── router.js                 ← navigation entre chapitres (pushState, preload, scroll)
│   └── assets/
│       └── fonts/
├── fanfics/
│   ├── fate-genesis/
│   │   ├── index.html                ← page unique (présentation + lecteur de chapitres)
│   │   ├── meta.json                 ← métadonnées (titre, auteur, résumé, liste chapitres, thèmes)
│   │   ├── theme.css                 ← thème visuel spécifique à cette fanfic
│   │   ├── chapters/
│   │   │   ├── 01/content.json       ← structure du chapitre (blocs de contenu)
│   │   │   ├── 02/content.json
│   │   │   └── .../
│   │   ├── lang/
│   │   │   ├── fr/chapter1.json      ← traductions FR
│   │   │   ├── fr/chapter2.json
│   │   │   ├── en/chapter1.json      ← traductions EN
│   │   │   └── en/chapter2.json
│   │   └── assets/
│   │       ├── img/                  ← images de personnages
│   │       └── audio/                ← pistes audio d'ambiance
│   ├── kh-familia-myth/
│   │   ├── index.html
│   │   ├── meta.json
│   │   ├── theme.css
│   │   ├── chapters/
│   │   ├── lang/
│   │   └── assets/
│   └── .../
└── public/
    └── favicon.ico
```

### Flux de navigation

```
index.html (catalogue)
  │
  ├── clic sur "Fate Genesis"
  │   └── fanfics/fate-genesis/index.html
  │       ├── affiche présentation + liste chapitres
  │       ├── clic "Lire chapitre 1" → charge chapters/01/content.json (dynamique)
  │       ├── clic "Suivant" → charge chapters/02/content.json (dynamique, pas de rechargement)
  │       └── sélecteur de chapitre → charge le chapitre choisi (dynamique)
  │
  ├── clic sur "KH Familia Myth"
  │   └── fanfics/kh-familia-myth/index.html
  │       └── même logique
  │
  └── clic sur "Sonic DxD"
      └── fanfics/sonic-dxd/index.html
          └── même logique
```

## Formats de données

### catalog.json (racine)

```json
{
  "fanfics": [
    {
      "id": "fate-genesis",
      "title": "Fate Genesis",
      "author": "Auteur Original",
      "translator": "Nicolas",
      "cover": "fanfics/fate-genesis/assets/img/cover.jpg",
      "summary": {
        "fr": "Quand Sonic débarque dans l'univers de Fate...",
        "en": "When Sonic arrives in the Fate universe..."
      },
      "chapters": 12,
      "status": "en_cours",
      "tags": ["Fate", "Sonic", "Crossover"],
      "protagonists": []
    }
  ]
}
```

### meta.json (par fanfic)

```json
{
  "id": "fate-genesis",
  "title": "Fate Genesis",
  "author": "Auteur Original",
  "original_language": "en",
  "translated_by": "Nicolas",
  "source_url": "https://...",
  "chapters": [
    { "number": 1, "title": { "fr": "Sonic Boom", "en": "Sonic Boom" } },
    { "number": 2, "title": { "fr": "...", "en": "..." } }
  ],
  "themes": {
    "default": 0,
    "backgrounds": [
      { "css": "linear-gradient(to right, #1E90FF, #0B0C2A)", "name": "Fusion Sonic/Fate", "textColor": "#f5f5f5" },
      { "css": "linear-gradient(to right, #0B0C2A, #4A0020)", "name": "Fuyuki Night", "textColor": "#f5f5f5" },
      { "css": "linear-gradient(to bottom, #87CEFA, #FFFFFF)", "name": "Thème Clair", "textColor": "#1a1a1a" }
    ]
  }
}
```

### content.json (par chapitre)

Chaque chapitre est décrit comme une liste ordonnée de blocs. Le fichier `reader.js` parcourt cette liste et génère le HTML correspondant dynamiquement.

```json
{
  "meta": {
    "fanfic": "fate-genesis",
    "chapter": 1,
    "title_key": "chapter_title"
  },
  "content": [
    { "type": "paragraph", "key": "p1" },
    {
      "type": "paragraph_with_characters",
      "parts": [
        { "text_key": "p3a" },
        { "character": "eggman", "name_key": "eggman_name", "img": "SDT_DoctorEggmanRender.png" },
        { "text_key": "p3b" }
      ]
    },
    {
      "type": "audio",
      "src": "Theme of Sonic.mp3",
      "title_key": "audio_title"
    },
    {
      "type": "dialogue",
      "speaker_key": "amy1",
      "line_key": "amy1b"
    },
    {
      "type": "reveal_image",
      "img": "Fsn_Lancer_in_anime.jpg",
      "button_key": "btn_show_image"
    },
    { "type": "separator" }
  ]
}
```

**Types de blocs disponibles** :
- `paragraph` — paragraphe simple, traduit via i18next
- `paragraph_with_characters` — paragraphe contenant des noms de personnages avec image au hover
- `dialogue` — réplique d'un personnage (speaker en gras + ligne de texte)
- `audio` — zone de lecteur audio (play/pause, progress, volume, titre défilant, barre fixe en haut)
- `reveal_image` — image cachée avec bouton "Click Me" pour la révéler
- `separator` — balise `<hr>`

## Modules JS — responsabilités

| Module | Rôle |
|---|---|
| `main.js` | Point d'entrée de la page d'accueil. Charge `catalog.json`, génère les cartes. |
| `catalog.js` | Génère le HTML des cartes de fanfics à partir du catalogue. |
| `reader.js` | **Moteur de rendu.** Lit un `content.json`, parcourt les blocs, génère le HTML du chapitre dans `#reader`. Gère aussi le re-rendu lors du changement de langue. |
| `router.js` | Navigation entre chapitres. `loadChapter(n)` → fetch content + lang → appelle reader → pushState → scroll top. Gère `popstate` (bouton retour). Preload du chapitre N+1. |
| `audio.js` | Lecteur audio. Initialise les contrôles après chaque rendu de chapitre. Stoppe l'audio en cours avant changement de chapitre. |
| `i18n.js` | Initialise i18next. Charge les fichiers de langue par chapitre. Expose `switchLanguage()` et `getCurrentLang()`. |
| `widget.js` | Panneau de thème (cycle backgrounds + textColor), hover images (desktop + mobile), reveal spoiler. Ré-initialise les listeners après chaque rendu. |

## Fonctionnalités clés

### Lecteur audio
- Lecteur custom (pas le natif du navigateur)
- Bouton play/pause, barre de progression, contrôle du volume
- Quand la musique joue : barre fixée en haut de la page avec titre défilant
- Un seul audio joue à la fois (les autres se mettent en pause automatiquement)
- La piste boucle en continu (`audio.loop = true` par défaut) jusqu'à pause manuelle
- Les éléments sont ciblés par sélecteurs relatifs à la zone (`.audio-zone .custom-player button`), pas par ID numérotés
- **Important** : l'audio doit être stoppé et les éléments nettoyés AVANT le changement de chapitre

### Images de personnages au hover
- Pattern `<a class="imag">` avec un `<span>` contenant l'image
- Au survol du nom (desktop) ou au tap (mobile) : l'image apparaît
- Repositionnement automatique si l'image déborde de l'écran (desktop et mobile)
- Les noms de personnages mentionnés pour la première fois ont une police spéciale (classe `.card`)
- Sur mobile : tap pour ouvrir, tap ailleurs pour fermer (classe `.show-mobile`)

### Internationalisation (i18n)
- Deux langues : français (par défaut) et anglais
- Fichiers JSON de traduction par chapitre : `lang/fr/chapter1.json`, `lang/en/chapter1.json`
- Bascule via bouton dans le panneau de thème
- Les éléments traduits utilisent l'attribut `data-i18n`
- Au changement de chapitre, les nouvelles traductions sont chargées dynamiquement

### Navigation entre chapitres
- Sélecteur de chapitre (dropdown) en haut et en bas de page
- Boutons "Précédent" / "Suivant"
- Changement dynamique sans rechargement de page
- URL mise à jour via `history.pushState` (ex: `?chapter=3`)
- Bouton retour du navigateur fonctionnel via `popstate`
- Scroll automatique en haut au changement de chapitre
- Preloading du chapitre suivant en arrière-plan

### Panneau de thème
- Panneau discret en haut à droite, se révèle au hover
- Bouton pour cycler entre les thèmes/backgrounds
- Chaque thème définit à la fois le `background` CSS ET la `textColor` (certains thèmes sont clairs avec texte sombre, d'autres sombres avec texte clair)
- Bouton de bascule de langue
- Toast de notification pour le changement de thème
- Les thèmes disponibles sont définis dans le `meta.json` de chaque fanfic

## Conventions de code

- **Langue du code** : commentaires et noms de variables en français ou anglais (cohérent au sein d'un fichier)
- **Modules JS** : utiliser `import` / `export` (ES Modules), pas de `<script>` multiples
- **CSS** : pas de `!important` sauf cas extrême, utiliser les custom properties pour tout ce qui varie par thème
- **Nommage des fichiers** : kebab-case pour les fichiers, camelCase pour les variables JS
- **Accessibilité** : attributs `aria-*` sur les contrôles interactifs, `alt` sur les images
- **Responsive** : mobile-first, breakpoints à 768px et 425px
- **Cycle de vie** : après chaque rendu de chapitre par `reader.js`, les modules `audio.js` et `widget.js` doivent ré-initialiser leurs listeners sur les nouveaux éléments du DOM

## Commandes

```bash
npm run dev          # serveur de développement Vite
npm run build        # build de production
npm run preview      # prévisualiser le build
```

## Notes

- Le contenu textuel des fanfics est TOUJOURS dans les fichiers JSON de traduction, jamais en dur dans le HTML
- Les assets audio (.mp3) et images de personnages sont propres à chaque fanfic et rangés dans son dossier `assets/`
- Les styles partagés (lecteur audio, hover images, layout) sont dans `global.css` ; les couleurs et ambiances spécifiques dans le `theme.css` de chaque fanfic
- Tout le rendu est côté client — aucun backend, aucune API, juste des `fetch()` sur des fichiers JSON statiques
- Le site est hébergé comme un site statique sur Vercel, déployé automatiquement depuis GitHub
