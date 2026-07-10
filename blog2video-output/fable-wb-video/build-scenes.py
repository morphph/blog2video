#!/usr/bin/env python3
"""build-scenes.py — fable-wb-video 场景装配器（S7/S9 的一次性手工原型）。

输入（同目录）：
  narration.md        tutor 叙述稿（## 分段）
  subtitles.json      tts.mjs 产出的逐句时间轴 [{start,end,text}]（绝对秒）
  storyboard.json     手写分镜：场景 ↔ 章节 ↔ 层揭示/镜头（时间锚=句索引或比例）
  layers/ steps.json  白板分层（obsidian visuals 拷贝）
  kit 真源            ../../.claude/skills/blog2video/design/wb-kit/

输出：scene-NN/index.html（自包含+layers/assets 引用）+ manifest.json（concat 用时长表）。

时间约定：storyboard 里 `at` 支持
  {"sent": k}        本场景第 k 句（0-based）的开始（相对场景起点）
  {"sent": k, "off": x} 第 k 句开始 + x 秒
  {"frac": f}        场景时长的 f 比例处
"""
import json, re, shutil, sys
from pathlib import Path

HERE = Path(__file__).parent
KIT = HERE / "../../.claude/skills/blog2video/design/wb-kit"

def load():
    narration = (HERE / "narration.md").read_text(encoding="utf-8")
    sents = json.loads((HERE / "subtitles.json").read_text(encoding="utf-8"))
    board = json.loads((HERE / "storyboard.json").read_text(encoding="utf-8"))
    steps = json.loads((HERE / "steps.json").read_text(encoding="utf-8"))
    return narration, sents, board, steps

def sections_of(narration: str):
    """[(title, plain_text)]，No.0 = hook（首个 ## 之前、跳过 # 标题行）。"""
    secs, title, buf = [], "__hook__", []
    for line in narration.splitlines():
        if line.startswith("## "):
            secs.append((title, "".join(buf)))
            title, buf = line[3:].strip(), []
        elif line.startswith("#") or not line.strip():
            continue
        else:
            buf.append(line.strip())
    secs.append((title, "".join(buf)))
    return secs

NORM = lambda t: re.sub(r"[^\w一-鿿]", "", t)

def assign_sentences(secs, sents):
    """章节首句前缀锚定：TTS 侧标点/符号被归一化改写，字符计数会漂移——
    改为在句子流里找「归一化后与章节开头前缀互为前缀」的句子当边界。"""
    starts = [0]
    cursor = 1
    for title, text in secs[1:]:
        prefix = NORM(text)[:12]
        hit = None
        for k in range(cursor, len(sents)):
            ns = NORM(sents[k]["text"])
            if not ns:
                continue
            m = min(len(ns), len(prefix))
            if m >= 4 and ns[:m] == prefix[:m]:
                hit = k
                break
        if hit is None:
            sys.exit(f"section boundary not found: 「{title}」 prefix={prefix}")
        starts.append(hit)
        cursor = hit + 1
    starts.append(len(sents))
    return [sents[starts[i]:starts[i + 1]] for i in range(len(secs))]

def resolve_at(spec, scene_sents, t0, dur):
    if "sent" in spec:
        k = spec["sent"]
        base = scene_sents[min(k, len(scene_sents) - 1)]["start"] - t0
        return max(0.0, base + spec.get("off", 0))
    return dur * spec["frac"]

def sub_html(s, t0, idx):
    txt = re.sub(r'^>\s*', '', s["text"])
    m = re.search(r"「([^」]{2,14})」", txt)
    if m:
        txt = txt.replace(m.group(0), f"「<span class=\"sub-k\">{m.group(1)}</span>」", 1)
    long_cls = " long" if len(re.sub(r'<[^>]+>', '', txt)) > 62 else ""
    return (f'    <div id="sub-{idx}" class="clip sub" data-start="{s["start"]-t0:.3f}" '
            f'data-duration="{s["end"]-s["start"]:.3f}" data-track-index="5">'
            f'<div class="sub-inner{long_cls}">{txt}</div></div>')

def main():
    narration, sents, board, steps = load()
    secs = sections_of(narration)
    per_sec = assign_sentences(secs, sents)
    sec_index = {t: i for i, (t, _) in enumerate(secs)}
    canvas = steps["canvas"]
    cw, ch = int(canvas["width"]) * 2, int(canvas["height"]) * 2  # data-ss=2

    head = (KIT / "samples/_src/head.html").read_text()
    css = (KIT / "wb-base.css").read_text()
    css += "\n.sub-inner.long{font-size:36px;line-height:1.45}\n"
    motion = (KIT / "wb-motion.js").read_text()
    # scene 坐标 → 层 SVG viewBox 坐标的平移（从 step-01.svg translate 实测：-10,+50）
    OFF = board.get("offset", [0, 0])
    def vb(b):
        return [round(b[0] + OFF[0], 1), round(b[1] + OFF[1], 1), b[2], b[3]]

    # 场景必须无缝分割音频时间轴（句间停顿归前一场），否则 concat 后 A/V 漂移：
    # t0[0]=0；t0[i>0]=该场首句 start；dur[i]=t0[i+1]-t0[i]；末场=音频尾+tail。
    scene_sents, scene_t0 = [], []
    for k, sc in enumerate(board["scenes"]):
        my_secs = [sec_index[t] for t in sc["sections"]]
        my_sents = [s for i in my_secs for s in per_sec[i]]
        if not my_sents:
            sys.exit(f"scene {sc['n']}: no sentences for sections {sc['sections']}")
        scene_sents.append(my_sents)
        scene_t0.append(0.0 if k == 0 else my_sents[0]["start"])
    audio_end = sents[-1]["end"]

    manifest = []
    for k, sc in enumerate(board["scenes"]):
        n, comp = sc["n"], f"wb{sc['n']:02d}"
        my_sents = my = scene_sents[k]
        t0 = scene_t0[k]
        t_end = my_sents[-1]["end"]
        dur = round((scene_t0[k + 1] - t0) if k + 1 < len(scene_t0)
                    else (audio_end - t0 + board.get("tail", 1.0)), 3)

        layers_html = "\n".join(
            f'        <img class="layer" id="ly{i}" src="layers/step-{i:02d}.svg">'
            for i in range(1, 8))
        subs_html = "\n".join(sub_html(s, t0, i + 1) for i, s in enumerate(my_sents))

        reveals = ",\n      ".join(
            f'{{ sel:\'#ly{r["layer"]}\', at:{resolve_at(r["at"], my_sents, t0, dur):.2f}, '
            f'mode:\'{r.get("mode", "draw")}\', d:{r.get("d", 1.0)} }}'
            for r in sc.get("reveals", []))
        shots = ",\n      ".join(
            (f'{{ home:true, at:{resolve_at(s["at"], my_sents, t0, dur):.2f}, d:{s.get("d", 1.8)} }}'
             if s.get("home") else
             f'{{ bbox:{json.dumps(vb(s["bbox"]))}, at:{resolve_at(s["at"], my_sents, t0, dur):.2f}, '
             f'd:{s.get("d", 1.6)}, pad:{s.get("pad", 100)} }}')
            for s in sc.get("shots", []))
        preset = (json.dumps([f"#ly{i}" for i in sc["preset"]])
                  if sc.get("preset") else None)

        tl = f"""
(function(){{
  var R = "[data-composition-id='{comp}'] ";
  var tl = WB.buildSceneTimeline(R, {{
    duration: {dur},
    start: {json.dumps(vb(sc["start_bbox"]))},
    {f'preset: {preset},' if preset else ''}
    reveals: [
      {reveals}
    ],
    shots: [
      {shots}
    ],
    subs: [ {", ".join(f"['#sub-{i+1}',{my_sents[i]['start']-t0:.3f}]" for i in range(len(my_sents)))} ],
    custom: function(t, r){{ WB.breath(t, r, {max(0.0, dur-4):.1f}, {min(3.8, dur):.1f}, 'in'); }}
  }});
  WB.register('{comp}', tl);
}})();
"""
        body = f"""</style>
</head>
<body>
<div id="root" data-composition-id="{comp}" data-start="0" data-duration="{dur}" data-width="1920" data-height="1080">
  <div class="stage">
    <div class="viewport">
      <div class="canvas" data-ss="2" style="width:{cw}px;height:{ch}px">
{layers_html}
      </div>
    </div>
    <div class="brandtag">精读<span class="acc">AI_</span></div>

{subs_html}
  </div>
</div>
<script>
"""
        d = HERE / f"scene-{n:02d}"
        d.mkdir(exist_ok=True)
        (d / "index.html").write_text(head + css + body + motion + tl
                                      + "</script>\n</body>\n</html>\n", encoding="utf-8")
        for link in ("layers", "assets"):
            dst = d / link
            if not dst.exists():
                src = HERE / "layers" if link == "layers" else KIT / "assets"
                shutil.copytree(src, dst, symlinks=False, dirs_exist_ok=True)
        manifest.append({"scene": n, "dir": d.name, "comp": comp, "t0": t0,
                         "duration": dur, "sentences": len(my_sents)})
        print(f"scene {n}: [{t0:.1f}s → {t_end:.1f}s] dur={dur}s sents={len(my_sents)} "
              f"sections={sc['sections']}")

    (HERE / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=1))
    total = sum(m["duration"] for m in manifest)
    print(f"total scenes={len(manifest)} span={total:.1f}s audio_end={sents[-1]['end']:.1f}s")

if __name__ == "__main__":
    main()
