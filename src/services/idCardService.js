import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { formatDate } from '../utils/helpers';

export const getVerificationUrl = (member) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/verify/${encodeURIComponent(member.member_id)}`;
};

export const getQrUrl = (member) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const params = new URLSearchParams();
  if (member.mobile) params.set('m', member.mobile);
  if (member.dob) params.set('d', member.dob);
  
  const queryString = params.toString();
  return `${baseUrl}/qr-login/${encodeURIComponent(member.member_id)}${queryString ? `?${queryString}` : ''}`;
};

export const createQrDataUrl = async (member) => {
  return QRCode.toDataURL(getQrUrl(member), {
    margin: 1,
    width: 180,
    color: {
      dark: '#14532d',
      light: '#ffffff',
    },
  });
};

/**
 * Generate a PDF that replicates the physical printed ID card.
 *
 * Layout:
 *   1. Green header with association name + registration no.
 *   2. Front section: photo, fields (Name, Occupation, Village, District, Designation), farmer logo, signature.
 *   3. Black divider line.
 *   4. Bottom section: Vehicle No, DOB, Aadhar No, Phone No, Address.
 *   5. "Head Office" label.
 *   6. Green footer with address and phone.
 */
export const downloadIdCardPdf = async (member) => {
  const element = document.getElementById('member-id-card');
  if (!element) {
    throw new Error('ID card element not found on the page. Ensure the preview is visible.');
  }

  try {
    // Capture the perfectly styled DOM element directly
    const canvas = await html2canvas(element, {
      scale: 3, // High resolution for crisp printing
      useCORS: true, // Allow external images
      allowTaint: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);

    // Calculate dimensions maintaining aspect ratio (target ~105mm width)
    const pdfWidth = 105;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pdfWidth, pdfHeight],
    });

    doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    doc.save(`${member.member_id || 'member'}_id_card.pdf`);
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF. Check if images are accessible.');
  }
};
