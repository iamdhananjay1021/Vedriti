'use client';

import React, { useState } from 'react';
import {
  Users,
  Shield,
  Sparkles,
  Search,
  CheckCircle2,
  Send,
  Building,
  Award,
  CreditCard,
  Check,
} from 'lucide-react';
import { AdminDevotee, AcharyaPayout } from '../types/admin';

interface DevoteesTabProps {
  devotees: AdminDevotee[];
  payouts: AcharyaPayout[];
  onSettlePayout: (payoutId: string) => void;
}

export const DevoteesTab: React.FC<DevoteesTabProps> = ({
  devotees,
  payouts,
  onSettlePayout,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'devotees' | 'payouts'>('devotees');
  const [searchQuery, setSearchQuery] = useState('');
  const [settledAcharyaId, setSettledAcharyaId] = useState<string | null>(null);

  const filteredDevotees = devotees.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.gotra.toLowerCase().includes(q) ||
      d.city.toLowerCase().includes(q) ||
      d.phone.includes(q)
    );
  });

  const handleSettle = (id: string) => {
    onSettlePayout(id);
    setSettledAcharyaId(id);
    setTimeout(() => setSettledAcharyaId(null), 4000);
  };

  const totalPendingDakshina = payouts.reduce((acc, p) => acc + p.pendingDakshina, 0);
  const totalSettledDakshina = payouts.reduce((acc, p) => acc + p.paidDakshina, 0);

  return (
    <div className="space-y-6">
      {/* Subtab navigation */}
      <div
        className="p-4 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('devotees')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'devotees' ? 'shadow-sm' : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: activeSubTab === 'devotees' ? 'var(--saffron)' : 'var(--bg-hover)',
              color: activeSubTab === 'devotees' ? '#FFFFFF' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
            }}
          >
            <Users className="w-3.5 h-3.5" /> Devotees Directory ({devotees.length})
          </button>

          <button
            onClick={() => setActiveSubTab('payouts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'payouts' ? 'shadow-sm' : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: activeSubTab === 'payouts' ? 'var(--saffron)' : 'var(--bg-hover)',
              color: activeSubTab === 'payouts' ? '#FFFFFF' : 'var(--text-secondary)',
              border: '1px solid var(--border-color)',
            }}
          >
            <Award className="w-3.5 h-3.5" /> Acharya Dakshina Payouts ({payouts.length})
          </button>
        </div>

        {activeSubTab === 'devotees' && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border w-full sm:w-64"
            style={{
              backgroundColor: 'var(--bg-hover)',
              borderColor: 'var(--border-color)',
            }}
          >
            <Search className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search devotee or gotra..."
              className="w-full text-xs bg-transparent focus:outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
        )}
      </div>

      {settledAcharyaId && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>आचार्य दक्षिणा सफलतापूर्वक Direct UPI / Bank Transfer द्वारा प्रेषित कर दी गई है!</span>
        </div>
      )}

      {/* View 1: Devotees Directory */}
      {activeSubTab === 'devotees' && (
        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr
                  className="border-b"
                  style={{
                    backgroundColor: 'var(--bg-hover)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <th className="py-3 px-4 font-semibold">Devotee Name</th>
                  <th className="py-3 px-4 font-semibold">Gotra & City</th>
                  <th className="py-3 px-4 font-semibold">Contact (Phone & Email)</th>
                  <th className="py-3 px-4 font-semibold">Pujas Booked</th>
                  <th className="py-3 px-4 font-semibold">Store Orders</th>
                  <th className="py-3 px-4 font-semibold">Punya Points</th>
                  <th className="py-3 px-4 font-semibold">Member Since</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                {filteredDevotees.map((d) => (
                  <tr key={d.id} className="hover:opacity-90 transition-opacity">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                          {d.name}
                        </span>
                        {d.isVip && (
                          <span
                            className="text-[9.5px] px-1.5 py-0.5 rounded font-extrabold flex items-center gap-0.5"
                            style={{
                              backgroundColor: 'rgba(212, 175, 55, 0.15)',
                              color: '#D4AF37',
                              border: '1px solid rgba(212, 175, 55, 0.3)',
                            }}
                          >
                            <Sparkles className="w-2.5 h-2.5" /> VIP
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-amber-700 dark:text-amber-400 block">
                        {d.gotra}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {d.city}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="block font-medium" style={{ color: 'var(--text-primary)' }}>
                        {d.phone}
                      </span>
                      {d.email && (
                        <span className="text-[10px] block" style={{ color: 'var(--text-secondary)' }}>
                          {d.email}
                        </span>
                      )}
                      <span
                        className="text-[9px] px-1.5 py-0.2 rounded font-semibold inline-block mt-0.5"
                        style={{
                          backgroundColor: d.signupMethod === 'email' ? 'rgba(37, 99, 235, 0.1)' : 'var(--saffron-light)',
                          color: d.signupMethod === 'email' ? '#2563EB' : 'var(--saffron)',
                        }}
                      >
                        {d.signupMethod === 'email' ? '📧 Email Auth' : '📱 Mobile OTP'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold" style={{ color: 'var(--text-primary)' }}>
                      {d.totalPujas}
                    </td>

                    <td className="py-3 px-4 font-bold" style={{ color: 'var(--text-primary)' }}>
                      {d.totalStoreOrders}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block"
                        style={{
                          backgroundColor: 'var(--saffron-light)',
                          color: 'var(--saffron)',
                        }}
                      >
                        {d.punyaPoints} Punya
                      </span>
                    </td>

                    <td className="py-3 px-4" style={{ color: 'var(--text-muted)' }}>
                      {d.joinedDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 2: Acharya Dakshina Payouts */}
      {activeSubTab === 'payouts' && (
        <div className="space-y-6">
          {/* Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className="p-4 rounded-2xl border flex items-center justify-between"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Total Pending Dakshina Distribution
                </span>
                <div className="text-xl font-bold mt-1" style={{ color: 'var(--saffron)' }}>
                  ₹{totalPendingDakshina.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Award className="w-5 h-5" />
              </div>
            </div>

            <div
              className="p-4 rounded-2xl border flex items-center justify-between"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Total Settled Dakshina (YTD)
                </span>
                <div className="text-xl font-bold mt-1 text-emerald-600">
                  ₹{totalSettledDakshina.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Acharyas Cards */}
          <div className="grid grid-cols-1 gap-4">
            {payouts.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-amber-600/40"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-serif font-bold text-base"
                    style={{
                      backgroundColor: 'var(--saffron-light)',
                      color: 'var(--saffron)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    आ
                  </div>

                  <div>
                    <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {p.acharyaName}
                    </h3>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {p.vedicSpecialty}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      <span>{p.completedPujasCount} Completed Anushthans</span>
                      <span>•</span>
                      <span>Bank: {p.bankAccount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="text-right sm:text-left">
                    <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>
                      Pending Dakshina
                    </span>
                    <span className="text-base font-bold" style={{ color: p.pendingDakshina > 0 ? 'var(--saffron)' : 'var(--text-muted)' }}>
                      ₹{p.pendingDakshina.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] block text-emerald-600">
                      Settled: ₹{p.paidDakshina.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {p.pendingDakshina > 0 ? (
                    <button
                      onClick={() => handleSettle(p.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer"
                      style={{ backgroundColor: 'var(--saffron)' }}
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Settle Dakshina
                    </button>
                  ) : (
                    <div className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Settled
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
