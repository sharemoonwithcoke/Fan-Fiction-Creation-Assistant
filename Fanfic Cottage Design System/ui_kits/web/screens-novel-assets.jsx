/* ui_kits/web/screens-novel-assets.jsx
   AssetsTab (Characters / Backgrounds / Music + AudioTrimmer) and PreviewTab.
   Depends on globals from components.jsx and screens-novel.jsx. */

/* ============================================================
   ASSETS TAB
============================================================ */
function AssetsTab({ characters, setCharacters, backgrounds, setBackgrounds, music, setMusic }) {
  const [sub, setSub] = React.useState('characters');

  return (
    <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
      {/* sub-nav */}
      <aside style={{
        width: 220, background: 'var(--paper-oat)',
        borderRight: '1px solid var(--border)',
        padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <span className="rail-label" style={{ paddingLeft: 6 }}>资源 · Assets</span>
        {[
          { value: 'characters',  label: '角色', en: 'Characters',  icon: 'user',  count: characters.length },
          { value: 'backgrounds', label: '背景', en: 'Backgrounds', icon: 'scene', count: backgrounds.length },
          { value: 'music',       label: '音乐', en: 'Music',       icon: 'music', count: music.length },
        ].map((it) => {
          const active = sub === it.value;
          return (
            <button
              key={it.value}
              onClick={() => setSub(it.value)}
              style={{
                background: active ? 'var(--bg-elevated)' : 'transparent',
                border: active ? '1px solid var(--border-strong)' : '1px solid transparent',
                borderRadius: 8, padding: '9px 12px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 9, textAlign: 'left',
                color: active ? 'var(--ink-walnut)' : 'var(--fg-2)',
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: active ? 600 : 500,
                boxShadow: active ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <Icon name={it.icon} size={15}/>
              <span style={{ flex: 1 }}>{it.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>{it.count}</span>
            </button>
          );
        })}
      </aside>

      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--paper-cream)', backgroundImage: 'var(--grain)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '32px 40px 80px' }}>
          {sub === 'characters'  && <CharactersPanel  characters={characters}   setCharacters={setCharacters}/>}
          {sub === 'backgrounds' && <BackgroundsPanel backgrounds={backgrounds} setBackgrounds={setBackgrounds}/>}
          {sub === 'music'       && <MusicPanel       music={music}             setMusic={setMusic}/>}
        </div>
      </div>
    </div>
  );
}

/* ====================  CHARACTERS  ==================== */
function CharactersPanel({ characters, setCharacters }) {
  function addCharacter() {
    setCharacters((cs) => [...cs, { id: uid(), name: '新角色', expressions: [] }]);
  }
  function renameCharacter(id, name) {
    setCharacters((cs) => cs.map((c) => c.id === id ? { ...c, name } : c));
  }
  function removeCharacter(id) {
    setCharacters((cs) => cs.filter((c) => c.id !== id));
  }
  function addExpression(charId) {
    setCharacters((cs) => cs.map((c) => c.id !== charId ? c : {
      ...c, expressions: [...c.expressions, { id: uid(), name: '新表情', color: pickPlaceholderColor() }],
    }));
  }
  function renameExpression(charId, expId, name) {
    setCharacters((cs) => cs.map((c) => c.id !== charId ? c : {
      ...c, expressions: c.expressions.map((e) => e.id === expId ? { ...e, name } : e),
    }));
  }
  function removeExpression(charId, expId) {
    setCharacters((cs) => cs.map((c) => c.id !== charId ? c : {
      ...c, expressions: c.expressions.filter((e) => e.id !== expId),
    }));
  }

  return (
    <div>
      <SectionHead title="角色 · Characters" en="One folder per cast member; upload an expression for every face you'll need.">
        <Button size="sm" iconName="plusCircle" onClick={addCharacter}>新建角色</Button>
      </SectionHead>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {characters.map((c) => (
          <div key={c.id} className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Icon name="user" size={18} color="var(--claret)"/>
              <input
                value={c.name}
                onChange={(e) => renameCharacter(c.id, e.target.value)}
                style={{
                  flex: 1, background: 'transparent', border: 0, outline: 'none',
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20,
                  color: 'var(--ink-walnut)',
                }}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>{c.expressions.length} expressions</span>
              <button
                onClick={() => removeCharacter(c.id)}
                style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', color: 'var(--fg-3)' }}
              ><Icon name="trash" size={13}/></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
              {c.expressions.map((e) => (
                <ExpressionThumb key={e.id} expression={e}
                  onRename={(n) => renameExpression(c.id, e.id, n)}
                  onRemove={() => removeExpression(c.id, e.id)}/>
              ))}
              <button
                onClick={() => addExpression(c.id)}
                style={{
                  border: '2px dashed var(--border-strong)', borderRadius: 10,
                  background: 'var(--paper-oat)', cursor: 'pointer',
                  padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                  color: 'var(--fg-3)', fontFamily: 'var(--font-body)', fontSize: 12,
                  aspectRatio: '1', minHeight: 130,
                }}
              >
                <Icon name="upload" size={20}/>
                上传表情
                <span style={{ fontSize: 10, fontStyle: 'italic' }}>PNG · 透明背景</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExpressionThumb({ expression, onRename, onRemove }) {
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 10, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        aspectRatio: '1', background: `linear-gradient(180deg, ${expression.color[0]} 0%, ${expression.color[1]} 100%)`,
        position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}>
        {/* placeholder sprite silhouette */}
        <div style={{ width: '52%', height: '72%', background: 'rgba(61,42,31,0.18)', borderRadius: '50% 50% 22% 22%', marginBottom: 0 }}/>
        <button
          onClick={onRemove}
          style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(251,246,236,0.85)', border: 0, borderRadius: 4, padding: 3, cursor: 'pointer', color: 'var(--claret)' }}
        ><Icon name="x" size={11}/></button>
      </div>
      <input
        value={expression.name}
        onChange={(e) => onRename(e.target.value)}
        style={{
          border: 0, outline: 'none', background: 'transparent',
          padding: '6px 10px', fontFamily: 'var(--font-body)', fontSize: 12,
          color: 'var(--ink-walnut)', textAlign: 'center', borderTop: '1px solid var(--border-soft)',
        }}
      />
    </div>
  );
}

const PLACEHOLDER_PALETTES = [
  ['#E4B8A8', '#C2725F'], ['#D4C2A1', '#8C6F4C'], ['#F2D9D4', '#C2725F'],
  ['#BFC9A6', '#7C8B5C'], ['#E0D2B7', '#8C6F4C'], ['#E8C97E', '#C89B3C'],
  ['#E2D6E4', '#6B4B6E'],
];
function pickPlaceholderColor() {
  return PLACEHOLDER_PALETTES[Math.floor(Math.random() * PLACEHOLDER_PALETTES.length)];
}

/* ====================  BACKGROUNDS  ==================== */
function BackgroundsPanel({ backgrounds, setBackgrounds }) {
  function addBg() {
    const palettes = ['linear-gradient(180deg,#2D2118 0%,#1a130d 100%)', 'linear-gradient(180deg,#6f8650 0%,#3a4530 100%)', 'linear-gradient(180deg,#7a5e1e 0%,#3D2A1F 100%)', 'linear-gradient(180deg,#4a6373 0%,#1f2d3a 100%)', 'linear-gradient(180deg,#E4B8A8 0%,#8A2C2C 100%)'];
    setBackgrounds((bs) => [...bs, { id: uid(), name: '新背景', gradient: palettes[Math.floor(Math.random() * palettes.length)] }]);
  }
  function rename(id, name) { setBackgrounds((bs) => bs.map((b) => b.id === id ? { ...b, name } : b)); }
  function remove(id) { setBackgrounds((bs) => bs.filter((b) => b.id !== id)); }

  return (
    <div>
      <SectionHead title="背景 · Backgrounds" en="The names you give these are what appears in the Scene Change dropdown.">
        <Button size="sm" iconName="plusCircle" onClick={addBg}>上传背景</Button>
      </SectionHead>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {backgrounds.map((b) => (
          <div key={b.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ aspectRatio: '16/9', background: b.gradient, position: 'relative' }}>
              <button
                onClick={() => remove(b.id)}
                style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(251,246,236,0.85)', border: 0, borderRadius: 4, padding: 4, cursor: 'pointer', color: 'var(--claret)' }}
              ><Icon name="x" size={12}/></button>
            </div>
            <input
              value={b.name}
              onChange={(e) => rename(b.id, e.target.value)}
              style={{
                border: 0, outline: 'none', background: 'transparent', width: '100%',
                padding: '10px 14px', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 14,
                color: 'var(--ink-walnut)', borderTop: '1px solid var(--border-soft)',
              }}
            />
          </div>
        ))}
        <button
          onClick={addBg}
          style={{
            border: '2px dashed var(--border-strong)', borderRadius: 14,
            background: 'transparent', aspectRatio: '16/9',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--fg-3)', gap: 6,
          }}
        >
          <Icon name="upload" size={22}/>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13 }}>上传背景</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontStyle: 'italic' }}>JPG · PNG · 1920 × 1080</span>
        </button>
      </div>
    </div>
  );
}

/* ====================  MUSIC  ==================== */
function MusicPanel({ music, setMusic }) {
  const [expanded, setExpanded] = React.useState(music[0]?.id);

  function addTrack() {
    const duration = 120 + Math.floor(Math.random() * 120);
    setMusic((ms) => [...ms, { id: uid(), name: '新音乐', duration, trim: [0, duration], loop: true }]);
  }
  function rename(id, name) { setMusic((ms) => ms.map((m) => m.id === id ? { ...m, name } : m)); }
  function patch(id, p)     { setMusic((ms) => ms.map((m) => m.id === id ? { ...m, ...p } : m)); }
  function remove(id)       { setMusic((ms) => ms.filter((m) => m.id !== id)); }

  return (
    <div>
      <SectionHead title="音乐 · Music" en="Upload tracks, trim the loop you want, set whether it loops.">
        <Button size="sm" iconName="plusCircle" onClick={addTrack}>上传音乐</Button>
      </SectionHead>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {music.map((m) => (
          <div key={m.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: expanded === m.id ? '1px solid var(--border-soft)' : 'none' }}>
              <button
                onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--fg-2)', display: 'flex', padding: 0 }}
              ><Icon name="chevronRight" size={14} style={{ transform: expanded === m.id ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}/></button>
              <span style={{ color: 'var(--sage-deep)', display: 'flex' }}><Icon name="music" size={16}/></span>
              <input
                value={m.name}
                onChange={(e) => rename(m.id, e.target.value)}
                style={{
                  flex: 1, background: 'transparent', border: 0, outline: 'none',
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16,
                  color: 'var(--ink-walnut)',
                }}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
                {formatTime(m.trim[0])} → {formatTime(m.trim[1])} · {formatTime(m.duration)}
              </span>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--fg-2)' }}>
                <input type="checkbox" checked={m.loop} onChange={(e) => patch(m.id, { loop: e.target.checked })}/>
                循环
              </label>
              <button
                onClick={() => remove(m.id)}
                style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 6px', cursor: 'pointer', color: 'var(--fg-3)' }}
              ><Icon name="trash" size={13}/></button>
            </div>
            {expanded === m.id && (
              <div style={{ padding: 16, background: 'var(--paper-oat)' }}>
                <AudioTrimmer track={m} onTrim={(trim) => patch(m.id, { trim })}/>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTime(t) {
  const s = Math.floor(t);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/* ====================  AUDIO TRIMMER  ==================== */
function AudioTrimmer({ track, onTrim }) {
  const canvasRef = React.useRef(null);
  const wrapRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(null);  // 'start' | 'end' | null
  const [playing, setPlaying] = React.useState(false);
  const [playhead, setPlayhead] = React.useState(track.trim[0]);

  // Generate a deterministic pseudo-waveform from track.id+name so it looks like real data
  const waveform = React.useMemo(() => {
    const seed = (track.id + track.name).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const samples = 220;
    const arr = [];
    let r = seed;
    for (let i = 0; i < samples; i++) {
      r = (r * 9301 + 49297) % 233280;
      const noise = (r / 233280 - 0.5);
      const env = Math.sin((i / samples) * Math.PI) * 0.75 + 0.3;          // overall envelope
      const detail = Math.sin(i * 0.4) * 0.15 + Math.sin(i * 0.13) * 0.25; // structure
      arr.push(Math.max(0.06, Math.min(1, env + detail + noise * 0.4)));
    }
    return arr;
  }, [track.id, track.name]);

  React.useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr; c.height = rect.height * dpr;
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const W = rect.width, H = rect.height;
    const bw = W / waveform.length;
    const trimStartX = (track.trim[0] / track.duration) * W;
    const trimEndX   = (track.trim[1] / track.duration) * W;

    waveform.forEach((v, i) => {
      const x = i * bw;
      const inside = x >= trimStartX && x <= trimEndX;
      ctx.fillStyle = inside ? '#8A2C2C' : '#D4C2A1';
      const h = v * H * 0.92;
      ctx.fillRect(x + bw * 0.1, (H - h) / 2, bw * 0.8, h);
    });

    // playhead
    if (playing) {
      const px = (playhead / track.duration) * W;
      ctx.fillStyle = '#4D5B3C';
      ctx.fillRect(px - 1, 0, 2, H);
    }
  }, [waveform, track.trim, track.duration, playhead, playing]);

  // playback timer
  React.useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPlayhead((p) => {
        const next = p + 0.1;
        if (next >= track.trim[1]) return track.trim[0];  // loop preview
        return next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [playing, track.trim]);

  function startDrag(handle) {
    setDragging(handle);
  }
  React.useEffect(() => {
    if (!dragging) return;
    function move(e) {
      const rect = wrapRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const t = ratio * track.duration;
      if (dragging === 'start') onTrim([Math.min(t, track.trim[1] - 0.5), track.trim[1]]);
      else                      onTrim([track.trim[0], Math.max(t, track.trim[0] + 0.5)]);
    }
    function up() { setDragging(null); }
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchend', up);
    };
  }, [dragging, track.duration, track.trim, onTrim]);

  const startPct = (track.trim[0] / track.duration) * 100;
  const endPct   = (track.trim[1] / track.duration) * 100;

  return (
    <div>
      <div ref={wrapRef} style={{ position: 'relative', height: 88, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: 4, userSelect: 'none' }}>
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }}/>

        {/* excluded shading */}
        <div style={{ position: 'absolute', top: 4, bottom: 4, left: 4, width: `calc(${startPct}% - 4px)`, background: 'rgba(180,158,126,0.35)', borderRadius: 4, pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', top: 4, bottom: 4, right: 4, width: `calc(${100 - endPct}% - 4px)`, background: 'rgba(180,158,126,0.35)', borderRadius: 4, pointerEvents: 'none' }}/>

        {/* handles */}
        <TrimHandle pct={startPct} color="var(--plum)"      side="start" onDown={() => startDrag('start')}/>
        <TrimHandle pct={endPct}   color="var(--sage-deep)" side="end"   onDown={() => startDrag('end')}/>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-2)' }}>
        <button
          onClick={() => { setPlaying((p) => !p); setPlayhead(track.trim[0]); }}
          className={`btn ${playing ? 'is-sage' : 'is-primary'} size-sm`}
        >
          <Icon name={playing ? 'pause' : 'play'} size={12}/>
          {playing ? '停止' : '试听片段'}
        </button>
        <span><span style={{ color: 'var(--plum)' }}>▲</span> start <strong style={{ color: 'var(--ink-walnut)' }}>{formatTime(track.trim[0])}</strong></span>
        <span><span style={{ color: 'var(--sage-deep)' }}>▲</span> end <strong style={{ color: 'var(--ink-walnut)' }}>{formatTime(track.trim[1])}</strong></span>
        <span style={{ marginLeft: 'auto', color: 'var(--fg-3)', fontStyle: 'italic', fontFamily: 'var(--font-body)' }}>
          waveform decoded via Web Audio · drag the triangles to set the loop region
        </span>
      </div>
    </div>
  );
}

function TrimHandle({ pct, color, side, onDown }) {
  return (
    <div
      onMouseDown={onDown}
      onTouchStart={onDown}
      style={{
        position: 'absolute', top: 0, bottom: 0,
        left: `${pct}%`, width: 2, background: color,
        marginLeft: side === 'start' ? -1 : -1,
        cursor: 'ew-resize', zIndex: 2,
      }}
    >
      <div style={{
        position: 'absolute', top: -4,
        left: side === 'start' ? -7 : -7,
        width: 0, height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderTop: `12px solid ${color}`,
      }}/>
      <div style={{
        position: 'absolute', bottom: -4,
        left: side === 'start' ? -7 : -7,
        width: 0, height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderBottom: `12px solid ${color}`,
      }}/>
    </div>
  );
}

/* ============================================================
   PREVIEW TAB — direct interpreter, no Ink compilation
============================================================ */
function PreviewTab({ sections, characters, backgrounds, music }) {
  const start = sections.find((s) => s.isStart) || sections[0];
  const [sectionId, setSectionId] = React.useState(start?.id);
  const [blockIdx, setBlockIdx] = React.useState(0);
  const [scene, setScene] = React.useState({ bg: backgrounds[0]?.id, music: music[0]?.id, sprites: [] });

  const sec = sections.find((s) => s.id === sectionId);
  const block = sec?.blocks[blockIdx];

  // auto-advance through non-pausing blocks (scene, enter, exit)
  React.useEffect(() => {
    if (!block) return;
    if (block.type === 'scene') {
      setScene((sc) => ({ ...sc, bg: block.bg || sc.bg, music: block.music === 'stop' ? null : (block.music || sc.music) }));
      const t = setTimeout(() => setBlockIdx((i) => i + 1), 350);
      return () => clearTimeout(t);
    }
    if (block.type === 'enter') {
      setScene((sc) => ({
        ...sc,
        sprites: [...sc.sprites.filter((s) => s.character !== block.character), {
          character: block.character, expression: block.expression, position: block.position,
        }],
      }));
      const t = setTimeout(() => setBlockIdx((i) => i + 1), 350);
      return () => clearTimeout(t);
    }
    if (block.type === 'exit') {
      setScene((sc) => ({ ...sc, sprites: sc.sprites.filter((s) => s.character !== block.character) }));
      const t = setTimeout(() => setBlockIdx((i) => i + 1), 350);
      return () => clearTimeout(t);
    }
    if (block.type === 'end') {
      // stay
    }
  }, [block]);

  function advance() {
    if (!block || block.type === 'choice' || block.type === 'end') return;
    setBlockIdx((i) => Math.min(i + 1, sec.blocks.length - 1));
  }
  function pickChoice(target) {
    setSectionId(target);
    setBlockIdx(0);
  }
  function restart() {
    setSectionId(start?.id); setBlockIdx(0);
    setScene({ bg: backgrounds[0]?.id, music: music[0]?.id, sprites: [] });
  }

  const bg = backgrounds.find((b) => b.id === scene.bg);
  const currentMusic = music.find((m) => m.id === scene.music);

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', minHeight: 0 }}>
      <div style={{ flex: 1, position: 'relative', background: bg?.gradient || '#1a130d' }}>
        {/* sprites */}
        <div style={{ position: 'absolute', inset: 0 }}>
          {scene.sprites.map((sp) => {
            const char = characters.find((c) => c.id === sp.character);
            const exp = char?.expressions.find((e) => e.id === sp.expression);
            const left = sp.position === 'left' ? '8%' : sp.position === 'right' ? 'auto' : '50%';
            const right = sp.position === 'right' ? '8%' : 'auto';
            const transform = sp.position === 'center' ? 'translateX(-50%)' : 'none';
            return (
              <div key={sp.character} style={{
                position: 'absolute', bottom: 220,
                left, right, transform,
                width: 190, height: 300,
                background: exp ? `linear-gradient(180deg, ${exp.color[0]} 0%, ${exp.color[1]} 100%)` : '#888',
                borderRadius: '50% 50% 30% 30%',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                transition: 'all var(--dur-3) var(--ease-out)',
              }}>
                <div style={{ position: 'absolute', bottom: 14, width: '100%', textAlign: 'center', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 600, fontSize: 20, color: 'var(--paper-cream)', letterSpacing: 1 }}>
                  {char?.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* dialogue box */}
        {block && (block.type === 'narration' || block.type === 'dialogue' || block.type === 'choice' || block.type === 'end') && (
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '24px 32px 32px' }}>
            <div
              onClick={advance}
              style={{
                maxWidth: 900, margin: '0 auto',
                background: 'rgba(45,58,76,0.92)', color: 'var(--paper-cream)',
                borderRadius: 14, padding: 22, lineHeight: 1.55,
                fontFamily: "'Lora','Noto Serif SC',serif", fontSize: 18,
                cursor: block.type === 'narration' || block.type === 'dialogue' ? 'pointer' : 'default',
              }}
            >
              {block.type === 'dialogue' && (
                <div style={{ display: 'inline-block', background: 'var(--claret)', color: 'var(--paper-cream)', padding: '3px 10px', borderRadius: 4, fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 8 }}>
                  {characters.find((c) => c.id === block.character)?.name}
                </div>
              )}
              {block.type === 'narration' && (
                <div style={{ fontSize: 11, fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.18em', opacity: 0.7, marginBottom: 6 }}>旁白 · Narration</div>
              )}
              {(block.type === 'narration' || block.type === 'dialogue') && (
                <p style={{ margin: 0 }}>{block.text}</p>
              )}
              {block.type === 'choice' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.18em', opacity: 0.7 }}>请选择 · Choose</div>
                  {block.choices.map((c, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); pickChoice(c.target); }}
                      style={{
                        background: 'rgba(251,246,236,0.12)', color: 'var(--paper-cream)',
                        border: '1px solid rgba(251,246,236,0.18)',
                        textAlign: 'left', padding: '9px 14px', borderRadius: 8,
                        fontSize: 16, fontFamily: 'inherit', cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(251,246,236,0.22)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(251,246,236,0.12)'; }}
                    >→ {c.text}</button>
                  ))}
                </div>
              )}
              {block.type === 'end' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22 }}>The end · 故事结束</div>
                  <button
                    onClick={restart}
                    className="btn is-primary size-sm"
                  >从头开始</button>
                </div>
              )}
              {(block.type === 'narration' || block.type === 'dialogue') && (
                <div style={{ marginTop: 10, fontSize: 11, opacity: 0.6, textAlign: 'right' }}>▼ 点击继续</div>
              )}
            </div>
          </div>
        )}

        {/* now-playing strip */}
        {currentMusic && (
          <div style={{
            position: 'absolute', top: 14, left: 14,
            background: 'rgba(0,0,0,0.5)', color: 'var(--paper-cream)',
            padding: '5px 12px', borderRadius: 999,
            fontFamily: 'var(--font-mono)', fontSize: 11,
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <Icon name="music" size={11}/> {currentMusic.name} · {formatTime(currentMusic.trim[0])}–{formatTime(currentMusic.trim[1])}{currentMusic.loop ? ' · 循环' : ''}
          </div>
        )}

        {/* save slots */}
        <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 6 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              style={{
                background: 'rgba(0,0,0,0.5)', color: 'var(--paper-cream)',
                border: '1px solid rgba(251,246,236,0.2)', borderRadius: 6,
                padding: '4px 10px', fontSize: 11, fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
              }}
            >S{s}</button>
          ))}
        </div>
      </div>

      {/* preview HUD */}
      <aside style={{
        width: 200, background: 'var(--paper-oat)',
        borderLeft: '1px solid var(--border)',
        padding: '16px 14px', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <span className="rail-label">现在播放</span>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-2)', lineHeight: 1.6 }}>
          <div><strong style={{ color: 'var(--ink-walnut)' }}>section</strong> · {sec?.name}</div>
          <div><strong style={{ color: 'var(--ink-walnut)' }}>block</strong> · {blockIdx + 1} / {sec?.blocks.length}</div>
          <div><strong style={{ color: 'var(--ink-walnut)' }}>type</strong> · {block?.type}</div>
          <div><strong style={{ color: 'var(--ink-walnut)' }}>sprites</strong> · {scene.sprites.length}</div>
        </div>
        <Button size="sm" variant="secondary" onClick={restart} iconName="play">重新开始</Button>
        <div style={{ marginTop: 'auto', fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: 11, color: 'var(--fg-3)', lineHeight: 1.4 }}>
          The preview walks blocks directly — no Ink compilation. Scene / enter / exit auto-advance; narration, dialogue, and choice pause for the reader.
        </div>
      </aside>
    </div>
  );
}

/* ============================================================
   SECTION HEAD helper
============================================================ */
function SectionHead({ title, en, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 28, color: 'var(--ink-walnut)', margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
        {children}
      </div>
      {en && <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-tea-stain)', margin: '4px 0 0' }}>{en}</p>}
    </div>
  );
}

Object.assign(window, { AssetsTab, PreviewTab });
