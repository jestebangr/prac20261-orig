// AXSO 2026-1 - front end (vanilla JS + Tailwind)
const CATEGORY_STYLE = {
  Laptops:     { icon: '💻', cover: 'bg-gradient-to-br from-sky-500 to-blue-800' },
  Desktops:    { icon: '🖥️', cover: 'bg-gradient-to-br from-indigo-500 to-violet-800' },
  Monitors:    { icon: '🖵',  cover: 'bg-gradient-to-br from-cyan-500 to-teal-800' },
  Peripherals: { icon: '⌨️', cover: 'bg-gradient-to-br from-fuchsia-500 to-purple-800' },
  Networking:  { icon: '🌐', cover: 'bg-gradient-to-br from-emerald-500 to-green-800' },
  Storage:     { icon: '💾', cover: 'bg-gradient-to-br from-amber-500 to-orange-800' },
  Servers:     { icon: '🗄️', cover: 'bg-gradient-to-br from-slate-500 to-slate-800' },
  Mobile:      { icon: '📱', cover: 'bg-gradient-to-br from-rose-500 to-red-800' },
  Accessories: { icon: '🎧', cover: 'bg-gradient-to-br from-lime-500 to-green-800' },
  Software:    { icon: '📀', cover: 'bg-gradient-to-br from-yellow-500 to-amber-800' },
}
const DEFAULT_STYLE = { icon: '📦', cover: 'bg-gradient-to-br from-gray-500 to-gray-800' }

const $ = (id) => document.getElementById(id)
const fmtPrice = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
const fmtDate = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeStyle: 'short' })

const state = { products: [], category: 'All', query: '' }

function stars(rating) {
  const full = Math.round(Number(rating))
  return '★'.repeat(full) + '☆'.repeat(5 - full) + ` ${Number(rating).toFixed(1)}`
}

function renderCategories() {
  const categories = ['All', ...new Set(state.products.map(p => p.category))]
  const nav = $('categories')
  nav.replaceChildren(...categories.map(cat => {
    const btn = document.createElement('button')
    const active = cat === state.category
    btn.type = 'button'
    btn.textContent = cat === 'All' ? `All (${state.products.length})` : cat
    btn.setAttribute('aria-pressed', active)
    btn.className = 'rounded-full px-4 py-1.5 text-sm border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ' +
      (active ? 'bg-sky-500 border-sky-500 text-neutral-950 font-semibold'
              : 'border-white/15 text-gray-300 hover:border-sky-400')
    btn.addEventListener('click', () => { state.category = cat; render() })
    return btn
  }))
}

function renderGrid() {
  const q = state.query.trim().toLowerCase()
  const visible = state.products.filter(p =>
    (state.category === 'All' || p.category === state.category) &&
    (!q || `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(q)))

  const tpl = $('product-card')
  $('grid').replaceChildren(...visible.map(p => {
    const card = tpl.content.cloneNode(true)
    const style = CATEGORY_STYLE[p.category] ?? DEFAULT_STYLE
    card.querySelector('[data-cover]').classList.add(...style.cover.split(' '))
    card.querySelector('[data-icon]').textContent = style.icon
    card.querySelector('[data-category]').textContent = p.category
    card.querySelector('[data-name]').textContent = p.name
    card.querySelector('[data-description]').textContent = p.description
    card.querySelector('[data-price]').textContent = fmtPrice.format(p.price)
    card.querySelector('[data-rating]').textContent = stars(p.rating)
    const stock = card.querySelector('[data-stock]')
    stock.textContent = p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'
    if (p.stock < 10) stock.classList.replace('text-gray-400', 'text-rose-300')
    return card
  }))
  $('empty').classList.toggle('hidden', visible.length > 0)
}

function render() {
  renderCategories()
  renderGrid()
}

async function load() {
  try {
    const resp = await fetch('/api/products')
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const data = await resp.json()
    state.products = data.products ?? []
    if (!state.products.length) throw new Error('empty table')

    $('student').textContent = data.student
    $('created').textContent = fmtDate.format(new Date(data.created))
    $('total').textContent = `${state.products.length} products loaded`
    $('runtime').textContent = data.server ?? ''
    $('db-ok').classList.remove('hidden')
    $('catalogue').classList.replace('hidden', 'flex')
    render()

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (window.confetti && !reduceMotion) confetti({ particleCount: 150, spread: 70 })
  } catch (err) {
    console.error('You need to configure the database parameters:', err.message)
    $('db-ko').classList.remove('hidden')
  }
}

$('search').addEventListener('input', (e) => { state.query = e.target.value; renderGrid() })
load()
