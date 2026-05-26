import { useState } from 'react'
import type {
  StoryScript,
  StorySection,
  StoryBlock,
  ChoiceBlock,
  VisualAssetMap,
} from '@fanfic/shared'

interface Props {
  script: StoryScript
  assets: VisualAssetMap
  onChange: (script: StoryScript) => void
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

// ── Block type metadata ───────────────────────────────────────────────────────

const BLOCK_TYPES: { type: StoryBlock['type']; label: string; color: string }[] = [
  { type: 'narration', label: '📖 旁白', color: 'border-violet-500' },
  { type: 'dialogue', label: '💬 对话', color: 'border-blue-500' },
  { type: 'scene', label: '🖼 切换场景', color: 'border-emerald-500' },
  { type: 'show', label: '👤 角色入场', color: 'border-cyan-500' },
  { type: 'hide', label: '🚪 角色退场', color: 'border-gray-500' },
  { type: 'choice', label: '❓ 选项分支', color: 'border-amber-500' },
  { type: 'end', label: '🏁 故事结束', color: 'border-red-500' },
]

function defaultBlock(type: StoryBlock['type']): StoryBlock {
  const id = uid()
  switch (type) {
    case 'narration': return { id, type, text: '' }
    case 'dialogue': return { id, type, characterId: '', expression: '', position: 'center', text: '' }
    case 'scene': return { id, type }
    case 'show': return { id, type, characterId: '', expression: '', position: 'center' }
    case 'hide': return { id, type, characterId: '' }
    case 'choice': return { id, type, options: [{ id: uid(), label: '选项一', targetSectionId: '' }] }
    case 'end': return { id, type }
  }
}

// ── Individual block editors ──────────────────────────────────────────────────

function NarrationEditor({ block, onUpdate }: { block: { id: string; type: 'narration'; text: string }; onUpdate: (b: StoryBlock) => void }) {
  return (
    <textarea
      value={block.text}
      onChange={(e) => onUpdate({ ...block, text: e.target.value })}
      rows={3}
      placeholder="旁白文本…"
      className="w-full bg-gray-900 text-gray-100 text-sm rounded-lg p-2 resize-none outline-none focus:ring-1 focus:ring-violet-500 placeholder:text-gray-600"
    />
  )
}

function CharExprSelect({ characterId, expression, assets, onCharChange, onExprChange }: {
  characterId: string; expression: string; assets: VisualAssetMap
  onCharChange: (id: string) => void; onExprChange: (name: string) => void
}) {
  const char = assets.characters.find((c) => c.id === characterId)
  return (
    <div className="flex gap-2 flex-wrap">
      <select
        value={characterId}
        onChange={(e) => { onCharChange(e.target.value); onExprChange('') }}
        className="bg-gray-800 text-gray-200 text-sm rounded px-2 py-1 outline-none"
      >
        <option value="">— 选择角色 —</option>
        {assets.characters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      {char && (
        <select
          value={expression}
          onChange={(e) => onExprChange(e.target.value)}
          className="bg-gray-800 text-gray-200 text-sm rounded px-2 py-1 outline-none"
        >
          <option value="">— 表情 —</option>
          {char.expressions.map((e) => <option key={e.name} value={e.name}>{e.name}</option>)}
        </select>
      )}
    </div>
  )
}

function PosSelect({ value, onChange }: { value: 'left' | 'center' | 'right'; onChange: (v: 'left' | 'center' | 'right') => void }) {
  return (
    <div className="flex gap-1">
      {(['left', 'center', 'right'] as const).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-2 py-0.5 rounded text-xs border transition-colors ${value === p ? 'border-blue-400 bg-blue-900/40 text-blue-300' : 'border-gray-700 text-gray-500 hover:text-gray-300'}`}
        >
          {p === 'left' ? '左' : p === 'center' ? '中' : '右'}
        </button>
      ))}
    </div>
  )
}

function DialogueEditor({ block, assets, onUpdate }: { block: Extract<StoryBlock, { type: 'dialogue' }>; assets: VisualAssetMap; onUpdate: (b: StoryBlock) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 items-center">
        <CharExprSelect
          characterId={block.characterId}
          expression={block.expression}
          assets={assets}
          onCharChange={(id) => onUpdate({ ...block, characterId: id })}
          onExprChange={(n) => onUpdate({ ...block, expression: n })}
        />
        <PosSelect value={block.position} onChange={(p) => onUpdate({ ...block, position: p })} />
      </div>
      <textarea
        value={block.text}
        onChange={(e) => onUpdate({ ...block, text: e.target.value })}
        rows={2}
        placeholder="对话内容…"
        className="w-full bg-gray-900 text-gray-100 text-sm rounded-lg p-2 resize-none outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-600"
      />
    </div>
  )
}

function SceneEditor({ block, assets, onUpdate }: { block: Extract<StoryBlock, { type: 'scene' }>; assets: VisualAssetMap; onUpdate: (b: StoryBlock) => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      <div>
        <p className="text-xs text-gray-500 mb-1">背景</p>
        <select
          value={block.backgroundId ?? ''}
          onChange={(e) => onUpdate({ ...block, backgroundId: e.target.value || undefined })}
          className="bg-gray-800 text-gray-200 text-sm rounded px-2 py-1 outline-none"
        >
          <option value="">— 不变 —</option>
          {assets.backgrounds.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">音乐</p>
        <select
          value={block.musicId ?? ''}
          onChange={(e) => onUpdate({ ...block, musicId: e.target.value || undefined })}
          className="bg-gray-800 text-gray-200 text-sm rounded px-2 py-1 outline-none"
        >
          <option value="">— 不变 —</option>
          <option value="__stop__">■ 停止音乐</option>
          {assets.music.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>
    </div>
  )
}

function ShowEditor({ block, assets, onUpdate }: { block: Extract<StoryBlock, { type: 'show' }>; assets: VisualAssetMap; onUpdate: (b: StoryBlock) => void }) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <CharExprSelect
        characterId={block.characterId}
        expression={block.expression}
        assets={assets}
        onCharChange={(id) => onUpdate({ ...block, characterId: id })}
        onExprChange={(n) => onUpdate({ ...block, expression: n })}
      />
      <PosSelect value={block.position} onChange={(p) => onUpdate({ ...block, position: p })} />
    </div>
  )
}

function HideEditor({ block, assets, onUpdate }: { block: Extract<StoryBlock, { type: 'hide' }>; assets: VisualAssetMap; onUpdate: (b: StoryBlock) => void }) {
  return (
    <select
      value={block.characterId}
      onChange={(e) => onUpdate({ ...block, characterId: e.target.value })}
      className="bg-gray-800 text-gray-200 text-sm rounded px-2 py-1 outline-none"
    >
      <option value="">— 选择角色 —</option>
      {assets.characters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
    </select>
  )
}

function ChoiceEditor({ block, sections, onUpdate }: { block: ChoiceBlock; sections: StorySection[]; onUpdate: (b: StoryBlock) => void }) {
  function updateOption(optId: string, patch: Partial<{ label: string; targetSectionId: string }>) {
    onUpdate({ ...block, options: block.options.map((o) => (o.id === optId ? { ...o, ...patch } : o)) })
  }
  function addOption() {
    onUpdate({ ...block, options: [...block.options, { id: uid(), label: `选项${block.options.length + 1}`, targetSectionId: '' }] })
  }
  function removeOption(optId: string) {
    onUpdate({ ...block, options: block.options.filter((o) => o.id !== optId) })
  }

  return (
    <div className="space-y-2">
      {block.options.map((opt) => (
        <div key={opt.id} className="flex gap-2 items-center">
          <input
            value={opt.label}
            onChange={(e) => updateOption(opt.id, { label: e.target.value })}
            placeholder="选项文字"
            className="flex-1 bg-gray-800 text-gray-200 text-sm rounded px-2 py-1 outline-none"
          />
          <span className="text-gray-600 text-sm">→</span>
          <select
            value={opt.targetSectionId}
            onChange={(e) => updateOption(opt.id, { targetSectionId: e.target.value })}
            className="bg-gray-800 text-gray-200 text-sm rounded px-2 py-1 outline-none"
          >
            <option value="">— 选择章节 —</option>
            {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button onClick={() => removeOption(opt.id)} className="text-gray-600 hover:text-red-400 transition-colors">×</button>
        </div>
      ))}
      <button onClick={addOption} className="text-xs text-amber-400 hover:text-amber-300 transition-colors">+ 添加选项</button>
    </div>
  )
}

// ── BlockCard ─────────────────────────────────────────────────────────────────

function BlockCard({ block, assets, sections, onUpdate, onDelete, onMoveUp, onMoveDown }: {
  block: StoryBlock
  assets: VisualAssetMap
  sections: StorySection[]
  onUpdate: (b: StoryBlock) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const meta = BLOCK_TYPES.find((t) => t.type === block.type)!

  return (
    <div className={`border-l-4 ${meta.color} bg-gray-900 rounded-r-xl p-3 space-y-2`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">{meta.label}</span>
        <div className="flex gap-1">
          <button onClick={onMoveUp} className="text-gray-600 hover:text-gray-300 px-1 transition-colors" title="上移">↑</button>
          <button onClick={onMoveDown} className="text-gray-600 hover:text-gray-300 px-1 transition-colors" title="下移">↓</button>
          <button onClick={onDelete} className="text-gray-600 hover:text-red-400 px-1 transition-colors" title="删除">×</button>
        </div>
      </div>

      {block.type === 'narration' && <NarrationEditor block={block} onUpdate={onUpdate} />}
      {block.type === 'dialogue' && <DialogueEditor block={block} assets={assets} onUpdate={onUpdate} />}
      {block.type === 'scene' && <SceneEditor block={block} assets={assets} onUpdate={onUpdate} />}
      {block.type === 'show' && <ShowEditor block={block} assets={assets} onUpdate={onUpdate} />}
      {block.type === 'hide' && <HideEditor block={block} assets={assets} onUpdate={onUpdate} />}
      {block.type === 'choice' && <ChoiceEditor block={block} sections={sections} onUpdate={onUpdate} />}
      {block.type === 'end' && <p className="text-xs text-gray-500 italic">剧情在此结束</p>}
    </div>
  )
}

// ── AddBlockButton ────────────────────────────────────────────────────────────

function AddBlockMenu({ onAdd }: { onAdd: (type: StoryBlock['type']) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative flex justify-center py-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-6 h-6 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 text-sm transition-colors flex items-center justify-center"
      >
        +
      </button>
      {open && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden min-w-[160px]">
          {BLOCK_TYPES.map((bt) => (
            <button
              key={bt.type}
              onClick={() => { onAdd(bt.type); setOpen(false) }}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
            >
              {bt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main StoryEditor ──────────────────────────────────────────────────────────

export default function StoryEditor({ script, assets, onChange }: Props) {
  const [selectedSectionId, setSelectedSectionId] = useState(script.startSectionId)
  const selectedSection = script.sections.find((s) => s.id === selectedSectionId) ?? script.sections[0]!

  function updateScript(patch: Partial<StoryScript>) {
    onChange({ ...script, ...patch })
  }

  function updateSection(id: string, patch: Partial<StorySection>) {
    updateScript({ sections: script.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)) })
  }

  function addSection() {
    const id = uid()
    const s: StorySection = { id, name: `新章节`, blocks: [] }
    updateScript({ sections: [...script.sections, s] })
    setSelectedSectionId(id)
  }

  function deleteSection(id: string) {
    if (script.sections.length <= 1) return
    const remaining = script.sections.filter((s) => s.id !== id)
    const newStart = script.startSectionId === id ? remaining[0]!.id : script.startSectionId
    updateScript({ sections: remaining, startSectionId: newStart })
    if (selectedSectionId === id) setSelectedSectionId(newStart)
  }

  // Block operations on selected section
  function setBlocks(blocks: StoryBlock[]) {
    updateSection(selectedSection.id, { blocks })
  }

  function addBlock(type: StoryBlock['type'], afterIdx?: number) {
    const b = defaultBlock(type)
    const blocks = [...selectedSection.blocks]
    const insertAt = afterIdx !== undefined ? afterIdx + 1 : blocks.length
    blocks.splice(insertAt, 0, b)
    setBlocks(blocks)
  }

  function updateBlock(idx: number, b: StoryBlock) {
    const blocks = [...selectedSection.blocks]
    blocks[idx] = b
    setBlocks(blocks)
  }

  function deleteBlock(idx: number) {
    setBlocks(selectedSection.blocks.filter((_, i) => i !== idx))
  }

  function moveBlock(idx: number, dir: -1 | 1) {
    const blocks = [...selectedSection.blocks]
    const target = idx + dir
    if (target < 0 || target >= blocks.length) return
    ;[blocks[idx], blocks[target]] = [blocks[target]!, blocks[idx]!]
    setBlocks(blocks)
  }

  const isStart = (id: string) => id === script.startSectionId

  return (
    <div className="flex h-full bg-gray-950 text-gray-100 overflow-hidden">
      {/* Section sidebar */}
      <aside className="w-44 border-r border-gray-800 flex flex-col shrink-0">
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">章节</div>
        <div className="flex-1 overflow-y-auto space-y-px px-1">
          {script.sections.map((s) => (
            <div
              key={s.id}
              className={`group flex items-center gap-1 px-2 py-2 rounded-lg cursor-pointer transition-colors ${selectedSectionId === s.id ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'}`}
              onClick={() => setSelectedSectionId(s.id)}
            >
              {isStart(s.id) && <span title="起始章节" className="text-amber-400 shrink-0">★</span>}
              <span className="flex-1 text-sm truncate">{s.name}</span>
              {!isStart(s.id) && (
                <button
                  onClick={(e) => { e.stopPropagation(); deleteSection(s.id) }}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                >×</button>
              )}
            </div>
          ))}
        </div>
        <div className="p-2">
          <button onClick={addSection} className="w-full py-1.5 rounded-lg border border-dashed border-gray-700 text-xs text-gray-500 hover:text-gray-300 hover:border-gray-500 transition-colors">
            + 添加章节
          </button>
        </div>
      </aside>

      {/* Block editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Section header */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-800 bg-gray-900">
          <input
            value={selectedSection.name}
            onChange={(e) => updateSection(selectedSection.id, { name: e.target.value })}
            className="flex-1 bg-transparent text-white font-medium outline-none text-sm"
            placeholder="章节名称"
          />
          {!isStart(selectedSection.id) && (
            <button
              onClick={() => updateScript({ startSectionId: selectedSection.id })}
              className="text-xs text-gray-500 hover:text-amber-400 transition-colors"
              title="设为起始章节"
            >
              设为起点
            </button>
          )}
          {isStart(selectedSection.id) && (
            <span className="text-xs text-amber-400">★ 起始章节</span>
          )}
        </div>

        {/* Block list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {selectedSection.blocks.length === 0 && (
            <div className="text-center py-12 text-gray-600">
              <p className="text-4xl mb-3">✦</p>
              <p className="text-sm">点击下方「+」添加第一个内容块</p>
            </div>
          )}

          <AddBlockMenu onAdd={(t) => addBlock(t, -1)} />

          {selectedSection.blocks.map((block, idx) => (
            <div key={block.id}>
              <BlockCard
                block={block}
                assets={assets}
                sections={script.sections}
                onUpdate={(b) => updateBlock(idx, b)}
                onDelete={() => deleteBlock(idx)}
                onMoveUp={() => moveBlock(idx, -1)}
                onMoveDown={() => moveBlock(idx, 1)}
              />
              <AddBlockMenu onAdd={(t) => addBlock(t, idx)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
