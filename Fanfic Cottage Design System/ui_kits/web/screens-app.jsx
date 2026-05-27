/* ui_kits/web/screens-app.jsx
   Marketing/dashboard surfaces: Login, Dashboard, Projects.
   Depends on globals from components.jsx. */

const { useState: _useState_a, useEffect: _useEffect_a } = React;

/* ============================================================
   LOGIN SCREEN
============================================================ */
function LoginScreen({ onLogin, onGoRegister }) {
  const [email, setEmail] = React.useState('quill@cottage.co');
  const [password, setPassword] = React.useState('teaandscones');
  const [submitting, setSubmitting] = React.useState(false);

  function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); onLogin({ nickname: 'Quill', email }); }, 350);
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      backgroundImage: 'var(--grain)',
    }}>
      <div className="fade-in" style={{
        width: '100%', maxWidth: 420,
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: '40px 36px',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* corner ornament */}
        <img src="../../assets/ornaments/corner-rose.svg" width="64" height="64"
          style={{ position: 'absolute', top: 6, right: 6, opacity: 0.6 }} alt=""/>

        {/* brand mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <img src="../../assets/logo-cottage-mark.svg" width="48" height="48" alt="mark"/>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, color: 'var(--ink-walnut)' }}>
              Fanfic Cottage
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              同人创作助手
            </div>
          </div>
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 30, lineHeight: 1.15, color: 'var(--ink-walnut)', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
          Welcome home, dear reader.
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-tea-stain)', margin: '0 0 22px' }}>
          欢迎回来 — 把外套挂好，先泡一壶茶。
        </p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="邮箱 · Email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com"/>
          <Input label="密码 · Password" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
            help="At least eight pleasant little characters."/>

          <Button type="submit" block disabled={submitting}>
            {submitting ? '正在沏茶…' : '登录 · Sign in'}
          </Button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--rule-double)', margin: '20px 0 16px' }}>
          <span style={{ flex: 1, height: 1, background: 'currentColor' }}/>
          <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--ink-tea-stain)', fontSize: 12 }}>or</span>
          <span style={{ flex: 1, height: 1, background: 'currentColor' }}/>
        </div>

        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg-2)', textAlign: 'center', margin: 0 }}>
          还没账号？{' '}
          <a onClick={onGoRegister} style={{ color: 'var(--claret)', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
            到这里来注册
          </a>
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   DASHBOARD SCREEN
============================================================ */
const FEATURES = [
  {
    key: 'image',  to: 'image',
    icon: 'image',
    title: '文字成图',  en: 'Postcards',
    desc: '把你的故事文本变成可分享的精美图片 — 微博、小红书或自订尺寸。',
    accent: 'var(--claret)',
    soft: 'var(--accent-soft)',
  },
  {
    key: 'forum',  to: 'forum',
    icon: 'messagesSquare',
    title: '论坛截图',  en: 'Threads',
    desc: '虚构一段论坛、微博或推特的对话 — 三种风格随你切换。',
    accent: 'var(--sage-deep)',
    soft: '#E5E9D6',
  },
  {
    key: 'novel',  to: 'novel',
    icon: 'bookOpen',
    title: '视觉小说',  en: 'Novellas',
    desc: '用 Ink 脚本编写带分支的视觉小说 — 五个存档位、立绘与对白随你布置。',
    accent: '#7a5e1e',
    soft: '#F7E9C4',
  },
];

const RECENT_PROJECTS = [
  { id: 'p1', type: 'image', title: 'A Quiet Afternoon in the Hedge', updated: '今天 14:22' },
  { id: 'p2', type: 'game',  title: '雾中信号 · Chapter II',          updated: '昨天 21:08' },
  { id: 'p3', type: 'forum', title: '论坛热议「续写」',                 updated: '5月22日' },
  { id: 'p4', type: 'image', title: '寄给读者的明信片',                 updated: '5月18日' },
  { id: 'p5', type: 'game',  title: '茶馆奇案 · 第三章',                updated: '5月15日' },
  { id: 'p6', type: 'forum', title: '深夜咖啡馆讨论串',                 updated: '5月12日' },
];

const TYPE_TO_CHIP = { image: 'image', forum: 'forum', game: 'game' };
const TYPE_LABEL = { image: '文字成图', forum: '论坛截图', game: '视觉小说' };
const TYPE_TO_ROUTE = { image: 'image', forum: 'forum', game: 'novel' };

function DashboardScreen({ user, onNavigate }) {
  return (
    <div className="container fade-in">
      <div style={{ marginBottom: 36 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>
          The Parlour · 起居室
        </span>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 600,
          fontSize: 64, lineHeight: 1.05, color: 'var(--claret)',
          margin: '8px 0 10px', letterSpacing: '-0.015em',
          textWrap: 'balance', maxWidth: 820,
        }}>
          What shall we write today?
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 17, color: 'var(--ink-cocoa)',
          margin: '0 0 6px',
        }}>
          你好，<span style={{ fontWeight: 600, color: 'var(--ink-walnut)' }}>{user.nickname}</span> — 欢迎回到你的起居室。
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink-tea-stain)', margin: 0, maxWidth: 640 }}>
          选一件工具开始 — 一支羽毛笔、一壶热茶，剩下的交给你的想象。
        </p>
      </div>

      <DiamondRule label="工具间 · The Tools"/>

      {/* feature tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20, marginBottom: 48 }}>
        {FEATURES.map((f) => (
          <button
            key={f.key}
            onClick={() => onNavigate(f.to)}
            className="card is-hoverable"
            style={{
              textAlign: 'left', cursor: 'pointer',
              border: '1px solid var(--border)',
              padding: '22px 24px 24px',
              display: 'flex', flexDirection: 'column', gap: 12,
              fontFamily: 'inherit',
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: f.soft, color: f.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={f.icon} size={24}/>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 24, color: 'var(--ink-walnut)', lineHeight: 1.1 }}>
                {f.title}
              </div>
              <div style={{ fontFamily: 'var(--font-hand)', fontSize: 18, color: f.accent, lineHeight: 1 }}>
                {f.en}
              </div>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.6, color: 'var(--fg-2)', margin: 0 }}>
              {f.desc}
            </p>
            <span style={{ marginTop: 'auto', paddingTop: 8, color: f.accent, fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              开始创作 <Icon name="chevronRight" size={14}/>
            </span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 28, color: 'var(--ink-walnut)', margin: 0 }}>
          最近项目
        </h2>
        <a onClick={() => onNavigate('projects')} style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--claret)', cursor: 'pointer' }}>
          查看全部书架 →
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14 }}>
        {RECENT_PROJECTS.map((p) => (
          <button
            key={p.id}
            onClick={() => onNavigate(TYPE_TO_ROUTE[p.type])}
            style={{
              textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex', flexDirection: 'column', gap: 6,
              transition: 'all var(--dur-3) var(--ease-out)',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <Chip kind={TYPE_TO_CHIP[p.type]}>{TYPE_LABEL[p.type]}</Chip>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, color: 'var(--ink-walnut)', lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p.title}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
              edited · {p.updated}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   PROJECTS SCREEN
============================================================ */
const ALL_PROJECTS = [
  ...RECENT_PROJECTS,
  { id: 'p7',  type: 'image', title: '初夏的小书签',           updated: '5月09日' },
  { id: 'p8',  type: 'forum', title: '关于 OC 设定的争论帖',    updated: '5月05日' },
  { id: 'p9',  type: 'game',  title: '黄昏图书馆 · 序章',       updated: '5月01日' },
  { id: 'p10', type: 'image', title: '抄一段 Austen 的开头',    updated: '4月27日' },
];

function ProjectsScreen({ onNavigate }) {
  const [filter, setFilter] = React.useState('all');
  const filtered = filter === 'all' ? ALL_PROJECTS : ALL_PROJECTS.filter((p) => p.type === filter);

  return (
    <div className="container fade-in">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <span className="eyebrow" style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>
            The Library · 书架
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 38, color: 'var(--ink-walnut)', margin: '4px 0 0', letterSpacing: '-0.01em' }}>
            我的项目
          </h1>
        </div>
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all',   label: '全部' },
            { value: 'image', label: '文字成图' },
            { value: 'forum', label: '论坛截图' },
            { value: 'game',  label: '视觉小说' },
          ]}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 18 }}>
        {filtered.map((p) => <ProjectCard key={p.id} project={p} onOpen={() => onNavigate(TYPE_TO_ROUTE[p.type])}/>)}
      </div>
    </div>
  );
}

function ProjectCard({ project, onOpen }) {
  return (
    <div className="card is-hoverable" style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 18 }}>
      {/* book-cover ribbon preview */}
      <div style={{
        height: 110,
        borderRadius: 8,
        background: project.type === 'image' ? 'linear-gradient(135deg, #FBE9DB, #E4B8A8)' :
                    project.type === 'forum' ? 'linear-gradient(135deg, #E5E9D6, #BFC9A6)' :
                                                'linear-gradient(135deg, #F7E9C4, #E8C97E)',
        border: '1px solid var(--border-soft)',
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: project.type === 'image' ? 'var(--claret)' : project.type === 'forum' ? 'var(--sage-deep)' : '#7a5e1e',
        boxShadow: 'var(--shadow-inner)',
      }}>
        <Icon name={project.type === 'image' ? 'image' : project.type === 'forum' ? 'messagesSquare' : 'bookOpen'} size={36}/>
        <span style={{
          position: 'absolute', top: 8, left: 8,
          fontFamily: 'var(--font-body)', fontSize: 10, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.12em',
          color: 'var(--ink-cocoa)', opacity: 0.7,
        }}>chapter draft</span>
      </div>

      <div>
        <Chip kind={TYPE_TO_CHIP[project.type]}>{TYPE_LABEL[project.type]}</Chip>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 19, color: 'var(--ink-walnut)', lineHeight: 1.25 }}>
        {project.title}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)' }}>
        edited · {project.updated}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <Button size="sm" variant="secondary" onClick={onOpen} block>打开</Button>
        <button
          title="删除"
          style={{
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--fg-3)', borderRadius: 8, padding: '6px 10px',
            cursor: 'pointer',
          }}
        ><Icon name="trash" size={14}/></button>
      </div>
    </div>
  );
}

Object.assign(window, {
  LoginScreen, DashboardScreen, ProjectsScreen, ProjectCard,
  FEATURES, ALL_PROJECTS, TYPE_LABEL, TYPE_TO_CHIP, TYPE_TO_ROUTE,
});
