'use client';

import { Printer, MessageSquare } from 'lucide-react';

interface PrintButtonProps {
  suggestedFileName?: string;
  clientPhone?: string;
  clientName?: string;
  docTitle?: string;
  documentNumber?: string;
}

export default function PrintButton({
  suggestedFileName = 'Dokumen - Salsabilla Advertising',
  clientPhone = '',
  clientName = '',
  docTitle = 'Dokumen Resmi',
  documentNumber = '',
}: PrintButtonProps) {
  const handlePrint = () => {
    const originalTitle = document.title;
    // Set document title temporarily to the smart filename so browser saves as this name
    document.title = suggestedFileName;
    window.print();
    // Restore original title after print dialog closes
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const handleShareWA = () => {
    const rawNumber = clientPhone.replace(/[^0-9]/g, '');
    let cleanNumber = rawNumber;
    if (rawNumber.startsWith('0')) {
      cleanNumber = '62' + rawNumber.substring(1);
    } else if (!rawNumber.startsWith('62')) {
      cleanNumber = '62' + rawNumber;
    }

    const message = 
`Halo Kak ${clientName || 'Bapak/Ibu'}, salam dari *Salsabilla Advertising* 🙏

Berikut kami informasikan terkait dokumen *${docTitle}* (No: ${documentNumber}) untuk pekerjaan pesanan Anda.

📄 Dokumen: *${suggestedFileName}.pdf*
(File resmi dapat kami kirimkan dalam format PDF langsung ke chat ini).

Apabila ada informasi yang ingin dikonfirmasi, silakan hubungi kami kembali. Terima kasih atas kepercayaannya! 😊`;

    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex items-center gap-2">
      {clientPhone && (
        <button
          type="button"
          onClick={handleShareWA}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Info ke</span> WA
        </button>
      )}

      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
      >
        <Printer className="w-4 h-4" />
        <span>Cetak / Download PDF</span>
      </button>
    </div>
  );
}
