# Blog2Video CSS Selectors Reference

Last updated: 2026-02-28

## 小红书 (creator.xiaohongshu.com)

### Page URL
`https://creator.xiaohongshu.com/publish/publish?source=official`

### Pre-upload (verified from DOM)
| Element | Selector | Notes |
|---------|----------|-------|
| Video file input | `input.upload-input[type="file"]` | `accept=".mp4,.mov,.flv,.f4v,.mkv,.rm,.rmvb,.m4v,.mpg,.mpeg,.ts"` |
| Upload button | `.upload-button` | Red button "上传视频" |
| Video tab | `text=上传视频` | First of 3 tabs (视频/图文/长文) |

### Post-upload (needs re-verification after actual upload)
| Element | Selector (best guess) | Notes |
|---------|----------------------|-------|
| Title input | `[placeholder*="标题"], .c-input_inner` | Appears after video upload |
| Description | `.ql-editor, [contenteditable="true"]` | Rich text editor |
| Tag/topic input | `[placeholder*="话题"], [placeholder*="标签"]` | May need Enter to confirm |
| Publish button | `button:has-text("发布")` | Primary action button |
| Cover upload | `input[type="file"][accept*="image"]` | Second file input |

### Page structure
- Vue 2 SPA with data-v-* attribute scopes
- Upload area: `.upload-container > .upload-content`
- Draft box: `.draft-title-box`
- Layout: sidebar (`.d-menu`) + main content (`.publish-vue-container`)

---

## 视频号 (channels.weixin.qq.com)

### Page URL
`https://channels.weixin.qq.com/platform/post/create`

### Architecture
- **Micro-frontend**: Uses `wujie-app` (无界) for module isolation
- Inner frame URL: `https://channels.weixin.qq.com/micro/content/post/create`
- Must access elements via `page.frames()` to get the inner frame
- UI framework: WeUI Desktop (`weui-desktop-btn`, `weui-desktop-form__input`)

### Elements (from inner frame DOM)
| Element | Selector | Notes |
|---------|----------|-------|
| Video file input | `input[type="file"]` (in inner frame) | Dynamically created, may need filechooser event |
| Description editor | `.ql-editor, [contenteditable="true"]` | Quill-based rich text editor |
| Publish button | `button:has-text("发表")` | WeUI primary button |
| Save draft | `button:has-text("保存")` | `weui-desktop-btn_disabled` when no content |
| Direct publish | `button:has-text("直接发表")` | Alternative to original declaration flow |
| Topic/hashtag | `.hl.topic` | Inline in description text |

### Available inputs (verified)
- `weui-desktop-form__input` with placeholders: 搜索内容, 请输入小程序名称, etc.
- `textarea.textarea-body` for product links (not for video description)
- `ant-checkbox-input` for various checkboxes

### Notes
- The "发表动态" (post create) view loads as route `PostCreate` inside content micro-app
- No explicit title field - title goes in the description/editor area
- Tags are entered as `#tag` directly in the description text
- Upload may require intercepting the filechooser event since input[type=file] may be dynamically injected

---

## Common Patterns

### Upload strategy
1. Try `page.locator('input[type="file"]').setInputFiles(path)` first
2. Fallback: `page.waitForEvent('filechooser')` + click upload area

### Cookie files
- `/home/ubuntu/blog2video/cookies/xiaohongshu.json`
- `/home/ubuntu/blog2video/cookies/weixin.json`

### Known issues
- Form fields only appear AFTER video upload completes
- Selectors may change with platform updates - re-verify periodically
- Weixin uses wujie micro-frontend, must use frame navigation
