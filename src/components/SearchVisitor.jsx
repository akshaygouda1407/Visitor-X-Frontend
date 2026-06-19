import React, { useState } from 'react';
import './global.css';

export default function SearchVisitor({ visitors = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('');

  // Fallback data structure to preview records if no parent state props are linked yet
  const fallbackRegistry = [
    { id: 1, name: 'Anjana Mohareer', phone: '8345454616', purpose: 'Internship', time: '25 May 2026, 09:30 AM', avatar: '👤' },
    { id: 2, name: 'Ravi Kumar', phone: '9876543210', purpose: 'Interview', time: '25 May 2026, 10:15 AM', avatar: '👤' },
    { id: 3, name: 'Priya Sharma', phone: '9988776655', purpose: 'Business Purpose', time: '25 May 2026, 10:42 AM', avatar: '👩' },
    { id: 4, name: 'Amit Verma', phone: '8765432109', purpose: 'Full-Time Employment', time: '25 May 2026, 11:00 AM', avatar: '🧑' }
  ];

  const dataRecords = visitors.length > 0 ? visitors : fallbackRegistry;

  // Normalizes purpose fields to attach CSS styling classes dynamically
  const getBadgeClass = (purpose) => {
    if (!purpose) return '';
    const norm = purpose.toLowerCase();
    if (norm.includes('interview')) return 'interview';
    if (norm.includes('business')) return 'business-purpose';
    if (norm.includes('intern')) return 'internship';
    if (norm.includes('employment') || norm.includes('full')) return 'full-time-employment';
    return '';
  };

  // Dual filtering execution layer
  const filteredVisitors = dataRecords.filter((visitor) => {
    const matchesSearch = 
      visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      visitor.phone.includes(searchTerm);
    
    const matchesPurpose = purposeFilter === '' || visitor.purpose === purposeFilter;

    return matchesSearch && matchesPurpose;
  });

  return (
    <div className="search-page-container">
      {/* Control Filters Area */}
      <div className="table-card">
        <div className="search-header-block">
          <h2>🔍 Advanced Directory Search</h2>
          <p>Query records across visitor identity details and registration categories instantly.</p>
        </div>

        <div className="search-filter-controls-row">
          {/* Text Input Element */}
          <div className="input-field-group filter-search-input">
            <label htmlFor="searchQuery">Search Visitor</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <span className="search-icon" style={{ left: '12px' }}>🔍</span>
              <input 
                id="searchQuery"
                type="text" 
                placeholder="Type name or mobile number..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          {/* Categorical Dropdown Filter Element */}
          <div className="input-field-group filter-dropdown-select">
            <label htmlFor="purposeSelect">Filter by Purpose</label>
            <select 
              id="purposeSelect"
              value={purposeFilter} 
              onChange={(e) => setPurposeFilter(e.target.value)}
              className="search-select-dropdown"
            >
              <option value="">✨ View All Purposes</option>
              <option value="Interview">Interview</option>
              <option value="Business Purpose">Business Purpose</option>
              <option value="Full-Time Employment">Full-Time Employment</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
        </div>
      </div>

      {/* Output Log Card Module */}
      <div className="table-card" style={{ marginTop: '24px' }}>
        <div className="table-toolbar" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', color: '#475569', fontWeight: 700 }}>
            Filtered Results ({filteredVisitors.length})
          </h3>
        </div>

        {/* Swipe scrolling horizontal container safe wrapper */}
        <div className="table-responsive">
          <table className="visitor-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Photo</th>
                <th>Name</th>
                <th>Mobile Number</th>
                <th>Purpose</th>
                <th>Check-In Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisitors.map((visitor, index) => (
                <tr key={visitor.id || index}>
                  <td style={{ fontWeight: 600, color: '#94a3b8' }}>{index + 1}</td>
                  <td>
                    <div style={{ fontSize: '20px', width: '32px', textAlign: 'center' }}>
                      {visitor.avatar || '👤'}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{visitor.name}</td>
                  <td style={{ color: '#475569', fontWeight: 500 }}>{visitor.phone}</td>
                  <td>
                    <span className={`badge-purpose ${getBadgeClass(visitor.purpose)}`}>
                      {visitor.purpose}
                    </span>
                  </td>
                  <td style={{ color: '#64748b' }}>{visitor.time}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredVisitors.length === 0 && (
            <div className="search-empty-state-notice">
              <span>📭</span>
              <p>No logged profile entries match current filter settings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}