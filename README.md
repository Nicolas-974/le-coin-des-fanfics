# 📚 Le Coin des Fanfics

Un site personnel de lecture pour des fanfictions traduites en français, avec une expérience de lecture immersive : ambiances sonores, images de personnages au survol, thèmes visuels par univers, et bascule FR/EN.

👉 [Voir le site](https://le-coin-des-fanfics.vercel.app) *(à adapter selon le domaine réel)*

---

## ✨ Un mot avant tout

Je ne suis qu'un lecteur passionné qui, au fil de ses lectures, est tombé sur des histoires qui l'ont marqué — et qui a eu envie de les faire découvrir à d'autres fans. Je les traduis avec soin et je leur offre ici un écrin de lecture à leur hauteur.

**Ces histoires ne sont pas les miennes.** Elles sont l'œuvre d'auteurs et autrices que j'admire, contactés pour obtenir leur autorisation avant de traduire et publier leur travail ici. Si une histoire vous touche, tout le mérite leur revient.

| Fanfic | Auteur original | Source |
|---|---|---|
| **Fate Genesis** (Sonic the Hedgehog × Fate/stay night) | [Cybertoy00](https://www.fanfiction.net/u/381645/Cybertoy00) | [FanFiction.net](https://www.fanfiction.net/s/11150281/1/Fate-Genesis) |
| **Kingdom Hearts: Familia Myth** (Kingdom Hearts × DanMachi) | [Keybladewielder97](https://www.fanfiction.net/u/5713519/Keybladewielder97) | [FanFiction.net](https://www.fanfiction.net/s/14016032/1/Kingdom-Hearts-Familia-Myth) |
| **Kingdom Hearts: Grand Order** (Kingdom Hearts × Fate/Grand Order) | [KingSora3](https://www.fanfiction.net/u/2615262/KingSora3) | [FanFiction.net](https://www.fanfiction.net/s/14130841/1/Kingdom-Hearts-Grand-Order) |
| **Sonic DxD** (Sonic the Hedgehog × High School DxD) | [Bakuganman](https://www.fanfiction.net/u/8473954/Bakuganman) | [FanFiction.net](https://www.fanfiction.net/s/13503927/1/Sonic-DxD) |

---

## ✨ Fonctionnalités

- 📖 **Lecture dynamique** — une seule page par fanfic, changement de chapitre sans rechargement (`history.pushState`, préchargement du chapitre suivant)
- 🌐 **Français / Anglais** — bascule de langue instantanée, chapitres et interface traduits
- 🎨 **Thèmes visuels** — plusieurs dégradés par fanfic, plus un thème clair/sombre sur la page d'accueil
- 🖱️ **Survol des personnages** — les noms mentionnés révèlent une image au survol (ou au tap sur mobile)
- 🔊 **Lecteur audio intégré** — ambiances sonores par chapitre, barre fixe pendant la lecture
- 🖼️ **Images à révéler** — contenus cachés (souvent des spoilers visuels) dévoilés au clic
- ❓ **Guide intégré** — un bouton d'aide explique les fonctionnalités avec des démonstrations en direct
- 🗂️ **Catalogue enrichi** — chaque fanfic s'ouvre en fiche détaillée (résumé complet, univers croisés, crédits, liens vers l'œuvre originale)

---

## 🛠️ Stack technique

- **HTML / CSS vanilla / JavaScript** (ES Modules) — pas de framework
- **[Vite](https://vitejs.dev/)** pour le développement et le build
- **[i18next](https://www.i18next.com/)** pour l'internationalisation
- Aucun backend, aucune base de données : tout le contenu est servi comme fichiers JSON statiques, consommés côté client via `fetch()`

## 📁 Structure du projet

```
le-coin-des-fanfics/
├── index.html                  # Page d'accueil / catalogue
├── catalog.json                # Liste des fanfics
├── lang/                       # Traductions de l'interface (accueil)
├── src/
│   ├── css/global.css          # Styles partagés (thèmes, lecteur, modales…)
│   └── js/                     # Modules : routeur, lecteur, i18n, widgets…
├── fanfics/
│   └── <id>/
│       ├── index.html          # Page unique de la fanfic
│       ├── meta.json           # Titre, auteur, chapitres, thèmes
│       ├── theme.css           # Thème visuel propre à cette fanfic
│       ├── chapters/<N>/content.json   # Contenu structuré du chapitre
│       ├── lang/{fr,en}/       # Traductions par chapitre
│       └── assets/{img,audio}/ # Médias propres à la fanfic
└── vercel.json                 # En-têtes de sécurité (CSP, etc.)
```

Ajouter une nouvelle fanfic ne demande aucune modification de configuration : il suffit de créer un dossier sous `fanfics/`, Vite et le catalogue la détectent automatiquement.

## 🚀 Démarrage

```bash
npm install
npm run dev       # serveur de développement
npm run build     # build de production
npm run preview   # prévisualiser le build
```

## 🔒 Sécurité

Site 100 % statique (pas de backend, pas de compte, pas de saisie utilisateur). Une politique de sécurité de contenu (CSP) et des en-têtes de durcissement additionnels sont définis dans `vercel.json`.

## ⚖️ Licence

Le code source n'est pour l'instant distribué sous aucune licence explicite. **Le contenu des fanfictions (textes, traductions) reste la propriété de leurs auteurs originaux respectifs** — voir le tableau des crédits ci-dessus. Ne réutilisez pas ces traductions sans l'autorisation des auteurs concernés.
