#!/usr/bin/env node
/* build-scene.mjs —— scaffold + 内联打包 d2 场景(取代实验里的 scaffold-scene.sh + build.mjs)
 *
 * 用法:
 *   node build-scene.mjs <workspace-dir> <NN ...>     只构建指定场景
 *   node build-scene.mjs <workspace-dir> all          构建 <workspace>/src/scene-*.html 全部
 *   例: node build-scene.mjs blog2video-output/loop-engineering 05 07
 *
 * workspace 布局(= blog2video-output/<slug>/):
 *   src/scene-NN.html       授权源(scene-generator 写;含 /*@@BASE@@*\/ 和 /*@@MOTION@@*\/ marker)
 *   assets -> (skill kit assets,字体)  ← workspace 根的绝对 symlink,本脚本自动建
 *   scenes/scene-NN/        本脚本产出: assets(相对 symlink ../../assets) + hyperframes.json + meta.json + index.html
 *
 * kit(d2-base.css / d2-motion.js / 字体)随 skill 走,从本脚本位置解析:
 *   .claude/skills/blog2video/design/d2-kit/{d2-base.css,d2-motion.js,assets/fonts}
 *
 * 注:授权源放 src/ 而非 scene 目录内,避免被 hyperframes 当成第二个 root composition。
 *     场景自包含 —— 不用 <link> 外链,kit 全文内联进 index.html。
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, symlinkSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, relative } from 'node:path';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const KIT = resolve(SCRIPT_DIR, '../design/d2-kit');
const KIT_ASSETS = join(KIT, 'assets');
const base = readFileSync(join(KIT, 'd2-base.css'), 'utf8').trimEnd();
const motion = readFileSync(join(KIT, 'd2-motion.js'), 'utf8').trimEnd();

const argv = process.argv.slice(2);
const workspace = argv[0] ? resolve(argv[0]) : null;
let names = argv.slice(1);
if (!workspace || names.length === 0) {
  console.error('usage: node build-scene.mjs <workspace-dir> <NN ...> | all');
  process.exit(1);
}

// workspace 根的 assets symlink(绝对指向 skill 字体);scene 内用相对 ../../assets 指回它
const wsAssets = join(workspace, 'assets');
function ensureLink(linkPath, target) {
  try { rmSync(linkPath, { force: true, recursive: false }); } catch { /* not present */ }
  symlinkSync(target, linkPath);
}
if (!existsSync(workspace)) mkdirSync(workspace, { recursive: true });
ensureLink(wsAssets, KIT_ASSETS);

if (names.length === 1 && names[0] === 'all') {
  const srcDir = join(workspace, 'src');
  names = existsSync(srcDir)
    ? readdirSync(srcDir).filter((f) => /^scene-\d\d\.html$/.test(f)).map((f) => f.slice(6, 8))
    : [];
  if (!names.length) { console.error(`✗ ${srcDir} 里没有 scene-NN.html`); process.exit(1); }
}

function scaffold(nn) {
  const dir = join(workspace, 'scenes', `scene-${nn}`);
  mkdirSync(dir, { recursive: true });
  ensureLink(join(dir, 'assets'), '../../assets');   // 相对 symlink → workspace/assets → skill 字体
  writeFileSync(join(dir, 'hyperframes.json'),
    '{ "$schema": "https://hyperframes.heygen.com/schema/hyperframes.json", "paths": { "assets": "assets" } }\n');
  writeFileSync(join(dir, 'meta.json'),
    `{ "id": "s${nn}", "name": "scene-${nn}", "createdAt": "2026-01-01T00:00:00.000Z" }\n`);
  return dir;
}

function build(nn) {
  const srcPath = join(workspace, 'src', `scene-${nn}.html`);
  if (!existsSync(srcPath)) { console.error(`✗ scene-${nn}: 缺 src/scene-${nn}.html`); return false; }
  let html = readFileSync(srcPath, 'utf8');
  if (!html.includes('/*@@BASE@@*/') || !html.includes('/*@@MOTION@@*/')) {
    console.error(`✗ scene-${nn}: src 缺 /*@@BASE@@*/ 或 /*@@MOTION@@*/ marker`); return false;
  }
  html = html.replace('/*@@BASE@@*/', base).replace('/*@@MOTION@@*/', motion);
  // 字幕带在 track 5 首尾相接,浮点求和会让 end 微超下一条 start(2e-15),触发
  // overlapping_clips_same_track。把每条 .sub clip 显示时长削 10ms(0.3 帧,不可见)消歧。
  html = html.replace(/(class="clip sub"[^>]*?\bdata-duration=")([\d.]+)(")/g,
    (m, a, d, c) => a + Math.max(0.05, parseFloat(d) - 0.01).toFixed(3) + c);
  const dir = scaffold(nn);
  writeFileSync(join(dir, 'index.html'), html);
  console.log(`✓ scenes/scene-${nn}/index.html  (${html.length} bytes)`);
  return true;
}

let ok = true;
for (const a of names) { const nn = String(a).padStart(2, '0'); if (!build(nn)) ok = false; }
process.exit(ok ? 0 : 1);
