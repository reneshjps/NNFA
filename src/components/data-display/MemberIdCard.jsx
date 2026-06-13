import { useQuery } from '@tanstack/react-query';
import { User } from 'lucide-react';
import { createQrDataUrl } from '../../services/idCardService';
import { formatDate } from '../../utils/helpers';

/**
 * MemberIdCard — replicates the physical printed card layout.
 *
 * Design rules (from the reference card):
 *   • White background, dark-green (#006B2D) borders & footer
 *   • Two halves separated by a thin black horizontal line
 *   • Times New Roman / serif throughout — NO modern fonts
 *   • No shadows, gradients, rounded corners, or glass effects
 */
export default function MemberIdCard({ member }) {
  const { data: qrDataUrl } = useQuery({
    queryKey: ['id-card-qr', member?.member_id],
    queryFn: () => createQrDataUrl(member),
    enabled: !!member?.member_id,
  });

  if (!member) return null;

  const validYear = member.valid_until
    ? new Date(member.valid_until).getFullYear()
    : '—';

  return (
    <div
      id="member-id-card"
      style={{
        width: '500px',
        fontFamily: "'Times New Roman', 'Times', 'Georgia', serif",
        backgroundColor: '#ffffff',
        border: '3px solid #006B2D',
        margin: '0 auto',
        overflow: 'hidden',
        lineHeight: 1.3,
      }}
    >
      {/* ───────── HEADER — Dark green banner ───────── */}
      <div
        style={{
          backgroundColor: '#006B2D',
          padding: '14px 16px 10px',
          textAlign: 'center',
          position: 'relative',
          minHeight: '90px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Left leader photo with wheat wreath */}
        <div
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '76px',
            height: '76px',
          }}
        >
          <img
            src="/card-assets/wheat-wreath.png"
            alt=""
            style={{
              position: 'absolute',
              top: '-6px',
              left: '-6px',
              width: '88px',
              height: '88px',
              objectFit: 'contain',
              opacity: 0.9,
            }}
          />
          <img
            src="/card-assets/chairman-photo.png"
            alt="Chairman"
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2.5px solid #D4AF37',
              position: 'relative',
              zIndex: 1,
              marginTop: '8px',
              marginLeft: '8px',
              backgroundColor: '#e8e8e8',
            }}
          />
        </div>

        {/* Right leader photo with wheat wreath */}
        <div
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '76px',
            height: '76px',
          }}
        >
          <img
            src="/card-assets/wheat-wreath.png"
            alt=""
            style={{
              position: 'absolute',
              top: '-6px',
              left: '-6px',
              width: '88px',
              height: '88px',
              objectFit: 'contain',
              opacity: 0.9,
            }}
          />
          <img
            src="/card-assets/secretary-photo.png"
            alt="Secretary"
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2.5px solid #D4AF37',
              position: 'relative',
              zIndex: 1,
              marginTop: '8px',
              marginLeft: '8px',
              backgroundColor: '#e8e8e8',
            }}
          />
        </div>

        {/* Association Name */}
        <h1
          style={{
            color: '#ffffff',
            fontSize: '21px',
            fontWeight: 'bold',
            fontStyle: 'italic',
            fontFamily: "'Times New Roman', 'Times', serif",
            margin: '0 90px',
            lineHeight: 1.25,
          }}
        >
          Narayanasamy Naidu Farmer's
          <br />
          Association
        </h1>

        {/* Registration Number — underlined */}
        <p
          style={{
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 'bold',
            fontStyle: 'italic',
            marginTop: '4px',
            fontFamily: "'Times New Roman', 'Times', serif",
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
          }}
        >
          Registration No : 148/2019
        </p>
      </div>

      {/* ───────── FRONT SECTION (Top Half) ───────── */}
      <div style={{ padding: '12px 16px 8px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          {/* LEFT — Member Photo */}
          <div style={{ flexShrink: 0 }}>
            <div
              style={{
                width: '100px',
                height: '120px',
                border: '2px solid #006B2D',
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {member.photo_url ? (
                <img
                  src={member.photo_url}
                  alt={member.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <User
                  style={{ width: 36, height: 36, color: '#006B2D', opacity: 0.4 }}
                />
              )}
            </div>

            {/* ID No box */}
            <div
              style={{
                marginTop: '6px',
                border: '1.5px solid #006B2D',
                padding: '2px 6px',
                display: 'inline-block',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#006B2D',
                }}
              >
                Id No :
              </span>{' '}
              <span style={{ fontSize: '11px', color: '#000' }}>
                {member.registration_number || '—'}
              </span>
            </div>
          </div>

          {/* CENTER — Fields */}
          <div style={{ flex: 1, paddingTop: '2px' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: "'Times New Roman', 'Times', serif",
              }}
            >
              <tbody>
                <FieldRow label="Name" value={member.name} valueColor="#cc0000" />
                <FieldRow
                  label="Occupation"
                  value={member.occupation || 'Farmer'}
                  valueColor="#cc0000"
                />
                <FieldRow label="Village" value={member.village} valueColor="#cc0000" />
                <FieldRow label="District" value={member.district} valueColor="#cc0000" />
                <FieldRow
                  label="Designation"
                  value={member.designation || 'Member'}
                  valueColor="#cc0000"
                />
              </tbody>
            </table>
          </div>

          {/* RIGHT — Farmer logo + Signature */}
          <div
            style={{
              flexShrink: 0,
              width: '100px',
              textAlign: 'center',
              paddingTop: '2px',
            }}
          >
            <img
              src="/card-assets/farmer-ox-logo.png"
              alt="Farmer Logo"
              style={{
                width: '90px',
                height: '75px',
                objectFit: 'contain',
              }}
            />
            <p
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                fontStyle: 'italic',
                color: '#000',
                marginTop: '2px',
                fontFamily: "'Times New Roman', 'Times', serif",
              }}
            >
              Signature
            </p>
            <div
              style={{
                height: '40px',
                marginTop: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src="/card-assets/chairman-signature.svg"
                alt="Chairman Signature"
                style={{ maxHeight: '38px', maxWidth: '90px', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>

        {/* Valid Until — centered below the fields */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '6px',
            paddingBottom: '4px',
          }}
        >
          <span
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#cc0000',
              fontFamily: "'Times New Roman', 'Times', serif",
              fontStyle: 'italic',
            }}
          >
            Valid up to: {validYear}
          </span>
        </div>
      </div>

      {/* ───────── DIVIDER LINE ───────── */}
      <div
        style={{
          borderTop: '2px solid #000000',
          margin: '0 0',
        }}
      />

      {/* ───────── BOTTOM SECTION ───────── */}
      <div
        style={{
          padding: '12px 16px 8px',
          position: 'relative',
          minHeight: '160px',
        }}
      >
        {/* Watermark background */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.08,
            width: '250px',
            height: '150px',
            pointerEvents: 'none',
          }}
        >
          <img
            src="/card-assets/farmer-watermark.png"
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>

        {/* Bottom fields + QR code */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <table
            style={{
              borderCollapse: 'collapse',
              fontFamily: "'Times New Roman', 'Times', serif",
              width: '100%',
            }}
          >
            <tbody>
              <FieldRow label="Vehicle No" value={member.vehicle_number} valueColor="#cc0000" />
              <FieldRow
                label="D.O.B"
                value={member.dob ? formatDate(member.dob) : ''}
                valueColor="#cc0000"
              />
              <FieldRow label="Aadhar No" value={member.aadhar_number} valueColor="#cc0000" />
              <FieldRow label="Phone No" value={member.mobile} valueColor="#cc0000" />
              <FieldRow label="Address" value={member.address} valueColor="#cc0000" />
            </tbody>
          </table>

          {/* QR Code */}
          <div
            style={{
              position: 'absolute',
              top: '-4px',
              right: '45px',
              width: '90px',
              textAlign: 'center',
            }}
          >
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Verification QR"
                style={{ width: '85px', height: '85px', border: '1px solid #006B2D' }}
              />
            ) : (
              <div
                style={{
                  width: '85px',
                  height: '85px',
                  border: '1px solid #006B2D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  color: '#999',
                  fontFamily: "'Times New Roman', serif",
                }}
              >
                QR Code
              </div>
            )}
            <p
              style={{
                fontSize: '8px',
                color: '#006B2D',
                marginTop: '2px',
                fontFamily: "'Times New Roman', serif",
                fontWeight: 'bold',
              }}
            >
              Scan to Verify
            </p>
          </div>
        </div>
      </div>

      {/* ───────── HEAD OFFICE SECTION ───────── */}
      <div
        style={{
          textAlign: 'center',
          padding: '8px 16px 6px',
        }}
      >
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 'bold',
            color: '#006B2D',
            fontFamily: "'Times New Roman', 'Times', serif",
            textDecoration: 'underline',
            margin: 0,
          }}
        >
          Head Office
        </h2>
      </div>

      {/* ───────── FOOTER — Dark green ───────── */}
      <div
        style={{
          backgroundColor: '#006B2D',
          padding: '10px 16px 8px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <p
          style={{
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 'bold',
            fontStyle: 'italic',
            fontFamily: "'Times New Roman', 'Times', serif",
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          15,A, L&amp;T Bypass Road, A.K. Pudur, (Opposite)
          <br />
          Irugur Via, Sulur Taluk, Coimbatore - 641103, Tamilnadu
        </p>

        {/* Phone number */}
        <p
          style={{
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 'bold',
            fontFamily: "'Times New Roman', 'Times', serif",
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '16px',
              height: '16px',
              backgroundColor: '#cc0000',
              borderRadius: '50%',
              fontSize: '10px',
              color: '#fff',
            }}
          >
            ✆
          </span>
          {' '}9751118444
        </p>

        {/* Terms */}
        <p
          style={{
            position: 'absolute',
            right: '10px',
            bottom: '4px',
            fontSize: '8px',
            fontStyle: 'italic',
            color: '#ffffffcc',
            fontFamily: "'Times New Roman', 'Times', serif",
            margin: 0,
          }}
        >
          *Terms and Conditions Applied
        </p>
      </div>
    </div>
  );
}

/**
 * FieldRow — a single label : value row rendered as a <tr>.
 *
 * Labels are dark green, values are black by default.
 * Supply `valueColor` for red-highlighted fields (Occupation, Designation).
 */
function FieldRow({ label, value, valueColor = '#000000' }) {
  return (
    <tr>
      <td
        style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#006B2D',
          paddingRight: '4px',
          paddingBottom: '3px',
          whiteSpace: 'nowrap',
          verticalAlign: 'top',
          fontFamily: "'Times New Roman', 'Times', serif",
        }}
      >
        {label}
      </td>
      <td
        style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#006B2D',
          paddingRight: '6px',
          paddingBottom: '3px',
          width: '14px',
          textAlign: 'center',
          verticalAlign: 'top',
          fontFamily: "'Times New Roman', 'Times', serif",
        }}
      >
        :
      </td>
      <td
        style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: valueColor,
          paddingBottom: '3px',
          verticalAlign: 'top',
          fontFamily: "'Times New Roman', 'Times', serif",
        }}
      >
        {value || ''}
      </td>
    </tr>
  );
}
