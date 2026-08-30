import React, { useState } from 'react'
import { UserRound, LockKeyhole, EyeOff, Eye, ChevronRight, Box } from 'lucide-react'
import type { BrandingSettings } from '../../types'

export function LoginScreen({ onLogin, branding }: { onLogin: (username: string, password: string) => Promise<boolean>; branding: BrandingSettings }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (submitting) return; 
    setSubmitting(true); 
    try { 
      if (!await onLogin(username.trim(), password)) { 
        setError('Tên đăng nhập hoặc mật khẩu không đúng.'); 
        setPassword('') 
      } 
    } finally { 
      setSubmitting(false) 
    } 
  }
  
  const logo = branding.logoDataUrl ? <img src={branding.logoDataUrl} alt="Logo" className="w-8 h-8 object-contain" /> : <Box size={24} />
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <section className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            {logo}
          </div>
          <div>
            <b className="block text-xl font-bold tracking-tight text-gray-900">{branding.appName}</b>
            <strong className="block text-sm font-medium text-gray-600">{branding.companyName}</strong>
            <small className="block text-xs text-gray-400 mt-1">{branding.tagline}</small>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Đăng nhập hệ thống</h2>
          <p className="text-sm text-gray-500">Tài khoản quản trị ban đầu được tạo trong quá trình cài đặt hệ thống.</p>
        </div>
        
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên đăng nhập</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <UserRound size={18} />
              </div>
              <input 
                autoFocus 
                required 
                autoComplete="username" 
                value={username} 
                onChange={e => { setUsername(e.target.value); setError('') }} 
                placeholder="Nhập tên đăng nhập"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <LockKeyhole size={18} />
              </div>
              <input 
                required 
                autoComplete="current-password" 
                type={show ? 'text' : 'password'} 
                value={password} 
                onChange={e => { setPassword(e.target.value); setError('') }} 
                placeholder="Nhập mật khẩu"
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
              />
              <button 
                type="button" 
                onClick={() => setShow(x => !x)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>
          
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">{error}</div>}
          
          <button 
            disabled={submitting} 
            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-70"
          >
            {submitting ? 'Đang xác thực...' : 'Đăng nhập'} <ChevronRight size={18} />
          </button>
        </form>
        
        <footer className="mt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} {branding.companyName}
        </footer>
      </section>
    </div>
  )
}
