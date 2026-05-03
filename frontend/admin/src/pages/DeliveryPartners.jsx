import { useState, useMemo, useEffect, useCallback } from 'react'
import { Search, Filter, Plus, Eye, Edit2, Trash2, CheckCircle, XCircle, Download, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

const statusColors = {
  pending:  'bg-amber-50 text-amber-600 border-amber-200',
  active:   'bg-green-50 text-green-600 border-green-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
}
const vehicleTypes = ['Bike', 'Scooter', 'Bicycle', 'Car']
const emptyForm = { full_name: '', mobile: '', email: '', city: '', vehicle_type: '', status: 'pending' }

export default function DeliveryPartners() {
  const { user } = useAuth()
  const [partners, setPartners] = useState([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [page, setPage]         = useState(1)
  const perPage = 5
  const [form, setForm]         = useState(emptyForm)

  const load = useCallback(() => {
    setLoading(true)
    api.getPartners()
      .then(setPartners)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => partners.filter(p => {
    const ms = search === '' || p.full_name.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase()) || p.mobile.includes(search)
    const mf = statusFilter === 'all' || p.status === statusFilter
    return ms && mf
  }), [partners, search, statusFilter])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage)

  const openAdd  = () => { setForm(emptyForm); setShowModal('add') }
  const openEdit = (p) => { setForm({ full_name: p.full_name, mobile: p.mobile, email: p.email || '', city: p.city, vehicle_type: p.vehicle_type, status: p.status }); setSelected(p); setShowModal('edit') }
  const openView = (p) => { setSelected(p); setShowModal('view') }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (showModal === 'add') {
        const created = await api.createPartner(form)
        setPartners(prev => [created, ...prev])
      } else {
        const updated = await api.updatePartner(selected.id, form)
        setPartners(prev => prev.map(p => p.id === selected.id ? updated : p))
      }
      setShowModal(null); setSelected(null)
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.deletePartner(id)
      setPartners(prev => prev.filter(p => p.id !== id))
      setDeleteConfirm(null)
    } catch (e) { alert(e.message) }
  }

  const quickAction = async (id, action) => {
    try {
      let updated
      if (action === 'active') {
        updated = await api.activatePartner(id, user?.id)
      } else {
        updated = await api.rejectPartner(id, user?.id, null)
      }
      setPartners(prev => prev.map(p => p.id === id ? updated : p))
      if (selected?.id === id) setSelected(updated)
    } catch (e) { alert(e.message) }
  }

  const exportCSV = () => {
    const headers = ['ID','Name','Phone','City','Vehicle','Status','Created']
    const rows = filtered.map(p => [p.id, p.full_name, p.mobile, p.city, p.vehicle_type, p.status, p.created_at])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'delivery_partners.csv'; a.click()
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h2 className="text-xl font-bold text-navy">Delivery Partners</h2><p className="text-sm text-gray-500">{filtered.length} total • {partners.filter(p => p.status === 'pending').length} pending</p></div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"><Download size={16} /> Export</button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark shadow-lg shadow-primary/20"><Plus size={16} /> Add Partner</button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search by name, city, phone..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" /></div>
        <div className="flex items-center gap-2"><Filter size={16} className="text-gray-400" />
          {['all','pending','active','rejected'].map(s => (<button key={s} onClick={() => { setStatusFilter(s); setPage(1) }} className={`px-3 py-2 rounded-lg text-xs font-medium capitalize ${statusFilter === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100">{['#','Name','Phone','City','Vehicle','Status','Date','Actions'].map(h => <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>)}</tr></thead>
            <tbody>
              {paginated.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-400">{p.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-navy">{p.full_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.mobile}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.city}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{p.vehicle_type}</td>
                  <td className="px-4 py-3"><span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border capitalize ${statusColors[p.status]}`}>{p.status}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openView(p)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary"><Eye size={16} /></button>
                      <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
                      {p.status === 'pending' && (<><button onClick={() => quickAction(p.id, 'active')} className="p-1.5 hover:bg-green-50 rounded-lg text-gray-400 hover:text-green-600"><CheckCircle size={16} /></button><button onClick={() => quickAction(p.id, 'rejected')} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"><XCircle size={16} /></button></>)}
                      <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">No partners found.</td></tr>}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
            <div className="flex gap-1"><button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={16} /></button><button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={16} /></button></div>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-navy">Delete Partner?</h3><p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
            <div className="flex gap-3 mt-6"><button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button><button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600">Delete</button></div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showModal === 'add' || showModal === 'edit') && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-bold text-navy">{showModal === 'add' ? 'Add Partner' : 'Edit Partner'}</h3><button onClick={() => setShowModal(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button></div>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label><input required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label><input required value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">City *</label><input required value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Vehicle *</label><select required value={form.vehicle_type} onChange={e => setForm({...form, vehicle_type: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary"><option value="">Select</option>{vehicleTypes.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
              </div>
              {showModal === 'edit' && <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary"><option value="pending">Pending</option><option value="active">Active</option><option value="rejected">Rejected</option></select></div>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {showModal === 'add' ? 'Add' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Slide-over */}
      {showModal === 'view' && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={() => setShowModal(null)}>
          <div className="bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between"><h3 className="text-lg font-bold text-navy">Partner Details</h3><button onClick={() => setShowModal(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button></div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4"><div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-xl font-bold">{selected.full_name.charAt(0)}</div><div><h4 className="font-semibold text-navy">{selected.full_name}</h4><span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border capitalize ${statusColors[selected.status]}`}>{selected.status}</span></div></div>
              {[['Mobile', selected.mobile],['Email', selected.email || '—'],['City', selected.city],['Vehicle', selected.vehicle_type],['Applied', new Date(selected.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })]].map(([l, v]) => (
                <div key={l} className="flex justify-between py-2 border-b border-gray-50"><span className="text-sm text-gray-500">{l}</span><span className="text-sm font-medium text-navy">{v}</span></div>
              ))}
              {selected.rejection_note && <div className="bg-red-50 rounded-xl p-4"><p className="text-xs font-semibold text-red-600 mb-1">Rejection Note</p><p className="text-sm text-red-700">{selected.rejection_note}</p></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
