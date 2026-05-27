/* ui_kits/web/screens-novel.jsx — redesigned 视觉小说 surface
   Block-based story editor (no Ink syntax), asset manager, direct preview.
   Depends on globals from components.jsx. */

const { useState: _us, useRef: _ur, useEffect: _ue } = React;

/* ============================================================
   MOCK STORY DATA
============================================================ */
const INIT_CHARACTERS = [
  { id: 'c1', name: 'Eloise', expressions: [
    { id: 'e1', name: 'gentle',  color: ['#E4B8A8', '#C2725F'] },
    { id: 'e2', name: 'worried', color: ['#D4C2A1', '#8C6F4C'] },
    { id: 'e3', name: 'glad',    color: ['#F2D9D4', '#C2725F'] },
  ]},
  { id: 'c2', name: 'Henry', expressions: [
    { id: 'e4', name: 'neutral', color: ['#BFC9A6', '#7C8B5C'] },
    { id: 'e5', name: 'reading', color: ['#E0D2B7', '#8C6F4C'] },
  ]},
];

const INIT_BACKGROUNDS = [
  { id: 'b1', name: 'parlour',    gradient: 'linear-gradient(180deg,#2D2118 0%,#1a130d 100%)' },
  { id: 'b2', name: 'garden',     gradient: 'linear-gradient(180deg,#6f8650 0%,#3a4530 100%)' },
  { id: 'b3', name: 'library',    gradient: 'linear-gradient(180deg,#7a5e1e 0%,#3D2A1F 100%)' },
];

const INIT_MUSIC = [
  { id: 'm1', name: 'ambient kettle', duration: 142, trim: [12, 124], loop: true },
  { id: 'm2', name: 'rain on window', duration: 188, trim: [0, 188], loop: true },
];

const INIT_SECTIONS = [
  { id: 's1', name: '序章 · A quiet afternoon', isStart: true, blocks: [
    { id: 'k1', type: 'scene',    bg: 'b1', music: 'm1' },
    { id: 'k2', type: 'enter',    character: 'c1', expression: 'e1', position: 'right' },
    { id: 'k3', type: 'narration', text: '一个宁静的午后。窗外的紫藤花正落着，钟摆敲过四下。' },
    { id: 'k4', type: 'dialogue', character: 'c1', expression: 'e1', position: 'right', text: '茶要凉了 — 你今天写了几个字？' },
    { id: 'k5', type: 'narration', text: '门外传来轻轻的脚步声。' },
    { id: 'k6', type: 'choice', choices: [
      { text: '起身去开门', target: 's2' },
      { text: '先把这一段写完', target: 's3' },
    ]},
  ]},
  { id: 's2', name: '邻人来访', isStart: false, blocks: [
    { id: 'k7', type: 'narration', text: '门外是邻家的猫，叼着一封打湿的信。' },
    { id: 'k8', type: 'end' },
  ]},
  { id: 's3', name: '结局 · 一杯热茶', isStart: false, blocks: [
    { id: 'k9', type: 'narration', text: '故事就这样停在了一杯热茶旁。' },
    { id: 'k10', type: 'end' },
  ]},
];

/* ============================================================
   BLOCK TYPE META — cottage palette, Lucide icons (no emoji)
============================================================ */
const BLOCK_META = {
  narration: { label: '旁白',       en: 'Narration',        icon: 'book',         color: 'var(--ink-cocoa)',  soft: 'var(--paper-oat)' },
  dialogue:  { label: '对话',       en: 'Dialogue',         icon: 'messageSquare', color: 'var(--claret)',     soft: 'var(--accent-soft)' },
  scene:     { label: '切换场景',   en: 'Scene change',     icon: 'scene',        color: 'var(--sage-deep)',  soft: '#E5E9D6' },
  enter:     { label: '角色入场',   en: 'Character enter',  icon: 'userPlus',     color: '#7a5e1e',           soft: '#F7E9C4' },
  exit:      { label: '角色退场',   en: 'Character exit',   icon: 'userMinus',    color: 'var(--plum)',       soft: '#E2D6E4' },
  choice:    { label: '选项分支',   en: 'Choice',           icon: 'gitBranch',    color: 'var(--rose-dusty)', soft: '#F8E1D9' },
  end:       { label: '故事结束',   en: 'Story end',        icon: 'flag',         color: 'var(--ink-walnut)', soft: 'var(--paper-tea)' },
};
const BLOCK_ORDER = ['narration', 'dialogue', 'scene', 'enter', 'exit', 'choice', 'end'];

let uidCounter = 100;
const uid = () => `n${++uidCounter}`;

/* ============================================================
   ROOT
============================================================ */
function VisualNovelScreen() {
  const [tab, setTab] = React.useState('story');
  const [title, setTitle] = React.useState('雾中信号 · Chapter II');
  const [sections, setSections] = React.useState(INIT_SECTIONS);
  const [characters, setCharacters] = React.useState(INIT_CHARACTERS);
  const [backgrounds, setBackgrounds] = React.useState(INIT_BACKGROUNDS);
  const [music, setMusic] = React.useState(INIT_MUSIC);
  const [activeSection, setActiveSection] = React.useState('s1');

  return (
    <div className="editor-shell fade-in" style={{ flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        background: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border)',
        padding: '0',
      }}>
        {[
          { value: 'story',   label: '剧情', en: 'Story',   icon: 'pen' },
          { value: 'assets',  label: '资源', en: 'Assets',  icon: 'image' },
          { value: 'preview', label: '预览', en: 'Preview', icon: 'play' },
        ].map((t) => {
          const active = tab === t.value;
          return (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              style={{
                background: 'transparent', border: 0, cursor: 'pointer',
                padding: '14px 22px',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                color: active ? 'var(--claret-deep)' : 'var(--fg-2)',
                borderBottom: active ? '2px solid var(--claret)' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              <Icon name={t.icon} size={14}/>
              {t.label}
              <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 12, color: 'var(--fg-3)', fontWeight: 400 }}>{t.en}</span>
            </button>
          );
        })}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px' }}>
          <input
            value={title} onChange={(e) => setTitle(e.target.value)}
            style={{
              background: 'transparent', border: 0, outline: 'none',
              fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 600,
              fontSize: 16, color: 'var(--ink-walnut)', width: 240, textAlign: 'right',
            }}
          />
          <Button size="sm" variant="secondary" iconName="save">保存</Button>
        </div>
      </div>

      {tab === 'story' && (
        <StoryEditorTab
          sections={sections} setSections={setSections}
          activeSection={activeSection} setActiveSection={setActiveSection}
          characters={characters} backgrounds={backgrounds} music={music}
        />
      )}
      {tab === 'assets' && (
        <AssetsTab
          characters={characters} setCharacters={setCharacters}
          backgrounds={backgrounds} setBackgrounds={setBackgrounds}
          music={music} setMusic={setMusic}
        />
      )}
      {tab === 'preview' && (
        <PreviewTab
          sections={sections} characters={characters}
          backgrounds={backgrounds} music={music}
        />
      )}
    </div>
  );
}

/* ============================================================
   STORY EDITOR TAB
============================================================ */
function StoryEditorTab({ sections, setSections, activeSection, setActiveSection, characters, backgrounds, music }) {
  const sec = sections.find((s) => s.id === activeSection) || sections[0];

  function setStartSection(id) {
    setSections((ss) => ss.map((s) => ({ ...s, isStart: s.id === id })));
  }
  function renameSection(id, name) {
    setSections((ss) => ss.map((s) => s.id === id ? { ...s, name } : s));
  }
  function addSection() {
    const id = uid();
    setSections((ss) => [...ss, { id, name: '新章节', isStart: false, blocks: [] }]);
    setActiveSection(id);
  }
  function removeSection(id) {
    setSections((ss) => {
      const next = ss.filter((s) => s.id !== id);
      if (next.length && !next.some((s) => s.isStart)) next[0].isStart = true;
      return next;
    });
    if (activeSection === id) setActiveSection(sections[0]?.id);
  }

  function patchBlock(blockId, patch) {
    setSections((ss) => ss.map((s) => s.id !== sec.id ? s : {
      ...s, blocks: s.blocks.map((b) => b.id === blockId ? { ...b, ...patch } : b),
    }));
  }
  function removeBlock(blockId) {
    setSections((ss) => ss.map((s) => s.id !== sec.id ? s : {
      ...s, blocks: s.blocks.filter((b) => b.id !== blockId),
    }));
  }
  function insertBlock(index, type) {
    const base = { id: uid(), type };
    const defaults = {
      narration: { text: '在这里写下旁白…' },
      dialogue:  { character: characters[0]?.id, expression: characters[0]?.expressions[0]?.id, position: 'center', text: '…' },
      scene:     { bg: backgrounds[0]?.id, music: music[0]?.id },
      enter:     { character: characters[0]?.id, expression: characters[0]?.expressions[0]?.id, position: 'center' },
      exit:      { character: characters[0]?.id },
      choice:    { choices: [{ text: '选项 A', target: sections[0]?.id }, { text: '选项 B', target: sections[0]?.id }] },
      end:       {},
    };
    setSections((ss) => ss.map((s) => s.id !== sec.id ? s : {
      ...s, blocks: [...s.blocks.slice(0, index), { ...base, ...defaults[type] }, ...s.blocks.slice(index)],
    }));
  }

  return (
    <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
      {/* sidebar */}
      <aside style={{
        width: 260, background: 'var(--paper-oat)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '16px 18px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="rail-label" style={{ marginBottom: 0 }}>章节 · Sections</span>
          <button
            onClick={addSection}
            title="新增章节"
            style={{ background: 'transparent', border: 0, color: 'var(--claret)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          ><Icon name="plus" size={16}/></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 12px' }}>
          {sections.map((s) => (
            <SectionRow
              key={s.id} section={s} active={s.id === activeSection}
              onSelect={() => setActiveSection(s.id)}
              onRename={(name) => renameSection(s.id, name)}
              onSetStart={() => setStartSection(s.id)}
              onRemove={() => removeSection(s.id)}
              canRemove={sections.length > 1}
            />
          ))}
        </div>
        <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
          {sections.length} sections · {sections.reduce((n, s) => n + s.blocks.length, 0)} blocks
        </div>
      </aside>

      {/* main editor */}
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--paper-cream)', backgroundImage: 'var(--grain)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 40px 80px' }}>
          <div style={{ marginBottom: 18, display: 'flex', alignItems: 'baseline', gap: 10 }}>
            {sec.isStart && (
              <span style={{ color: 'var(--honey)', display: 'inline-flex' }}><Icon name="star" size={18}/></span>
            )}
            <input
              value={sec.name}
              onChange={(e) => renameSection(sec.id, e.target.value)}
              style={{
                background: 'transparent', border: 0, outline: 'none',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 30,
                color: 'var(--ink-walnut)', flex: 1, padding: 0, letterSpacing: '-0.01em',
              }}
            />
          </div>

          <InsertSlot onInsert={(t) => insertBlock(0, t)}/>
          {sec.blocks.map((block, i) => (
            <React.Fragment key={block.id}>
              <BlockCard
                block={block}
                onPatch={(p) => patchBlock(block.id, p)}
                onRemove={() => removeBlock(block.id)}
                characters={characters}
                backgrounds={backgrounds}
                music={music}
                sections={sections}
              />
              <InsertSlot onInsert={(t) => insertBlock(i + 1, t)}/>
            </React.Fragment>
          ))}
          {sec.blocks.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--fg-3)', fontFamily: 'var(--font-body)', fontStyle: 'italic', padding: '32px 0' }}>
              空空如也 — 点击上方加号开始添加内容。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionRow({ section, active, onSelect, onRename, onSetStart, onRemove, canRemove }) {
  return (
    <div
      onClick={onSelect}
      style={{
        background: active ? 'var(--bg-elevated)' : 'transparent',
        border: active ? '1px solid var(--border-strong)' : '1px solid transparent',
        borderRadius: 8, padding: '8px 10px', marginBottom: 4,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        boxShadow: active ? 'var(--shadow-sm)' : 'none',
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onSetStart(); }}
        title={section.isStart ? '起始章节' : '设为起始'}
        style={{ background: 'transparent', border: 0, cursor: 'pointer', color: section.isStart ? 'var(--honey)' : 'var(--ink-mist)', display: 'flex', padding: 0 }}
      ><Icon name="star" size={14}/></button>
      <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-walnut)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {section.name}
      </span>
      {canRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--fg-3)', display: 'flex', padding: 0 }}
        ><Icon name="x" size={12}/></button>
      )}
    </div>
  );
}

/* ============================================================
   INSERT SLOT (between blocks)
============================================================ */
function InsertSlot({ onInsert }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ position: 'relative', height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: open ? 5 : 1 }}>
      <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: open ? 'var(--claret)' : 'transparent', transition: 'background var(--dur-2) var(--ease-out)' }}/>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: open ? 'var(--claret)' : 'var(--bg-elevated)',
          color: open ? 'var(--paper-cream)' : 'var(--claret)',
          border: '1px solid ' + (open ? 'var(--claret)' : 'var(--border)'),
          borderRadius: 999, width: 24, height: 24, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1, transition: 'all var(--dur-2) var(--ease-out)',
        }}
      >
        <Icon name="plus" size={14}/>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 12, boxShadow: 'var(--shadow-lg)',
          padding: 6, display: 'grid', gridTemplateColumns: 'repeat(2,minmax(150px,1fr))', gap: 4,
          minWidth: 320, zIndex: 10,
        }}>
          {BLOCK_ORDER.map((t) => {
            const m = BLOCK_META[t];
            return (
              <button
                key={t}
                onClick={() => { onInsert(t); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                  background: 'transparent', border: 0, cursor: 'pointer',
                  borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: 13,
                  color: 'var(--ink-walnut)', textAlign: 'left',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = m.soft; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ width: 26, height: 26, borderRadius: 6, background: m.soft, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={m.icon} size={14}/>
                </span>
                <span style={{ flex: 1 }}>{m.label}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 11, color: 'var(--fg-3)' }}>{m.en}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   BLOCK CARD (router)
============================================================ */
function BlockCard({ block, onPatch, onRemove, characters, backgrounds, music, sections }) {
  const meta = BLOCK_META[block.type];
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderLeft: `3px solid ${meta.color}`,
      borderRadius: 10,
      padding: '12px 14px 14px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ width: 26, height: 26, borderRadius: 6, background: meta.soft, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={meta.icon} size={14}/>
        </span>
        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: meta.color }}>{meta.label}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 12, color: 'var(--fg-3)' }}>{meta.en}</span>
        <button
          onClick={onRemove}
          title="删除区块"
          style={{ marginLeft: 'auto', background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--fg-3)', padding: 4, borderRadius: 4 }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--claret)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg-3)'; }}
        ><Icon name="trash" size={13}/></button>
      </div>
      <BlockBody block={block} onPatch={onPatch}
        characters={characters} backgrounds={backgrounds} music={music} sections={sections}/>
    </div>
  );
}

function BlockBody({ block, onPatch, characters, backgrounds, music, sections }) {
  if (block.type === 'narration') {
    return (
      <textarea
        className="textarea"
        rows={2}
        value={block.text}
        onChange={(e) => onPatch({ text: e.target.value })}
        placeholder="旁白文本…"
        style={{ fontFamily: "'Lora','Noto Serif SC',serif", fontStyle: 'italic' }}
      />
    );
  }
  if (block.type === 'dialogue') {
    const char = characters.find((c) => c.id === block.character);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <Select label="角色" value={block.character} onChange={(v) => {
            const nextChar = characters.find((c) => c.id === v);
            onPatch({ character: v, expression: nextChar?.expressions[0]?.id });
          }} options={characters.map((c) => ({ value: c.id, label: c.name }))}/>
          <Select label="表情" value={block.expression} onChange={(v) => onPatch({ expression: v })}
            options={(char?.expressions || []).map((e) => ({ value: e.id, label: e.name }))}/>
          <Select label="位置" value={block.position} onChange={(v) => onPatch({ position: v })}
            options={[{ value: 'left', label: '左' }, { value: 'center', label: '中' }, { value: 'right', label: '右' }]}/>
        </div>
        <textarea
          className="textarea" rows={2}
          value={block.text}
          onChange={(e) => onPatch({ text: e.target.value })}
          placeholder="对白内容…"
        />
      </div>
    );
  }
  if (block.type === 'scene') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Select label="背景" value={block.bg} onChange={(v) => onPatch({ bg: v })}
          options={[{ value: '', label: '不变' }, ...backgrounds.map((b) => ({ value: b.id, label: b.name }))]}/>
        <Select label="音乐" value={block.music} onChange={(v) => onPatch({ music: v })}
          options={[{ value: '', label: '不变' }, { value: 'stop', label: '停止音乐' }, ...music.map((m) => ({ value: m.id, label: m.name }))]}/>
      </div>
    );
  }
  if (block.type === 'enter') {
    const char = characters.find((c) => c.id === block.character);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <Select label="角色" value={block.character} onChange={(v) => {
          const nextChar = characters.find((c) => c.id === v);
          onPatch({ character: v, expression: nextChar?.expressions[0]?.id });
        }} options={characters.map((c) => ({ value: c.id, label: c.name }))}/>
        <Select label="表情" value={block.expression} onChange={(v) => onPatch({ expression: v })}
          options={(char?.expressions || []).map((e) => ({ value: e.id, label: e.name }))}/>
        <Select label="位置" value={block.position} onChange={(v) => onPatch({ position: v })}
          options={[{ value: 'left', label: '左' }, { value: 'center', label: '中' }, { value: 'right', label: '右' }]}/>
      </div>
    );
  }
  if (block.type === 'exit') {
    return (
      <Select label="角色" value={block.character} onChange={(v) => onPatch({ character: v })}
        options={characters.map((c) => ({ value: c.id, label: c.name }))}/>
    );
  }
  if (block.type === 'choice') {
    function patchChoice(i, p) {
      onPatch({ choices: block.choices.map((c, idx) => idx === i ? { ...c, ...p } : c) });
    }
    function addChoice() { onPatch({ choices: [...block.choices, { text: '新选项', target: sections[0]?.id }] }); }
    function removeChoice(i) { onPatch({ choices: block.choices.filter((_, idx) => idx !== i) }); }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {block.choices.map((c, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 200px auto', gap: 8, alignItems: 'flex-end' }}>
            <Input label={`选项 ${i + 1}`} value={c.text} onChange={(e) => patchChoice(i, { text: e.target.value })}/>
            <Select label="跳转到" value={c.target} onChange={(v) => patchChoice(i, { target: v })}
              options={sections.map((s) => ({ value: s.id, label: s.name }))}/>
            <button
              onClick={() => removeChoice(i)}
              disabled={block.choices.length <= 1}
              style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', color: 'var(--fg-3)' }}
            ><Icon name="x" size={12}/></button>
          </div>
        ))}
        <button
          onClick={addChoice}
          style={{
            background: 'transparent', border: '1px dashed var(--border-strong)',
            borderRadius: 8, padding: '7px 12px', cursor: 'pointer',
            color: 'var(--rose-dusty)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
          }}
        ><Icon name="plus" size={11}/> 添加选项</button>
      </div>
    );
  }
  if (block.type === 'end') {
    return <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--fg-3)', fontSize: 14 }}>故事到此为止。 · The end.</div>;
  }
  return null;
}

function Select({ label, value, onChange, options }) {
  return (
    <label style={{ display: 'block' }}>
      {label && <span className="field-label">{label}</span>}
      <select className="select" value={value || ''} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

Object.assign(window, { VisualNovelScreen, BLOCK_META, INIT_CHARACTERS, INIT_BACKGROUNDS, INIT_MUSIC });
