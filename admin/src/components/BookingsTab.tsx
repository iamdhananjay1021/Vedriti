'use client';

import React, { useState } from 'react';
import {
  Flame,
  Search,
  Filter,
  CheckCircle,
  Clock,
  User,
  Users,
  MapPin,
  FileText,
  X,
  Sparkles,
  Phone,
  Send,
  Download,
} from 'lucide-react';
import { AdminPujaBooking, BookingStatus } from '../types/admin';

interface BookingsTabProps {
  bookings: AdminPujaBooking[];
  onUpdateBooking: (updated: AdminPujaBooking) => void;
  selectedBookingForModal?: AdminPujaBooking | null;
  onCloseModal?: () => void;
}

export const BookingsTab: React.FC<BookingsTabProps> = ({
  bookings,
  onUpdateBooking,
  selectedBookingForModal = null,
  onCloseModal,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalBooking, setActiveModalBooking] = useState<AdminPujaBooking | null>(
    selectedBookingForModal
  );
  const [assigningAcharya, setAssigningAcharya] = useState<string>('');
  const [showCertificateBanner, setShowCertificateBanner] = useState(false);

  // Sync with prop if provided
  React.useEffect(() => {
    if (selectedBookingForModal) {
      setActiveModalBooking(selectedBookingForModal);
      setAssigningAcharya(selectedBookingForModal.assignedAcharya || '');
    }
  }, [selectedBookingForModal]);

  const availableAcharyas = [
    'पं. विद्याधर शास्त्री (काशी - ऋग्वेद संहिता एवं रुद्राभिषेक)',
    'पं. ओंकार नाथ दीक्षित (काशी - वास्तु शांति एवं नवग्रह)',
    'पं. रामेश्वर त्रिपाठी (उज्जैन - कालसर्प एवं महाकाल)',
    'पं. सत्यनारायण पाठक (अयोध्या - श्री रामानुग्रह एवं हनुमान आराधना)',
    'पं. गिरधारी लाल शर्मा (हरिद्वार - गंगा पूजन एवं पितृ तर्पण)',
  ];

  const filteredBookings = bookings.filter((item) => {
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.devoteeName.toLowerCase().includes(q) ||
      item.gotra.toLowerCase().includes(q) ||
      item.referenceNo.toLowerCase().includes(q) ||
      item.pujaTitle.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const handleOpenModal = (b: AdminPujaBooking) => {
    setActiveModalBooking(b);
    setAssigningAcharya(b.assignedAcharya || '');
    setShowCertificateBanner(false);
  };

  const handleCloseModal = () => {
    setActiveModalBooking(null);
    if (onCloseModal) onCloseModal();
  };

  const handleSaveAssignment = () => {
    if (!activeModalBooking) return;
    const updated: AdminPujaBooking = {
      ...activeModalBooking,
      assignedAcharya: assigningAcharya || activeModalBooking.assignedAcharya,
      status: activeModalBooking.status === 'Pending Sankalp' ? 'Assigned' : activeModalBooking.status,
    };
    onUpdateBooking(updated);
    setActiveModalBooking(updated);
  };

  const handleGenerateCertificate = () => {
    if (!activeModalBooking) return;
    const updated: AdminPujaBooking = {
      ...activeModalBooking,
      sankalpPatraGenerated: true,
      status: 'Completed',
    };
    onUpdateBooking(updated);
    setActiveModalBooking(updated);
    setShowCertificateBanner(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div
        className="p-4 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        {/* Status Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['All', 'Pending Sankalp', 'Assigned', 'In Progress', 'Completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === st ? 'shadow-sm' : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: statusFilter === st ? 'var(--saffron)' : 'var(--bg-hover)',
                color: statusFilter === st ? '#FFFFFF' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
              }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border w-full md:w-72"
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
            placeholder="Search Gotra, Devotee, Ref..."
            className="w-full text-xs bg-transparent focus:outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Bookings Table / Card View */}
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
                <th className="py-3 px-4 font-semibold">Reference & Puja</th>
                <th className="py-3 px-4 font-semibold">Devotee & Gotra</th>
                <th className="py-3 px-4 font-semibold">Muhurat & Date</th>
                <th className="py-3 px-4 font-semibold">Assigned Acharya</th>
                <th className="py-3 px-4 font-semibold">Dakshina</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:opacity-90 transition-opacity">
                  {/* Reference & Puja */}
                  <td className="py-3 px-4">
                    <span className="font-mono text-[10px] block" style={{ color: 'var(--text-muted)' }}>
                      {b.referenceNo}
                    </span>
                    <span className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                      {b.pujaTitle}
                    </span>
                    <span className="text-[10px] block" style={{ color: 'var(--text-secondary)' }}>
                      {b.packageType}
                    </span>
                  </td>

                  {/* Devotee & Gotra */}
                  <td className="py-3 px-4">
                    <span className="font-bold block" style={{ color: 'var(--text-primary)' }}>
                      {b.devoteeName}
                    </span>
                    <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 block">
                      {b.gotra}
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {b.city}
                    </span>
                  </td>

                  {/* Muhurat & Date */}
                  <td className="py-3 px-4">
                    <span className="font-medium block" style={{ color: 'var(--text-primary)' }}>
                      {b.bookingDate}
                    </span>
                    <span className="text-[10.5px]" style={{ color: 'var(--text-muted)' }}>
                      {b.muhuratTime}
                    </span>
                  </td>

                  {/* Assigned Acharya */}
                  <td className="py-3 px-4">
                    {b.assignedAcharya ? (
                      <span className="font-medium text-[11px]" style={{ color: 'var(--text-primary)' }}>
                        {b.assignedAcharya}
                      </span>
                    ) : (
                      <span className="text-[11px] italic font-medium text-amber-600">
                        Pending Assignment
                      </span>
                    )}
                  </td>

                  {/* Dakshina */}
                  <td className="py-3 px-4">
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                      ₹{b.dakshinaAmount}
                    </span>
                    <span className="text-[10px] block text-emerald-600 font-medium">
                      {b.paymentStatus}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block"
                      style={{
                        backgroundColor:
                          b.status === 'Completed'
                            ? 'var(--green-bg)'
                            : b.status === 'In Progress'
                            ? 'rgba(37, 99, 235, 0.1)'
                            : 'var(--saffron-light)',
                        color:
                          b.status === 'Completed'
                            ? 'var(--green)'
                            : b.status === 'In Progress'
                            ? '#2563EB'
                            : 'var(--saffron)',
                      }}
                    >
                      {b.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenModal(b)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold border transition-all hover:border-amber-600 cursor-pointer"
                      style={{
                        backgroundColor: 'var(--bg-hover)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      Inspect Gotra
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
            No bookings found matching filter or search query.
          </div>
        )}
      </div>

      {/* Gotra & Sankalp Inspector Modal */}
      {activeModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="w-full max-w-2xl rounded-2xl border shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
            }}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between pb-4 border-b"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--saffron-light)',
                    color: 'var(--saffron)',
                  }}
                >
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    वैदिक संकल्प एवं गोत्र विवरण
                  </h3>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    {activeModalBooking.referenceNo} • {activeModalBooking.pujaTitle}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-75 transition-opacity"
                style={{
                  backgroundColor: 'var(--bg-hover)',
                  color: 'var(--text-secondary)',
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="py-4 space-y-4 overflow-y-auto">
              {showCertificateBanner && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>
                    श्री काशी विश्वनाथ डिजिटल संकल्प पत्र सफलता पूर्वक तैयार कर लिया गया है एवं यजमान के WhatsApp पर प्रेषित हो चुका है!
                  </span>
                </div>
              )}

              {/* Devotee Info Card */}
              <div
                className="p-4 rounded-xl border grid grid-cols-2 gap-3"
                style={{
                  backgroundColor: 'var(--bg-hover)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div>
                  <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>
                    यजमान का नाम
                  </span>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {activeModalBooking.devoteeName}
                  </span>
                  <span className="text-xs block" style={{ color: 'var(--text-secondary)' }}>
                    {activeModalBooking.devoteePhone}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>
                    गोत्र एवं कुलदेवी
                  </span>
                  <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                    {activeModalBooking.gotra}
                  </span>
                  <span className="text-xs block" style={{ color: 'var(--text-secondary)' }}>
                    कुलदेवी: {activeModalBooking.kuldevi}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>
                    नगर एवं स्थान
                  </span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {activeModalBooking.city}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>
                    संकल्प मुहूर्त
                  </span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {activeModalBooking.bookingDate} ({activeModalBooking.muhuratTime})
                  </span>
                </div>
              </div>

              {/* Family Members in Sankalp */}
              <div
                className="p-4 rounded-xl border space-y-2"
                style={{
                  backgroundColor: 'var(--bg-hover)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                  <Users className="w-4 h-4" style={{ color: 'var(--saffron)' }} />
                  <span>सपरिवार संकल्पित सदस्यगण ({activeModalBooking.familyMembers.length})</span>
                </div>

                {activeModalBooking.familyMembers.length === 0 ? (
                  <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
                    व्यक्तिगत यजमान संकल्प (कोई अन्य सदस्य सम्मिलित नहीं)।
                  </p>
                ) : (
                  <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                    {activeModalBooking.familyMembers.map((m, idx) => (
                      <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {m.name} ({m.relation})
                        </span>
                        <div className="flex items-center gap-3">
                          <span style={{ color: 'var(--text-secondary)' }}>{m.gotra}</span>
                          {m.rashi && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium">
                              {m.rashi}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Special Sankalp Intent */}
              {activeModalBooking.specialSankalp && (
                <div
                  className="p-4 rounded-xl border"
                  style={{
                    backgroundColor: 'var(--bg-hover)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <span className="text-[10px] block font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    विशेष मनोरथ एवं संपुटित संकल्प
                  </span>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                    "{activeModalBooking.specialSankalp}"
                  </p>
                </div>
              )}

              {/* Acharya Assignment Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                  काशी वैदिक आचार्य नियुक्त करें
                </label>
                <div className="flex gap-2">
                  <select
                    value={assigningAcharya}
                    onChange={(e) => setAssigningAcharya(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl border text-xs focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="">-- आचार्य चयन करें --</option>
                    {availableAcharyas.map((ach) => (
                      <option key={ach} value={ach}>
                        {ach}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSaveAssignment}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 cursor-pointer"
                    style={{ backgroundColor: 'var(--saffron)' }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div
              className="pt-4 border-t flex flex-wrap items-center justify-between gap-3"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                  Dakshina: ₹{activeModalBooking.dakshinaAmount}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold px-2 py-0.5 rounded bg-emerald-500/10">
                  {activeModalBooking.paymentStatus}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateCertificate}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border hover:border-amber-600 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--bg-hover)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <Download className="w-3.5 h-3.5 text-amber-600" />
                  Generate Digital Sankalp Patra
                </button>

                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  style={{
                    backgroundColor: 'var(--bg-hover)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
