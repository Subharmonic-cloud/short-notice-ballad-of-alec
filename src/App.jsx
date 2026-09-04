import { useState, useMemo, useEffect } from 'react'
import ndData from './data/ndgf.json'
import sdData from './data/sdgfp.json'
import mtData from './data/mt.json'
import mnData from './data/mn.json'
import wyData from './data/wy.json'

const states = [
  { id: 'nd', label: 'ND', name: 'North Dakota', data: ndData, icon: '🌾' },
  { id: 'sd', label: 'SD', name: 'South Dakota', data: sdData, icon: '🦌' },
  { id: 'mt', label: 'MT', name: 'Montana', data: mtData, icon: '🏔️', placeholder: true },
  { id: 'mn', label: 'MN', name: 'Minnesota', data: mnData, icon: '🌲', placeholder: true },
  { id: 'wy', label: 'WY', name: 'Wyoming', data: wyData, icon: '🦬', placeholder: true },
]

function Badge({ type, children }) {
  const map = {
    removal: 'bg-[#a3b18a] text-[#1a2e1a] border-[#8a9a6a]',
    added: 'bg-[#8b2635]/10 text-[#8b2635] border-[#8b2635]/30',
    watch: 'bg-[#d4a574]/20 text-[#6b4a1f] border-[#d4a574]/40',
    finalized: 'bg-[#2d4a22] text-white border-[#2d4a22]',
    tentative: 'bg-amber-100 text-amber-900 border-amber-300',
    info: 'bg-white border-[#e8e0d0] text-[#5a4a32]',
  }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase border ${map[type] || map.info}`}>{children}</span>
}

function DeadlineAlertCard({ deadlines = [] }) {
  const [email, setEmail] = useState('')
  const [selected, setSelected] = useState(['deer-gun', 'swan'])
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const toggle = id => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  const submit = async e => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setStatus({ type: 'error', msg: 'Enter a valid email' })
    if (selected.length === 0) return setStatus({ type: 'error', msg: 'Pick at least one category (deer, swan, etc.)' })
    setLoading(true)
    setStatus(null)
    try {
      const r = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, categories: selected }) })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Failed')
      setStatus({ type: 'ok', msg: `You're in — ${email} will get alerts for ${selected.length} picks. We'll email 2 weeks before each deadline.` })
      setEmail('')
      // keep selected for next time, or not
      localStorage.setItem('alec-alert-email', email)
      localStorage.setItem('alec-alert-cats', JSON.stringify(selected))
    } catch (err) {
      // fallback to localStorage mock if api not available (dev)
      try { localStorage.setItem('alec-alert-email', email); localStorage.setItem('alec-alert-cats', JSON.stringify(selected)); setStatus({ type: 'ok', msg: `Saved locally — ${email} (${selected.length} picks). In production this hits /api/subscribe.` }) } catch {}
      if (!status) setStatus({ type: 'error', msg: err.message })
    } finally { setLoading(false) }
  }
  useEffect(() => {
    const e = localStorage.getItem('alec-alert-email')
    const c = localStorage.getItem('alec-alert-cats')
    if (e) setEmail(e)
    if (c) try { setSelected(JSON.parse(c)) } catch {}
  }, [])
  return (
    <form onSubmit={submit} className="p-3 sm:p-4 grid gap-3">
      <div className="grid sm:grid-cols-[1.4fr_1fr] gap-3">
        <div>
          <label className="text-[11px] tracking-[0.12em] uppercase font-bold text-[#8b7355]">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" type="email" className="mt-1.5 w-full bg-white border border-[#e8e0d0] rounded-full px-4 py-2.5 text-[13px] placeholder:text-[#8b7355]/50 focus:outline-none focus:border-[#c45d26] focus:ring-2 focus:ring-[#c45d26]/20" />
          <div className="mt-2 text-[11px] text-[#8b7355]">Pick categories — we only email for your picks, ~2 weeks before each deadline. No spam. Unsubscribe anytime.</div>
        </div>
        <div>
          <div className="text-[11px] tracking-[0.12em] uppercase font-bold text-[#8b7355]">Categories you care about</div>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5 max-h-[120px] overflow-auto pr-1">
            {(deadlines || []).map(dl => (
              <label key={dl.id} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full border text-[12px] cursor-pointer transition ${selected.includes(dl.id) ? 'bg-[#1a2e1a] text-white border-[#1a2e1a]' : 'bg-white border-[#e8e0d0] hover:border-[#c2b8a3] text-[#1a2e1a]'}`}>
                <input type="checkbox" checked={selected.includes(dl.id)} onChange={() => toggle(dl.id)} className="accent-[#c45d26] w-3.5 h-3.5" />
                <span className="truncate">{dl.species.replace(' — ', ' ')}</span>
              </label>
            ))}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            <button type="button" onClick={() => setSelected((deadlines || []).map(d => d.id))} className="text-[11px] font-mono bg-[#f4f1eb] border border-[#e8e0d0] px-2 py-1 rounded-full">All</button>
            <button type="button" onClick={() => setSelected([])} className="text-[11px] font-mono bg-white border border-[#e8e0d0] px-2 py-1 rounded-full">None</button>
            <span className="text-[11px] font-mono text-[#8b7355] self-center">{selected.length} selected</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button disabled={loading} className="bg-[#c45d26] hover:bg-[#a34d1f] disabled:opacity-50 text-white text-[13px] font-semibold px-5 py-2.5 rounded-full transition"> {loading ? 'Saving…' : 'Get alerts →'} </button>
        <span className="text-[11px] font-mono text-[#8b7355]">Example: “Deer Gun lotto ends in 12 days — last call”</span>
        {status && <span className={`text-[12px] px-3 py-1.5 rounded-full border ${status.type === 'ok' ? 'bg-[#a3b18a]/20 border-[#a3b18a] text-[#1a2e1a]' : 'bg-[#8b2635]/10 border-[#8b2635]/30 text-[#8b2635]'}`}>{status.msg}</span>}
      </div>
    </form>
  )
}

export default function App() {
  const [residency, setResidency] = useState('resident')
  const [activeCat, setActiveCat] = useState('deer')
  const [openId, setOpenId] = useState('deer-bow')
  const [query, setQuery] = useState('')
  const [yoyOpen, setYoyOpen] = useState({})
  const [dark, setDark] = useState(false)
  const [stateId, setStateId] = useState('nd')
  const activeState = states.find(s => s.id === stateId) || states[0]
  const data = activeState.data
  const categories = data.categories
  const headsUp = data.headsUp

  useEffect(() => {
    const saved = localStorage.getItem('alec-dark')
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = saved ? saved === 'true' : prefers
    setDark(initial)
    if (initial) document.documentElement.classList.add('dark')
  }, [])
  useEffect(() => {
    localStorage.setItem('alec-dark', String(dark))
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [dark])
  useEffect(() => {
    // reset category when switching states if current not in new state
    if (!categories.find(c => c.id === activeCat)) setActiveCat(categories[0]?.id || 'deer')
    setOpenId(categories[0]?.species[0]?.id || '')
  }, [stateId])

  const filtered = useMemo(() => {
    if (!query) return categories
    const q = query.toLowerCase()
    return categories.map(c => ({
      ...c,
      species: c.species.filter(s => s.name.toLowerCase().includes(q) || s.briefing.bag.toLowerCase().includes(q) || (s.trashTalk && s.trashTalk.toLowerCase().includes(q)))
    })).filter(c => c.species.length > 0)
  }, [query])

  const activeCategory = filtered.find(c => c.id === activeCat) || filtered[0]

  return (
    <div className="min-h-screen">
      {/* Header - ink */}
      <header className="sticky top-0 z-40 bg-[#1a2e1a] text-[#f4f1eb] border-b border-black/20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px] gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-[6px] bg-[#c45d26] grid place-items-center text-white font-black text-[11px] leading-none shrink-0">SN<br/>24</div>
              <div className="min-w-0">
                <h1 className="font-display font-bold text-[18px] sm:text-[20px] leading-none tracking-[-0.02em] truncate">Short Notice <span className="font-normal opacity-60">— the ballad of Alec</span></h1>
                <p className="text-[11px] tracking-[0.12em] uppercase opacity-60 hidden sm:block">NDGF Seasonal Changes • One-stop hunter reminder</p>
              </div>
              <span className="hidden lg:inline-flex ml-2 px-2 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] tracking-widest uppercase">Alec came up short. You won't.</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] opacity-70 mr-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE NDGF PULL 2026-09-03
              </div>
              <button onClick={() => setDark(!dark)} className="w-8 h-8 rounded-full bg-white/10 border border-white/15 grid place-items-center text-[14px] hover:bg-white/20 transition" title={dark ? 'Light mode' : 'Dark mode'}>{dark ? '☀️' : '🌙'}</button>
              <div className="flex bg-black/30 rounded-full p-1 border border-white/10">
                <button onClick={() => setResidency('resident')} className={`px-3 sm:px-4 py-1.5 rounded-full text-[12px] font-semibold transition ${residency==='resident' ? 'bg-[#f4f1eb] text-[#1a2e1a]' : 'text-white/70 hover:text-white'}`}>Resident</button>
                <button onClick={() => setResidency('nonresident')} className={`px-3 sm:px-4 py-1.5 rounded-full text-[12px] font-semibold transition ${residency==='nonresident' ? 'bg-[#c45d26] text-white' : 'text-white/70 hover:text-white'}`}>Nonresident</button>
              </div>
            </div>
          </div>
        </div>
        {/* sub header search */}
        <div className="bg-[#f4f1eb] border-y border-[#e8e0d0]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row gap-3 py-3 items-center justify-between">
            <div className="flex items-center gap-2 text-[12px] text-[#5a4a32] w-full sm:w-auto">
              <span className="hidden sm:inline font-mono text-[11px] bg-white border border-[#e8e0d0] px-2 py-1 rounded">PROCLAMATIONS • HIGHLIGHTED</span>
              <span className="sm:hidden font-semibold">Proclamations highlighted</span>
              <span className="hidden md:inline opacity-60">•</span>
              <span className="hidden md:inline opacity-70">Removal of restrictions pinned first</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-[320px]">
                <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search species, bag, gear, trash talk…" className="w-full bg-white border border-[#e8e0d0] rounded-full pl-9 pr-3 py-2 text-[13px] placeholder:text-[#8b7355]/60 focus:outline-none focus:border-[#8b7355] focus:ring-2 focus:ring-[#8b7355]/20" />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40">⌕</span>
              </div>
              <a href="#heads-up" className="hidden sm:inline-flex items-center gap-1.5 bg-[#1a2e1a] text-white text-[12px] font-semibold px-3 py-2 rounded-full">Heads Up →</a>
            </div>
          </div>
        </div>
      </header>

      {/* State Tabs */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mt-3">
        <div className="flex flex-wrap items-center gap-2">
          {states.map(s => (
            <button key={s.id} onClick={() => setStateId(s.id)} className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[13px] font-semibold transition ${stateId === s.id ? 'bg-[#1a2e1a] text-white border-[#1a2e1a] shadow' : 'bg-white border-[#e8e0d0] hover:border-[#c2b8a3] text-[#1a2e1a]'}`}>
              <span>{s.icon}</span>{s.label}
              {s.placeholder && <span className="text-[10px] tracking-widest uppercase bg-black/10 border border-black/10 px-1.5 py-0.5 rounded-full">Soon</span>}
              {s.id === 'nd' && <span className="hidden sm:inline text-[10px] opacity-60">• NDGF live</span>}
              {s.id === 'sd' && <span className="hidden sm:inline text-[10px] opacity-60">• GFP live</span>}
            </button>
          ))}
          <span className="text-[11px] font-mono text-[#8b7355] ml-1 hidden sm:inline">{activeState.name} — {activeState.data.meta.subtitle}</span>
        </div>
        {activeState.placeholder && (
          <div className="mt-2 text-[12px] bg-amber-50 border border-amber-200 rounded-[10px] px-3 py-2 text-amber-900">🚧 {activeState.name} placeholder — structure preview. Real season dates & proclamations pending pipeline (see ND/SD for live example).</div>
        )}
      </div>

      {/* Heads Up strip */}
      <section id="heads-up" className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mt-5">
        <div className="grid md:grid-cols-3 gap-3">
          {headsUp.map(h => (
            <a key={h.title} href={h.link} target="_blank" rel="noreferrer" className={`relative overflow-hidden rounded-[10px] border p-3 flex gap-3 items-start hover:shadow-[0_2px_12px_rgba(26,46,26,0.08)] transition ${h.level==='high' ? 'bg-[#c45d26]/10 border-[#c45d26]/30' : h.level==='watch' ? 'bg-[#d4a574]/15 border-[#d4a574]/30' : 'bg-white border-[#e8e0d0]'}`}>
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${h.level==='high' ? 'bg-[#c45d26]' : h.level==='watch' ? 'bg-[#d4a574]' : 'bg-[#1a2e1a]'}`} />
              <div className="text-[18px] leading-none mt-0.5">{h.icon}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-[13px] leading-tight">{h.title}</h3>
                  <Badge type={h.level==='high' ? 'added' : h.level==='watch' ? 'watch' : 'info'}>{h.level}</Badge>
                </div>
                <p className="text-[12px] leading-[1.4] text-[#5a4a32] mt-1 line-clamp-3">{h.body}</p>
                <span className="text-[11px] font-mono text-[#8b7355] underline decoration-dotted mt-1 inline-block">NDGF source ↗</span>
              </div>
            </a>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
          <span className="px-2.5 py-1 rounded-full bg-white border border-[#e8e0d0] font-mono">CWD: head/tags + photo method</span>
          <span className="px-2.5 py-1 rounded-full bg-white border border-[#e8e0d0] font-mono">PLOTS/WMA Oct 10-16 nonres CLOSED</span>
          <span className="px-2.5 py-1 rounded-full bg-[#a3b18a]/30 border border-[#a3b18a] font-mono">★ Removals highlighted green</span>
          <span className="px-2.5 py-1 rounded-full bg-[#f4f1eb] border border-[#e8e0d0]">Sources: gf.nd.gov • ndresponse.gov</span>
          <span className="px-2.5 py-1 rounded-full bg-[#1a2e1a] text-white border border-[#1a2e1a] font-mono hidden sm:inline">🌙 Dark theme toggle top-right</span>
        </div>
      </section>

      {/* Email Collector — Deadline Alerts */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mt-5">
        <div className="bg-white border border-[#e8e0d0] rounded-[12px] overflow-hidden">
          <div className="px-4 py-3 bg-[#1a2e1a] text-[#f4f1eb] flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display font-bold text-[15px] flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-[#c45d26] grid place-items-center text-[12px]">✉️</span>Get deadline alerts — don’t be Alec</h2>
            <span className="text-[11px] font-mono bg-white/15 border border-white/20 px-2 py-1 rounded-full">Example: deer lotto ends in 2 weeks → we email you</span>
          </div>
          <DeadlineAlertCard deadlines={data.deadlines} />
        </div>
        {/* Upcoming deadlines preview */}
        <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {data.deadlines.slice(0,4).map(dl => {
            const days = Math.ceil((new Date(dl.deadline) - new Date()) / 86400000)
            const urgent = days >= 0 && days <= 14
            return (
              <div key={dl.id} className={`bg-white border rounded-[10px] px-3 py-2.5 flex flex-col gap-1 ${urgent ? 'border-[#c45d26]/40 bg-[#c45d26]/5' : 'border-[#e8e0d0]'}`}>
                <div className="text-[11px] tracking-[0.12em] uppercase font-bold text-[#8b7355]">{dl.species}</div>
                <div className="text-[12px] font-semibold leading-tight">{dl.label}</div>
                <div className="text-[11px] font-mono flex items-center gap-1.5"><span className={`w-1.5 h-1.5 rounded-full ${urgent ? 'bg-[#c45d26] animate-pulse' : 'bg-[#a3b18a]'}`} />{dl.deadline} · {days < 0 ? `closed ${Math.abs(days)}d ago` : days === 0 ? 'today!' : `${days}d left${urgent ? ' — 2 weeks!' : ''}`}</div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Layout */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex flex-col lg:flex-row gap-6 pb-10">
        {/* Left nav */}
        <aside className="lg:w-[240px] shrink-0">
          <div className="lg:sticky lg:top-[132px] space-y-3">
            <div className="hidden lg:block text-[11px] tracking-[0.14em] uppercase font-semibold text-[#8b7355]">Categories</div>
            <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
              {filtered.map(cat => (
                <button key={cat.id} onClick={() => setActiveCat(cat.id)} className={`group flex items-center gap-3 px-3 py-2.5 rounded-[10px] border text-left shrink-0 lg:shrink transition ${activeCat===cat.id ? 'bg-[#1a2e1a] text-[#f4f1eb] border-[#1a2e1a] shadow' : 'bg-white border-[#e8e0d0] hover:border-[#c2b8a3] text-[#1a2e1a]'}`}>
                  <span className="w-7 h-7 rounded-full grid place-items-center text-[14px] bg-[#f4f1eb] border border-[#e8e0d0] shrink-0">{cat.icon}</span>
                  <span className="min-w-0">
                    <div className="text-[13px] font-semibold leading-none">{cat.label}</div>
                    <div className={`text-[11px] leading-none mt-1 ${activeCat===cat.id ? 'text-white/60' : 'text-[#8b7355]'}`}>{cat.species.length} species</div>
                  </span>
                </button>
              ))}
            </nav>
            <div className="hidden lg:block bg-white border border-[#e8e0d0] rounded-[10px] p-3">
              <div className="text-[11px] tracking-widest uppercase font-semibold text-[#8b7355]">Resident vs Nonres</div>
              <p className="text-[12px] leading-[1.5] text-[#5a4a32] mt-1.5">{residency==='resident' ? data.residency.resident : data.residency.nonresident}</p>
              <div className="mt-2 text-[11px] font-mono bg-[#f4f1eb] border border-[#e8e0d0] rounded px-2 py-1.5">Toggle top-right switches briefings & checklists.</div>
            </div>
            <div className="hidden lg:block bg-[#2d4a22] text-[#f4f1eb] rounded-[10px] p-3">
              <div className="text-[12px] font-semibold">How YoY works</div>
              <p className="text-[12px] leading-[1.5] opacity-80 mt-1">Click any species → see 3-yr dropdown + 5-yr majors, trash talk, first-timer checklists, and proclamation highlights.</p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {activeCategory ? (
            <>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-[28px] font-bold tracking-[-0.02em] leading-none flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-white border border-[#e8e0d0] grid place-items-center text-[16px]">{activeCategory.icon}</span>
                    {activeCategory.label}
                    <span className="text-[11px] tracking-[0.14em] uppercase font-semibold text-white bg-[#1a2e1a] px-2 py-1 rounded-full">{activeCategory.species.length}</span>
                  </h2>
                  <p className="text-[13px] text-[#5a4a32] mt-1.5">{activeCategory.blurb}</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono">
                  <span className="px-2 py-1 rounded-full bg-[#a3b18a]/30 border border-[#a3b18a]">REMOVAL</span>
                  <span className="px-2 py-1 rounded-full bg-[#8b2635]/10 border border-[#8b2635]/20 text-[#8b2635]">ADDED</span>
                  <span className="px-2 py-1 rounded-full bg-white border border-[#e8e0d0]">UNCHANGED</span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {activeCategory.species.map(sp => {
                  const isOpen = openId === sp.id
                  const yoyKey = `${sp.id}-yoy`
                  const yoyIsOpen = !!yoyOpen[yoyKey]
                  return (
                    <div key={sp.id} className={`bg-white border rounded-[12px] overflow-hidden transition ${isOpen ? 'border-[#c2b8a3] shadow-[0_6px_24px_rgba(26,46,26,0.08)]' : 'border-[#e8e0d0] hover:border-[#c2b8a3]'}`}>
                      {/* Row header */}
                      <button onClick={() => setOpenId(isOpen ? '' : sp.id)} className="w-full text-left px-3 sm:px-4 py-3 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-[14px] sm:text-[15px] leading-tight">{sp.name}</h3>
                            <Badge type={sp.season.status === 'Finalized' ? 'finalized' : 'tentative'}>{sp.season.status}</Badge>
                            <span className="hidden sm:inline text-[11px] font-mono bg-[#f4f1eb] border border-[#e8e0d0] px-2 py-0.5 rounded-full">{sp.units}</span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <span className="inline-flex items-center gap-1.5 bg-[#1a2e1a] text-[#f4f1eb] text-[12px] font-mono px-2.5 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#c45d26]" /> {sp.season.open} → {sp.season.close}
                            </span>
                            <span className="text-[11px] font-mono text-[#8b7355] hidden sm:inline">{sp.season.open.includes('Sep 4') ? 'Noon opener • Orange req.' : ''}</span>
                          </div>
                          <div className="sm:hidden mt-1.5 text-[11px] font-mono text-[#5a4a32] bg-[#f4f1eb] border border-[#e8e0d0] px-2 py-1 rounded-full inline-block">{sp.units}</div>
                          {sp.trashTalk && <div className="mt-2 text-[12px] italic leading-[1.4] text-[#8b7355] flex gap-1.5"><span className="not-italic">💬</span><span>“{sp.trashTalk}”</span></div>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0 mt-1">
                          <span className="hidden md:inline text-[11px] font-semibold tracking-wide uppercase text-[#8b7355]">{isOpen ? 'Hide' : 'Details'}</span>
                          <span className={`w-7 h-7 rounded-full grid place-items-center border text-[12px] transition ${isOpen ? 'bg-[#1a2e1a] text-white border-[#1a2e1a] rotate-180' : 'bg-white border-[#e8e0d0] text-[#5a4a32]'}`}>⌄</span>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="border-t border-[#e8e0d0] bg-[#fdfcfa]">
                          {/* Removed banner */}
                          {sp.proclamation.removed && (
                            <div className="mx-3 sm:mx-4 mt-3 bg-[#a3b18a]/25 border border-[#a3b18a] rounded-[10px] px-3 py-2 flex gap-2.5 items-start">
                              <span className="shrink-0 w-6 h-6 rounded-full bg-[#a3b18a] grid place-items-center text-[11px]">✓</span>
                              <div>
                                <div className="text-[11px] tracking-[0.12em] uppercase font-bold text-[#1a2e1a]">Removal — Important</div>
                                <div className="text-[12px] leading-[1.5] text-[#1a2e1a] font-medium">{sp.proclamation.removed}</div>
                              </div>
                            </div>
                          )}
                          {sp.proclamation.added && (
                            <div className="mx-3 sm:mx-4 mt-2 bg-[#8b2635]/8 border border-[#8b2635]/20 rounded-[10px] px-3 py-2 flex gap-2.5">
                              <span className="shrink-0 w-6 h-6 rounded-full bg-[#8b2635] text-white grid place-items-center text-[11px]">!</span>
                              <div>
                                <div className="text-[11px] tracking-[0.12em] uppercase font-bold text-[#8b2635]">Added Restriction</div>
                                <div className="text-[12px] leading-[1.5] text-[#5a4a32]">{sp.proclamation.added}</div>
                              </div>
                            </div>
                          )}

                          {/* 3-col briefing */}
                          <div className="p-3 sm:p-4 grid gap-3">
                            {/* Residency-aware banner */}
                            <div className="bg-white border border-[#e8e0d0] rounded-[10px] p-3 flex flex-col sm:flex-row gap-3">
                              <div className="flex-1">
                                <div className="text-[11px] tracking-[0.12em] uppercase font-bold text-[#8b7355] flex items-center gap-1.5">
                                  <span className={`w-2 h-2 rounded-full ${residency==='resident' ? 'bg-[#2d4a22]' : 'bg-[#c45d26]'}`} /> {residency==='resident' ? 'Resident Briefing' : 'Nonresident Briefing'} — tap header to toggle
                                </div>
                                <p className="text-[13px] leading-[1.5] mt-1 text-[#1a2e1a]">{residency==='resident' ? sp.resident : sp.nonresident}</p>
                              </div>
                              <div className="sm:w-[200px] shrink-0 bg-[#f4f1eb] border border-[#e8e0d0] rounded-[8px] px-3 py-2">
                                <div className="text-[11px] tracking-widest uppercase font-semibold text-[#8b7355]">Season Window</div>
                                <div className="font-mono text-[13px] font-semibold">{sp.season.open}</div>
                                <div className="font-mono text-[13px] font-semibold">→ {sp.season.close}</div>
                                <div className="text-[11px] text-[#5a4a32] mt-1">{sp.units}</div>
                              </div>
                            </div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                              <div className="bg-white border border-[#e8e0d0] rounded-[10px] p-3">
                                <div className="text-[11px] tracking-[0.12em] uppercase font-bold text-[#8b7355]">Sex</div>
                                <div className="text-[13px] leading-[1.5] mt-1">{sp.briefing.sex}</div>
                              </div>
                              <div className="bg-white border border-[#e8e0d0] rounded-[10px] p-3">
                                <div className="text-[11px] tracking-[0.12em] uppercase font-bold text-[#8b7355]">Bag Limits</div>
                                <div className="text-[13px] leading-[1.5] mt-1">{sp.briefing.bag}</div>
                                {sp.bagTable && (
                                  <div className="mt-2.5 border border-[#e8e0d0] rounded-[8px] overflow-hidden divide-y divide-[#ede8dc]">
                                    <div className="grid grid-cols-[1.4fr_0.7fr] gap-2 px-2.5 py-1.5 bg-[#f4f1eb] text-[10px] tracking-[0.12em] uppercase font-bold text-[#8b7355]"><span>Species</span><span>Daily</span></div>
                                    {sp.bagTable.map((r,i) => (
                                      <div key={i} className="grid grid-cols-[1.4fr_0.7fr] gap-2 px-2.5 py-1.5 text-[12px] leading-[1.3] items-center">
                                        <span className="font-medium">{r.species}{r.note && <span className="font-normal text-[#8b7355]"> — {r.note}</span>}</span>
                                        <span className="font-mono font-semibold bg-[#f4f1eb] border border-[#e8e0d0] rounded-full px-2 py-0.5 text-center text-[11px]">{r.limit}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="bg-white border border-[#e8e0d0] rounded-[10px] p-3">
                                <div className="text-[11px] tracking-[0.12em] uppercase font-bold text-[#8b7355]">Gear Updates</div>
                                <div className="text-[13px] leading-[1.5] mt-1">{sp.briefing.gear}</div>
                              </div>
                              <div className="bg-[#f4f1eb] border border-[#e8e0d0] rounded-[10px] p-3">
                                <div className="text-[11px] tracking-[0.12em] uppercase font-bold text-[#8b7355]">Basic Rules — Unchanged</div>
                                <div className="text-[12px] leading-[1.5] mt-1 text-[#5a4a32] italic">{sp.briefing.unchanged}</div>
                                <div className="mt-2 text-[11px] font-mono text-[#8b7355]">Unit/area: {sp.unitNotes}</div>
                              </div>
                            </div>

                            {/* First-timer checklists */}
                            {sp.firstTime && (
                              <div className="grid md:grid-cols-2 gap-3">
                                <div className="bg-white border border-[#e8e0d0] rounded-[10px] p-3">
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-[#2d4a22] text-white grid place-items-center text-[11px]">✓</span>
                                    <div className="text-[11px] tracking-[0.12em] uppercase font-bold text-[#2d4a22]">First Time? — Resident</div>
                                  </div>
                                  <ul className="mt-2.5 space-y-1.5">
                                    {sp.firstTime.resident.map((b,i) => (
                                      <li key={i} className="text-[12px] leading-[1.5] flex gap-2"><span className="text-[#a3b18a] mt-1 text-[8px]">●</span><span>{b}</span></li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="bg-[#1a2e1a] border border-[#1a2e1a] rounded-[10px] p-3 text-[#f4f1eb]">
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-[#c45d26] text-white grid place-items-center text-[11px]">★</span>
                                    <div className="text-[11px] tracking-[0.12em] uppercase font-bold text-[#c45d26]">First Time? — Nonresident</div>
                                  </div>
                                  <ul className="mt-2.5 space-y-1.5">
                                    {sp.firstTime.nonresident.map((b,i) => (
                                      <li key={i} className="text-[12px] leading-[1.5] flex gap-2 text-[#e8ddd0]"><span className="text-[#c45d26] mt-1 text-[8px]">●</span><span>{b}</span></li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}

                            {/* YoY dropdown + major 5 */}
                            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-3">
                              <div className="bg-white border border-[#e8e0d0] rounded-[10px] overflow-hidden">
                                <button onClick={() => setYoyOpen(prev => ({...prev, [yoyKey]: !yoyIsOpen}))} className="w-full flex items-center justify-between px-3 py-2.5 bg-[#1a2e1a] text-[#f4f1eb]">
                                  <span className="text-[12px] font-semibold tracking-wide">▾ 3-Year Changes (dropdown)</span>
                                  <span className={`text-[11px] font-mono bg-white/15 px-2 py-1 rounded-full transition ${yoyIsOpen ? 'rotate-180' : ''}`}>⌄</span>
                                </button>
                                {yoyIsOpen ? (
                                  <div className="divide-y divide-[#ede8dc]">
                                    {sp.yoy3.map((y, i) => (
                                      <div key={i} className="px-3 py-2.5 flex gap-3 items-start">
                                        <span className="shrink-0 text-[11px] font-mono bg-[#f4f1eb] border border-[#e8e0d0] px-2 py-1 rounded-full">{y.year}</span>
                                        <span className="text-[13px] leading-[1.5] text-[#1a2e1a]">{y.change}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="px-3 py-2.5 text-[12px] text-[#8b7355] italic">Click to expand — compares {sp.yoy3.map(y=>y.year).join(' • ')}</div>
                                )}
                              </div>
                              <div className="bg-white border border-[#e8e0d0] rounded-[10px] p-3">
                                <div className="text-[11px] tracking-[0.12em] uppercase font-bold text-[#8b7355]">Major Changes — Last 5 Years</div>
                                <ul className="mt-2 space-y-1.5">
                                  {sp.major5.map((m, i) => (
                                    <li key={i} className={`text-[12px] leading-[1.5] pl-3 border-l-2 ${m.startsWith('REMOVED') ? 'border-[#a3b18a] bg-[#a3b18a]/15' : m.startsWith('ADDED') ? 'border-[#8b2635]/40 bg-[#8b2635]/5' : 'border-[#e8e0d0]'} -ml-px py-1 pr-2 rounded-r`}>
                                      {m}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Proclamation */}
                            <div className="bg-[#f4f1eb] border border-[#c2b8a3] border-dashed rounded-[10px] p-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="text-[11px] tracking-[0.14em] uppercase font-bold text-[#5a4a32]">Proclamation / Regulation — Copy with Highlight</div>
                                <a href={sp.proclamation.url} target="_blank" rel="noreferrer" className="text-[11px] font-mono bg-[#1a2e1a] text-white px-2.5 py-1 rounded-full hover:bg-black transition">View on NDGF ↗</a>
                              </div>
                              <div className="mt-2 bg-white border border-[#e8e0d0] rounded-[8px] p-3 font-mono text-[12px] leading-[1.6] text-[#1a2e1a]" dangerouslySetInnerHTML={{ __html: sp.proclamation.highlight }} />
                              <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-mono">
                                <span className="px-2 py-1 rounded-full bg-[#a3b18a]/30 border border-[#a3b18a]">highlight = updated 2026</span>
                                <span className="px-2 py-1 rounded-full bg-white border border-[#e8e0d0]">Full text: gf.nd.gov/regulations</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 bg-white border border-[#e8e0d0] rounded-[12px] p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div>
                  <div className="text-[12px] font-bold tracking-[0.08em] uppercase text-[#8b7355]">Until / Unit Restrictions — in each drawer</div>
                  <p className="text-[12px] leading-[1.5] text-[#5a4a32] mt-1">Every species drawer above has its unit chip + “Unit/area” note. Check park permits (Grahams Island, Fort Stevenson, etc.) — they change yearly.</p>
                </div>
                <a href="https://gf.nd.gov/hunting/where" target="_blank" rel="noreferrer" className="shrink-0 bg-[#c45d26] text-white text-[12px] font-semibold px-4 py-2 rounded-full">Where to Hunt Map ↗</a>
              </div>

              {/* Access & Posting — moved to bottom, collapsed */}
              {data.access && (
                <details className="mt-4 bg-white border border-[#e8e0d0] rounded-[12px] overflow-hidden group">
                  <summary className="px-4 py-3 flex items-center justify-between cursor-pointer bg-[#f4f1eb] hover:bg-[#ede8dc] transition list-none">
                    <span className="font-display font-bold text-[13px] flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-[#1a2e1a] text-white grid place-items-center text-[10px]">🪧</span>{data.access.title} <span className="hidden sm:inline font-normal text-[#8b7355]">— non-posted/E-posted & buildings</span></span>
                    <span className="text-[11px] font-mono bg-white border border-[#e8e0d0] px-2.5 py-1 rounded-full group-open:hidden">Expand ▾</span>
                    <span className="text-[11px] font-mono bg-[#1a2e1a] text-white px-2.5 py-1 rounded-full hidden group-open:inline">Hide ▴</span>
                  </summary>
                  <div className="p-3 grid md:grid-cols-2 lg:grid-cols-3 gap-3 border-t border-[#e8e0d0]">
                    {data.access.rules.map((r,i) => (
                      <div key={i} className="bg-[#f4f1eb] border border-[#e8e0d0] rounded-[10px] p-3">
                        <div className="text-[11px] tracking-[0.12em] uppercase font-bold text-[#1a2e1a]">{r.label}</div>
                        <div className="text-[12px] leading-[1.5] text-[#5a4a32] mt-1">{r.body}</div>
                      </div>
                    ))}
                  </div>
                  <div className="px-3 pb-3 flex flex-wrap gap-2">
                    {data.access.links.map(l => (
                      <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="text-[11px] font-mono bg-[#1a2e1a] text-white px-3 py-1.5 rounded-full hover:bg-black transition">{l.label} ↗</a>
                    ))}
                    <span className="text-[11px] font-mono bg-[#a3b18a]/30 border border-[#a3b18a] px-3 py-1.5 rounded-full hidden sm:inline">If they tried to post — even if not compliant — skip it.</span>
                  </div>
                </details>
              )}
            </>
          ) : (
            <div className="py-16 text-center">
              <div className="text-[15px] font-semibold">No match for “{query}”</div>
              <button onClick={() => setQuery('')} className="mt-2 text-[13px] underline">Clear search</button>
            </div>
          )}
        </main>
      </div>

      <footer className="border-t border-[#e8e0d0] bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row gap-3 justify-between text-[11px] leading-[1.5] text-[#8b7355]">
          <div>
            <div className="font-semibold text-[#1a2e1a] font-mono">Short Notice — the ballad of Alec • NDGF Seasonal Changes</div>
            <div>Built from live NDGF pulls 2026-09-03 • Not affiliated with NDGF • Verify before you go: <a className="underline" href="https://gf.nd.gov/regulations" target="_blank" rel="noreferrer">gf.nd.gov/regulations</a></div>
          </div>
          <div className="flex gap-2 shrink-0">
            <a href="https://gf.nd.gov/regulations/deer" target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-full bg-[#f4f1eb] border border-[#e8e0d0] font-mono">Deer Proclamation</a>
            <a href="https://gf.nd.gov/hunting/season-dates" target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-full bg-[#1a2e1a] text-[#f4f1eb] font-mono">Season Dates</a>
          </div>
        </div>
      </footer>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,ital,wght@9..144,0,600;9..144,0,700&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
      mark{ background:#a3b18a55; border-bottom:1px solid #8a9a6a; padding:0 2px; border-radius:2px;}
      html.dark mark{ background:#a3b18a33; border-color:#5a6a4a; }
      .scrollbar-none::-webkit-scrollbar{display:none} .scrollbar-none{scrollbar-width:none}`}</style>
    </div>
  )
}
