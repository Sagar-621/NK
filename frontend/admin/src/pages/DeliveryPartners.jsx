import { useState, useMemo, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Filter, Plus, Eye, Edit2, Trash2, CheckCircle, XCircle, Download, X, ChevronLeft, ChevronRight, Loader2, Bike, Mail, Phone, Calendar } from 'lucide-react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { SkeletonTable, SkeletonSidePanel, SkeletonImage } from '../components/Skeleton'

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
  const [proofUrl, setProofUrl] = useState(null)
  const [proofLoading, setProofLoading] = useState(false)

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
  
  const openView = async (p) => { 
    setSelected(p); 
    setShowModal('view');
    if (p.id_proof_mime) {
      loadProof(p.id);
    }
  }

  const loadProof = async (id) => {
    setProofLoading(true);
    setProofUrl(null);
    try {
      const stored = localStorage.getItem('admin_session');
      const token  = stored ? JSON.parse(stored).token : null;
      const res    = await fetch(`/api/delivery-partners/${id}/id-proof`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load proof');
      const blob = await res.blob();
      setProofUrl(URL.createObjectURL(blob));
    } catch (e) {
      console.error(e);
    } finally {
      setProofLoading(false);
    }
  }

  // Cleanup blob URL
  useEffect(() => {
    return () => { if (proofUrl) URL.revokeObjectURL(proofUrl); }
  }, [proofUrl])

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

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-sm">{error}</div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-navy">Delivery Partners</h2>
          <p className="text-sm text-gray-500">
            {loading ? '…' : `${filtered.length} total • ${partners.filter(p => p.status === 'pending').length} pending`}
          </p>
        </div>
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

      {/* Table / Skeleton */}
      {loading ? (
        <SkeletonTable rows={5} cols={8}
          headers={['#','Name','Phone','City','Vehicle','Status','Date','Actions']} />
      ) : (
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
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-navy">Delete Partner?</h3><p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
            <div className="flex gap-3 mt-6"><button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button><button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600">Delete</button></div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {(showModal === 'add' || showModal === 'edit') && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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

      {/* View Modal Popup */}
      <AnimatePresence>
        {showModal === 'view' && selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(null)}
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-base">
                    {selected.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy">{selected.full_name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-widest ${statusColors[selected.status]}`}>
                        {selected.status}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">{selected.vehicle_type}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-navy transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">

                {/* ID Proof */}
                {selected.id_proof_mime && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Verification Document</p>
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                      {proofLoading ? (
                        <SkeletonImage className="w-full h-36 rounded-lg" />
                      ) : proofUrl ? (
                        selected.id_proof_mime.startsWith('image/') ? (
                          <img src={proofUrl} alt="ID proof" className="w-full max-h-48 object-cover rounded-lg border border-gray-200 bg-white shadow-sm" />
                        ) : (
                          <a href={proofUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-primary hover:bg-primary/5 transition-all">
                            <span className="flex items-center gap-2">📄 View Identity PDF</span>
                            <Download size={15} />
                          </a>
                        )
                      ) : (
                        <p className="text-xs text-red-500 text-center py-2">Failed to load document</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact & Info</p>
                  <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
                    {[
                      { icon: Phone,    label: 'Phone Number',       value: selected.mobile },
                      { icon: Mail,     label: 'Email Address',       value: selected.email || 'Not provided' },
                      { icon: Bike,     label: 'Vehicle Type',        value: selected.vehicle_type },
                      { icon: Calendar, label: 'Registration Date',   value: new Date(selected.created_at).toLocaleDateString() },
                    ].map((item, idx) => (
                      <div key={idx} className="px-4 py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <item.icon size={13} className="text-gray-400" />
                          <span className="text-xs text-gray-500 font-medium">{item.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-navy text-right">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selected.rejection_note && (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    <p className="text-xs font-semibold text-red-500 mb-1">Rejection Note</p>
                    <p className="text-sm text-red-700">{selected.rejection_note}</p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex gap-3">
                {selected.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => { updateStatus(selected.id, 'active'); setShowModal(null) }}
                      className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-sm"
                    >
                      ✓ Activate
                    </button>
                    <button
                      onClick={() => { updateStatus(selected.id, 'rejected'); setShowModal(null) }}
                      className="px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-all"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowModal('edit')}
                    className="w-full py-2.5 bg-navy text-white rounded-xl text-sm font-bold hover:bg-primary transition-all"
                  >
                    Edit Partner
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
