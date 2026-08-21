import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Ahli, CartaAkaun, Transaksi, PembiayaanAhli, TransaksiPOS, Mesyuarat } from '../types';

export const pdfExport = {
  // 1. Official SKM Financial Statements (Penyata Kewangan Teraudit)
  exportFinancialStatements(
    koperasiName: string,
    regNo: string,
    year: number,
    incomeData: { hasil: number; belanja: number; untungKasar: number; untungBersih: number },
    statutoryData: { kwrs: number; kwpk: number; kwp: number; untungBolehDiagih: number; cadanganDividen: number; honorarium: number },
    balanceSheetData: { aset: number; liabiliti: number; ekuiti: number; modalSyer: number }
  ) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header Background
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(koperasiName.toUpperCase(), pageWidth / 2, 16, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(16, 185, 129); // emerald-400
    doc.text(`NO. PENDAFTARAN SKM: ${regNo}`, pageWidth / 2, 23, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(226, 232, 240);
    doc.text(`PENYATA KEWANGAN TERAUDIT & AGIHAN STATUTORI BAGI TAHUN ${year}`, pageWidth / 2, 31, { align: 'center' });

    // Section 1: Penyata Pendapatan Komprehensif
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. PENYATA PENDAPATAN & PERBELANJAAN TAHUNAN', 14, 48);

    autoTable(doc, {
      startY: 52,
      head: [['Perkara / Butiran Perakaunan', 'Jumlah (RM)']],
      body: [
        ['Jumlah Hasil & Pendapatan Operasi', `RM ${incomeData.hasil.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`],
        ['Tolak: Perbelanjaan Pengendalian & Pentadbiran', `RM (${incomeData.belanja.toLocaleString('en-MY', { minimumFractionDigits: 2 })})`],
        ['KEUNTUNGAN BERSIH SEBELUM STATUTORI', `RM ${incomeData.untungBersih.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 60, halign: 'right', fontStyle: 'bold' },
      },
    });

    // Section 2: Agihan Statutori SKM (Akta Koperasi 1993)
    const finalY1 = (doc as any).lastAutoTable.finalY || 80;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. AGIHAN KUMPULAN WANG STATUTORI SKM (SEKSYEN 57 AKTA KOPERASI 1993)', 14, finalY1 + 10);

    autoTable(doc, {
      startY: finalY1 + 14,
      head: [['Kumpulan Wang Statutori', 'Kadar Statutori', 'Jumlah Caruman (RM)']],
      body: [
        ['Kumpulan Wang Rizab Statutori (KWRS)', '12% daripada Untung Bersih', `RM ${statutoryData.kwrs.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`],
        ['Kumpulan Wang Pendidikan Koperasi (KWPK)', '3% daripada Untung Bersih', `RM ${statutoryData.kwpk.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`],
        ['Kumpulan Wang Pembangunan Koperasi (KWP)', '1% daripada Untung Bersih', `RM ${statutoryData.kwp.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`],
        ['Baki Untung Bersih Boleh Diagih (Distributable Profit)', '-', `RM ${statutoryData.untungBolehDiagih.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`],
        ['Cadangan Agihan Dividen Ahli', '≤ 10% Modal Syer', `RM ${statutoryData.cadanganDividen.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`],
        ['Honorarium Ahli Lembaga Koperasi (ALK)', '-', `RM ${statutoryData.honorarium.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] }, // indigo-600
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 45, halign: 'center' },
        2: { cellWidth: 45, halign: 'right', fontStyle: 'bold' },
      },
    });

    // Section 3: Kunci Kira-Kira Ringkas
    const finalY2 = (doc as any).lastAutoTable.finalY || 150;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3. RINGKASAN KEDUDUKAN KEWANGAN (KUNCI KIRA-KIRA)', 14, finalY2 + 10);

    autoTable(doc, {
      startY: finalY2 + 14,
      head: [['Komponen Kunci Kira-Kira', 'Baki Semasa (RM)']],
      body: [
        ['Jumlah Aset Keseluruhan', `RM ${balanceSheetData.aset.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`],
        ['Jumlah Liabiliti Semasa & Jangka Panjang', `RM ${balanceSheetData.liabiliti.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`],
        ['Jumlah Ekuiti & Kumpulan Wang Terkumpul', `RM ${balanceSheetData.ekuiti.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`],
        ['Modal Syer Terbitan Dipegang Ahli', `RM ${balanceSheetData.modalSyer.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 60, halign: 'right', fontStyle: 'bold' },
      },
    });

    // Signatures Section at bottom
    const finalY3 = (doc as any).lastAutoTable.finalY || 220;
    const signY = Math.min(finalY3 + 20, 255);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);

    // Left Signature
    doc.line(14, signY + 15, 75, signY + 15);
    doc.text('Tandatangan Pengerusi ALK', 14, signY + 19);
    doc.text('Tarikh: ..............................', 14, signY + 24);

    // Center Signature
    doc.line(78, signY + 15, 135, signY + 15);
    doc.text('Tandatangan Bendahari Koperasi', 78, signY + 19);
    doc.text('Tarikh: ..............................', 78, signY + 24);

    // Right Signature
    doc.line(140, signY + 15, 196, signY + 15);
    doc.text('Pemeriksa Akaun (JAD / Juruaudit)', 140, signY + 19);
    doc.text('Cop Rasmi SKM / Juruaudit', 140, signY + 24);

    // Footer
    doc.setFontSize(8);
    doc.text(`Dijana secara automatik oleh SPPKM™ Pro pada ${new Date().toLocaleString('ms-MY')}`, 14, 288);
    doc.text('Pematuhan Penuh Akta Koperasi 1993', pageWidth - 14, 288, { align: 'right' });

    doc.save(`Penyata_Kewangan_SKM_${year}_${koperasiName.replace(/\s+/g, '_')}.pdf`);
  },

  // 2. Official AGM Executive Report (Laporan Eksekutif AGM)
  exportAGMReport(
    koperasiName: string,
    regNo: string,
    agmTitle: string,
    markdownReportText: string
  ) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 14;
    const maxLineWidth = pageWidth - margin * 2;

    // Header Band
    doc.setFillColor(30, 27, 75); // indigo-950
    doc.rect(0, 0, pageWidth, 36, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(koperasiName.toUpperCase(), pageWidth / 2, 14, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(165, 180, 252); // indigo-300
    doc.text(`NO. PENDAFTARAN SKM: ${regNo}`, pageWidth / 2, 21, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(agmTitle.toUpperCase(), pageWidth / 2, 30, { align: 'center' });

    let currentY = 46;
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);

    // Clean markdown headings & format into lines
    const lines = markdownReportText.split('\n');

    for (let line of lines) {
      if (currentY > 275) {
        doc.addPage();
        currentY = 20;
      }

      line = line.replace(/\*\*/g, '').trim();

      if (line.startsWith('# ')) {
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        currentY += 4;
        doc.text(line.replace('# ', ''), margin, currentY);
        currentY += 6;
      } else if (line.startsWith('## ')) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(67, 56, 202); // indigo-700
        currentY += 3;
        doc.text(line.replace('## ', ''), margin, currentY);
        currentY += 5;
      } else if (line.startsWith('### ')) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        currentY += 2;
        doc.text(line.replace('### ', ''), margin, currentY);
        currentY += 4.5;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        const splitText = doc.splitTextToSize(`• ${line.substring(2)}`, maxLineWidth - 4);
        doc.text(splitText, margin + 4, currentY);
        currentY += splitText.length * 4.5;
      } else if (line.length > 0) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        const splitText = doc.splitTextToSize(line, maxLineWidth);
        doc.text(splitText, margin, currentY);
        currentY += splitText.length * 4.5;
      } else {
        currentY += 2;
      }
    }

    doc.save(`Laporan_Eksekutif_AGM_${koperasiName.replace(/\s+/g, '_')}.pdf`);
  },

  // 3. Official POS Sales Receipt
  exportPOSReceipt(koperasiName: string, tx: TransaksiPOS) {
    const doc = new jsPDF({
      unit: 'mm',
      format: [80, 160], // Thermal receipt size
    });

    const width = 80;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(koperasiName, width / 2, 10, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('RESIT RASMI KEDAI KOPERASI', width / 2, 15, { align: 'center' });
    doc.text(`No. Resit: ${tx.noResit}`, width / 2, 20, { align: 'center' });
    doc.text(`Tarikh: ${tx.tarikhMasa}`, width / 2, 24, { align: 'center' });
    doc.text(`Juruwang: ${tx.juruwang}`, width / 2, 28, { align: 'center' });

    doc.setLineDashPattern([1, 1], 0);
    doc.line(5, 31, 75, 31);

    autoTable(doc, {
      startY: 33,
      head: [['Item', 'Qty', 'Jumlah']],
      body: tx.itemSenarai.map((i) => [i.namaProduk, i.kuantiti.toString(), `${i.jumlah.toFixed(2)}`]),
      theme: 'plain',
      styles: { fontSize: 7.5, cellPadding: 1 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 10, halign: 'center' },
        2: { cellWidth: 20, halign: 'right' },
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 70;
    doc.line(5, finalY + 2, 75, finalY + 2);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`Subtotal: RM ${tx.subtotal.toFixed(2)}`, 75, finalY + 7, { align: 'right' });
    if (tx.diskaun > 0) {
      doc.text(`Diskaun Ahli: -RM ${tx.diskaun.toFixed(2)}`, 75, finalY + 11, { align: 'right' });
    }
    doc.text(`JUMLAH: RM ${tx.jumlahKeseluruhan.toFixed(2)}`, 75, finalY + 16, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(`Kaedah Bayaran: ${tx.caraBayaran}`, 5, finalY + 21);

    doc.setFontSize(7);
    doc.text('Terima kasih atas sokongan anda kepada Koperasi!', width / 2, finalY + 30, { align: 'center' });

    doc.save(`Resit_${tx.noResit}.pdf`);
  },
};
