import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import OpenAI from 'openai';
import { QueueMeta, VideoMeta, log, logError } from './utils';

// ============== Config ==============

function loadEnvFile(): Record<string, string> {
  const envPath = '/home/ubuntu/.env';
  const vars: Record<string, string> = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const match = line.match(/^([A-Z_]+)=(.+)$/);
      if (match) vars[match[1]] = match[2].trim();
    }
  }
  return vars;
}

function getApiKey(name: string): string | undefined {
  return process.env[name] || loadEnvFile()[name];
}

// ============== FFmpeg: Extract Audio ==============

function extractAudio(videoPath: string): string {
  const audioPath = videoPath.replace(/\.mp4$/i, '.wav');
  try {
    execSync(
      `ffmpeg -y -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${audioPath}"`,
      { stdio: 'pipe', timeout: 120000 }
    );
    return audioPath;
  } catch (err) {
    throw new Error(`FFmpeg audio extraction failed for ${videoPath}: ${err instanceof Error ? err.message : err}`);
  }
}

// ============== Whisper: Speech to Text ==============

async function transcribeAudio(audioPath: string): Promise<string> {
  const apiKey = getApiKey('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not found in environment or /home/ubuntu/.env');
  }

  const openai = new OpenAI({ apiKey });

  // Whisper API has 25MB limit; check file size
  const stats = fs.statSync(audioPath);
  if (stats.size > 25 * 1024 * 1024) {
    log(`[Whisper] Audio file ${path.basename(audioPath)} is ${Math.round(stats.size / 1024 / 1024)}MB, may need splitting`);
  }

  const response = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: 'whisper-1',
    language: 'zh',
    response_format: 'text',
  });

  return response as unknown as string;
}

// ============== Brave Search: Trending Tags ==============

async function searchTrendingTags(topic: string): Promise<string[]> {
  const apiKey = getApiKey('BRAVE_API_KEY');
  if (!apiKey) {
    log('[Tags] BRAVE_API_KEY not found, skipping trending tag search');
    return [];
  }

  const tags: string[] = [];

  const queries = [
    `小红书 ${topic} 热门标签`,
    `视频号 ${topic} 热门话题`,
  ];

  for (const query of queries) {
    try {
      const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`;
      const resp = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': apiKey,
        },
      });

      if (!resp.ok) {
        log(`[Tags] Brave search failed: ${resp.status}`);
        continue;
      }

      const data = await resp.json() as { web?: { results?: Array<{ title: string; description: string }> } };
      const results = data.web?.results || [];

      // Extract hashtags from titles and descriptions
      for (const result of results) {
        const text = `${result.title} ${result.description}`;
        const hashtagMatches = text.match(/#[\u4e00-\u9fff\w]+/g);
        if (hashtagMatches) {
          for (const tag of hashtagMatches) {
            tags.push(tag.replace('#', ''));
          }
        }
      }
    } catch (err) {
      logError(`Brave search failed for "${query}"`, err);
    }
  }

  // Deduplicate
  return [...new Set(tags)].slice(0, 10);
}

// ============== AI: Generate Meta ==============

async function generateMetaFromTranscript(
  transcript: string,
  trendingTags: string[],
  fileName: string
): Promise<{ topic: string; title: string; description: string; tags: string[] }> {
  const apiKey = getApiKey('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not found');
  }

  const openai = new OpenAI({ apiKey });

  const trendingSection = trendingTags.length > 0
    ? `\n当前平台热门相关标签：${trendingTags.join('、')}\n请从中选择相关的标签并与内容标签合并。`
    : '';

  const prompt = `根据以下视频转录文字，生成中文的视频元信息。

转录文字：
${transcript.slice(0, 3000)}
${trendingSection}

请严格按以下 JSON 格式返回（不要包含其他文字）：
{
  "topic": "视频核心主题一句话",
  "title": "吸引人的中文标题（15字以内）",
  "description": "中文描述（2-3句话，适合小红书和视频号发布）",
  "tags": ["标签1", "标签2", "标签3", "标签4", "标签5"]
}

标签要求：
- 5-8个标签
- 混合内容相关标签和平台热门标签
- 不要带#号`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('Empty response from AI');
  }

  // Parse JSON from response (handle markdown code blocks)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Failed to parse AI response as JSON: ${content.slice(0, 200)}`);
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    topic: parsed.topic || '未知主题',
    title: parsed.title || fileName,
    description: parsed.description || '',
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 8) : [],
  };
}

// ============== Read script.md for a specific video ==============

function readVideoScript(videoDir: string, videoFile: string): string | null {
  // Try video-specific script first: video_1_script.md
  const num = videoFile.match(/video_(\d+)/)?.[1];
  if (num) {
    const specificScript = path.join(videoDir, `video_${num}_script.md`);
    if (fs.existsSync(specificScript)) {
      const content = fs.readFileSync(specificScript, 'utf-8').trim();
      if (content.length > 10) {
        log(`[AutoMeta] Using ${path.basename(specificScript)} (${content.length} chars)`);
        return content;
      }
    }
  }
  return null;
}

// ============== Read source blog ==============

function readSourceBlog(videoDir: string): string | null {
  for (const name of ['source_blog.md', 'source_raw.md']) {
    const p = path.join(videoDir, name);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf-8').trim();
      if (content.length > 10) {
        log(`[AutoMeta] Found ${name} (${content.length} chars)`);
        return content;
      }
    }
  }
  return null;
}

// ============== Read VTT subtitle ==============

function readSubtitle(videoDir: string, videoFile: string): string | null {
  const num = videoFile.match(/video_(\d+)/)?.[1];
  if (num) {
    const vttPath = path.join(videoDir, `video_${num}_audio.vtt`);
    if (fs.existsSync(vttPath)) {
      const raw = fs.readFileSync(vttPath, 'utf-8');
      // Strip VTT headers and timestamps, keep only text
      const text = raw
        .split('\n')
        .filter(l => !l.match(/^(WEBVTT|NOTE|\d{2}:\d{2}|\s*$)/))
        .join(' ')
        .trim();
      if (text.length > 10) {
        log(`[AutoMeta] Using VTT subtitle for video_${num} (${text.length} chars)`);
        return text;
      }
    }
  }
  return null;
}

// ============== Enhanced AI prompt with script + blog ==============

async function generateMetaFromScriptAndBlog(
  script: string,
  sourceBlog: string | null,
  trendingTags: string[],
  videoFile: string,
  videoNumber: number,
  totalVideos: number,
): Promise<{ topic: string; title: string; description: string; tags: string[] }> {
  const apiKey = getApiKey('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not found');

  const openai = new OpenAI({ apiKey });

  const trendingSection = trendingTags.length > 0
    ? `\n当前平台热门相关标签：${trendingTags.join('、')}\n请从中选择相关的标签并与内容标签合并。`
    : '';

  const blogSection = sourceBlog
    ? `\n原始博客内容（节选）：\n${sourceBlog.slice(0, 2000)}\n`
    : '';

  const seriesNote = totalVideos > 1
    ? `\n这是系列视频的第 ${videoNumber}/${totalVideos} 集。标题中请体现集数。`
    : '';

  const prompt = `你是一个小红书和微信视频号的内容运营专家。根据以下视频脚本和原始博客内容，生成适合发布的视频元信息。

视频脚本：
${script.slice(0, 3000)}
${blogSection}
${seriesNote}
${trendingSection}

请严格按以下 JSON 格式返回（不要包含其他文字）：
{
  "topic": "视频核心主题一句话",
  "title": "吸引人的中文标题（15-25字，有冲击力，适合小红书和视频号）",
  "description": "中文描述（3-4句话，100-200字。第一句话要抓眼球，适合小红书和视频号发布。结尾可以加引导互动的话）",
  "tags": ["标签1", "标签2", "标签3", "标签4", "标签5"]
}

标签要求：
- 5-8个标签
- 包含：内容主题标签 + 平台热门标签
- 不要带#号
- 参考风格：AI、AI创业、LLM、Claude、AI Agent、精读AI`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error('Empty response from AI');

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Failed to parse AI response as JSON: ${content.slice(0, 200)}`);

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    topic: parsed.topic || '未知主题',
    title: parsed.title || videoFile,
    description: parsed.description || '',
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 8) : [],
  };
}

// ============== Main: generateMeta ==============

export async function generateMeta(videoDir: string): Promise<boolean> {
  const metaPath = path.join(videoDir, 'meta.json');

  // Read existing meta.json if present (may have partial info from Claude Code)
  let existingMeta: any = null;
  if (fs.existsSync(metaPath)) {
    try {
      existingMeta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    } catch { /* ignore parse errors */ }

    // If meta already has full publish info (title+description+tags on all videos), skip
    if (existingMeta?.videos?.length > 0 &&
        existingMeta.videos.every((v: any) => v.title && v.description && v.tags?.length > 0) &&
        !existingMeta._needs_publish_meta) {
      log(`[AutoMeta] Skipping ${videoDir}: meta.json already has complete publish info`);
      return false;
    }
  }

  // Find all .mp4 files
  const files = fs.readdirSync(videoDir).filter(f => f.toLowerCase().endsWith('.mp4')).sort();
  if (files.length === 0) {
    log(`[AutoMeta] Skipping ${videoDir}: no .mp4 files`);
    return false;
  }

  log(`[AutoMeta] Generating publish meta for ${videoDir} (${files.length} videos)`);

  // Read source blog (shared across all videos in the series)
  const sourceBlog = readSourceBlog(videoDir);

  const videos: VideoMeta[] = [];
  let overallTopic = existingMeta?.topic || '';

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const videoNum = i + 1;

    try {
      // Priority: script.md > VTT subtitle > Whisper transcription
      let transcript = readVideoScript(videoDir, file);

      if (!transcript) {
        transcript = readSubtitle(videoDir, file);
      }

      if (!transcript) {
        // Fallback: check for shared script.txt
        const scriptTxt = path.join(videoDir, 'script.txt');
        if (fs.existsSync(scriptTxt)) {
          transcript = fs.readFileSync(scriptTxt, 'utf-8').trim();
          log(`[AutoMeta] Using shared script.txt (${transcript.length} chars)`);
        }
      }

      if (!transcript) {
        // Last resort: Whisper transcription
        log(`[AutoMeta] No script/subtitle found for ${file}, falling back to Whisper...`);
        const videoPath = path.join(videoDir, file);
        let audioPath: string | null = null;
        try {
          audioPath = extractAudio(videoPath);
          transcript = await transcribeAudio(audioPath);
        } finally {
          if (audioPath && fs.existsSync(audioPath)) {
            try { fs.unlinkSync(audioPath); } catch { /* ignore */ }
          }
        }
      }

      if (!transcript || transcript.length < 10) {
        log(`[AutoMeta] Transcript too short for ${file}, using filename as fallback`);
        videos.push({
          file,
          title: file.replace(/\.mp4$/i, ''),
          description: '视频内容',
          tags: ['视频', '分享'],
          cover: existingMeta?.videos?.[i]?.cover,
        });
        continue;
      }

      // Search trending tags
      const roughTopic = transcript.slice(0, 100).replace(/[^\u4e00-\u9fff\w\s]/g, '').trim();
      log(`[AutoMeta] Searching trending tags for: ${roughTopic.slice(0, 30)}...`);
      const trendingTags = await searchTrendingTags(roughTopic.slice(0, 30));

      // Generate meta with AI using script + blog context
      log(`[AutoMeta] Generating publish meta with AI for ${file}...`);
      const meta = await generateMetaFromScriptAndBlog(
        transcript, sourceBlog, trendingTags, file, videoNum, files.length
      );

      if (!overallTopic) overallTopic = meta.topic;

      // Preserve cover from existing meta if available
      const cover = existingMeta?.videos?.[i]?.cover
        || `video_${videoNum}_cover_photo.png`;

      videos.push({
        file,
        title: meta.title,
        description: meta.description,
        tags: meta.tags,
        cover,
      });

      log(`[AutoMeta] ✓ ${file}: "${meta.title}"`);
    } catch (err) {
      logError(`[AutoMeta] Failed to process ${file}`, err);
      videos.push({
        file,
        title: file.replace(/\.mp4$/i, ''),
        description: '自动生成失败，请手动编辑',
        tags: ['视频'],
      });
    }
  }

  if (videos.length === 0) {
    logError(`[AutoMeta] No videos processed in ${videoDir}`);
    return false;
  }

  // Write updated meta.json (preserve existing fields like blog_url)
  const queueMeta = {
    blog_url: existingMeta?.blog_url || '',
    topic: overallTopic || '未知主题',
    source: existingMeta?.source || '',
    videos,
    schedule: existingMeta?.schedule || 'auto',
    auto_generated: true,
    publish_meta_generated_at: new Date().toISOString(),
  };

  fs.writeFileSync(metaPath, JSON.stringify(queueMeta, null, 2));
  log(`[AutoMeta] ✓ Generated publish meta in ${videoDir}`);
  return true;
}
