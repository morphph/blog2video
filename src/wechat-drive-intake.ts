import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';
import { ensureDir, log, logError, PROJECT_ROOT, QUEUE_DIR } from './utils';

type BlogMeta = {
  topic?: string;
  blog_url?: string;
  source?: string;
  flow_source?: string;
  videos?: BlogVideo[];
};

type BlogVideo = {
  video_number: number;
  file: string;
  cover?: string;
  script?: string;
  subtitle?: string;
};

type PublishRow = {
  source_slug: string;
  video_number: string;
  topic: string;
  source_blog_url: string;
  drive_folder: string;
  video_file: string;
  cover_file: string;
  script_file: string;
  subtitle_file: string;
  description: string;
  collection: string;
  scheduled_at_sgt: string;
  status: string;
  wechat_preview_url: string;
  final_video_url: string;
  error: string;
  created_at: string;
  updated_at: string;
};

type RemoteFolder = {
  slug: string;
  modTime: string;
};

type IntakeState = {
  last_successful_at?: string;
  seen_folders?: Record<string, string>;
};

const DRIVE_REMOTE = process.env.BLOG2VIDEO_GDRIVE_REMOTE || 'gdrive:blog2video';
const INTAKE_MAX_AGE = process.env.BLOG2VIDEO_INTAKE_MAX_AGE || '3d';
const LOG_DIR = path.join(PROJECT_ROOT, 'published');
const CSV_PATH = process.env.WECHAT_PUBLISH_LOG_CSV || path.join(LOG_DIR, 'wechat_publish_log.csv');
const JSON_PATH = process.env.WECHAT_PUBLISH_LOG_JSON || path.join(LOG_DIR, 'wechat_publish_log.json');
const QUEUE_MANIFEST_PATH = path.join(LOG_DIR, 'wechat_publish_queue.json');
const STATE_PATH = path.join(LOG_DIR, 'wechat_intake_state.json');
const SGT_TIME_ZONE = 'Asia/Singapore';
const SCHEDULE_SLOTS = ['13:00', '22:30'];
const FIXED_TAGS = [
  '#ai',
  '#llm',
  '#aiagent',
  '#agent',
  '#anthropic',
  '#claude',
  '#claudecode',
  '#aicoding',
  '#agenticcoding',
  '#智能体',
  '#大语言模型',
  '#codex',
  '#openai',
  '#chagpt',
];

const CSV_HEADERS: (keyof PublishRow)[] = [
  'source_slug',
  'video_number',
  'topic',
  'source_blog_url',
  'drive_folder',
  'video_file',
  'cover_file',
  'script_file',
  'subtitle_file',
  'description',
  'collection',
  'scheduled_at_sgt',
  'status',
  'wechat_preview_url',
  'final_video_url',
  'error',
  'created_at',
  'updated_at',
];

function runRclone(args: string[]): string {
  return execFileSync('rclone', args, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function listDriveFolders(): RemoteFolder[] {
  const output = runRclone(['lsjson', DRIVE_REMOTE, '--dirs-only']);
  const entries = JSON.parse(output) as Array<{ Name?: string; ModTime?: string; IsDir?: boolean }>;
  return entries
    .filter(entry => entry.IsDir && entry.Name && !entry.Name.startsWith('.'))
    .map(entry => ({
      slug: entry.Name as string,
      modTime: entry.ModTime || new Date(0).toISOString(),
    }))
    .sort((a, b) => a.modTime.localeCompare(b.modTime));
}

function copyFolder(slug: string, destRoot: string): void {
  const dest = path.join(destRoot, slug);
  ensureDir(dest);
  runRclone([
    'copy',
    `${DRIVE_REMOTE}/${slug}`,
    dest,
    '--transfers',
    '4',
    '--checkers',
    '8',
    '--retries',
    '3',
  ]);
}

function downloadFolder(slug: string): void {
  copyFolder(slug, QUEUE_DIR);
}

function readRows(): PublishRow[] {
  if (fs.existsSync(JSON_PATH)) {
    const rows = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8')) as PublishRow[];
    return rows.map(row => ({
      ...row,
      video_number: String(row.video_number ?? ''),
    }));
  }
  return [];
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function writeRows(rows: PublishRow[]): void {
  ensureDir(LOG_DIR);
  fs.writeFileSync(JSON_PATH, JSON.stringify(rows, null, 2));
  const csv = [
    CSV_HEADERS.join(','),
    ...rows.map(row => CSV_HEADERS.map(header => csvEscape(row[header] || '')).join(',')),
  ].join('\n') + '\n';
  fs.writeFileSync(CSV_PATH, csv);
}

function readState(): IntakeState {
  if (!fs.existsSync(STATE_PATH)) {
    return { seen_folders: {} };
  }
  return JSON.parse(fs.readFileSync(STATE_PATH, 'utf-8')) as IntakeState;
}

function writeState(state: IntakeState): void {
  ensureDir(LOG_DIR);
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

function getSgtParts(date: Date): { year: number; month: number; day: number; hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: SGT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find(part => part.type === type)?.value);
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
  };
}

function formatSgtDate(date: Date): string {
  const parts = getSgtParts(date);
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')} ${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`;
}

function parseSgtDate(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, y, m, d, h, min] = match;
  return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), Number(h) - 8, Number(min), 0));
}

function makeSgtDate(year: number, month: number, day: number, time: string): Date {
  const [hour, minute] = time.split(':').map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour - 8, minute, 0));
}

function nextScheduleSlot(after: Date, occupied: Set<string>): string {
  const now = after;
  const base = getSgtParts(now);
  for (let offset = 0; offset < 45; offset++) {
    const day = makeSgtDate(base.year, base.month, base.day + offset, '00:00');
    const dayParts = getSgtParts(day);
    for (const slot of SCHEDULE_SLOTS) {
      const candidate = makeSgtDate(dayParts.year, dayParts.month, dayParts.day, slot);
      const label = formatSgtDate(candidate);
      if (candidate.getTime() <= now.getTime()) continue;
      if (occupied.has(label)) continue;
      occupied.add(label);
      return label;
    }
  }
  throw new Error('No schedule slot available in the next 45 days');
}

function extractHook(scriptPath: string): string {
  if (!fs.existsSync(scriptPath)) return '';
  const text = fs.readFileSync(scriptPath, 'utf-8').replace(/\r\n/g, '\n');
  const lines = text.split('\n');
  const paragraph: string[] = [];
  let hasPassedSlideMarker = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (paragraph.length > 0) break;
      continue;
    }
    if (line.startsWith('#')) continue;
    if (/^\[SLIDE\b/i.test(line)) {
      hasPassedSlideMarker = true;
      if (paragraph.length > 0) break;
      continue;
    }
    if (!hasPassedSlideMarker && paragraph.length === 0) {
      hasPassedSlideMarker = true;
    }
    paragraph.push(line);
  }

  return paragraph.join(' ').replace(/\s+/g, ' ').trim();
}

function classifyCollection(topic: string, hook: string, sourceSlug: string): string {
  const haystack = `${topic} ${hook} ${sourceSlug}`.toLowerCase();
  const harnessSignals = [
    'harness',
    'managed agent',
    'managed agents',
    'orchestration',
    'workflow',
    'agent loop',
    '架构',
    '编排',
    '工作流',
  ];
  return harnessSignals.some(signal => haystack.includes(signal)) ? 'harness' : 'aicoding';
}

function buildDescription(hook: string): string {
  const body = hook || '精读AI更新。';
  return `${body}\n\n${FIXED_TAGS.join(' ')}`;
}

function emptyRow(): PublishRow {
  return {
    source_slug: '',
    video_number: '',
    topic: '',
    source_blog_url: '',
    drive_folder: '',
    video_file: '',
    cover_file: '',
    script_file: '',
    subtitle_file: '',
    description: '',
    collection: '',
    scheduled_at_sgt: '',
    status: '',
    wechat_preview_url: '',
    final_video_url: '',
    error: '',
    created_at: '',
    updated_at: '',
  };
}

function buildRowsForFolder(folderPath: string, slug: string, existingRows: PublishRow[], occupied: Set<string>): PublishRow[] {
  const metaPath = path.join(folderPath, 'meta.json');
  if (!fs.existsSync(metaPath)) {
    log(`[WeChat Intake] Skipping ${slug}: no meta.json after download`);
    return [];
  }

  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as BlogMeta;
  const videos = meta.videos || [];
  const nowIso = new Date().toISOString();
  const rows: PublishRow[] = [];

  for (const video of videos) {
    const exists = existingRows.some(row => row.source_slug === slug && String(row.video_number) === String(video.video_number));
    if (exists) continue;

    const scriptFile = video.script || `video_${video.video_number}_script.md`;
    const hook = extractHook(path.join(folderPath, scriptFile));
    const description = buildDescription(hook);
    const row = emptyRow();
    row.source_slug = slug;
    row.video_number = String(video.video_number);
    row.topic = meta.topic || '';
    row.source_blog_url = meta.blog_url || '';
    row.drive_folder = `${DRIVE_REMOTE}/${slug}`;
    row.video_file = video.file;
    row.cover_file = video.cover || '';
    row.script_file = scriptFile;
    row.subtitle_file = video.subtitle || '';
    row.description = description;
    row.collection = classifyCollection(row.topic, hook, slug);
    row.scheduled_at_sgt = nextScheduleSlot(new Date(), occupied);
    row.status = 'queued';
    row.created_at = nowIso;
    row.updated_at = nowIso;
    rows.push(row);
  }

  return rows;
}

function writeQueueManifest(rows: PublishRow[]): void {
  const queued = rows.filter(row => row.status === 'queued' || row.status === 'staged');
  fs.writeFileSync(QUEUE_MANIFEST_PATH, JSON.stringify({
    generated_at: new Date().toISOString(),
    drive_remote: DRIVE_REMOTE,
    schedule_slots_sgt: SCHEDULE_SLOTS,
    items: queued.map(row => ({
      source_slug: row.source_slug,
      video_number: Number(row.video_number),
      topic: row.topic,
      source_blog_url: row.source_blog_url,
      video_path: path.join(QUEUE_DIR, row.source_slug, row.video_file),
      cover_path: row.cover_file ? path.join(QUEUE_DIR, row.source_slug, row.cover_file) : '',
      script_path: row.script_file ? path.join(QUEUE_DIR, row.source_slug, row.script_file) : '',
      description: row.description,
      collection: row.collection,
      scheduled_at_sgt: row.scheduled_at_sgt,
      wechat_preview_url: row.wechat_preview_url,
      final_video_url: row.final_video_url,
    })),
  }, null, 2));
}

function parseMaxAgeMs(value: string): number | null {
  const match = value.match(/^(\d+)([smhdw])$/i);
  if (!match) return null;
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  };
  return amount * multipliers[unit];
}

function resolveCandidates(folders: RemoteFolder[], state: IntakeState, existingRows: PublishRow[]): RemoteFolder[] {
  const seen = state.seen_folders || {};
  const existingSlugs = new Set(existingRows.map(row => row.source_slug));
  const lastSuccessfulMs = state.last_successful_at ? Date.parse(state.last_successful_at) : NaN;

  if (Number.isFinite(lastSuccessfulMs)) {
    return folders.filter(folder => {
      const folderMs = Date.parse(folder.modTime);
      const seenModTime = seen[folder.slug];
      if (seenModTime && seenModTime >= folder.modTime) return false;
      if (folderMs > lastSuccessfulMs) return true;
      return !existingSlugs.has(folder.slug) && !seenModTime;
    });
  }

  const maxAgeMs = parseMaxAgeMs(INTAKE_MAX_AGE);
  if (maxAgeMs == null) {
    return folders.filter(folder => !seen[folder.slug] || seen[folder.slug] < folder.modTime);
  }

  const cutoffMs = Date.now() - maxAgeMs;
  return folders.filter(folder => {
    const folderMs = Date.parse(folder.modTime);
    if (!Number.isFinite(folderMs)) return false;
    if (folderMs < cutoffMs) return false;
    return !seen[folder.slug] || seen[folder.slug] < folder.modTime;
  });
}

function parseArgs(): { dryRun: boolean; limit: number | null } {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const init = args.includes('--init-log');
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : null;
  return { dryRun: dryRun || init, limit: Number.isFinite(limit) ? limit : null };
}

function hasArg(name: string): boolean {
  return process.argv.slice(2).includes(name);
}

async function main(): Promise<void> {
  const { dryRun, limit } = parseArgs();
  ensureDir(LOG_DIR);
  ensureDir(QUEUE_DIR);

  const existingRows = readRows();
  const state = readState();
  if (hasArg('--init-log')) {
    writeRows(existingRows);
    writeQueueManifest(existingRows);
    writeState(state);
    log(`[WeChat Intake] Initialized log files: ${CSV_PATH}, ${JSON_PATH}`);
    return;
  }
  const occupied = new Set(existingRows.map(row => row.scheduled_at_sgt).filter(Boolean));
  const folders = listDriveFolders();
  const candidates = resolveCandidates(folders, state, existingRows);
  const selected = limit ? candidates.slice(0, limit) : candidates;

  log(`[WeChat Intake] Drive folders=${folders.length}, previousSeen=${Object.keys(state.seen_folders || {}).length}, candidates=${candidates.length}, lastSuccessful=${state.last_successful_at || 'none'}, fallbackMaxAge=${INTAKE_MAX_AGE || 'disabled'}`);
  if (selected.length === 0) {
    writeRows(existingRows);
    writeQueueManifest(existingRows);
    writeState({
      ...state,
      last_successful_at: new Date().toISOString(),
      seen_folders: {
        ...(state.seen_folders || {}),
        ...Object.fromEntries(folders.map(folder => [folder.slug, folder.modTime])),
      },
    });
    log('[WeChat Intake] No new videos found.');
    return;
  }

  const additions: PublishRow[] = [];
  const nextSeenFolders = { ...(state.seen_folders || {}) };
  const tempRoot = path.join(PROJECT_ROOT, '.tmp');
  if (dryRun) ensureDir(tempRoot);
  const stageRoot = dryRun ? fs.mkdtempSync(path.join(tempRoot, 'wechat-intake-')) : QUEUE_DIR;
  try {
    for (const folder of selected) {
      const slug = folder.slug;
      try {
        log(`[WeChat Intake] Downloading ${slug} from ${DRIVE_REMOTE}...`);
        if (dryRun) {
          copyFolder(slug, stageRoot);
        } else {
          downloadFolder(slug);
        }
        const folderRows = buildRowsForFolder(path.join(stageRoot, slug), slug, [...existingRows, ...additions], occupied);
        additions.push(...folderRows);
        nextSeenFolders[slug] = folder.modTime;
        log(`[WeChat Intake] Prepared ${folderRows.length} row(s) for ${slug}`);
      } catch (err) {
        logError(`[WeChat Intake] Failed to prepare ${slug}`, err);
      }
    }
  } finally {
    if (dryRun && fs.existsSync(stageRoot)) {
      fs.rmSync(stageRoot, { recursive: true, force: true });
    }
  }

  const nextRows = [...existingRows, ...additions];
  if (!dryRun) {
    writeRows(nextRows);
    writeQueueManifest(nextRows);
    writeState({
      last_successful_at: new Date().toISOString(),
      seen_folders: nextSeenFolders,
    });
  } else {
    log(`[WeChat Intake] Dry run additions:\n${JSON.stringify(additions, null, 2)}`);
  }
  log(`[WeChat Intake] Added ${additions.length} video(s). Log: ${CSV_PATH}`);
}

if (require.main === module) {
  main().catch(err => {
    logError('[WeChat Intake] Crashed', err);
    process.exit(1);
  });
}
