import { useState } from 'react'
import { User, Lock, Shield, AlertTriangle, Save, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' })
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })
  const [showPasswords, setShowPasswords] = useState({ current: false, newPass: false, confirm: false })
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [saved, setSaved] = useState('')
  const [passError, setPassError] = useState('')

  const handleProfileSave = (e) => {
    e.preventDefault()
    // TODO: API call to update profile
    setSaved('Profile updated successfully!')
    setTimeout(() => setSaved(''), 3000)
  }

  const handlePasswordChange = (e) => {
    e.preventDefault()
    setPassError('')
    if (passwords.newPass.length < 8) { setPassError('Password must be at least 8 characters'); return }
    if (passwords.newPass !== passwords.confirm) { setPassError('Passwords do not match'); return }
    // TODO: API call to change password
    setPasswords({ current: '', newPass: '', confirm: '' })
    setSaved('Password changed successfully!')
    setTimeout(() => setSaved(''), 3000)
  }

  const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'security', label: 'Security', icon: Lock },
    { key: 'system', label: 'System', icon: Shield },
  ]

  return (
    <div className="max-w-3xl space-y-6">
      <div><h2 className="text-xl font-bold text-navy">Settings</h2><p className="text-sm text-gray-500">Manage your account and system settings.</p></div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium animate-slideDown">{saved}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${activeTab === t.key ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-navy mb-6">Edit Profile</h3>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-2xl font-bold">{profile.name.charAt(0)}</div>
              <div><p className="text-sm font-medium text-navy">{profile.name}</p><p className="text-xs text-gray-500">{user?.role || 'admin'}</p></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" /></div>
            <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark"><Save size={16} /> Save Changes</button>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-navy mb-6">Change Password</h3>
          {passError && <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{passError}</div>}
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {[
              { key: 'current', label: 'Current Password' },
              { key: 'newPass', label: 'New Password' },
              { key: 'confirm', label: 'Confirm New Password' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <div className="relative">
                  <input
                    type={showPasswords[field.key] ? 'text' : 'password'}
                    required value={passwords[field.key]}
                    onChange={e => setPasswords({...passwords, [field.key]: e.target.value})}
                    className="w-full px-3 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary"
                  />
                  <button type="button" onClick={() => setShowPasswords({...showPasswords, [field.key]: !showPasswords[field.key]})}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPasswords[field.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark"><Lock size={16} /> Change Password</button>
          </form>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          {/* Maintenance */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-base font-semibold text-navy mb-2">Maintenance Mode</h3>
            <p className="text-sm text-gray-500 mb-4">Enable to show a maintenance overlay on the public site.</p>
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
              <div>
                <p className="text-sm font-medium text-navy">Maintenance Mode</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {maintenanceMode ? 'Public site is showing maintenance page' : 'Public site is live'}
                </p>
              </div>
              <button onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`relative w-12 h-6 rounded-full transition-colors ${maintenanceMode ? 'bg-amber-500' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {maintenanceMode && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800 font-medium">⚠️ To apply this change:</p>
                <p className="text-xs text-amber-700 mt-1">Edit <code className="bg-amber-100 px-1.5 py-0.5 rounded">src/config/siteConfig.js</code> in the public site and set <code className="bg-amber-100 px-1.5 py-0.5 rounded">MAINTENANCE_MODE = true</code></p>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl border-2 border-red-100 p-6">
            <div className="flex items-center gap-2 mb-2"><AlertTriangle size={18} className="text-red-500" /><h3 className="text-base font-semibold text-red-600">Danger Zone</h3></div>
            <p className="text-sm text-gray-500 mb-4">Irreversible and destructive actions.</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-xl">
                <div><p className="text-sm font-medium text-navy">Log out all sessions</p><p className="text-xs text-gray-500">This will invalidate all active sessions.</p></div>
                <button onClick={logout} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50">Log out all</button>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-xl">
                <div><p className="text-sm font-medium text-navy">Delete account</p><p className="text-xs text-gray-500">Permanently remove admin access.</p></div>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 opacity-50 cursor-not-allowed" disabled>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
