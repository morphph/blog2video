import * as fs from 'fs';
import * as path from 'path';

// ============== Types ==============

export interface VideoMeta {
  file: string;
  title: string;
  description: string;
  tags: string[];
  cover?: string;
}

export interface QueueMeta {
  blog_url: string;
  videos: VideoMeta[];
  schedule: string; // "auto" or ISO date
}

export interface PublishRecord {
  folder: string;
  video: VideoMeta;
  platform: string;
  publishedAt: string;
  success: boolean;
  error?: string;
}

export class CookieExpiredError extends Error {
  platform: string;
  constructor(platform: string) {
    super(`Cookie expired for ${platform}, need re-login`);
    this.name = 'CookieExpiredError';
    this.platform = platform;
  }
}

// ============== Paths ==============

export const PROJECT_ROOT = path.resolve(__dirname, '..');
export const QUEUE_DIR = path.join(PROJECT_ROOT, 'queue');
export const PUBLISHED_DIR = path.join(PROJECT_ROOT, 'published');
export const COOKIES_DIR = path.join(PROJECT_ROOT, 'cookies');

// ============== Time (SGT UTC+8) ==============

export function nowSGT(): Date {
  return new Date();
}

export function toSGT(date: Date): Date {
  // Returns a shifted Date for display purposes
  return new Date(date.getTime() + 8 * 60 * 60 * 1000);
}

export function formatSGT(date: Date): string {
  const sgt = toSGT(date);
  return sgt.toISOString().replace('T', ' ').replace(/\.\d+Z/, '') + ' SGT';
}

// Schedule slots in UTC hours (corresponding to SGT 08:00, 13:00, 21:00)
export const SCHEDULE_SLOTS_UTC = [0, 5, 13]; // 08:00 SGT, 13:00 SGT, 21:00 SGT

export function getNextSlot(after: Date, occupiedSlots: Set<string>): Date {
  const current = new Date(after);
  
  // Start from current day
  current.setUTCMinutes(0, 0, 0);
  
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    for (const hourUTC of SCHEDULE_SLOTS_UTC) {
      const slot = new Date(current);
      slot.setUTCDate(slot.getUTCDate() + dayOffset);
      slot.setUTCHours(hourUTC, 0, 0, 0);
      
      // Skip past slots
      if (slot.getTime() <= after.getTime()) continue;
      
      const slotKey = slot.toISOString();
      if (!occupiedSlots.has(slotKey)) {
        return slot;
      }
    }
  }
  
  throw new Error('No available slot in next 30 days');
}

// ============== File helpers ==============

export function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function writeJson(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============== Logging ==============

export function log(msg: string): void {
  console.log(`[${formatSGT(new Date())}] ${msg}`);
}

export function logError(msg: string, err?: unknown): void {
  console.error(`[${formatSGT(new Date())}] ERROR: ${msg}`, err instanceof Error ? err.message : err);
}
