'use client';

import React, { useState } from 'react';
import {
  Search,
  Sun,
  Moon,
  Bell,
  Sparkles,
  UserCheck,
  Check,
  Calendar,
  X,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (query: string) => void;
  activeTabTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  searchTerm,
  onSearchChange,
  activeTabTitle,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'नूतन महा रुद्राभिषेक संकल्प प्राप्त',
      desc: 'राहुल शर्मा (कश्यप गोत्र) ने ब्रह्म मुहूर्त रुद्राभिषेक बुक किया।',
      time: '5 मिनट पूर्व',
      unread: true,
    },
    {
      id: 2,
      title: 'BlueDart प्रसाद पार्सल AWB जारी',
      desc: 'AWB #BD-VR-90812341 (नेपाली रुद्राक्ष माला) पिकअप हेतु तैयार।',
      time: '28 मिनट पूर्व',
      unread: true,
    },
    {
      id: 3,
      title: 'आचार्य दक्षिणा अनुमोदन शेष',
      desc: 'पं. विद्याधर शास्त्री (काशी) के 3 महायज्ञ दक्षिणा वितरण हेतु उपलब्ध।',
      time: '1 घंटा पूर्व',
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <header
      className="sticky top-0 z-20 h-16 border-b px-6 flex items-center justify-between backdrop-blur-md transition-colors"
      style={{
        backgroundColor:
          theme === 'dark' ? 'rgba(21, 16, 12, 0.88)' : 'rgba(255, 255, 255, 0.92)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Title & Live Panchang Ticker */}
      <div className="flex items-center gap-4">
        <div>
          <h1
            className="text-base font-bold tracking-tight capitalize"
            style={{ color: 'var(--text-primary)' }}
          >
            {activeTabTitle}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="text-[10px] font-medium flex items-center gap-1"
              style={{ color: 'var(--text-muted)' }}
            >
              <Calendar className="w-3 h-3 text-amber-600" />
              कार्तिक कृष्ण पक्ष • काशी संवत् २०८३ • शुभ मुहूर्त सक्रिय
            </span>
          </div>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all focus-within:ring-2 focus-within:ring-amber-500/20"
          style={{
            backgroundColor: 'var(--bg-hover)',
            borderColor: 'var(--border-color)',
          }}
        >
          <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by devotee, Gotra, AWB, or reference..."
            className="w-full text-xs bg-transparent focus:outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="p-0.5 hover:opacity-75"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Controls: Theme Toggle, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Dark / Light Mode Switcher */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all hover:opacity-90 cursor-pointer"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span className="hidden sm:inline text-[11px] font-semibold">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-700" />
              <span className="hidden sm:inline text-[11px] font-semibold">Dark</span>
            </>
          )}
        </button>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-9 h-9 rounded-xl border flex items-center justify-center transition-all hover:opacity-90"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)',
            }}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-extrabold rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: 'var(--saffron)' }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div
                className="flex items-center justify-between pb-3 border-b"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    Sanctum Alerts
                  </span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                    style={{
                      backgroundColor: 'var(--saffron-light)',
                      color: 'var(--saffron)',
                    }}
                  >
                    {unreadCount} New
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-medium hover:underline flex items-center gap-1"
                    style={{ color: 'var(--saffron)' }}
                  >
                    <Check className="w-3 h-3" /> Mark read
                  </button>
                )}
              </div>

              <div className="divide-y max-h-72 overflow-y-auto" style={{ borderColor: 'var(--border-color)' }}>
                {notifications.map((item) => (
                  <div key={item.id} className="py-2.5 flex flex-col gap-1 hover:opacity-90 transition-opacity">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-medium ${item.unread ? 'font-bold' : ''}`}
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {item.title}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Chip */}
        <div
          className="flex items-center gap-2.5 pl-3 border-l"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
            style={{
              backgroundColor: 'var(--saffron)',
              color: '#FFFFFF',
            }}
          >
            आ
          </div>
          <div className="hidden lg:flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                आचार्य अध्यक्ष
              </span>
              <UserCheck className="w-3 h-3 text-emerald-500" />
            </div>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Chief Priest (Sanctum Admin)
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
