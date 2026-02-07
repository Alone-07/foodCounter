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
if (token) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`
}

/* ===================== FALLBACK ===================== */

const MOCK_ITEMS = [
  { id: 'm1', name: 'Classic Burger', price: 12.99, is_available: true },
  { id: 'm2', name: 'Margherita Pizza', price: 14.99, is_available: true },
  { id: 'm3', name: 'Caesar Salad', price: 9.99, is_available: true },
]

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(!!token)
  const [showLogin, setShowLogin] = useState(false)

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

  /* ===================== API ===================== */

  const fetchItems = async () => {
    try {
      setLoading(true)
      const res = await api.get('/list-items')

      // Normalize items (IMPORTANT)
      const normalized = (res.data || []).map((item, index) => ({
        ...item,
        id: item.uuid ?? `${index}`,
      }))

      setMenu(normalized)
    } catch {
      setMenu(MOCK_ITEMS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const saveItem = async () => {
    try {
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => v !== null && data.append(k, v))

      editingId
        ? await api.put(`/update-item/${editingId}`, data)
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
      setIsAdmin(!isAdmin)
      setShowLogin(true)
    } else {
      setIsAdmin(!isAdmin)
    }
  }

  const handleLogin = async (email, password) => {
    try {
      const res = await api.post('/login', { email, password })
      localStorage.setItem('auth_token', res.data.token)
      api.defaults.headers.common.Authorization = `Bearer ${res.data.token}`
      setIsAuthenticated(true)
      setShowLogin(false)
    } catch {
      alert('Invalid credentials')
    }
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
        <div className="grid md:grid-cols-2 gap-8">
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
            {menu.map((item, index) => (
              <div
                key={item.id ?? `admin-${index}`}
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
      )}

      {/* ===================== USER VIEW ===================== */}
      {!isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            <p>Loading...</p>
          ) : (
            menu.map((item, index) => (
              <div
                key={item.id ?? `user-${index}`}
                className="bg-white rounded-2xl shadow"
              >
                <div className="h-40 bg-gray-100 flex items-center justify-center">
                  {item.img_url ? (
                    <img
                      src={`${RESOURCE_URL}/${item.img_url}`}
                      className="h-full w-full object-cover rounded-t-2xl"
                    />
                  ) : (
                    'No Image'
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{item.name}</h3>
                  <span className="inline-block mt-2 bg-orange-500 text-white px-3 py-1 rounded-full">
                    ₹{item.price}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
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
        className="w-full border p-2 mb-3 rounded"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="w-full border p-2 mb-4 rounded"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="w-full bg-orange-500 text-white py-2 rounded"
        onClick={() => onLogin(email, password)}
      >
        Login
      </button>
    </div>
  )
}
