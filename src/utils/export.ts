import { Meeting, AgendaItem, ActionItem } from '../types';

export function exportToMarkdown(meeting: Meeting, agendas: AgendaItem[]): string {
  let md = `# NOTULEN RAPAT: ${meeting.title.toUpperCase()}\n`;
  md += `**Perusahaan**: ${meeting.company}\n`;
  md += `**Kategori**: ${meeting.category}\n`;
  md += `**Tanggal / Waktu**: ${meeting.date} pada ${meeting.time}\n`;
  md += `**Status Notulen**: ${meeting.minutesStatus}\n`;
  md += `**Peserta**: ${meeting.participants.join(', ')}\n\n`;
  md += `--- \n\n`;

  md += `## AGENDA & CATATAN\n\n`;
  agendas.forEach((agenda, idx) => {
    md += `### ${idx + 1}. [${agenda.status}] ${agenda.title}\n`;
    md += `**PIC**: ${agenda.pic || 'Tidak ada'} | **Deadline**: ${agenda.deadline || 'Tidak ada'}\n\n`;
    
    md += `#### Catatan Pembahasan:\n`;
    md += `${stripHtml(agenda.notes) || '_Tidak ada catatan_'}\n\n`;

    md += `#### Keputusan:\n`;
    md += `${stripHtml(agenda.decisions) || '_Tidak ada keputusan_'}\n\n`;

    if (agenda.actionItems && agenda.actionItems.length > 0) {
      md += `#### Action Items:\n`;
      agenda.actionItems.forEach(item => {
        md += `- [${item.status === 'Done' ? 'x' : ' '}] ${item.title} (PIC: ${item.pic}, Deadline: ${item.deadline}, Status: ${item.status})\n`;
      });
      md += `\n`;
    }
    md += `---\n\n`;
  });

  return md;
}

export function exportToHtml(meeting: Meeting, agendas: AgendaItem[]): string {
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Notulen - ${meeting.title}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    h1 { color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px; font-family: 'Georgia', serif; }
    h2 { color: #0f766e; margin-top: 30px; font-family: 'Georgia', serif; }
    h3 { color: #115e59; background: #f4f7f6; padding: 8px 12px; border-left: 4px solid #0d9488; }
    .meta-box { background: #f9fbfb; border: 1px solid #e2edea; border-radius: 6px; padding: 15px; margin-bottom: 30px; }
    .meta-item { margin-bottom: 8px; }
    .meta-label { font-weight: bold; color: #0f766e; }
    .agenda-section { margin-bottom: 40px; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; }
    .status-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; background: #e0f2fe; color: #0369a1; }
    .status-done { background: #dcfce7; color: #15803d; }
    .status-progress { background: #fef9c3; color: #a16207; }
    .status-cancel { background: #fee2e2; color: #b91c1c; }
    .sub-section { margin-left: 20px; margin-bottom: 15px; }
    .sub-title { font-weight: bold; color: #374151; margin-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
    th { background: #f3f4f6; color: #374151; }
    .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <h1>NOTULEN RAPAT</h1>
  <div class="meta-box">
    <div class="meta-item"><span class="meta-label">Topik Rapat:</span> ${meeting.title}</div>
    <div class="meta-item"><span class="meta-label">Perusahaan:</span> ${meeting.company}</div>
    <div class="meta-item"><span class="meta-label">Kategori:</span> ${meeting.category}</div>
    <div class="meta-item"><span class="meta-label">Waktu:</span> ${meeting.date} pukul ${meeting.time}</div>
    <div class="meta-item"><span class="meta-label">Status Notulen:</span> ${meeting.minutesStatus}</div>
    <div class="meta-item"><span class="meta-label">Peserta:</span> ${meeting.participants.join(', ')}</div>
  </div>

  <h2>AGENDA RAPAT & DETAIL PEMBAHASAN</h2>
  `;

  agendas.forEach((agenda, index) => {
    let statusClass = '';
    if (agenda.status === 'Done') statusClass = 'status-done';
    if (agenda.status === 'Progress') statusClass = 'status-progress';
    if (agenda.status === 'Cancel') statusClass = 'status-cancel';

    html += `
    <div class="agenda-section">
      <h3>
        ${index + 1}. ${agenda.title} 
        <span class="status-badge ${statusClass}">${agenda.status}</span>
      </h3>
      <div style="margin-bottom: 10px; font-size: 14px; color: #6b7280;">
        <strong>PIC:</strong> ${agenda.pic || 'Belum diisi'} &nbsp;|&nbsp; <strong>Tenggat:</strong> ${agenda.deadline || 'Belum diisi'}
      </div>
      
      <div class="sub-section">
        <div class="sub-title">Catatan Pembahasan</div>
        <div style="background: #ffffff; border: 1px solid #f3f4f6; padding: 10px; border-radius: 4px;">
          ${agenda.notes || '<i>Tidak ada catatan.</i>'}
        </div>
      </div>

      <div class="sub-section">
        <div class="sub-title">Keputusan yang Disepakati</div>
        <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 10px; border-radius: 4px; border-left: 3px solid #f59e0b;">
          ${agenda.decisions || '<i>Tidak ada keputusan yang tercatat.</i>'}
        </div>
      </div>
    `;

    if (agenda.actionItems && agenda.actionItems.length > 0) {
      html += `
      <div class="sub-section">
        <div class="sub-title">Rencana Tindak Lanjut (Action Items)</div>
        <table>
          <thead>
            <tr>
              <th>Deskripsi Tugas</th>
              <th>PIC</th>
              <th>Tenggat Waktu</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
      `;
      agenda.actionItems.forEach(item => {
        html += `
          <tr>
            <td>${item.title}</td>
            <td>${item.pic}</td>
            <td>${item.deadline}</td>
            <td>${item.status}</td>
          </tr>
        `;
      });
      html += `
          </tbody>
        </table>
      </div>
      `;
    }

    html += `</div>`;
  });

  html += `
  <div class="footer">
    Dokumen ini digenerate secara otomatis oleh MeetFlow AI - Smart Meeting & Decision Management
  </div>
</body>
</html>
  `;
  return html;
}

export function exportToCsv(meeting: Meeting, agendas: AgendaItem[]): string {
  // Simple CSV export of Action Items
  let csv = 'Agenda,Deskripsi Tindakan,PIC,Tenggat Waktu,Status\r\n';
  agendas.forEach(a => {
    if (a.actionItems && a.actionItems.length > 0) {
      a.actionItems.forEach(item => {
        const row = [
          `"${a.title.replace(/"/g, '""')}"`,
          `"${item.title.replace(/"/g, '""')}"`,
          `"${item.pic.replace(/"/g, '""')}"`,
          `"${item.deadline}"`,
          `"${item.status}"`
        ].join(',');
        csv += row + '\r\n';
      });
    } else {
      // Just export agenda overview if no action items
      const row = [
        `"${a.title.replace(/"/g, '""')}"`,
        '"(Overview)"',
        `"${a.pic || ''}"`,
        `"${a.deadline || ''}"`,
        `"${a.status}"`
      ].join(',');
      csv += row + '\r\n';
    }
  });
  return csv;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<li>/gi, '- ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
