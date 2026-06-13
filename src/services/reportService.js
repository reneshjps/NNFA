import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { memberService } from './memberService';
import { renewalService } from './renewalService';
import { formatDate } from '../utils/helpers';

const memberColumns = [
  ['Member ID', 'member_id'],
  ['Name', 'name'],
  ['Mobile', 'mobile'],
  ['District', 'district'],
  ['Village', 'village'],
  ['Designation', 'designation'],
  ['Status', 'status'],
  ['Valid Until', 'valid_until'],
];

const renewalColumns = [
  ['Member ID', 'member.member_id'],
  ['Name', 'member.name'],
  ['Renewal', 'renewal_type'],
  ['Renewed On', 'renewed_on'],
  ['Valid Until', 'valid_until'],
  ['Amount', 'amount'],
];

export const reportService = {
  async getMemberReport({ type = 'all', district = '', village = '' } = {}) {
    const status = type === 'active' || type === 'expired' ? type : '';
    const result = await memberService.getMembers({
      status,
      district,
      page: 1,
      limit: 50000,
      sortBy: 'member_id',
      sortDir: 'asc',
    });

    let rows = result.data || [];
    if (village) {
      rows = rows.filter((member) => member.village?.toLowerCase().includes(village.toLowerCase()));
    }
    return rows;
  },

  async getRenewalReport() {
    const result = await renewalService.getRenewals({ page: 1, limit: 50000 });
    return result.data || [];
  },

  exportMembersExcel(rows, fileName = 'NNFA_Member_Report') {
    const formatted = rows.map((member) => ({
      'Member ID': member.member_id,
      Name: member.name,
      Mobile: member.mobile,
      District: member.district,
      Village: member.village,
      Taluk: member.taluk,
      Designation: member.designation,
      Status: member.status,
      'Joining Date': member.joining_date,
      'Valid Until': member.valid_until,
      'Vehicle Number': member.vehicle_number,
      'Registration Number': member.registration_number,
    }));
    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');
    XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  },

  exportMembersPdf(rows, title = 'NNFA Member Report') {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(14);
    doc.text(title, 14, 14);
    doc.setFontSize(8);
    doc.text(`Generated on ${formatDate(new Date())}`, 14, 20);

    let y = 30;
    doc.setFont('helvetica', 'bold');
    memberColumns.forEach(([label], index) => doc.text(label, 14 + index * 34, y));
    doc.setFont('helvetica', 'normal');
    y += 6;

    rows.slice(0, 120).forEach((member) => {
      if (y > 190) {
        doc.addPage();
        y = 18;
      }
      memberColumns.forEach(([, key], index) => {
        const value = key === 'valid_until' ? formatDate(member[key]) : member[key] || '-';
        doc.text(String(value).slice(0, 22), 14 + index * 34, y);
      });
      y += 6;
    });

    if (rows.length > 120) {
      doc.setTextColor(100, 116, 139);
      doc.text(`Showing first 120 rows of ${rows.length}. Use Excel export for the full dataset.`, 14, y + 4);
    }

    doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
  },

  exportRenewalsExcel(rows, fileName = 'NNFA_Renewal_Report') {
    const formatted = rows.map((renewal) => ({
      'Member ID': renewal.member?.member_id || renewal.member_id,
      Name: renewal.member?.name || '-',
      Mobile: renewal.member?.mobile || '-',
      Renewal: renewal.renewal_type,
      'Renewed On': renewal.renewed_on,
      'Valid Until': renewal.valid_until,
      Amount: renewal.amount || 0,
    }));
    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Renewals');
    XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  },

  exportRenewalsPdf(rows, title = 'NNFA Renewal Report') {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(14);
    doc.text(title, 14, 14);
    doc.setFontSize(8);
    doc.text(`Generated on ${formatDate(new Date())}`, 14, 20);

    let y = 30;
    doc.setFont('helvetica', 'bold');
    renewalColumns.forEach(([label], index) => doc.text(label, 14 + index * 42, y));
    doc.setFont('helvetica', 'normal');
    y += 6;

    rows.slice(0, 120).forEach((renewal) => {
      if (y > 190) {
        doc.addPage();
        y = 18;
      }
      renewalColumns.forEach(([, key], index) => {
        const value = key.split('.').reduce((obj, part) => obj?.[part], renewal);
        const formattedValue = key.includes('date') || key.includes('_on') || key === 'valid_until' ? formatDate(value) : value || '-';
        doc.text(String(formattedValue).slice(0, 26), 14 + index * 42, y);
      });
      y += 6;
    });

    doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
  },

  async parseMembersExcel(file) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    const normalized = rows.map((row) => ({
      member_id: row.member_id || row['Member ID'] || row['MemberID'] || undefined,
      name: row.name || row.Name,
      mobile: String(row.mobile || row.Mobile || '').trim(),
      dob: row.dob || row.DOB || row['Date of Birth'] || null,
      occupation: row.occupation || row.Occupation || '',
      village: row.village || row.Village || '',
      district: row.district || row.District || '',
      taluk: row.taluk || row.Taluk || '',
      address: row.address || row.Address || '',
      aadhar_number: String(row.aadhar_number || row['Aadhar Number'] || '').trim(),
      vehicle_number: row.vehicle_number || row['Vehicle Number'] || '',
      designation: row.designation || row.Designation || 'Member',
      registration_number: row.registration_number || row['Registration Number'] || '',
      joining_date: row.joining_date || row['Joining Date'] || new Date().toISOString().slice(0, 10),
      valid_until: row.valid_until || row['Valid Until'] || null,
      blood_group: row.blood_group || row['Blood Group'] || '',
      status: row.status || row.Status || 'active',
    }));

    const seenIds = new Set();
    const seenPhones = new Set();
    const duplicates = [];
    const validRows = [];

    normalized.forEach((member, index) => {
      const rowNumber = index + 2;
      if (!member.name || !member.mobile) {
        duplicates.push(`Row ${rowNumber}: name and mobile are required`);
        return;
      }
      if (!/^[6-9]\d{9}$/.test(member.mobile)) {
        duplicates.push(`Row ${rowNumber}: invalid mobile ${member.mobile}`);
        return;
      }
      if (member.member_id && seenIds.has(member.member_id)) {
        duplicates.push(`Row ${rowNumber}: duplicate member ID ${member.member_id}`);
        return;
      }
      if (seenPhones.has(member.mobile)) {
        duplicates.push(`Row ${rowNumber}: duplicate mobile ${member.mobile}`);
        return;
      }
      if (member.member_id) seenIds.add(member.member_id);
      seenPhones.add(member.mobile);
      validRows.push(member);
    });

    const existing = await memberService.getExistingIdentifiers({
      memberIds: validRows.map((member) => member.member_id),
      mobiles: validRows.map((member) => member.mobile),
    });

    if (existing.length) {
      const existingIds = new Set(existing.map((member) => member.member_id).filter(Boolean));
      const existingMobiles = new Set(existing.map((member) => member.mobile).filter(Boolean));
      const filteredRows = [];

      validRows.forEach((member) => {
        if (member.member_id && existingIds.has(member.member_id)) {
          duplicates.push(`Member ID ${member.member_id} already exists in the database`);
          return;
        }
        if (existingMobiles.has(member.mobile)) {
          duplicates.push(`Mobile ${member.mobile} already exists in the database`);
          return;
        }
        filteredRows.push(member);
      });

      return { rows: filteredRows, issues: duplicates };
    }

    return { rows: validRows, issues: duplicates };
  },

  async importMembers(rows) {
    const created = [];
    const failed = [];

    for (const row of rows) {
      try {
        const member = await memberService.createMember(row);
        created.push(member);
      } catch (err) {
        failed.push({ row, error: err.message });
      }
    }

    return { created, failed };
  },
};
