/* ui_kits/web/components.jsx
   Small, neat primitives. All globals are exposed at the end via window.assign so
   sibling Babel scripts can use them. */

const { useState, useEffect, useRef } = React;

/* ============================================================
   ICON — a tiny inline-Lucide system (1.5px stroke).
   Only the icons we actually need in this kit.
============================================================ */
const ICON_PATHS = {
  image: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></>,
  messagesSquare: <><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></>,
  bookOpen: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>,
  heart: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>,
  messageCircle: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>,
  repeat: <><path d="m2 9 3-3 3 3"/><path d="M13 18H7a2 2 0 0 1-2-2V6"/><path d="m22 15-3 3-3-3"/><path d="M11 6h6a2 2 0 0 1 2 2v10"/></>,
  share: <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>,
  play: <polygon points="5 3 19 12 5 21 5 3"/>,
  pause: <><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></>,
  pen: <><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></>,
  palette: <><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></>,
  chevronDown: <polyline points="6 9 12 15 18 9"/>,
  chevronRight: <polyline points="9 18 15 12 9 6"/>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
  save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  alignLeft: <><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></>,
  alignCenter: <><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></>,
  alignRight: <><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></>,
  feather: <><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></>,
  bookmark: <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>,
  messageSquare: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>,
  userPlus: <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></>,
  userMinus: <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/></>,
  user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  gitBranch: <><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></>,
  flag: <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></>,
  music: <><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>,
  scene: <><rect x="3" y="3" width="18" height="14" rx="2"/><path d="M3 12l4-3 4 3 5-4 5 4"/><circle cx="8" cy="8" r="1.4"/></>,
  star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
  plusCircle: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></>,
  upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>,
  x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></>,
  arrowRight: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
  volume: <><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></>,
};

function Icon({ name, size = 18, color, strokeWidth = 1.5, className = '', style = {} }) {
  const path = ICON_PATHS[name];
  if (!path) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}

/* ============================================================
   BUTTON
============================================================ */
function Button({
  variant = 'primary',
  size = 'md',
  block,
  iconName,
  children,
  className = '',
  ...rest
}) {
  const cls = [
    'btn',
    `is-${variant}`,
    size !== 'md' && `size-${size}`,
    block && 'is-block',
    className,
  ].filter(Boolean).join(' ');
  return (
    <button className={cls} {...rest}>
      {iconName && <Icon name={iconName} size={size === 'sm' ? 14 : 16}/>}
      {children}
    </button>
  );
}

/* ============================================================
   INPUT / TEXTAREA
============================================================ */
function Input({ label, error, help, className = '', ...rest }) {
  return (
    <label style={{ display: 'block' }}>
      {label && <span className="field-label">{label}</span>}
      <input className={`input ${error ? 'has-error' : ''} ${className}`} {...rest}/>
      {(error || help) && <div className={`field-help ${error ? 'is-error' : ''}`}>{error || help}</div>}
    </label>
  );
}

function Textarea({ label, error, help, rows = 4, className = '', ...rest }) {
  return (
    <label style={{ display: 'block' }}>
      {label && <span className="field-label">{label}</span>}
      <textarea rows={rows} className={`textarea ${error ? 'has-error' : ''} ${className}`} {...rest}/>
      {(error || help) && <div className={`field-help ${error ? 'is-error' : ''}`}>{error || help}</div>}
    </label>
  );
}

/* ============================================================
   SEGMENTED CONTROL
============================================================ */
function Segmented({ value, onChange, options, block }) {
  return (
    <div className={`segmented ${block ? 'is-block' : ''}`}>
      {options.map((o) => (
        <button
          key={o.value}
          className={value === o.value ? 'is-active' : ''}
          onClick={() => onChange(o.value)}
          type="button"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   CHIP / BADGE
============================================================ */
function Chip({ kind, children }) {
  return <span className={`chip is-${kind}`}>{children}</span>;
}

/* ============================================================
   HEADER
============================================================ */
const NAV_ITEMS = [
  { to: 'home',     label: '首页',     en: 'Parlour' },
  { to: 'projects', label: '我的项目', en: 'Library' },
  { to: 'image',    label: '文字成图', en: 'Postcards' },
  { to: 'forum',    label: '论坛截图', en: 'Threads' },
  { to: 'novel',    label: '视觉小说', en: 'Novellas' },
];

function Header({ route, onNavigate, user, onLogout }) {
  return (
    <header style={{
      background: 'var(--bg-elevated)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      position: 'sticky',
      top: 0,
      zIndex: 20,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div
        onClick={() => onNavigate('home')}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginRight: 18 }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '1.6px solid var(--claret)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 600,
          color: 'var(--claret)', fontSize: 22, lineHeight: 1,
        }}>&amp;</div>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18,
            color: 'var(--ink-walnut)', letterSpacing: 0.3,
          }}>Fanfic Cottage</div>
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: 10,
            color: 'var(--fg-3)', letterSpacing: '0.18em', textTransform: 'uppercase',
          }}>同人创作助手</div>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: 2 }}>
        {NAV_ITEMS.map((item) => {
          const active = route === item.to;
          return (
            <button
              key={item.to}
              onClick={() => onNavigate(item.to)}
              style={{
                background: active ? 'var(--accent-soft)' : 'transparent',
                color: active ? 'var(--claret-deep)' : 'var(--fg-2)',
                fontWeight: active ? 600 : 500,
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                padding: '7px 14px',
                border: 0,
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all var(--dur-2) var(--ease-out)',
              }}
            >{item.label}</button>
          );
        })}
      </nav>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        {user && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'var(--sage)',
                color: 'var(--paper-cream)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
              }}>{user.nickname[0]}</div>
              <span style={{ fontSize: 13, color: 'var(--fg-2)' }}>{user.nickname}</span>
            </div>
            <button
              onClick={onLogout}
              style={{
                background: 'transparent', border: 0, cursor: 'pointer',
                color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 4,
                fontFamily: 'var(--font-body)', fontSize: 13,
              }}
              title="退出"
            >
              <Icon name="logout" size={16}/>
            </button>
          </>
        )}
      </div>
    </header>
  );
}

/* ============================================================
   ORNAMENTS
============================================================ */
function DiamondRule({ label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      color: 'var(--rule-double)',
      margin: '12px 0',
    }}>
      <span style={{ flex: 1, height: 1, background: 'currentColor' }}/>
      {label && (
        <span style={{
          fontFamily: 'var(--font-display)', fontStyle: 'italic',
          color: 'var(--ink-tea-stain)', fontSize: 13,
        }}>{label}</span>
      )}
      <span style={{
        width: 8, height: 8, transform: 'rotate(45deg)',
        background: 'var(--claret)',
      }}/>
      <span style={{ flex: 1, height: 1, background: 'currentColor' }}/>
    </div>
  );
}

function CornerOrnament() {
  return (
    <img
      src="../../assets/ornaments/corner-rose.svg"
      width="48" height="48"
      style={{ position: 'absolute', top: 8, right: 8, opacity: 0.55 }}
      alt=""
    />
  );
}

/* ============================================================
   EXPORTS
============================================================ */
Object.assign(window, {
  Icon, Button, Input, Textarea, Segmented, Chip, Header,
  DiamondRule, CornerOrnament, NAV_ITEMS,
});
