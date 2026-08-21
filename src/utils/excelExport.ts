import * as XLSX from 'xlsx';
import { Ahli, CartaAkaun, Transaksi, PembiayaanAhli, TransaksiPOS } from '../types';

export const excelExport = {
  // 1. Export Member Masterlist to Excel
  exportMembersList(members: Ahli[], koperasiName: string) {
    const data = members.map((m, idx) => ({
      'Bil': idx + 1,
      'No. Ahli': m.noAhli,
      'Nama Ahli': m.nama,
      'No. KP': m.noKp,
      'No. Telefon': m.noTelefon,
      'E-Mel': m.eMel,
      'Jawatan/Staf': m.jawatanStaf || m.jawatan || '-',
      'No. Gaji': m.noGaji || '-',
      'Majikan': m.majikan || '-',
      'Status': m.status,
      'Tarikh Sertai': m.tarikhSertai,
      'Modal Syer (RM)': m.modalSyer,
      'Yuran Bulanan (RM)': m.yuranBulanan,
      'Baki Pinjaman (RM)': m.bakiPinjaman,
      'Nama Bank': m.maklumatBank?.namaBank || '-',
      'No. Akaun Bank': m.maklumatBank?.noAkaun || '-',
      'Nama Waris': m.waris?.nama || '-',
      'Hubungan Waris': m.waris?.hubungan || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Senarai Ahli & Syer');

    // Auto width
    const colWidths = [
      { wch: 6 }, { wch: 15 }, { wch: 30 }, { wch: 18 }, { wch: 16 }, { wch: 25 },
      { wch: 25 }, { wch: 12 }, { wch: 25 }, { wch: 12 }, { wch: 14 }, { wch: 16 },
      { wch: 16 }, { wch: 16 }, { wch: 22 }, { wch: 20 }, { wch: 25 }, { wch: 15 }
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `Senarai_Ahli_Syer_${koperasiName.replace(/\s+/g, '_')}.xlsx`);
  },

  // 2. Export General Ledger & Transactions
  exportGeneralLedger(transactions: Transaksi[], accounts: CartaAkaun[], koperasiName: string) {
    const accMap = new Map(accounts.map((a) => [a.kod, a.namaAkaun]));

    const txData = transactions.map((t, idx) => ({
      'Bil': idx + 1,
      'Tarikh': t.tarikh,
      'No. Rujukan': t.noRujukan,
      'Kategori': t.kategori,
      'Perihal / Butiran': t.perihal,
      'Ahli Terlibat': t.namaAhli ? `${t.namaAhli} (${t.noAhli})` : '-',
      'Debit (Kod)': t.debitAkaunKod,
      'Debit (Akaun)': accMap.get(t.debitAkaunKod) || t.debitAkaunKod,
      'Kredit (Kod)': t.kreditAkaunKod,
      'Kredit (Akaun)': accMap.get(t.kreditAkaunKod) || t.kreditAkaunKod,
      'Jumlah (RM)': t.jumlah,
      'Pegawai Pengemas Kini': t.dikemaskiniOleh,
    }));

    const coaData = accounts.map((a) => ({
      'Kod Akaun': a.kod,
      'Nama Akaun': a.namaAkaun,
      'Kategori': a.kategori,
      'Jenis Baki': a.jenisBaki,
      'Baki Awal (RM)': a.bakiAwal,
      'Baki Semasa (RM)': a.bakiSemasa,
      'Nota Statutori SKM': a.notaSKM,
    }));

    const wb = XLSX.utils.book_new();

    const wsTx = XLSX.utils.json_to_sheet(txData);
    XLSX.utils.book_append_sheet(wb, wsTx, 'Buku Jurnal & Transaksi');

    const wsCoa = XLSX.utils.json_to_sheet(coaData);
    XLSX.utils.book_append_sheet(wb, wsCoa, 'Carta Akaun (COA)');

    XLSX.writeFile(wb, `Lejar_Am_Perakaunan_${koperasiName.replace(/\s+/g, '_')}.xlsx`);
  },

  // 3. Export Dividend Distribution & Bank Payment Schedule
  exportDividendSchedule(
    members: Ahli[],
    dividendRatePercent: number,
    koperasiName: string,
    year: number
  ) {
    const data = members
      .filter((m) => m.status === 'AKTIF')
      .map((m, idx) => {
        const dividenRM = (m.modalSyer * dividendRatePercent) / 100;
        const potonganHutang = Math.min(m.bakiPinjaman > 0 ? 50 : 0, dividenRM); // Potongan pinjaman jika ada
        const dividenBersih = dividenRM - potonganHutang;

        return {
          'Bil': idx + 1,
          'No. Ahli': m.noAhli,
          'Nama Ahli': m.nama,
          'No. KP': m.noKp,
          'Modal Syer (RM)': m.modalSyer,
          'Kadar Dividen (%)': `${dividendRatePercent}%`,
          'Dividen Kasar (RM)': dividenRM,
          'Potongan Pinjaman (RM)': potonganHutang,
          'Dividen Bersih Dibayar (RM)': dividenBersih,
          'Nama Bank Penerima': m.maklumatBank?.namaBank || 'Semakan Tunai',
          'No. Akaun Bank': m.maklumatBank?.noAkaun || '-',
          'Status Bayaran': 'SEDIA_PINDAHAN_AUTOPAY',
        };
      });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Jadual Dividen ${year}`);

    XLSX.writeFile(wb, `Jadual_Agihan_Dividen_${year}_${koperasiName.replace(/\s+/g, '_')}.xlsx`);
  },

  // 4. Export POS Sales & Inventory Records
  exportPOSSales(transactions: TransaksiPOS[], koperasiName: string) {
    const data = transactions.map((t, idx) => ({
      'Bil': idx + 1,
      'No. Resit': t.noResit,
      'Tarikh Masa': t.tarikhMasa,
      'Pelanggan': t.namaPelanggan,
      'Status Ahli': t.isAhli ? `Ahli (${t.noAhli})` : 'Bukan Ahli',
      'Bil. Item': t.itemSenarai.reduce((acc, i) => acc + i.kuantiti, 0),
      'Subtotal (RM)': t.subtotal,
      'Diskaun Ahli (RM)': t.diskaun,
      'Jumlah Keseluruhan (RM)': t.jumlahKeseluruhan,
      'Kaedah Bayaran': t.caraBayaran,
      'Juruwang': t.juruwang,
      'No. Transaksi Lejar': t.noTransaksiLejar,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Jualan POS Kedai');

    XLSX.writeFile(wb, `Laporan_Jualan_POS_${koperasiName.replace(/\s+/g, '_')}.xlsx`);
  },
};
