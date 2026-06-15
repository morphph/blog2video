#!/usr/bin/env node
/* build-scenes-data.mjs —— 由 TTS 产物脚本化生成 d2 场景时间轴(取代手搓 scenes-data.json)
 *
 * 用法:
 *   node build-scenes-data.mjs <output-dir> [video-number] [--workdir <写出目录>]
 *   例: node build-scenes-data.mjs blog2video-output/loop-engineering 1
 *
 * 输入(全在 <output-dir>/,均由 stage-6 的 tts.mjs 产出,与渲染器无关):
 *   video_N_audio_slide_map.json            —— [{slideNumber,charStart,charEnd}] slide↔narration 字符区间
 *   video_N_audio_minimax_raw_subtitles.json—— MiniMax 粗段 [{text,time_begin(ms),time_end(ms),text_begin,text_end}],char→time 的锚
 *   video_N_audio_subtitles.json            —— 细粒度句级字幕 [{start(s),end(s),text}]
 *   video_N_config.json (可选)              —— 仅用于 scriptType 提示;无则用结构默认
 *   slide_N.html                            —— 每页源内容(brief.srcSlideHtml 指向它)
 *
 * 输出(默认写进 <output-dir>/,可用 --workdir 改写出位置):
 *   scenes-data.json          —— 主时间轴 [{n,type,scriptType,start,dur,subs:[{start,end,text}],srcHtml,clip,file}]
 *   briefs/scene-NN.json      —— 每场景生成器输入 {scene,id,type,dataDuration,srcSlideHtml,topbarIndex,subtitles:[{id,localStart,localDuration,text}]}
 *
 * 算法(与 blog2video-remotion/scripts/render-image-video.mjs 的 alignSlideTiming 一致,+ 帧吸附修漂移):
 *   1. 每条 raw sub 归到 charStart ≤ text_begin 的最后一张 slide → 按 slide 分组
 *   2. slide.start = 组内首段 time_begin/1000;slide.dur = 组内末段 time_end/1000 − start
 *   3. gap-fill: 相邻 slide 间若有空隙,补到前一张(场景首尾相接)
 *   4. 末张内容 slide +1s 收尾;尾部追加 5s 静音 CTA 场景
 *   5. ★帧吸附(修音视频漂移): 所有场景边界吸到帧 —— start_frame=round(start×fps),
 *      dur=(next_start_frame − start_frame)/fps。于是每段 dur 都是 1/fps 整数倍,
 *      逐 clip 的 ceil(dur×fps) 取整不再累加,整片与口播误差恒定 ≤1 帧(不漂移)。
 *   6. 细字幕按吸附后的边界归入各场景,重定基到本地时间(localStart/localDuration)。
 *
 * scriptType(d2 类型)只给结构默认: 1=cover · 末张=summary · CTA=cta · 其余=image。
 * principle/comparison_cards/checklist/quote 等语义类型由 stage-5 编排者读 slide 内容后在 brief 里改定。
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const FPS = 30;
const CTA_DURATION = 5;            // 末尾静音尾卡时长(秒),固定 = 150 帧
const D2_TYPES = new Set(['cover', 'image', 'principle', 'comparison_cards', 'checklist', 'quote', 'summary', 'cta']);

// ---- 参数 ----
const argv = process.argv.slice(2);
const positional = [];
let workdirArg = null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--workdir') { workdirArg = argv[++i]; }
  else positional.push(argv[i]);
}
const outputDir = positional[0] ? resolve(positional[0]) : null;
const videoNumber = parseInt(positional[1] || '1', 10);
if (!outputDir) {
  console.error('usage: node build-scenes-data.mjs <output-dir> [video-number] [--workdir <dir>]');
  process.exit(1);
}
const workdir = workdirArg ? resolve(workdirArg) : outputDir;
const base = `video_${videoNumber}_audio`;

// ---- 读输入 ----
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const slideMapPath = join(outputDir, `${base}_slide_map.json`);
const rawSubPath = join(outputDir, `${base}_minimax_raw_subtitles.json`);
const finePath = join(outputDir, `${base}_subtitles.json`);
for (const p of [slideMapPath, rawSubPath, finePath]) {
  if (!existsSync(p)) { console.error(`✗ 缺少输入: ${p}`); process.exit(1); }
}
const slideMap = readJson(slideMapPath);
const rawSubs = readJson(rawSubPath);
const fineSubs = readJson(finePath);

// scriptType 提示(可选): 若 config 给了非占位的 d2 类型则采纳
const configPath = join(outputDir, `video_${videoNumber}_config.json`);
const configTypes = {};
if (existsSync(configPath)) {
  try {
    for (const s of (readJson(configPath).slides || [])) {
      if (s && s.type && D2_TYPES.has(s.type) && s.type !== 'image' && s.type !== 'cta') {
        configTypes[s.slideNumber || s.slide_number] = s.type;
      }
    }
  } catch { /* config 坏了就忽略,用结构默认 */ }
}

// ---- 1~4: 复刻 render-image-video.mjs 的 alignSlideTiming ----
const groups = new Map();                       // slideNumber → [raw sub]
for (const sub of rawSubs) {
  let slideNum = slideMap[0]?.slideNumber ?? 1;
  for (let i = slideMap.length - 1; i >= 0; i--) {
    if (slideMap[i].charStart <= sub.text_begin) { slideNum = slideMap[i].slideNumber; break; }
  }
  if (!groups.has(slideNum)) groups.set(slideNum, []);
  groups.get(slideNum).push(sub);
}

const slides = slideMap.map((s) => ({ n: s.slideNumber, start: 0, dur: 0 }));
for (const sl of slides) {
  const subs = groups.get(sl.n);
  if (subs && subs.length) {
    sl.start = subs[0].time_begin / 1000;
    sl.dur = subs[subs.length - 1].time_end / 1000 - sl.start;
  }
}
for (let i = 0; i < slides.length - 1; i++) {
  const gap = slides[i + 1].start - (slides[i].start + slides[i].dur);
  if (gap > 0) slides[i].dur += gap;          // gap-fill: 场景首尾相接
}
slides[slides.length - 1].dur += 1;            // 末张 +1s 收尾
const contentEnd = slides.reduce((m, s) => Math.max(m, s.start + s.dur), 0);

// ---- 5: 帧吸附(修漂移)----
// 连续边界 = 各场景 start + contentEnd + (contentEnd + CTA);全部吸到帧。
const boundsSec = [...slides.map((s) => s.start), contentEnd, contentEnd + CTA_DURATION];
const boundsFrame = boundsSec.map((t) => Math.round(t * FPS));
const startSnap = (i) => boundsFrame[i] / FPS;
const durSnap = (i) => (boundsFrame[i + 1] - boundsFrame[i]) / FPS;
const round3 = (x) => Math.round(x * 1000) / 1000;

// ---- scriptType 结构默认 ----
const lastContentIdx = slides.length - 1;
const scriptTypeFor = (idx) => {
  if (configTypes[slides[idx].n]) return configTypes[slides[idx].n];
  if (idx === 0) return 'cover';
  if (idx === lastContentIdx) return 'summary';
  return 'image';
};

// ---- 6: 细字幕归场景 + 重定基 ----
// 归属用【未吸附】的 slide 边界(= slide 成员关系,与口播分段一致;每张 slide 首条细字幕
// 的 start 恰好 = 该 slide 的 start,吸附会把它推过界,所以归属必须用原始边界)。
// 重定基用【已吸附】的 start: 终片里 clip i 落在 frame boundsFrame[i],即 startSnap(i) 处,
// 音频是连续原轨,故烧字幕本地时间 = 绝对口播时间 − startSnap(i),才与音频对齐(这正是修漂移的校正,
// 与 Phase 1 按未吸附 start 重定基相差 ≤ 半帧)。
const unsnapBounds = [...slides.map((s) => s.start), contentEnd];
const sceneSubs = (idx) => {
  const lo = unsnapBounds[idx], hi = unsnapBounds[idx + 1];
  const out = [];
  for (const s of fineSubs) {
    if (s.start >= lo - 1e-6 && s.start < hi - 1e-6) {
      const localStart = Math.max(0, round3(s.start - startSnap(idx)));
      out.push({ localStart, localDuration: round3(s.end - s.start), text: s.text });
    }
  }
  return out;
};

// ---- 组装 scenes-data.json ----
const total = slides.length;                    // 内容场景数(topbarIndex 分母,不含 CTA)
const pad = (n) => String(n).padStart(2, '0');
const scenesData = [];
const briefs = [];

for (let i = 0; i < slides.length; i++) {
  const n = i + 1;
  const stype = scriptTypeFor(i);
  const subs = sceneSubs(i);
  const srcAbs = join(outputDir, `slide_${slides[i].n}.html`);
  scenesData.push({
    n,
    type: configTypes[slides[i].n] || 'image',   // legacy 槽位(Remotion fallback 用)
    scriptType: stype,
    start: round3(startSnap(i)),
    dur: round3(durSnap(i)),
    subs: subs.map((s) => ({ start: s.localStart, end: round3(s.localStart + s.localDuration), text: s.text })),
    srcHtml: `slide_${slides[i].n}.html`,
    clip: `clips/scene-${pad(n)}.mp4`,
    file: `src/scene-${pad(n)}.html`,
  });
  briefs.push({
    scene: n,
    id: `s${pad(n)}`,
    type: stype,
    dataDuration: round3(durSnap(i)),
    srcSlideHtml: srcAbs,
    topbarIndex: `[${pad(n)}/${total}]`,
    subtitles: subs.map((s, k) => ({ id: `sub-${k + 1}`, localStart: s.localStart, localDuration: s.localDuration, text: s.text })),
  });
}

// CTA 尾卡场景(无字幕,5s 静音)
{
  const ctaIdx = slides.length;                  // boundsFrame 中 CTA 区间的左边界下标
  const n = ctaIdx + 1;
  scenesData.push({
    n, type: 'cta', scriptType: 'cta',
    start: round3(startSnap(ctaIdx)), dur: round3(durSnap(ctaIdx)),
    subs: [], srcHtml: null, clip: `clips/scene-${pad(n)}.mp4`, file: `src/scene-${pad(n)}.html`,
  });
  briefs.push({
    scene: n, id: `s${pad(n)}`, type: 'cta',
    dataDuration: round3(durSnap(ctaIdx)),
    srcSlideHtml: join(outputDir, `slide_${n}.html`),
    topbarIndex: `[${pad(n)}/${total}]`,
    subtitles: [],
  });
}

// ---- 写出 ----
if (!existsSync(workdir)) mkdirSync(workdir, { recursive: true });
const briefsDir = join(workdir, 'briefs');
if (!existsSync(briefsDir)) mkdirSync(briefsDir, { recursive: true });
writeFileSync(join(workdir, 'scenes-data.json'), JSON.stringify(scenesData, null, 1));
for (const b of briefs) writeFileSync(join(briefsDir, `scene-${pad(b.scene)}.json`), JSON.stringify(b, null, 1));

const totalVideo = scenesData[scenesData.length - 1].start + scenesData[scenesData.length - 1].dur;
console.log(`✓ scenes-data.json + ${briefs.length} briefs → ${workdir}`);
console.log(`  内容场景 ${total} + CTA = ${scenesData.length} 个;整片 ${totalVideo.toFixed(3)}s (= ${Math.round(totalVideo * FPS)} 帧)`);
console.log(`  字幕归位: ${briefs.reduce((s, b) => s + b.subtitles.length, 0)}/${fineSubs.length} 条`);
console.log(`  帧吸附: 全部场景 dur 为 1/${FPS}s 整数倍,音视频零累积漂移`);
