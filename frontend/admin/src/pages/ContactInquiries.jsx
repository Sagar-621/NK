import { useState, useMemo, useEffect, useCallback } from 'react'
import { Search, Eye, Trash2, Mail, CheckCircle, X, ExternalLink, Loader2 } from 'lucide-react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

const statusColors = {
  unread:  'bg-blue-50 text-blue-600 border-blue-200',
  read:    'bg-gray-50 text-gray-600 border-gray-200',
  replied: 'bg-green-50 text-green-600 border-green-200',
}

export default function ContactInquiries() {
  const { user } = useAuth()
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    api.getInquiries()
      .then(setInquiries)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => inquiries.filter(i => {
    const ms = !search || i.full_name.toLowerCase().includes(search.toLowerCase()) || i.email.toLowerCase().includes(search.toLowerCase()) || i.subject?.toLowerCase().includes(search.toLowerCase())
    const mf = statusFilter === 'all' || i.status === statusFilter
    return ms && mf
  }), [inquiries, search, statusFilter])

  const markAs = async (id, status) => {
    try {
      const updated = await api.updateInquiry(id, status, status === 'replied' ? user?.id : undefined)
      setInquiries(prev => prev.map(i => i.id === id ? updated : i))
      // Keep selected panel in sync
      if (selected?.id === id) setSelected(updated)
    } catch (e) { alert(e.message) }
  }

  const handleSelect = async (inquiry) => {
    setSelected(inquiry)
    if (inquiry.status === 'unread') {
      await markAs(inquiry.id, 'read')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.deleteInquiry(id)
      setInquiries(prev => prev.filter(i => i.id !== id))
      setDeleteConfirm(null)
      if (selected?.id === id) setSelected(null)
    } catch (e) { alert(e.message) }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 size={32} className="animate-spin text-primary" />
    </div>
  )

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-sm">{error}</div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy">Contact Inquiries</h2>
        <p className="text-sm text-gray-500">{inquiries.filter(i => i.status === 'unread').length} unread messages</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" />
        </div>
        <div className="flex gap-2">
          {['all','unread','read','replied'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-lg text-xs font-medium capitalize ${statusFilter === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-2 space-y-2">
          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">No messages found.</div>
          )}
          {filtered.map(i => (
            <button key={i.id} onClick={() => handleSelect(i)}
              className={`w-full text-left bg-white rounded-xl border p-4 transition-all hover:shadow-md ${selected?.id === i.id ? 'border-primary ring-1 ring-primary/20' : 'border-gray-100'} ${i.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={`text-sm truncate ${i.status === 'unread' ? 'font-bold text-navy' : 'font-medium text-gray-700'}`}>{i.full_name}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{i.subject || 'No subject'}</p>
                </div>
                <span className={`flex-shrink-0 inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium border capitalize ${statusColors[i.status]}`}>{i.status}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2 line-clamp-2">{i.message}</p>
              <p className="text-[10px] text-gray-300 mt-2">
                {new Date(i.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </button>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-navy">{selected.full_name}</h3>
                  <p className="text-sm text-gray-500">{selected.email}{selected.phone && ` • ${selected.phone}`}</p>
                </div>
                <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border capitalize ${statusColors[selected.status]}`}>{selected.status}</span>
              </div>
              {selected.subject && <p className="text-sm font-semibold text-navy mb-2">{selected.subject}</p>}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
              <p className="text-xs text-gray-400 mb-6">
                Received: {new Date(selected.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${selected.subject || 'Your inquiry'}`}
                  onClick={() => markAs(selected.id, 'replied')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark"
                >
                  <Mail size={16} /> Reply via Email <ExternalLink size={12} />
                </a>
                {selected.status !== 'replied' && (
                  <button onClick={() => markAs(selected.id, 'replied')} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                    <CheckCircle size={16} /> Mark Replied
                  </button>
                )}
                <button onClick={() => setDeleteConfirm(selected.id)} className="flex items-center gap-2 px-4 py-2.5 border border-red-200 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <Mail size={40} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 text-sm">Select a message to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-navy">Delete Message?</h3>
            <p className="text-sm text-gray-500 mt-2">This cannot be undone.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
