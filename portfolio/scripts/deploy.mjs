/**
 * Publishes the site by hand, from this machine.
 *
 * The source repository is private and the free plan will not serve GitHub
 * Pages from it, so the built site lives in a separate public repository —
 * that is the one Pages serves. Nothing but dist/ is pushed there.
 *
 *   npm run deploy
 *
 * VITE_SOON keeps the Extra and Random pages as placeholders, exactly as the
 * CI build does. Remove it here and in .github/workflows/ci.yml on the day
 * those pages go live.
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_REPO = 'https://github.com/Tsamh/Tsamh.github.io.git';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');

/* No shell: on Windows it re-joins the arguments without quoting them, and a
   commit message with a space ends up split into several arguments. */
const run = (cmd, args, cwd, env) =>
  execFileSync(cmd, args, { cwd, stdio: 'inherit', env: { ...process.env, ...env } });

console.log('\n→ building');
rmSync(dist, { recursive: true, force: true });
// the binary directly rather than npx: no shell, so no platform quirks
run(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), 'build'], root, {
  VITE_SOON: '1',
});

// GitHub Pages runs Jekyll by default, which would drop anything starting
// with an underscore; this file turns it off.
writeFileSync(resolve(dist, '.nojekyll'), '');

console.log('\n→ publishing to', SITE_REPO);
const sha = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root }).toString().trim();
rmSync(resolve(dist, '.git'), { recursive: true, force: true });
run('git', ['init', '-q', '-b', 'main'], dist);
run('git', ['add', '-A'], dist);
run('git', ['commit', '-q', '-m', `Publish ${sha}`], dist);
run('git', ['push', '--force', '--quiet', SITE_REPO, 'main'], dist);

console.log('\n✓ published — https://tsamh.github.io/\n');
