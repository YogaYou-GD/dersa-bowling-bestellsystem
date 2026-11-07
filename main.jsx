import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import { Check, CheckCircle2, ChevronDown, CircleUserRound, ClipboardList, LogOut, Minus, Plus, RefreshCw, ShoppingBasket, Trash2 } from 'lucide-react'
import { drinks } from './drinks'
import './style.css'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null
const euro = value => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(value || 0))

function App() {
  const [session, setSession] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [lane, setLane] = useState(1)
  const [category, setCategory] = useState('Alle')
  const [cart, setCart] = useState({})
  const [orders, setOrders] = useState([])
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => listener.subscription.unsubscribe()
  }, [])

  const staffName = session?.user?.user_metadata?.username || session?.user?.email?.split('@')[0] || 'Kellner'
  const filteredDrinks = useMemo(() => drinks.filter(d => category === 'Alle' || d.category === category), [category])
  const cartItems = drinks.filter(d => cart[d.id] > 0)
  const cartTotal = cartItems.reduce((sum, d) => sum + d.price * cart[d.id], 0)
  const cartCount = cartItems.reduce((sum, d) => sum + cart[d.id], 0)

  async function loadOrders() {
    if (!supabase || !session) return
    const { data, error } = await supabase.from('orders').select('*').eq('is_done', false).order('created_at', { ascending: false })
    if (error) setNotice('Bestellungen konnten nicht geladen werden: ' + error.message)
    else setOrders(data || [])
  }

  useEffect(() => {
    if (!session || !supabase) return
    loadOrders()
    const channel = supabase.channel('live-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadOrders())
      .subscribe()
    const refresh = window.setInterval(loadOrders, 20000)
    return () => { supabase.removeChannel(channel); window.clearInterval(refresh) }
  }, [session])

  async function login(event) {
    event.preventDefault()
    setLoginError('')
    if (!supabase) return setLoginError('Die App ist noch nicht mit Supabase verbunden. Bitte zuerst die Einrichtung abschließen.')
    const cleanName = username.trim()
    if (!/^kellner\d+$/i.test(cleanName)) return setLoginError('Bitte einen Benutzernamen wie Kellner1 oder Kellner2 eingeben.')
    setBusy(true)
    const email = `${cleanName.toLowerCase()}@dersabowling.de`
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (error) setLoginError('Anmeldung fehlgeschlagen. Benutzername und Passwort prüfen.')
  }

  async function logout() {
    await supabase?.auth.signOut()
    setCart({})
    setOrders([])
  }

  function changeQty(id, amount) {
    setCart(old => {
      const next = { ...old, [id]: Math.max(0, (old[id] || 0) + amount) }
      if (!next[id]) delete next[id]
      return next
    })
  }

  async function submitOrder() {
    if (!cartItems.length || !session) return
    setBusy(true)
    const rows = cartItems.map(d => ({
      lane, drink_name: d.name, drink_size: d.size, quantity: cart[d.id],
      unit_price: d.price, created_by: staffName
    }))
    const { error } = await supabase.from('orders').insert(rows)
    setBusy(false)
    if (error) setNotice('Bestellung konnte nicht gespeichert werden: ' + error.message)
    else {
      setCart({})
      setNotice(`Bestellung für Bahn ${lane} wurde aufgenommen.`)
      loadOrders()
    }
  }

  async function completeOrder(id) {
    const { error } = await supabase.from('orders').update({ is_done: true, completed_at: new Date().toISOString() }).eq('id', id)
    if (error) setNotice('Konnte nicht abgehakt werden: ' + error.message)
    else {
      setOrders(old => old.filter(order => order.id !== id))
      setNotice('Bestellung erledigt.')
    }
  }

  if (!session) return <main className="login-shell">
    <div className="login-card">
      <div className="brand-mark">D</div>
      <p className="eyebrow">DERSA BOWLING</p>
      <h1>Kellner-Login</h1>
      <p className="muted">Melde dich an, um Bestellungen aufzunehmen und die Bahnen im Blick zu behalten.</p>
      {!supabase && <div className="warning">Die Verbindung zur Datenbank fehlt noch. Bitte zuerst die Einrichtung in der README durchführen.</div>}
      <form onSubmit={login}>
        <label>Benutzername</label>
        <input autoComplete="username" placeholder="z. B. Kellner1" value={username} onChange={e => setUsername(e.target.value)} />
        <label>Passwort</label>
        <input type="password" autoComplete="current-password" placeholder="Dein Passwort" value={password} onChange={e => setPassword(e.target.value)} />
        {loginError && <p className="error">{loginError}</p>}
        <button className="primary full" disabled={busy}>{busy ? 'Anmeldung…' : 'Anmelden'}</button>
      </form>
      <p className="tiny muted">Zugangsdaten erhältst du von der Schichtleitung.</p>
    </div>
  </main>

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark small">D</div><div><strong>DERSA BOWLING</strong><span>BESTELLSYSTEM</span></div></div>
      <div className="user-area"><span><CircleUserRound size={16}/> {staffName}</span><button className="icon-button" onClick={logout} title="Abmelden"><LogOut size={18}/></button></div>
    </header>

    <main className="main-grid">
      <section className="panel order-panel">
        <div className="section-heading"><div><p className="eyebrow">NEUE BESTELLUNG</p><h1>Getränke aufnehmen</h1></div><ShoppingBasket className="heading-icon"/></div>
        <h2 className="subheading">1. Bowlingbahn auswählen</h2>
        <div className="lanes">
          {[1,2,3,4,5,6].map(n => <button key={n} onClick={() => setLane(n)} className={`lane ${lane === n ? 'selected' : ''}`}><span>Bahn</span><strong>{n}</strong></button>)}
        </div>
        <div className="menu-heading"><h2 className="subheading">2. Getränke auswählen</h2><span className="selected-lane">Bahn {lane}</span></div>
        <div className="tabs">
          {['Alle','Softdrinks','Säfte & Schorlen','Heißgetränke'].map(c => <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>)}
        </div>
        <div className="drink-list">
          {filteredDrinks.map(d => <div className="drink-row" key={d.id}>
            <div className="drink-info"><strong>{d.name}</strong><span>{d.size} · {euro(d.price)}</span></div>
            <div className="qty-controls">
              {cart[d.id] > 0 && <><button className="qty-btn" onClick={() => changeQty(d.id, -1)} aria-label="Verringern"><Minus size={15}/></button><b>{cart[d.id]}</b></>}
              <button className="add-btn" onClick={() => changeQty(d.id, 1)}><Plus size={16}/><span>Hinzufügen</span></button>
            </div>
          </div>)}
        </div>
        <div className="cart">
          <div className="cart-title"><h2 className="subheading">Warenkorb · Bahn {lane}</h2><span>{cartCount} Artikel</span></div>
          {!cartItems.length ? <p className="empty">Noch keine Getränke ausgewählt.</p> : <>
            {cartItems.map(d => <div className="cart-row" key={d.id}><div><strong>{d.name}</strong><span>{cart[d.id]} × {euro(d.price)}</span></div><b>{euro(cart[d.id] * d.price)}</b><button className="remove-btn" onClick={() => setCart(old => { const n = {...old}; delete n[d.id]; return n })}><Trash2 size={15}/></button></div>)}
            <div className="cart-total"><span>Gesamt</span><strong>{euro(cartTotal)}</strong></div>
            <button className="primary full" onClick={submitOrder} disabled={busy}>{busy ? 'Wird gespeichert…' : 'Bestellung absenden'}</button>
          </>}
        </div>
      </section>

      <section className="panel live-panel">
        <div className="section-heading"><div><p className="eyebrow">LIVE-ÜBERSICHT</p><h1>Offene Bestellungen</h1></div><div className="live-indicator"><i/> LIVE</div></div>
        <p className="muted small-copy">Bestellungen aller Bahnen. Abhaken, sobald sie erledigt sind.</p>
        {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice('')}>×</button></div>}
        {[1,2,3,4,5,6].map(n => {
          const laneOrders = orders.filter(o => o.lane === n)
          return <div className="lane-orders" key={n}>
            <div className="lane-orders-title"><h3>Bahn {n}</h3><span>{laneOrders.length} offen</span></div>
            {!laneOrders.length ? <p className="empty lane-empty">Keine offenen Bestellungen</p> : laneOrders.map(o => <div className="order-item" key={o.id}>
              <button className="check-button" onClick={() => completeOrder(o.id)} title="Als erledigt markieren"><Check size={18}/></button>
              <div className="order-detail"><strong>{o.quantity} × {o.drink_name}</strong><span>{o.drink_size} · aufgenommen von {o.created_by}</span></div>
              <b className="order-price">{euro(o.quantity * o.unit_price)}</b>
            </div>)}
          </div>
        })}
        <button className="refresh-button" onClick={loadOrders}><RefreshCw size={15}/> Aktualisieren</button>
      </section>
    </main>
    <footer>© DERSA BOWLING · Internes Bestellsystem <span><ClipboardList size={14}/> {orders.length} offene Positionen</span></footer>
  </div>
}

createRoot(document.getElementById('root')).render(<App />)
