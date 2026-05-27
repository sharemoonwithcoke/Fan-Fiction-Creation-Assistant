/* ui_kits/web/screens-editors.jsx
   Editor surfaces: TextToImageScreen, ForumPostScreen, VisualNovelScreen.
   Depends on globals from components.jsx. */

/* ============================================================
   TEXT-TO-IMAGE — preview + control rail
============================================================ */
const PLATFORMS = [
  { value: 'xhs_portrait', label: '小红书竖图 1080×1440', w: 720, h: 960 },
  { value: 'xhs_square',   label: '小红书方图 1080×1080', w: 720, h: 720 },
  { value: 'weibo',        label: '微博竖图 1080×1440',   w: 720, h: 960 },
  { value: 'custom',       label: '自定义尺寸',           w: 720, h: 800 },
];

const FONT_OPTIONS = [
  { value: "'Lora','Noto Serif SC',serif",                label: 'Lora · 衬线' },
  { value: "'Cormorant Garamond','Noto Serif SC',serif",  label: 'Cormorant · 优雅' },
  { value: "'Caveat','Patrick Hand',cursive",             label: 'Caveat · 手写' },
  { value: "'Pinyon Script',cursive",                     label: 'Pinyon · 花体' },
];

const BG_PRESETS = [
  { bg: '#FBF6EC', fg: '#3D2A1F', name: 'Clotted cream' },
  { bg: '#F4EADA', fg: '#3D2A1F', name: 'Oat milk' },
  { bg: '#EADFC8', fg: '#3D2A1F', name: 'Linen' },
  { bg: '#3D2A1F', fg: '#FBF6EC', name: 'Walnut night' },
  { bg: '#8A2C2C', fg: '#FBF6EC', name: 'Claret' },
  { bg: '#4D5B3C', fg: '#FBF6EC', name: 'Hedgerow' },
];

const SAMPLE_TEXT = `The little kitchen smelled of bergamot and warm scones. She set the kettle on, opened her notebook, and began the chapter she had been turning over in her head all afternoon.

小厨房里飘着伯爵茶和热司康的香气。她把水壶坐上炉子，翻开本子，开始写那个酝酿了整个下午的章节。`;

function TextToImageScreen() {
  const [text, setText] = React.useState(SAMPLE_TEXT);
  const [platform, setPlatform] = React.useState('xhs_portrait');
  const [font, setFont] = React.useState(FONT_OPTIONS[0].value);
  const [fontSize, setFontSize] = React.useState(20);
  const [lineHeight, setLineHeight] = React.useState(1.7);
  const [padding, setPadding] = React.useState(48);
  const [align, setAlign] = React.useState('left');
  const [palette, setPalette] = React.useState(BG_PRESETS[0]);
  const [resolution, setResolution] = React.useState(2);
  const [title, setTitle] = React.useState('寄给读者的明信片');

  const dim = PLATFORMS.find((p) => p.value === platform);
  // scale the preview to fit nicely
  const scale = Math.min(540 / dim.w, 720 / dim.h);
  const w = dim.w * scale, h = dim.h * scale;

  return (
    <div className="editor-shell fade-in">
      <div className="editor-canvas">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          {/* postcard frame */}
          <div style={{
            position: 'relative',
            padding: 10,
            background: 'var(--bg-elevated)',
            borderRadius: 12,
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border)',
          }}>
            <div style={{
              width: w, height: h,
              background: palette.bg,
              color: palette.fg,
              fontFamily: font,
              fontSize: fontSize * scale,
              lineHeight,
              padding: padding * scale,
              textAlign: align,
              whiteSpace: 'pre-wrap',
              overflow: 'hidden',
              borderRadius: 4,
              transition: 'background var(--dur-3) var(--ease-out)',
            }}>
              {text}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
            <span>{dim.w / scale > 0 ? `${(dim.w * resolution / scale * 1.5).toFixed(0)} × ${(dim.h * resolution / scale * 1.5).toFixed(0)} px @${resolution}×` : null}</span>
            <span>{platform === 'xhs_portrait' ? '1080 × 1440 @' + resolution + '×' : null}</span>
            <span>{palette.name}</span>
          </div>
        </div>
      </div>

      <aside className="editor-rail">
        <div className="rail-section" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={title} onChange={(e) => setTitle(e.target.value)}
            style={{
              flex: 1, background: 'transparent', border: 0, outline: 'none',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, color: 'var(--ink-walnut)',
            }}
          />
          <Button size="sm" variant="secondary" iconName="save">保存</Button>
        </div>

        <div className="rail-section">
          <span className="rail-label">文本内容</span>
          <Textarea
            rows={6} value={text}
            onChange={(e) => setText(e.target.value)}
            help="Each kettle-on update redraws the postcard live."
          />
        </div>

        <div className="rail-section">
          <span className="rail-label">输出尺寸</span>
          <select className="select" value={platform} onChange={(e) => setPlatform(e.target.value)}>
            {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        <div className="rail-section">
          <span className="rail-label">字体排版</span>
          <select className="select" value={font} onChange={(e) => setFont(e.target.value)} style={{ marginBottom: 12 }}>
            {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>)}
          </select>
          <RailSlider label="字号"   value={fontSize}   min={12} max={56} step={1}   onChange={setFontSize}/>
          <RailSlider label="行高"   value={lineHeight} min={1.2} max={2.5} step={0.1} onChange={setLineHeight} fmt={(v) => v.toFixed(1)}/>
          <RailSlider label="内边距" value={padding}    min={0}  max={120} step={4}  onChange={setPadding}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--fg-2)', width: 56 }}>对齐</span>
            <Segmented
              value={align}
              onChange={setAlign}
              options={[
                { value: 'left',   label: '左' },
                { value: 'center', label: '中' },
                { value: 'right',  label: '右' },
              ]}
            />
          </div>
        </div>

        <div className="rail-section">
          <span className="rail-label">配色 · Palette</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {BG_PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => setPalette(p)}
                style={{
                  background: p.bg, color: p.fg,
                  border: palette.name === p.name ? '2px solid var(--claret)' : '1px solid var(--border)',
                  borderRadius: 8, padding: '14px 8px',
                  fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', textAlign: 'center',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                Aa
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, marginTop: 4, opacity: 0.75, fontWeight: 400 }}>{p.name}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="rail-section">
          <span className="rail-label">导出设置</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--fg-2)', width: 56 }}>分辨率</span>
            <Segmented
              value={resolution}
              onChange={setResolution}
              options={[
                { value: 1, label: '1×' },
                { value: 2, label: '2×' },
                { value: 3, label: '3×' },
              ]}
            />
          </div>
        </div>

        <div className="rail-footer">
          <Button block iconName="download">导出图片 · Export</Button>
        </div>
      </aside>
    </div>
  );
}

function RailSlider({ label, value, min, max, step, onChange, fmt }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: 'var(--fg-2)', width: 56 }}>{label}</span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range" style={{ flex: 1 }}
      />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', width: 30, textAlign: 'right' }}>
        {fmt ? fmt(value) : value}
      </span>
    </div>
  );
}

/* ============================================================
   FORUM POST — preview + control rail
============================================================ */
const POST_COLORS = ['#8A2C2C', '#C2725F', '#7C8B5C', '#4D5B3C', '#C89B3C', '#6B4B6E'];
function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return POST_COLORS[hash % POST_COLORS.length];
}

const DEFAULT_POSTS = [
  { id: '1', floor: 1, username: '执笔者',   content: '大家好！我写了一篇关于黄昏图书馆的同人，欢迎阅读和讨论~\n\n这个故事是从一只猫的视角写的，写到一半发现有点不舍得让它走。', isOP: true,  ts: '2026/05/22 14:21', likes: 142, reposts: 12, comments: 18 },
  { id: '2', floor: 2, username: '茶馆掌柜', content: '一气读完，那只猫的描写太可爱了。我猜它最后留在了图书馆？',                                                isOP: false, ts: '2026/05/22 14:33', likes: 23,  reposts: 0,  comments: 2 },
  { id: '3', floor: 3, username: '雨夜读书', content: '楼主写的雨景特别像故乡的小巷。等下一章！',                                                                isOP: false, ts: '2026/05/22 15:08', likes: 17,  reposts: 1,  comments: 0 },
];

function ForumPostScreen() {
  const [style, setStyleKind] = React.useState('bbs');
  const [theme, setTheme] = React.useState('light');
  const [posts, setPosts] = React.useState(DEFAULT_POSTS);
  const [editing, setEditing] = React.useState(2);
  const [title, setTitle] = React.useState('黄昏图书馆 · 讨论帖');

  function update(floor, patch) {
    setPosts((ps) => ps.map((p) => p.floor === floor ? { ...p, ...patch } : p));
  }
  function addPost() {
    const floor = posts.length + 1;
    setPosts((ps) => [...ps, { id: String(floor), floor, username: `读者${floor}`, content: '这里是新楼层的内容…', isOP: false, ts: '2026/05/22 16:00', likes: 0, reposts: 0, comments: 0 }]);
    setEditing(floor);
  }
  function remove(floor) {
    setPosts((ps) => ps.filter((p) => p.floor !== floor).map((p, i) => ({ ...p, floor: i + 1 })));
  }

  return (
    <div className="editor-shell fade-in">
      <div className="editor-canvas" style={{ alignItems: 'flex-start' }}>
        <div style={{ width: 480, maxWidth: '100%' }}>
          <div style={{
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border)',
            background: theme === 'dark' ? '#1d1916' : 'var(--bg-elevated)',
          }}>
            {/* thread header */}
            <div style={{
              padding: '12px 16px',
              borderBottom: theme === 'dark' ? '1px solid #2a2520' : '1px solid var(--border-soft)',
              background: theme === 'dark' ? '#15110f' : 'var(--paper-oat)',
              fontFamily: 'var(--font-display)',
              fontWeight: 600, fontSize: 18,
              color: theme === 'dark' ? 'var(--paper-cream)' : 'var(--ink-walnut)',
            }}>{title}</div>
            {posts.map((post) => (
              <ForumRow key={post.id} post={post} kind={style} theme={theme}/>
            ))}
          </div>
        </div>
      </div>

      <aside className="editor-rail">
        <div className="rail-section" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={title} onChange={(e) => setTitle(e.target.value)}
            style={{
              flex: 1, background: 'transparent', border: 0, outline: 'none',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, color: 'var(--ink-walnut)',
            }}
          />
          <Button size="sm" variant="secondary" iconName="save">保存</Button>
        </div>

        <div className="rail-section">
          <span className="rail-label">风格 · Style</span>
          <Segmented
            block
            value={style}
            onChange={setStyleKind}
            options={[
              { value: 'bbs',     label: '论坛' },
              { value: 'twitter', label: 'Twitter' },
              { value: 'weibo',   label: '微博' },
            ]}
          />
        </div>

        <div className="rail-section">
          <span className="rail-label">主题 · Theme</span>
          <Segmented
            block
            value={theme}
            onChange={setTheme}
            options={[
              { value: 'light', label: '浅色' },
              { value: 'dark',  label: '深色' },
            ]}
          />
        </div>

        <div className="rail-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span className="rail-label" style={{ marginBottom: 0 }}>楼层内容</span>
            <button
              onClick={addPost}
              style={{
                background: 'var(--accent-soft)', border: 0, color: 'var(--claret-deep)',
                borderRadius: 6, padding: '3px 9px', fontSize: 11, fontWeight: 600,
                fontFamily: 'var(--font-body)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3,
              }}
            ><Icon name="plus" size={11}/> 加楼层</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {posts.map((p) => (
              <div key={p.id} style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'var(--bg-elevated)' }}>
                <button
                  onClick={() => setEditing(editing === p.floor ? null : p.floor)}
                  style={{
                    width: '100%', textAlign: 'left',
                    background: 'var(--paper-oat)', border: 0, cursor: 'pointer',
                    padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-walnut)',
                  }}
                >
                  <span>#{p.floor}&nbsp;&nbsp;<strong style={{ fontWeight: 600 }}>{p.username}</strong>{p.isOP && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--claret)' }}>· 楼主</span>}</span>
                  <Icon name="chevronDown" size={12} style={{ transform: editing === p.floor ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}/>
                </button>
                {editing === p.floor && (
                  <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input className="input" value={p.username} onChange={(e) => update(p.floor, { username: e.target.value })} placeholder="用户名"/>
                    <textarea className="textarea" rows={3} value={p.content} onChange={(e) => update(p.floor, { content: e.target.value })} placeholder="正文"/>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--fg-2)' }}>
                        <input type="checkbox" checked={p.isOP} onChange={(e) => update(p.floor, { isOP: e.target.checked })}/>
                        楼主
                      </label>
                      <button
                        onClick={() => remove(p.floor)}
                        style={{ marginLeft: 'auto', background: 'transparent', border: 0, color: 'var(--claret)', fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3 }}
                      ><Icon name="trash" size={11}/> 删除楼层</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rail-footer">
          <Button block iconName="download">导出长图 ZIP</Button>
        </div>
      </aside>
    </div>
  );
}

/* ----- Per-style row renderers ----- */
function ForumRow({ post, kind, theme }) {
  const dark = theme === 'dark';
  const color = avatarColor(post.username);
  const initial = post.username[0];

  if (kind === 'bbs') {
    return (
      <div style={{
        padding: '14px 16px',
        borderBottom: dark ? '1px solid #2a2520' : '1px solid var(--border-soft)',
        display: 'flex', gap: 12,
      }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: color, color: 'var(--paper-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, flexShrink: 0 }}>
          {initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: dark ? 'var(--paper-cream)' : 'var(--ink-walnut)' }}>{post.username}</span>
            {post.isOP && <span style={{ background: 'var(--accent-soft)', color: 'var(--claret)', fontSize: 10, padding: '1px 6px', borderRadius: 3, fontWeight: 600 }}>楼主</span>}
            <span style={{ marginLeft: 'auto', fontSize: 11, color: dark ? '#8c7a64' : 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>#{post.floor}楼</span>
          </div>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: dark ? '#d7caaf' : 'var(--ink-cocoa)', whiteSpace: 'pre-wrap' }}>{post.content}</p>
          <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 11, color: dark ? '#8c7a64' : 'var(--fg-3)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="heart" size={12}/> {post.likes}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="messageCircle" size={12}/> {post.comments}</span>
          </div>
        </div>
      </div>
    );
  }
  if (kind === 'twitter') {
    return (
      <div style={{
        padding: '14px 18px',
        borderBottom: dark ? '1px solid #2a2520' : '1px solid var(--border-soft)',
        display: 'flex', gap: 12,
      }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: color, color: 'var(--paper-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, flexShrink: 0 }}>
          {initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginBottom: 2 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: dark ? 'var(--paper-cream)' : 'var(--ink-walnut)' }}>{post.username}</span>
            <span style={{ fontSize: 12, color: dark ? '#8c7a64' : 'var(--fg-3)' }}>@{post.username}</span>
            <span style={{ fontSize: 12, color: dark ? '#8c7a64' : 'var(--fg-3)' }}>· {post.ts.split(' ')[1]}</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: dark ? '#e8dcc4' : 'var(--ink-walnut)', whiteSpace: 'pre-wrap' }}>{post.content}</p>
          <div style={{ display: 'flex', gap: 28, marginTop: 10, fontSize: 12, color: dark ? '#8c7a64' : 'var(--fg-3)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="messageCircle" size={13}/> {post.comments}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="repeat" size={13}/> {post.reposts}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="heart" size={13}/> {post.likes}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="share" size={13}/></span>
          </div>
        </div>
      </div>
    );
  }
  // weibo
  return (
    <div style={{
      padding: '14px 16px',
      borderBottom: dark ? '1px solid #2a2520' : '1px solid var(--border-soft)',
      display: 'flex', gap: 12,
    }}>
      <div style={{ width: 42, height: 42, borderRadius: '50%', background: color, color: 'var(--paper-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, flexShrink: 0 }}>
        {initial}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--rose-dusty)', marginBottom: 2 }}>{post.username}</div>
        <div style={{ fontSize: 11, color: dark ? '#8c7a64' : 'var(--fg-3)', marginBottom: 4 }}>{post.ts}&nbsp;&nbsp;来自微博 weibo.com</div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: dark ? '#e8dcc4' : 'var(--ink-walnut)', whiteSpace: 'pre-wrap' }}>{post.content}</p>
        <div style={{ display: 'flex', gap: 24, marginTop: 10, fontSize: 12, color: dark ? '#8c7a64' : 'var(--fg-3)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="share" size={12}/> {post.reposts}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="messageCircle" size={12}/> {post.comments}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="heart" size={12}/> {post.likes}</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TextToImageScreen, ForumPostScreen });
