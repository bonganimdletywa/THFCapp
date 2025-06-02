import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface CrateQrCodeProps {
  crateId: string;
  size?: number;
}

const CrateQrCode: React.FC<CrateQrCodeProps> = ({ crateId, size = 128 }) => {
  if (!crateId) {
    return <p>No Crate ID provided to generate QR code.</p>;
  }

  return (
    <div style={{ textAlign: 'center', margin: '1rem 0' }}>
      <p style={{ fontWeight: 600 }}>Crate ID: {crateId}</p>
      <QRCodeSVG
        value={crateId}
        size={size}
        bgColor={'#ffffff'}
        fgColor={'#000000'}
        level={'L'}
        includeMargin={true}
      />
      <br />
      <button style={{ marginTop: 12 }} onClick={() => window.print()}>
        Print Label
      </button>
    </div>
  );
};

export default CrateQrCode;
