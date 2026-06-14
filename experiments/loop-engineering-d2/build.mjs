#!/usr/bin/env node
/* build.mjs —— 把 kit 内联进场景,产出自包含 index.html
 * 授权源:src/scene-NN.html(含 markers /*@@BASE@@*\/ 和 /*@@MOTION@@*\/)
 * 用法:  node build.mjs 05        只构建 scene-05
 *         node build.mjs 05 07 16  构建多个
 *         node build.mjs all       构建所有 src/scene-NN.html
 * 结果:  scenes/scene-NN/index.html(kit 全文内联,hyperframes 直接渲)
 * 注:授权源放 src/ 而非 scene 目录内,避免被 hyperframes 当成第二个 root composition。
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));
const base = readFileSync(join(ROOT, 'kit/d2-base.css'), 'utf8').trimEnd();
const motion = readFileSync(join(ROOT, 'kit/d2-motion.js'), 'utf8').trimEnd();

function build(nn){
  const dir = join(ROOT, `scenes/scene-${nn}`);
  const srcPath = join(ROOT, `src/scene-${nn}.html`);
  if(!existsSync(srcPath)){ console.error(`✗ scene-${nn}: no src/scene-${nn}.html`); return false; }
  let html = readFileSync(srcPath, 'utf8');
  if(!html.includes('/*@@BASE@@*/') || !html.includes('/*@@MOTION@@*/')){
    console.error(`✗ scene-${nn}: src missing /*@@BASE@@*/ or /*@@MOTION@@*/ marker`); return false;
  }
  html = html.replace('/*@@BASE@@*/', base).replace('/*@@MOTION@@*/', motion);
  // 字幕带在 track 5 上首尾相接,浮点求和会让 end 微超下一条 start(2e-15),触发
  // overlapping_clips_same_track。把每条 .sub clip 的显示时长削 10ms(0.3 帧,不可见)消歧。
  html = html.replace(/(class="clip sub"[^>]*?\bdata-duration=")([\d.]+)(")/g,
    (m, a, d, c) => a + Math.max(0.05, parseFloat(d) - 0.01).toFixed(3) + c);
  writeFileSync(join(dir, 'index.html'), html);
  console.log(`✓ scene-${nn}/index.html  (${html.length} bytes)`);
  return true;
}

let args = process.argv.slice(2);
if(args.length === 1 && args[0] === 'all'){
  args = readdirSync(join(ROOT, 'src'))
    .filter(f => /^scene-\d\d\.html$/.test(f))
    .map(f => f.slice(6, 8));
}
if(args.length === 0){ console.error('usage: node build.mjs <NN ...> | all'); process.exit(1); }
let ok = true;
for(const a of args){ const nn = String(a).padStart(2,'0'); if(!build(nn)) ok = false; }
process.exit(ok ? 0 : 1);
