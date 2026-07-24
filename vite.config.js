import { defineConfig } from 'vite';
import { existsSync, readdirSync, cpSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { resolve } from 'node:path';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const fanficsDir = resolve(rootDir, 'fanfics');

// Chaque fanfic vit dans fanfics/<id>/index.html : on scanne le dossier
// pour ajouter automatiquement une entrée de build par fanfic, sans avoir
// à retoucher cette config à chaque nouvelle fanfic.
function getBuildEntries() {
  const entries = { main: resolve(rootDir, 'index.html') };

  if (!existsSync(fanficsDir)) return entries;

  readdirSync(fanficsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .forEach((entry) => {
      const indexPath = resolve(fanficsDir, entry.name, 'index.html');
      if (existsSync(indexPath)) {
        entries[entry.name] = indexPath;
      }
    });

  return entries;
}

function copyIfExists(src, dest) {
  if (!existsSync(src)) return;
  cpSync(src, dest, { recursive: true });
}

// catalog.json, lang/ et les données de chaque fanfic (meta.json, chapters/,
// lang/, assets/) sont chargés dynamiquement via fetch() au runtime, jamais
// référencés depuis le HTML/JS au moment du build : Rollup ne les voit donc
// jamais et ne les copie pas tout seul dans dist/. Ce plugin les copie après
// le build, en suivant le même principe de scan automatique que
// getBuildEntries() (aucune config à retoucher pour une nouvelle fanfic).
function copyStaticData() {
  return {
    name: 'copy-static-data',
    apply: 'build',
    closeBundle() {
      const outDir = resolve(rootDir, 'dist');

      copyIfExists(resolve(rootDir, 'catalog.json'), resolve(outDir, 'catalog.json'));
      copyIfExists(resolve(rootDir, 'lang'), resolve(outDir, 'lang'));

      if (!existsSync(fanficsDir)) return;

      readdirSync(fanficsDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .forEach((entry) => {
          const src = resolve(fanficsDir, entry.name);
          const dest = resolve(outDir, 'fanfics', entry.name);

          ['meta.json', 'chapters', 'lang', 'assets'].forEach((name) => {
            copyIfExists(resolve(src, name), resolve(dest, name));
          });
        });
    },
  };
}

export default defineConfig({
  plugins: [copyStaticData()],
  build: {
    rollupOptions: {
      input: getBuildEntries(),
    },
  },
});
