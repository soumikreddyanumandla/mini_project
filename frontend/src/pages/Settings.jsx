// src/pages/Settings.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { settingsAPI } from '../services/api';
import { User, Lock, Trash2, CheckCircle, AlertCircle, Eye, EyeOff, Save, Sun, Moon } from 'lucide-react';

function Alert({ type, message }) {
  if (!message) return null;
  const ok = type === 'success';
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm
      ${ok ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500'
           : 'bg-red-500/10 border border-red-500/20 text-red-500'}`}>
      {ok ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}{message}
    </div>
  );
}

function Field({ label, type='text', value, onChange, placeholder, hint }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">{label}</label>
      <div className="relative">
        <input type={isPassword && show ? 'text' : type} value={value} onChange={onChange} placeholder={placeholder}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700
            rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-indigo-500 transition pr-10"/>
        {isPassword && (
          <button type="button" onClick={() => setShow(s=>!s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            {show ? <EyeOff size={16}/> : <Eye size={16}/>}
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function Section({ icon: Icon, title, subtitle, iconColor='text-indigo-400', iconBg='bg-indigo-500/20', children }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon size={18} className={iconColor}/>
        </div>
        <div>
          <h2 className="font-semibold text-sm text-slate-900 dark:text-white">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function Settings() {
  const { admin, login, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ fullName:'', email:'' });
  const [profileMsg, setProfileMsg] = useState({ type:'', text:'' });
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [passwordMsg, setPasswordMsg] = useState({ type:'', text:'' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteMsg, setDeleteMsg] = useState({ type:'', text:'' });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteSection, setShowDeleteSection] = useState(false);

  useEffect(() => {
    settingsAPI.getProfile()
      .then(r => setProfile({ fullName: r.data.fullName, email: r.data.email }))
      .catch(()=>{});
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ type:'', text:'' });
    if (!profile.fullName.trim() || !profile.email.trim()) {
      setProfileMsg({ type:'error', text:'All fields are required.' }); return;
    }
    setProfileLoading(true);
    try {
      const { data } = await settingsAPI.updateProfile(profile);
      login({ token: localStorage.getItem('survey_token'), ...data, adminId: data.id });
      setProfileMsg({ type:'success', text:'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type:'error', text: err.response?.data?.message || 'Update failed.' });
    } finally { setProfileLoading(false); }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type:'', text:'' });
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setPasswordMsg({ type:'error', text:'All fields are required.' }); return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg({ type:'error', text:'New passwords do not match.' }); return;
    }
    if (passwords.newPassword.length < 6) {
      setPasswordMsg({ type:'error', text:'Minimum 6 characters.' }); return;
    }
    setPasswordLoading(true);
    try {
      await settingsAPI.changePassword(passwords);
      setPasswordMsg({ type:'success', text:'Password changed! Logging out...' });
      setPasswords({ currentPassword:'', newPassword:'', confirmPassword:'' });
      setTimeout(() => { logout(); navigate('/login'); }, 2000);
    } catch (err) {
      setPasswordMsg({ type:'error', text: err.response?.data?.message || 'Change failed.' });
    } finally { setPasswordLoading(false); }
  };

  const handleDeleteAccount = async () => {
    setDeleteMsg({ type:'', text:'' });
    if (deleteConfirmText !== 'DELETE') {
      setDeleteMsg({ type:'error', text:'Please type DELETE to confirm.' }); return;
    }
    if (!deletePassword) {
      setDeleteMsg({ type:'error', text:'Password is required.' }); return;
    }
    setDeleteLoading(true);
    try {
      await settingsAPI.deleteAccount({ confirmPassword: deletePassword });
      logout(); navigate('/login');
    } catch (err) {
      setDeleteMsg({ type:'error', text: err.response?.data?.message || 'Deletion failed.' });
    } finally { setDeleteLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account and preferences.</p>
      </div>

      {/* ── Theme Toggle ── */}
      <Section icon={isDark ? Moon : Sun} title="Appearance"
        subtitle="Switch between dark and light mode"
        iconColor={isDark ? 'text-indigo-400' : 'text-yellow-500'}
        iconBg={isDark ? 'bg-indigo-500/20' : 'bg-yellow-500/15'}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </p>
            <p className="text-slate-500 text-xs mt-0.5">
              {isDark ? 'Switch to light mode for a brighter look' : 'Switch to dark mode for easier reading'}
            </p>
          </div>
          <button onClick={toggleTheme}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none
              ${isDark ? 'bg-indigo-600' : 'bg-slate-300'}`}>
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all duration-300
              ${isDark ? 'left-8' : 'left-1'}`}/>
          </button>
        </div>
      </Section>

      {/* ── Edit Profile ── */}
      <Section icon={User} title="Edit Profile" subtitle="Update your display name and email address">
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <Field label="Full Name" value={profile.fullName}
            onChange={e => setProfile(p=>({...p, fullName: e.target.value}))} placeholder="Your full name"/>
          <Field label="Email Address" type="email" value={profile.email}
            onChange={e => setProfile(p=>({...p, email: e.target.value}))}
            placeholder="you@example.com" hint="Changing email will require logging in again."/>
          <Alert type={profileMsg.type} message={profileMsg.text}/>
          <div className="flex justify-end">
            <button type="submit" disabled={profileLoading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                text-white font-semibold px-5 py-2.5 rounded-lg transition text-sm">
              <Save size={15}/>{profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Section>

      {/* ── Change Password ── */}
      <Section icon={Lock} title="Change Password"
        subtitle="Use a strong password you don't use elsewhere"
        iconColor="text-violet-400" iconBg="bg-violet-500/20">
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Field label="Current Password" type="password" value={passwords.currentPassword}
            onChange={e => setPasswords(p=>({...p, currentPassword: e.target.value}))} placeholder="••••••••"/>
          <Field label="New Password" type="password" value={passwords.newPassword}
            onChange={e => setPasswords(p=>({...p, newPassword: e.target.value}))}
            placeholder="••••••••" hint="Minimum 6 characters."/>
          <Field label="Confirm New Password" type="password" value={passwords.confirmPassword}
            onChange={e => setPasswords(p=>({...p, confirmPassword: e.target.value}))} placeholder="••••••••"/>
          <Alert type={passwordMsg.type} message={passwordMsg.text}/>
          <div className="flex justify-end">
            <button type="submit" disabled={passwordLoading}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50
                text-white font-semibold px-5 py-2.5 rounded-lg transition text-sm">
              <Lock size={15}/>{passwordLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </Section>

      {/* ── Account Info ── */}
      <Section icon={User} title="Account Info" subtitle="Your current account details"
        iconColor="text-emerald-400" iconBg="bg-emerald-500/20">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label:'Full Name',  value: admin?.fullName },
            { label:'Email',      value: admin?.email },
            { label:'Role',       value: 'Administrator' },
            { label:'Account ID', value: `#${admin?.id}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{label}</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{value}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Danger Zone ── */}
      <Section icon={Trash2} title="Danger Zone" subtitle="Irreversible and destructive actions"
        iconColor="text-red-400" iconBg="bg-red-500/20">
        {!showDeleteSection ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Delete Account</p>
              <p className="text-slate-500 text-xs mt-0.5">Permanently deletes your account and all surveys.</p>
            </div>
            <button onClick={() => setShowDeleteSection(true)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                border border-red-300 dark:border-red-500/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition">
              <Trash2 size={14}/> Delete Account
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-sm font-semibold mb-1">⚠️ This action is permanent</p>
              <p className="text-red-500/80 text-xs">All surveys, questions and responses will be deleted forever.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                Type <span className="text-red-500 font-bold">DELETE</span> to confirm
              </label>
              <input type="text" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-red-300 dark:border-red-500/30
                  rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400
                  focus:outline-none focus:ring-2 focus:ring-red-500 transition"/>
            </div>
            <Field label="Enter your password to confirm" type="password"
              value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="••••••••"/>
            <Alert type={deleteMsg.type} message={deleteMsg.text}/>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setShowDeleteSection(false); setDeleteConfirmText(''); setDeletePassword(''); setDeleteMsg({type:'',text:''}); }}
                className="px-4 py-2 text-sm border border-slate-300 dark:border-slate-700
                  text-slate-600 dark:text-slate-400 rounded-lg transition">
                Cancel
              </button>
              <button onClick={handleDeleteAccount}
                disabled={deleteLoading || deleteConfirmText !== 'DELETE' || !deletePassword}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                  bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition">
                <Trash2 size={14}/>{deleteLoading ? 'Deleting...' : 'Permanently Delete Account'}
              </button>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}
