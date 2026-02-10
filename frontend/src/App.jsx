import { useEffect, useState } from 'react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
const RESOURCE_URL =
  import.meta.env.VITE_RESOURCE_URL || 'http://127.0.0.1:8000/storage'

/* ===================== AXIOS ===================== */

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
})

const token = localStorage.getItem('auth_token')
if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`

/* ===================== FALLBACK ===================== */

const MOCK_ITEMS = [
  { id: 'm1', name: 'Classic Burger', price: 12.99, is_available: true },
  { id: 'm2', name: 'Margherita Pizza', price: 14.99, is_available: true },
]

export default function App() {
  /* ===================== AUTH ===================== */

  const [isAdmin, setIsAdmin] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(!!token)
  const [showLogin, setShowLogin] = useState(false)

  /* ===================== MENU ===================== */

  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    price: '',
    is_available: true,
    img: null,
  })

  const [editingId, setEditingId] = useState(null)
  const [editingImage, setEditingImage] = useState(null)

  /* ===================== PRE ORDER ===================== */

  const [showPreOrder, setShowPreOrder] = useState(false)
  const [preOrders, setPreOrders] = useState([])

  /* ===================== API ===================== */

  const fetchItems = async () => {
    try {
      setLoading(true)
      const res = await api.get('/list-items')
      const normalized = (res.data || []).map((item, index) => ({
        ...item,
        id: item.id ?? item.uuid ?? `item-${index}`,
      }))
      setMenu(normalized)
    } catch {
      setMenu(MOCK_ITEMS)
    } finally {
      setLoading(false)
    }
  }

  const fetchPreOrders = async () => {
    try {
      const res = await api.get('/pre-orders')
      setPreOrders(res.data || [])
    } catch {
      setPreOrders([])
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    if (isAdmin && isAuthenticated) {
      fetchPreOrders()
    }
  }, [isAdmin, isAuthenticated])

  /* ===================== ITEM CRUD ===================== */

  const saveItem = async () => {
    try {
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => v !== null && data.append(k, v))

      editingId
        ? await api.post(`/update-item/${editingId}`, data)
        : await api.post('/create-item', data)

      resetForm()
      fetchItems()
    } catch {
      alert('Save failed')
    }
  }

  const deleteItem = async () => {
    if (!editingId) return
    if (!confirm('Delete this item?')) return

    try {
      await api.delete(`/delete-item/${editingId}`)
      resetForm()
      fetchItems()
    } catch {
      alert('Delete failed')
    }
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditingImage(item.img_url || null)
    setForm({
      name: item.name,
      price: item.price,
      is_available: item.is_available,
      img: null,
    })
  }

  const resetForm = () => {
    setEditingId(null)
    setEditingImage(null)
    setForm({ name: '', price: '', is_available: true, img: null })
  }

  /* ===================== AUTH ===================== */

  const handleAdminClick = () => {
    if (!isAuthenticated) {
      setIsAdmin(true)
      setShowLogin(true)
    } else {
      setIsAdmin(!isAdmin)
    }
  }

  const handleLogin = async (email, password) => {
    const res = await api.post('/login', { email, password })
    localStorage.setItem('auth_token', res.data.token)
    api.defaults.headers.common.Authorization = `Bearer ${res.data.token}`
    setIsAuthenticated(true)
    setShowLogin(false)
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setIsAuthenticated(false)
    setIsAdmin(false)
  }

  /* ===================== UI ===================== */

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <header className="flex justify-between mb-10">
        <h1 className="text-2xl font-bold text-orange-600">FoodCourt</h1>

        <div className="flex gap-3">
          {isAuthenticated && (
            <button onClick={logout} className="bg-gray-300 px-4 py-2 rounded-full">
              Logout
            </button>
          )}
          <button
            onClick={handleAdminClick}
            className="bg-orange-500 text-white px-4 py-2 rounded-full"
          >
            {isAdmin ? 'User View' : 'Admin'}
          </button>
        </div>
      </header>

      {isAdmin && !isAuthenticated && showLogin && <Login onLogin={handleLogin} />}

      {/* ===================== ADMIN ===================== */}
      {isAdmin && isAuthenticated && (
        <>
          {/* ITEM CRUD */}
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div className="bg-white p-6 rounded-2xl shadow">
              <h2 className="text-xl font-semibold mb-4">
                {editingId ? 'Update Item' : 'Add Item'}
              </h2>

              <input
                className="w-full border p-2 mb-3 rounded"
                placeholder="Food name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <input
                type="number"
                className="w-full border p-2 mb-3 rounded"
                placeholder="Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />

              {editingImage && (
                <img
                  src={`${RESOURCE_URL}/${editingImage}`}
                  className="h-24 w-24 object-cover rounded mb-3"
                />
              )}

              <input
                type="file"
                className="w-full border p-2 mb-3 rounded"
                onChange={(e) => setForm({ ...form, img: e.target.files[0] })}
              />

              <button
                className="w-full bg-orange-500 text-white py-2 rounded mb-2"
                onClick={saveItem}
              >
                {editingId ? 'Update' : 'Create'}
              </button>

              {editingId && (
                <button
                  className="w-full bg-red-500 text-white py-2 rounded"
                  onClick={deleteItem}
                >
                  Delete
                </button>
              )}
            </div>

            <div className="space-y-4">
              {menu.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-xl shadow flex gap-4"
                >
                  {item.img_url && (
                    <img
                      src={`${RESOURCE_URL}/${item.img_url}`}
                      className="h-16 w-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p>₹{item.price}</p>
                  </div>
                  <button
                    className="text-orange-500"
                    onClick={() => startEdit(item)}
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>

      {/* PRE ORDERS */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">Pre-Orders</h2>

        {preOrders.length === 0 ? (
          <p className="text-gray-500">No pre-orders yet</p>
        ) : (
          <div className="space-y-6">
            {preOrders.map((user) => (
              <div
                key={user.email}
                className="border rounded-xl p-4 bg-orange-50"
              >
                {/* USER INFO */}
                <div className="mb-3">
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <span className="inline-block mt-1 ml-1 text-xs bg-orange-200 px-2 py-1 rounded">
                    Total Items: {user.total_items}
                  </span>

                  <span className="inline-block mt-1 ml-1 text-xs bg-orange-200 px-2 py-1 rounded">
                    Total Amount: {user.orders.reduce((prev, next) => {
                      return prev += next?.menu_item?.price || 0;
                    }, 0) * user.total_items}
                  </span>
                </div>

                {/* ORDERS */}
                <div className="space-y-2">
                  {user.orders.map((order) => (
                    <div
                      key={order.uuid}
                      className="flex justify-between items-center bg-white p-3 rounded shadow-sm"
                    >
                      <div>
                        <p className="text-xs text-gray-500">Order ID</p>
                        <p className="font-mono text-xs">
                          {order.uuid.slice(0, 8)}
                        </p>

                        <p className="text-xs text-gray-500">Ordered</p>
                        <p className="font-mono text-xs">
                          {order.menu_item?.name}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">Created</p>
                        <p className="text-xs">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">Qty: {order.quantity}</p>
                        <span className="inline-block mt-1 text-xs bg-yellow-200 px-2 py-1 rounded">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

        </>
      )}

      {/* ===================== USER ===================== */}
      {!isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            <p className="col-span-full text-center">Loading...</p>
          ) : (
            menu.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden"
              >
                {/* Image Section */}
                <div className="h-40 bg-gray-100 flex items-center justify-center">
                  {item.img_url ? (
                    <img
                      src={`${RESOURCE_URL}/${item.img_url}`}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No Image</span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-2">
                  <h3 className="font-semibold text-lg truncate">
                    {item.name}
                  </h3>

                  <p className="text-orange-600 font-bold">
                    ₹{item.price}
                  </p>

                  <button
                    className="mt-auto w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition"
                    onClick={() => setShowPreOrder(true)}
                  >
                    Pre-Order
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showPreOrder && (
        <PreOrderModal menu={menu} onClose={() => setShowPreOrder(false)} />
      )}
    </div>
  )
}

/* ===================== PRE ORDER MODAL ===================== */

function PreOrderModal({ menu, onClose }) {
  const [step, setStep] = useState(1)
  const [customer, setCustomer] = useState({ name: '', email: '' })
  const [cart, setCart] = useState({})

  const submitOrder = async () => {
    const items = Object.entries(cart).map(([id, qty]) => ({
      menu_item_id: id,
      quantity: qty,
    }))

    try {
      await api.post('/pre-order', { ...customer, items })
      alert('Pre-order placed');
      onClose();
    } catch(err) {
      console.error('While placing order: ', err);
      alert('Order not placed');
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md">
        {step === 1 && (
          <>
            <input
              className="w-full border p-2 mb-3"
              placeholder="Name"
              onChange={(e) =>
                setCustomer({ ...customer, name: e.target.value })
              }
            />
            <input
              className="w-full border p-2 mb-4"
              placeholder="Email"
              onChange={(e) =>
                setCustomer({ ...customer, email: e.target.value })
              }
            />
            <button
              className="w-full bg-orange-500 text-white py-2"
              onClick={() => setStep(2)}
            >
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            {menu.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between mb-3 border-b pb-2"
              >
                <span className="text-sm font-medium">{m.name}</span>

                <div className="flex items-center gap-3">
                  <button
                    className="px-3 py-1 bg-gray-200 rounded"
                    onClick={() =>
                      setCart((prev) => {
                        const current = prev[m.id] || 0
                        if (current <= 1) {
                          const { [m.id]: _, ...rest } = prev
                          return rest
                        }
                        return { ...prev, [m.id]: current - 1 }
                      })
                    }
                  >
                    −
                  </button>

                  <span className="w-6 text-center">
                    {cart[m.id] || 0}
                  </span>

                  <button
                    className="px-3 py-1 bg-green-500 text-white rounded"
                    onClick={() =>
                      setCart((prev) => ({
                        ...prev,
                        [m.id]: (prev[m.id] || 0) + 1,
                      }))
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            ))}

            <button
              className="mt-4 w-full bg-green-500 text-white py-2"
              onClick={submitOrder}
            >
              Confirm Order
            </button>
          </>
        )}

        <button className="mt-3 text-sm text-gray-500 w-full" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  )
}

/* ===================== LOGIN ===================== */

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="max-w-sm mx-auto bg-white p-6 rounded-2xl shadow">
      <input
        className="w-full border p-2 mb-3"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="w-full border p-2 mb-4"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="w-full bg-orange-500 text-white py-2"
        onClick={() => onLogin(email, password)}
      >
        Login
      </button>
    </div>
  )
}
