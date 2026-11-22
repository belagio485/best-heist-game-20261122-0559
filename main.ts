// Midnight Vault — make.fun hand-in.
// Copies game/ and screenshots/ into the output directory and writes the
// dossier buildDossier produces from them, byte for byte.
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

const gameSrc = join(repoRoot, 'game');
const shotsSrc = join(repoRoot, 'screenshots');

if (!existsSync(gameSrc)) throw new Error('game/ is missing from the repository');
if (!existsSync(shotsSrc)) throw new Error('screenshots/ is missing from the repository');

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(gameSrc, join(outDir, 'game'), { recursive: true });
cpSync(shotsSrc, join(outDir, 'screenshots'), { recursive: true });

const dossier = buildDossier(repoRoot, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 48 * 1024 * 1024,
  game_path_max_bytes: 1000
});
const dossierPath = join(outDir, 'dossier.json');
writeFileSync(dossierPath, dossier);

// The dossier must be byte for byte what buildDossier writes from the
// copied output too: rebuild it from the output directory and compare.
const checkAgain = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 48 * 1024 * 1024,
  game_path_max_bytes: 1000
});
if (!Buffer.from(dossier).equals(Buffer.from(checkAgain))) {
  throw new Error('dossier.json does not match a rebuild from the output directory');
}
console.log(`Midnight Vault handed in: dossier.json is ${dossier.length} bytes`);
