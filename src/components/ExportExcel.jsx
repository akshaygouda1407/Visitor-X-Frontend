import React, { useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import './global.css';

export default function ExportExcel({ visitors = [] }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fallback structural utility functions syncing perfectly with AdminDashboard.jsx getters
  const getVisitorId = (v) => v.visitorId || v.id || v.visitorID || "";
  const getVisitorPhone = (v) => v.mobileNumber || v.phone || v.mobile || "";
  const getVisitorPurpose = (v) => v.purposeOfVisit || v.purpose || v.visitPurpose || "";
  const getVisitorTime = (v) => v.visitDateTime || v.checkInTime || v.createdAt || v.timestamp || "";
  const getVisitorPhoto = (v) => v.photoBase64 || v.photo || v.image || v.visitorPhoto || "";

  // Dynamically filter matching logs based on dashboard criteria range selections
  const filteredData = visitors.filter((v) => {
    const rawTime = getVisitorTime(v);
    if (!rawTime) return true;
    
    const visitDate = new Date(rawTime);
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (visitDate < start) return false;
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (visitDate > end) return false;
    }
    
    return true;
  });

  const handleExport = async (e) => {
    e.preventDefault();

    if (filteredData.length === 0) {
      alert("There are no visitor logs available to export for the selected filters.");
      return;
    }

    try {
      // Create Workbook and Setup sheet grid
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Visitor Logs');

      // Define Clean Spreadsheet columns layout schema matching dashboard view structure
      worksheet.columns = [
        { header: 'S.No', key: 'sno', width: 8 },
        { header: 'Photo Avatar', key: 'photo', width: 14 },
        { header: 'ID', key: 'id', width: 15 },
        { header: 'Full Name', key: 'name', width: 25 },
        { header: 'Mobile Number', key: 'phone', width: 18 },
        { header: 'Email Address', key: 'email', width: 28 },
        { header: 'Registry Purpose', key: 'purpose', width: 22 },
        { header: 'Check-In Context', key: 'time', width: 26 }
      ];

      // Format Header Cells Row Styling aesthetics
      const headerRow = worksheet.getRow(1);
      headerRow.height = 28;
      headerRow.eachCell((cell) => {
        cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0A1128' } }; // Dark Deep Navy match
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      // Populate text data items row loops dynamically
      for (let index = 0; index < filteredData.length; index++) {
        const item = filteredData[index];
        const currentRowNum = index + 2; 

        worksheet.addRow({
          sno: index + 1,
          photo: "", // Keep slot blank textually so it plays canvas space anchor for image drawing
          id: getVisitorId(item) || "—",
          name: item.name || "—",
          phone: getVisitorPhone(item) || "—",
          email: item.email || "—",
          purpose: getVisitorPurpose(item) || "—",
          time: getVisitorTime(item) || "—"
        });

        // Dynamic Row Height alignment fitting nicely to pixel layout constraints
        const row = worksheet.getRow(currentRowNum);
        row.height = 48; 
        row.eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        });
        worksheet.getCell(`A${currentRowNum}`).alignment = { vertical: 'middle', horizontal: 'center' };

        // Attempt safely drawing Base64 String images to layout cells coordinates
        const photoString = getVisitorPhoto(item);
        if (photoString && typeof photoString === 'string') {
          try {
            // Clean dynamic string extensions headers out if backend string contains them
            const cleanBase64 = photoString.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
            
            // Register image to workbook resources pool buffer
            const imageId = workbook.addImage({
              base64: cleanBase64,
              extension: 'jpeg',
            });

            // Anchor image directly on top of the 'Photo Avatar' Column Cell bounds
            worksheet.addImage(imageId, {
              tl: { col: 1, row: currentRowNum - 1 },
              ext: { width: 50, height: 50 },
              editAs: 'oneCell'
            });
          } catch (imgErr) {
            console.warn("Failed drawing matrix images to row allocation index:", index, imgErr);
          }
        }
      }

      // Generate binary array buffer asset download
      const buffer = await workbook.xlsx.writeBuffer();
      const datestamp = new Date().toISOString().split('T')[0];
      const fileBlob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      
      saveAs(fileBlob, `Visitor_Registry_Report_${datestamp}.xlsx`);

    } catch (error) {
      console.error("Excel generation error:", error);
      alert("An unexpected error occurred while building the Excel file structure.");
    }
  };

  return (
    <div className="export-page-container">
      {/* Configuration Control Panel Card */}
      <div className="table-card">
        <div className="export-header-block">
          <h2>💾 Export Registry Database</h2>
          <p>Filter by date range parameters to compile custom spreadsheets.</p>
        </div>

        <form className="export-filter-form" onSubmit={handleExport}>
          <div className="input-field-group">
            <label htmlFor="startDate">Start Date</label>
            <input 
              id="startDate"
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="input-field-group">
            <label htmlFor="endDate">End Date</label>
            <input 
              id="endDate"
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <button type="submit" className="add-btn download-action-btn">
            📥 Download Spreadsheet (.xlsx)
          </button>
        </form>
      </div>

      {/* Preview Sheet Card Container */}
      <div className="table-card" style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '16px', color: '#334155' }}>
          📋 Previewing ({filteredData.length}) Log Rows
        </h3>

        {/* Responsive viewport boundary scroller container */}
        <div className="table-responsive">
          <table className="visitor-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Mobile Number</th>
                <th>Registry Purpose</th>
                <th>Check-In Context</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    No matching records found for the specified criteria.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, idx) => (
                  <tr key={getVisitorId(row) || idx}>
                    <td style={{ fontWeight: 600, color: '#94a3b8' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{row.name || "—"}</td>
                    <td style={{ color: '#475569', fontWeight: 500 }}>{getVisitorPhone(row) || "—"}</td>
                    <td>
                      <span className="badge-purpose preview-label">
                        {getVisitorPurpose(row) || "—"}
                      </span>
                    </td>
                    <td style={{ color: '#64748b' }}>{getVisitorTime(row) || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}