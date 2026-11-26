import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Palette, Shield, LogOut, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [savingAccount, setSavingAccount] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('studysync_notif_prefs');
      return saved
        ? JSON.parse(saved)
        : {
            groupInvites: true,
            sessionReminders: true,
            resourceAlerts: true,
            partnerMatches: true,
          };
    } catch {
      return {
        groupInvites: true,
        sessionReminders: true,
        resourceAlerts: true,
        partnerMatches: true,
      };
    }
  });

  const [theme, setTheme] = useState(
    () => localStorage.getItem('studysync_theme') || 'light'
  );

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSavingAccount(true);
    try {
      await updateUser({ full_name: fullName.trim() });
      toast.success('Account settings updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update account');
    } finally {
      setSavingAccount(false);
    }
  };

  const toggleNotif = (key) => {
    setNotifPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('studysync_notif_prefs', JSON.stringify(next));
      toast.success('Notification preference saved');
      return next;
    });
  };

  const handleThemeChange = (nextTheme) => {
    setTheme(nextTheme);
    localStorage.setItem('studysync_theme', nextTheme);
    toast.success(`Theme preference set to ${nextTheme}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage your account, notifications, and display preferences
        </p>
      </div>

      {/* Account Settings */}
      <Card hover={false}>
        <div className="flex items-center gap-2.5 mb-4">
          <Shield className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900">
            Account Settings
          </h2>
        </div>

        <form onSubmit={handleSaveAccount} className="space-y-4">
          <Input
            label="Display Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input
            label="Email Address"
            value={user?.email || ''}
            disabled
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" loading={savingAccount}>
              <Save className="w-4 h-4" />
              Save Account
            </Button>
          </div>
        </form>
      </Card>

      {/* Notification Preferences */}
      <Card hover={false}>
        <div className="flex items-center gap-2.5 mb-4">
          <Bell className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900">
            Notification Preferences
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {[
            {
              key: 'groupInvites',
              label: 'Group Invites & Join Requests',
              desc: 'Get notified when someone invites you or requests to join your group',
            },
            {
              key: 'sessionReminders',
              label: 'Study Session Reminders',
              desc: 'Reminders before your scheduled study sessions begin',
            },
            {
              key: 'resourceAlerts',
              label: 'Shared Resources',
              desc: 'Alerts when new study materials are uploaded to your groups',
            },
            {
              key: 'partnerMatches',
              label: 'Partner Matches',
              desc: 'Notifications when high-compatibility study partners join',
            },
          ].map((item) => (
            <div
              key={item.key}
              className="py-3.5 flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {item.label}
                </p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifPrefs[item.key]}
                onClick={() => toggleNotif(item.key)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  notifPrefs[item.key] ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                    notifPrefs[item.key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Theme Preference */}
      <Card hover={false}>
        <div className="flex items-center gap-2.5 mb-4">
          <Palette className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900">
            Theme Preference
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light (Default)', desc: 'Clean bright workspace' },
            { id: 'soft', label: 'Soft Slate', desc: 'Reduced contrast glare' },
            { id: 'system', label: 'System', desc: 'Match OS appearance' },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleThemeChange(opt.id)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                theme === opt.id
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <p className="text-sm font-semibold text-slate-900">{opt.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Sign out */}
      <Card hover={false}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Sign Out</h2>
            <p className="text-xs text-slate-500">
              End your current session on this device
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Log Out
          </Button>
        </div>
      </Card>
    </div>
  );
}
