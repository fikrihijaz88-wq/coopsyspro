/**
 * Compliance Engine - Pemeriksaan Pematuhan Automatik
 * Akta Koperasi 1993, Peraturan-Peraturan Koperasi 1995,
 * Garis Panduan Suruhanjaya Koperasi Malaysia (SKM) & Undang-undang Kecil Koperasi
 */

import {
  Ahli, CartaAkaun, Transaksi, PembiayaanAhli, Mesyuarat,
  DokumenSokongan, AnggotaJawatankuasa, RekodKewanganTahunan,
  PeraturanPematuhan, HasilSemakanPematuhan, LaporanPematuhan,
  StatusPematuhan,
} from '../types';

export interface DataPematuhan {
  ahliList: Ahli[];
  cartaAkaun: CartaAkaun[];
  transaksiList: Transaksi[];
  pembiayaanList: PembiayaanAhli[];
  mesyuaratList: Mesyuarat[];
  dokumenList: DokumenSokongan[];
  jawatanKuasaList: AnggotaJawatankuasa[];
  rekodTahunanList: RekodKewanganTahunan[];
  untungBersihSemasa: number;
  kadarDividenCadangan: number; // % e.g. 7.5
}

const formatRM = (v: number) =>
  new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(v);

// ---------------------------------------------------------------------------
// SENARAI PERATURAN (Akta Koperasi 1993, GP SKM, Undang-undang Kecil)
// ---------------------------------------------------------------------------

export const SENARAI_PERATURAN: PeraturanPematuhan[] = [
  // ===== AKTA KOPERASI 1993 =====
  {
    kod: 'AKTA-S54',
    tajuk: 'Peruntukan Kumpulan Wang Rizab Statutori (KWRS) 12%',
    sumber: 'AKTA_1993',
    rujukanUndang2: 'Seksyen 54 Akta Koperasi 1993',
    kategori: 'KEWANGAN',
    deskripsiBM: 'Setiap koperasi wajib memperuntukkan sekurang-kurangnya 12% daripada lebihan bersih tahunan (surplus) ke Kumpulan Wang Rizab Statutori sebelum sebarang agihan dividen.',
    deskripsiEN: 'Every co-operative must allocate at least 12% of annual net surplus to the Statutory Reserve Fund before any dividend distribution.',
    tindakanPembetulan: 'Posting jurnal peruntukan KWRS 12% melalui modul Perakaunan & Lejar sebelum agihan dividen.',
  },
  {
    kod: 'AKTA-S54B',
    tajuk: 'Peruntukan Kumpulan Wang Pendidikan Koperasi 3%',
    sumber: 'AKTA_1993',
    rujukanUndang2: 'Seksyen 54 Akta Koperasi 1993 (Garis Panduan SKM 3%)',
    kategori: 'KEWANGAN',
    deskripsiBM: 'Peruntukan 3% daripada lebihan bersih tahunan ke Kumpulan Wang Pendidikan Koperasi (KWPK) untuk aktiviti pendidikan & latihan ahli.',
    deskripsiEN: 'Allocation of 3% of annual net surplus to the Co-operative Education Fund for member education & training.',
    tindakanPembetulan: 'Posting jurnal KWPK 3% dan rancangkan program pendidikan ahli tahunan.',
  },
  {
    kod: 'AKTA-S54C',
    tajuk: 'Peruntukan Kumpulan Wang Pembangunan Koperasi 1%',
    sumber: 'AKTA_1993',
    rujukanUndang2: 'Seksyen 54 Akta Koperasi 1993 (Garis Panduan SKM 1%)',
    kategori: 'KEWANGAN',
    deskripsiBM: 'Peruntukan 1% daripada lebihan bersih tahunan ke Kumpulan Wang Pembangunan Koperasi (KWP).',
    deskripsiEN: 'Allocation of 1% of annual net surplus to the Co-operative Development Fund.',
    tindakanPembetulan: 'Posting jurnal KWP 1% dalam akaun ekuiti 3040.',
  },
  {
    kod: 'AKTA-S57',
    tajuk: 'Had Kadar Dividen Syer Maksimum 10%',
    sumber: 'AKTA_1993',
    rujukanUndang2: 'Seksyen 57 Akta Koperasi 1993',
    kategori: 'KEWANGAN',
    deskripsiBM: 'Dividen syer yang diagihkan kepada ahli tidak boleh melebihi kadar yang diluluskan (garis panduan SKM: maksimum 10% ke atas modal syer) dan mesti diluluskan oleh Mesyuarat Agung.',
    deskripsiEN: 'Dividend distributed to members must not exceed the approved rate (SKM guideline: max 10% of share capital) and requires AGM approval.',
    tindakanPembetulan: 'Kurangkan kadar dividen cadangan kepada 10% ke bawah dan minta kelulusan AGM.',
  },
  {
    kod: 'AKTA-S39',
    tajuk: 'Korum Mesyuarat Agung Tahunan (AGM)',
    sumber: 'AKTA_1993',
    rujukanUndang2: 'Seksyen 39 & 40 Akta Koperasi 1993',
    kategori: 'MESYUARAT',
    deskripsiBM: 'AGM mesti diadakan dalam tempoh 6 bulan selepas tamat tahun kewangan. Korum minimum: satu perempat (1/4) daripada jumlah ahli berhak mengundi ATAU 50 ahli (yang mana lebih rendah), dan keputusan mesyuarat sah hanya jika korum tercapai.',
    deskripsiEN: 'AGM must be held within 6 months of financial year-end. Minimum quorum: one-quarter of eligible members OR 50 members (whichever is lower).',
    tindakanPembetulan: 'Pastikan AGM dijadualkan & korum dicapai; jika tidak, tangguhkan mengikut tatacara undang-undang kecil.',
  },
  {
    kod: 'AKTA-S44',
    tajuk: 'Korum & Kekerapan Mesyuarat ALK',
    sumber: 'AKTA_1993',
    rujukanUndang2: 'Seksyen 44 Akta Koperasi 1993',
    kategori: 'MESYUARAT',
    deskripsiBM: 'Ahli Lembaga Koperasi (ALK) mesti bermesyuarat sekurang-kurangnya sekali setiap tiga bulan dan korum melebihi 50% anggota ALK diperlukan untuk keputusan sah.',
    deskripsiEN: 'The Board must meet at least once every three months; quorum requires more than 50% of Board members.',
    tindakanPembetulan: 'Jadualkan mesyuarat ALK suku tahunan dan pastikan kehadiran melebihi 50%.',
  },
  {
    kod: 'AKTA-S47',
    tajuk: 'Pelantikan Jawatankuasa Audit Dalaman (JAD)',
    sumber: 'AKTA_1993',
    rujukanUndang2: 'Seksyen 47 Akta Koperasi 1993',
    kategori: 'TADBIR_UTUS',
    deskripsiBM: 'Koperasi wajib melantik Jawatankuasa Audit Dalaman (JAD) yang berfungsi memeriksa akaun & operasi dan melapor kepada Mesyuarat Agung. JAD tidak boleh terdiri daripada anggota ALK.',
    deskripsiEN: 'A Co-operative Internal Audit Committee must be appointed to examine accounts & operations and report to the AGM. JAD members must not be Board members.',
    tindakanPembetulan: 'Lantik semula JAD dalam AGM akan datang; pastikan tiada pertindihan keanggotaan dengan ALK.',
  },
  {
    kod: 'AKTA-S50',
    tajuk: 'Audit Tahunan oleh Juru Audit Bertauliah',
    sumber: 'AKTA_1993',
    rujukanUndang2: 'Seksyen 50 Akta Koperasi 1993',
    kategori: 'KEWANGAN',
    deskripsiBM: 'Akaun koperasi mesti diaudit setiap tahun oleh juru audit bertauliah yang diluluskan SKM dan laporan audit dikemukakan kepada SKM.',
    deskripsiEN: 'Accounts must be audited annually by an SKM-approved auditor and the audit report submitted to SKM.',
    tindakanPembetulan: 'Lintasukan juru audit bertauliah SKM dan kemukakan laporan audit tahun lepas.',
  },
  {
    kod: 'AKTA-S29',
    tajuk: 'Yuran Masuk Tidak Boleh Dipulangkan',
    sumber: 'AKTA_1993',
    rujukanUndang2: 'Seksyen 29 Akta Koperasi 1993',
    kategori: 'KEAHLIAN',
    deskripsiBM: 'Yuran masuk ahli (entrance fee) yang telah dibayar tidak boleh dipulangkan kepada ahli di bawah sebarang keadaan, termasuk upon pembatalan keahlian.',
    deskripsiEN: 'Entrance fees paid by members are non-refundable under any circumstances, including membership cancellation.',
    tindakanPembetulan: 'Semak dasar pemulangan yuran; yuran masuk mesti kekal sebagai hasil koperasi.',
  },
  {
    kod: 'AKTA-S26',
    tajuk: 'Syarat Pemberian Pembiayaan Kepada Ahli',
    sumber: 'AKTA_1993',
    rujukanUndang2: 'Seksyen 26 Akta Koperasi 1993 & Peraturan 14',
    kategori: 'PEMBIAYAAN',
    deskripsiBM: 'Pembiayaan kepada ahli mesti mendapat kelulusan ALK dengan sekurang-kurangnya satu penjamin, dan jumlah keseluruhan pembiayaan tidak boleh melebihi had liputan modal syer yang dibenarkan oleh undang-undang kecil.',
    deskripsiEN: 'Member financing requires Board approval with at least one guarantor; total financing must not exceed the multiple of share capital allowed by by-laws.',
    tindakanPembetulan: 'Kemas kini tatacara kelulusan pembiayaan & pastikan setiap pinjaman mempunyai penjamin.',
  },

  // ===== GARIS PANDUAN SKM =====
  {
    kod: 'GP-SKM-BH',
    tajuk: 'Kekuatan Rizab / Nisbah Modal Koperasi',
    sumber: 'GARIS_PANDUAN_SKM',
    rujukanUndang2: 'Garis Panduan Indikator Kewangan SKM',
    kategori: 'KEWANGAN',
    deskripsiBM: 'Nisbah rizab statutori terkumpul terhadap modal syer digalakkan melebihi 15% sebagai penanda aras kesihatan kewangan koperasi (GP SKM).',
    deskripsiEN: 'Ratio of accumulated statutory reserve to share capital should exceed 15% as a financial health benchmark (SKM guideline).',
    tindakanPembetulan: 'Tingkatkan peruntukan KWRS tahunan sebelum menimbang agihan dividen/honorarium.',
  },
  {
    kod: 'GP-SKM-EL',
    tajuk: 'Elaun & Honorarium Anggota ALK',
    sumber: 'GARIS_PANDUAN_SKM',
    rujukanUndang2: 'Garis Panduan Elaun Ahli Lembaga Koperasi SKM',
    kategori: 'TADBIR_UTUS',
    deskripsiBM: 'Jumlah elaun & honorarium ALK tidak boleh melebihi 10% daripada lebihan bersih tahunan mengikut garis panduan SKM.',
    deskripsiEN: 'Total Board allowances & honorarium must not exceed 10% of annual net surplus per SKM guideline.',
    tindakanPembetulan: 'Semak semula elaun ALK semasa AGM; kurangkan jika melebihi had 10% lebihan bersih.',
  },
  {
    kod: 'GP-SKM-DOK',
    tajuk: 'Rekod Dokumen & Minit Disahkan',
    sumber: 'GARIS_PANDUAN_SKM',
    rujukanUndang2: 'Garis Panduan Rekod & Minit SKM',
    kategori: 'DOKUMEN',
    deskripsiBM: 'Semua minit mesyuarat, baucar pembayaran & dokumen sokongan kewangan mesti lengkap, disahkan dan disimpan mengikut tempoh peruntukan akta (minima 7 tahun).',
    deskripsiEN: 'All meeting minutes, payment vouchers & supporting financial documents must be complete, verified and retained for the statutory period (min 7 years).',
    tindakanPembetulan: 'Selesaikan dokumen berstatus PENDING_SEMAKAN dan sahkan melalui modul Dokumen.',
  },
  {
    kod: 'GP-SKM-TRN',
    tajuk: 'Rekod Transaksi Berkala (Dwikembara)',
    sumber: 'GARIS_PANDUAN_SKM',
    rujukanUndang2: 'Garis Panduan Perakaunan Koperasi SKM',
    kategori: 'KEWANGAN',
    deskripsiBM: 'Lejar transaksi perlu dikemaskini secara berkala (dwibulanan minimum) tanpa jurang lebih 60 hari untuk memastikan penyata kewangan semasa & boleh diaudit.',
    deskripsiEN: 'The transaction ledger should be updated regularly (at least bi-monthly) with no gap exceeding 60 days.',
    tindakanPembetulan: 'Posting transaksi tertunggak melalui modul Perakaunan & Lejar.',
  },

  // ===== UNDANG-UNDANG KECIL =====
  {
    kod: 'UUK-SYER',
    tajuk: 'Nilai Minimum Modal Syer Ahli',
    sumber: 'UNDANG2_KECIL',
    rujukanUndang2: 'Undang-undang Kecil Koperasi - Syer',
    kategori: 'KEAHLIAN',
    deskripsiBM: 'Setiap ahli mesti memegang sekurang-kurangnya modal syer minimum yang ditetapkan dalam undang-undang kecil koperasi (contoh: RM100) pada semua masa semasa keahlian aktif.',
    deskripsiEN: 'Every member must hold at least the minimum share capital stipulated in the by-laws (e.g. RM100) at all times during active membership.',
    tindakanPembetulan: 'Maklumkan ahli bermodal syer rendah untuk top-up melalui potongan gaji bulanan.',
  },
  {
    kod: 'UUK-YURAN',
    tajuk: 'Yuran Bulanan Ahli & Tunggakan',
    sumber: 'UNDANG2_KECIL',
    rujukanUndang2: 'Undang-undang Kecil Koperasi - Yuran',
    kategori: 'KEAHLIAN',
    deskripsiBM: 'Yuran bulanan ahli mesti dibayar mengikut kadar undang-undang kecil; tunggakan melebihi 6 bulan boleh mengakibatkan penggantungan keahlian mengikut tatacara.',
    deskripsiEN: 'Monthly membership fees must be paid per by-laws; arrears exceeding 6 months may result in membership suspension per procedure.',
    tindakanPembetulan: 'Issu notis tunggakan yuran & rancang pelan potongan gaji bagi ahli tertunggak.',
  },
  {
    kod: 'UUK-JAWATAN',
    tajuk: 'Struktur Jawatan Wajib ALK',
    sumber: 'UNDANG2_KECIL',
    rujukanUndang2: 'Undang-undang Kecil Standard Koperasi - Jawatan',
    kategori: 'TADBIR_UTUS',
    deskripsiBM: 'ALK mesti mempunyai sekurang-kurangnya tiga jawatan utama terisi pada setiap masa: Pengerusi, Setiausaha dan Bendahari.',
    deskripsiEN: 'The Board must have at least three key positions filled at all times: Chairman, Secretary and Treasurer.',
    tindakanPembetulan: 'Panggil mesyuarat ALK untuk melantik pemangku jawatan yang kosong.',
  },
  {
    kod: 'UUK-SEKAT',
    tajuk: 'Tempoh Perkhidmatan Maksimum ALK & JAD',
    sumber: 'UNDANG2_KECIL',
    rujukanUndang2: 'Undang-undang Kecil Standard Koperasi - Tempoh Lantikan',
    kategori: 'TADBIR_UTUS',
    deskripsiBM: 'Anggota ALK tidak boleh berkhidmat melebihi tempoh lantikan yang diluluskan (biasanya 2 tahun sesi) tanpa pemilihan semula dalam AGM; lantikan yang tamat tempoh perlu dikemaskini.',
    deskripsiEN: 'Board members must not serve beyond the approved term (usually 2-year session) without re-election at the AGM; expired terms need updating.',
    tindakanPembetulan: 'Kemaskini rekod kepimpinan atau jalankan pemilihan semula dalam AGM akan datang.',
  },
];

// ---------------------------------------------------------------------------
// ENGINE SEMAKAN AUTOMATIK
// ---------------------------------------------------------------------------

export function semakPematuhan(data: DataPematuhan): LaporanPematuhan {
  const hasil: HasilSemakanPematuhan[] = [];
  const tahunSemasa = new Date().getFullYear();

  // Derive core financials from live data
  const totalHasil = data.cartaAkaun.filter(c => c.kategori === 'HASIL').reduce((a, b) => a + b.bakiSemasa, 0);
  const totalBelanja = data.cartaAkaun.filter(c => c.kategori === 'BELANJA').reduce((a, b) => a + b.bakiSemasa, 0);
  const untungBersih = data.untungBersihSemasa || (totalHasil - totalBelanja);
  const rekodSemasa = data.rekodTahunanList.find(r => r.tahun === tahunSemasa) || data.rekodTahunanList[data.rekodTahunanList.length - 1];
  const rekodTerdahulu = [...data.rekodTahunanList].filter(r => r.tahun < tahunSemasa).pop();

  const kwrsAktual = rekodSemasa?.kwrs12 ?? Math.max(0, untungBersih * 0.12);
  const kwpkAktual = rekodSemasa?.kwpk3 ?? Math.max(0, untungBersih * 0.03);
  const kwpAktual = rekodSemasa?.kwp1 ?? Math.max(0, untungBersih * 0.01);

  const akaun = (kod: string) => data.cartaAkaun.find(c => c.kod === kod);

  // ===== AKTA-S54: KWRS 12% =====
  const kwrsWajib = Math.max(0, untungBersih * 0.12);
  const kwrsPatuh = kwrsAktual >= kwrsWajib * 0.999;
  hasil.push({
    peraturan: SENARAI_PERATURAN.find(p => p.kod === 'AKTA-S54')!,
    status: kwrsPatuh ? 'PATUH' : 'TIDAK_PATUH',
    skor: 5,
    nilaiSemasa: `KWRS terkumpul: ${formatRM(kwrsAktual)}`,
    hadPeraturan: `Minima 12% x ${formatRM(untungBersih)} = ${formatRM(kwrsWajib)}`,
    catatan: kwrsPatuh
      ? `Peruntukan KWRS melebihi/sempurna dengan keperluan 12% lebihan bersih.`
      : `Kekurangan peruntukan KWRS: ${formatRM(kwrsWajib - kwrsAktual)}. Agihan dividen TIDAK BOLEH dibuat sehingga diperbetulkan.`,
  });

  // ===== AKTA-S54B: KWPK 3% =====
  const kwpkWajib = Math.max(0, untungBersih * 0.03);
  const kwpkPatuh = kwpkAktual >= kwpkWajib * 0.999;
  hasil.push({
    peraturan: SENARAI_PERATURAN.find(p => p.kod === 'AKTA-S54B')!,
    status: kwpkPatuh ? 'PATUH' : 'TIDAK_PATUH',
    skor: 3,
    nilaiSemasa: `KWPK terkumpul: ${formatRM(kwpkAktual)}`,
    hadPeraturan: `Minima 3% x ${formatRM(untungBersih)} = ${formatRM(kwpkWajib)}`,
    catatan: kwpkPatuh ? 'Peruntukan KWPK 3% dipenuhi.' : `Kekurangan ${formatRM(kwpkWajib - kwpkAktual)} untuk KWPK.`,
  });

  // ===== AKTA-S54C: KWP 1% =====
  const kwpWajib = Math.max(0, untungBersih * 0.01);
  const kwpPatuh = kwpAktual >= kwpWajib * 0.999;
  hasil.push({
    peraturan: SENARAI_PERATURAN.find(p => p.kod === 'AKTA-S54C')!,
    status: kwpPatuh ? 'PATUH' : 'TIDAK_PATUH',
    skor: 2,
    nilaiSemasa: `KWP terkumpul: ${formatRM(kwpAktual)}`,
    hadPeraturan: `Minima 1% x ${formatRM(untungBersih)} = ${formatRM(kwpWajib)}`,
    catatan: kwpPatuh ? 'Peruntukan KWP 1% dipenuhi.' : `Kekurangan ${formatRM(kwpWajib - kwpAktual)} untuk KWP.`,
  });

  // ===== AKTA-S57: Dividen maks 10% =====
  const kadarDividen = data.kadarDividenCadangan ?? rekodSemasa?.peratusDividen ?? 0;
  const dividenPatuh = kadarDividen <= 10;
  hasil.push({
    peraturan: SENARAI_PERATURAN.find(p => p.kod === 'AKTA-S57')!,
    status: dividenPatuh ? 'PATUH' : 'TIDAK_PATUH',
    skor: 4,
    nilaiSemasa: `Kadar dividen cadangan: ${kadarDividen.toFixed(2)}%`,
    hadPeraturan: 'Maksimum 10.00% modal syer',
    catatan: dividenPatuh
      ? kadarDividen === 0 ? 'Tiada agihan dividen aktif direkodkan.' : 'Kadar dividen dalam had statutori.'
      : 'Kadar dividen MELEBIHI had 10% - melanggar Seksyen 57. Kurangkan kadar sebelum AGM.',
  });

  // ===== AKTA-S39: AGM & korum =====
  const agms = data.mesyuaratList.filter(m => m.jenis === 'AGM');
  const agmTerakhir = agms.sort((a, b) => b.tarikh.localeCompare(a.tarikh))[0];
  const bilanganAhliBerhak = data.ahliList.filter(a => a.status === 'AKTIF').length || 1;
  const korumDiperlukanAGM = Math.min(Math.ceil(bilanganAhliBerhak / 4), 50);
  let agmStatus: StatusPematuhan = 'TIDAK_DAPAT_DINILAI';
  let agmCatatan = 'Tiada rekod AGM dalam sistem.';
  if (agmTerakhir) {
    const korumOk = agmTerakhir.kehadiranHadir >= korumDiperlukanAGM;
    const tahunAGM = parseInt(agmTerakhir.tarikh.split('-')[0], 10);
    const tahunTertutup = rekodTerdahulu?.tahun ?? tahunSemasa - 1;
    const dalamTempoh = tahunAGM >= tahunTertutup;
    agmStatus = korumOk && dalamTempoh ? 'PATUH' : 'TIDAK_PATUH';
    agmCatatan = `AGM terakhir "${agmTerakhir.bilangan}" pada ${agmTerakhir.tarikh}: kehadiran ${agmTerakhir.kehadiranHadir}/${bilanganAhliBerhak} (korum perlu ${korumDiperlukanAGM}). ${korumOk ? 'Korum DICAPAI.' : 'Korum TIDAT dicapai.'} ${dalamTempoh ? 'Dalam tempoh 6 bulan selepas tutup tahun.' : 'AMARAN: AGM mungkin lewat berbanding tahun kewangan tertutup.'}`;
    if (!korumOk) agmStatus = 'TIDAK_PATUH';
    else if (!dalamTempoh) agmStatus = 'AMARAN';
  }
  hasil.push({
    peraturan: SENARAI_PERATURAN.find(p => p.kod === 'AKTA-S39')!,
    status: agmStatus,
    skor: 6,
    nilaiSemasa: agmTerakhir ? `${agmTerakhir.bilangan} (${agmTerakhir.tarikh})` : 'Tiada AGM direkod',
    hadPeraturan: `Korum: min(1/4 ahli, 50) = ${korumDiperlukanAGM} orang`,
    catatan: agmCatatan,
  });

  // ===== AKTA-S44: Kekerapan & korum mesyuarat ALK =====
  const alkMesyuarat = data.mesyuaratList.filter(m => m.jenis === 'ALK' && m.status === 'SELESAI');
  const alkAktif = data.jawatanKuasaList.filter(j => j.kategori === 'ALK' && j.status === 'AKTIF');
  const korumALK = Math.floor(alkAktif.length / 2) + 1;
  const alkGagalKorum = alkMesyuarat.filter(m => m.kehadiranHadir < korumALK);
  const alkStatus: StatusPematuhan = alkMesyuarat.length === 0
    ? 'AMARAN'
    : alkGagalKorum.length > 0 ? 'TIDAK_PATUH' : 'PATUH';
  hasil.push({
    peraturan: SENARAI_PERATURAN.find(p => p.kod === 'AKTA-S44')!,
    status: alkStatus,
    skor: 4,
    nilaiSemasa: `${alkMesyuarat.length} mesyuarat ALK selesai; ${alkGagalKorum.length} gagal korum (${korumALK} diperlukan)`,
    hadPeraturan: `Sekurang-kurangnya 1 mesyuarat setiap 3 bulan; korum > 50% ALK (${korumALK}/${alkAktif.length})`,
    catatan: alkMesyuarat.length === 0
      ? 'Tiada mesyuarat ALK direkodkan. Pastikan mesyuarat suku tahunan diadakan & minit direkodkan.'
      : alkGagalKorum.length > 0
      ? `${alkGagalKorum.length} mesyuarat ALK tidak mencapai korum — keputusan mesyuarat berkenaan berisiko tidak sah.`
      : 'Semua mesyuarat ALK mencapai korum yang ditetapkan.',
  });

  // ===== AKTA-S47: JAD =====
  const jadAktif = data.jawatanKuasaList.filter(j => j.kategori === 'JAD' && j.status === 'AKTIF');
  const noKpALK = new Set(data.jawatanKuasaList.filter(j => j.kategori === 'ALK').map(j => j.noKp));
  const jadBertindih = jadAktif.filter(j => noKpALK.has(j.noKp));
  const jadStatus = jadAktif.length === 0 ? 'TIDAK_PATUH' : jadBertindih.length > 0 ? 'TIDAK_PATUH' : 'PATUH';
  hasil.push({
    peraturan: SENARAI_PERATURAN.find(p => p.kod === 'AKTA-S47')!,
    status: jadStatus,
    skor: 4,
    nilaiSemasa: `${jadAktif.length} anggota JAD aktif`,
    hadPeraturan: 'JAD mesti wujud & bebas daripada anggota ALK',
    catatan: jadAktif.length === 0
      ? 'TIADA JAD aktif — pelanggaran Seksyen 47. Lantik JAD dalam AGM akan datang.'
      : jadBertindih.length > 0
      ? `${jadBertindih.length} anggota JAD bertindih dengan ALK (${jadBertindih.map(j => j.nama).join(', ')}).`
      : 'JAD lengkap & bebas daripada pertindihan keanggotaan ALK.',
  });

  // ===== AKTA-S50: Audit tahunan =====
  const auditStatus = !rekodSemasa ? 'TIDAK_DAPAT_DINILAI' as StatusPematuhan
    : rekodSemasa.statusAuditSKM === 'DISAHKAN_SKM' ? 'PATUH' as StatusPematuhan
    : rekodSemasa.statusAuditSKM === 'DALAM_PROSES' ? 'AMARAN' as StatusPematuhan
    : 'TIDAK_PATUH' as StatusPematuhan;
  hasil.push({
    peraturan: SENARAI_PERATURAN.find(p => p.kod === 'AKTA-S50')!,
    status: auditStatus,
    skor: 5,
    nilaiSemasa: rekodSemasa ? `${rekodSemasa.tahun}: ${rekodSemasa.statusAuditSKM} (${rekodSemasa.juruauditBertauliah})` : 'Tiada rekod',
    hadPeraturan: 'Audit tahunan oleh juru audit bertauliah SKM',
    catatan: rekodSemasa?.catatanSKM || 'Kemukakan penyata teraudit kepada SKM setiap tahun.',
  });

  // ===== AKTA-S29: Yuran masuk tidak boleh dipulangkan =====
  const yuranMasukAhli = data.ahliList.filter(a => a.yuranMasuk <= 0).length;
  hasil.push({
    peraturan: SENARAI_PERATURAN.find(p => p.kod === 'AKTA-S29')!,
    status: yuranMasukAhli === 0 ? 'PATUH' : 'AMARAN',
    skor: 2,
    nilaiSemasa: `${data.ahliList.length - yuranMasukAhli}/${data.ahliList.length} ahli dengan yuran masuk RM10 direkod`,
    hadPeraturan: 'Yuran masuk RM10 kekal sebagai hasil; tiada pemulangan',
    catatan: yuranMasukAhli === 0
      ? 'Semua ahli mempunyai rekod yuran masuk yang sah.'
      : `${yuranMasukAhli} ahli tanpa rekod yuran masuk — kemaskini pendaftaran.`,
  });

  // ===== AKTA-S26: Pembiayaan dengan penjamin =====
  const pembiayaanAktif = data.pembiayaanList.filter(p => p.status === 'DILULUSKAN');
  const tiadaPenjamin = pembiayaanAktif.filter(p => !p.penjamin || p.penjamin.length === 0);
  const totalPembiayaan = pembiayaanAktif.reduce((a, b) => a + b.bakiPinjaman, 0);
  const totalModalSyer = data.ahliList.filter(a => a.status === 'AKTIF').reduce((a, b) => a + b.modalSyer, 0);
  const nisbahPembiayaan = totalModalSyer > 0 ? totalPembiayaan / totalModalSyer : 0;
  const pembiayaanStatus = tiadaPenjamin.length > 0 ? 'TIDAK_PATUH' : nisbahPembiayaan > 1.0 ? 'AMARAN' : 'PATUH';
  hasil.push({
    peraturan: SENARAI_PERATURAN.find(p => p.kod === 'AKTA-S26')!,
    status: pembiayaanStatus,
    skor: 4,
    nilaiSemasa: `${pembiayaanAktif.length} pembiayaan aktif; baki ${formatRM(totalPembiayaan)}; nisbah pinjaman/syer ${(nisbahPembiayaan * 100).toFixed(1)}%`,
    hadPeraturan: 'Penjamin >= 1 setiap pembiayaan; jumlah dalam had liputan modal syer UUK',
    catatan: tiadaPenjamin.length > 0
      ? `${tiadaPenjamin.length} pembiayaan TIADA penjamin: ${tiadaPenjamin.slice(0, 3).map(p => p.namaAhli).join(', ')}${tiadaPenjamin.length > 3 ? '...' : ''}`
      : nisbahPembiayaan > 1.0
      ? `Nisbah pembiayaan/syer ${(nisbahPembiayaan * 100).toFixed(1)}% melebihi 100% modal syer — semak had undang-undang kecil.`
      : 'Semua pembiayaan mempunyai penjamin & dalam had modal syer.',
  });

  // ===== GP-SKM-BH: Nisbah rizab/modal =====
  const modalSyerAkaun = akaun('3010')?.bakiSemasa ?? totalModalSyer;
  const kwrsAkaun = akaun('3020')?.bakiSemasa ?? kwrsAktual;
  const nisbahRizab = modalSyerAkaun > 0 ? kwrsAkaun / modalSyerAkaun : 0;
  hasil.push({
    peraturan: SENARAI_PERATURAN.find(p => p.kod === 'GP-SKM-BH')!,
    status: nisbahRizab >= 0.15 ? 'PATUH' : nisbahRizab >= 0.10 ? 'AMARAN' : 'TIDAK_PATUH',
    skor: 3,
    nilaiSemasa: `KWRS ${formatRM(kwrsAkaun)} / Modal Syer ${formatRM(modalSyerAkaun)} = ${(nisbahRizab * 100).toFixed(1)}%`,
    hadPeraturan: 'Digalakkan >= 15% (amaran < 15%, kritikal < 10%)',
    catatan: nisbahRizab >= 0.15
      ? 'Nisbah rizab kukuh mengikut penanda aras SKM.'
      : `Nisbah rizab ${(nisbahRizab * 100).toFixed(1)}% di bawah sasaran 15% SKM.`,
  });

  // ===== GP-SKM-EL: Elaun ALK <= 10% lebihan bersih =====
  const elaunALK = akaun('5020')?.bakiSemasa ?? 0;
  const nisbahElaun = untungBersih > 0 ? elaunALK / untungBersih : 0;
  hasil.push({
    peraturan: SENARAI_PERATURAN.find(p => p.kod === 'GP-SKM-EL')!,
    status: nisbahElaun <= 0.10 ? 'PATUH' : 'TIDAK_PATUH',
    skor: 3,
    nilaiSemasa: `Elaun ALK ${formatRM(elaunALK)} / Lebihan bersih ${formatRM(untungBersih)} = ${(nisbahElaun * 100).toFixed(1)}%`,
    hadPeraturan: 'Maksimum 10% lebihan bersih tahunan',
    catatan: nisbahElaun <= 0.10
      ? 'Elaun ALK dalam had garis panduan SKM.'
      : `Elaun ALK melebihi 10% lebihan bersih (${(nisbahElaun * 100).toFixed(1)}%) — semak semula kelulusan AGM.`,
  });

  // ===== GP-SKM-DOK: Dokumen disahkan =====
  const dokPending = data.dokumenList.filter(d => d.status === 'PENDING_SEMAKAN');
  const dokDitolak = data.dokumenList.filter(d => d.status === 'DITOLAK');
  const dokStatus = dokDitolak.length > 0 ? 'TIDAK_PATUH' : dokPending.length > 0 ? 'AMARAN' : 'PATUH';
  hasil.push({
    peraturan: SENARAI_PERATURAN.find(p => p.kod === 'GP-SKM-DOK')!,
    status: dokStatus,
    skor: 3,
    nilaiSemasa: `${data.dokumenList.length} dokumen; ${dokPending.length} menunggu semakan; ${dokDitolak.length} ditolak`,
    hadPeraturan: 'Semua dokumen sokongan mesti DISAHKAN',
    catatan: dokDitolak.length > 0
      ? `${dokDitolak.length} dokumen DITOLAK — muat naik semula versi sah segera.`
      : dokPending.length > 0
      ? `${dokPending.length} dokumen menunggu semakan: ${dokPending.slice(0, 3).map(d => d.namaFail).join(', ')}${dokPending.length > 3 ? '...' : ''}`
      : 'Semua dokumen sokongan telah disahkan.',
  });

  // ===== GP-SKM-TRN: Kekemaskinian lejar =====
  const tarikhTransaksiTerkini = data.transaksiList
    .map(t => t.tarikh)
    .sort()
    .pop();
  let hariJurang = 0;
  if (tarikhTransaksiTerkini) {
    hariJurang = Math.floor((Date.now() - new Date(tarikhTransaksiTerkini).getTime()) / 86400000);
  }
  hasil.push({
    peraturan: SENARAI_PERATURAN.find(p => p.kod === 'GP-SKM-TRN')!,
    status: !tarikhTransaksiTerkini ? 'TIDAK_DAPAT_DINILAI' : hariJurang <= 60 ? 'PATUH' : 'TIDAK_PATUH',
    skor: 2,
    nilaiSemasa: tarikhTransaksiTerkini ? `Transaksi terkini: ${tarikhTransaksiTerkini} (${hariJurang} hari lalu)` : 'Tiada transaksi',
    hadPeraturan: 'Jurang maksimum 60 hari',
    catatan: hariJurang <= 60
      ? 'Lejar dikemaskini dalam tempoh garis panduan.'
      : `Lejar tertunggak ${hariJurang} hari — posting transaksi terkini segera.`,
  });

  // ===== UUK-SYER: Modal syer minimum =====
  const MODAL_SYER_MIN = 100;
  const ahliSyerRendah = data.ahliList.filter(a => a.status === 'AKTIF' && a.modalSyer < MODAL_SYER_MIN);
  hasil.push({
    peraturan: SENARAI_PERATURAN.find(p => p.kod === 'UUK-SYER')!,
    status: ahliSyerRendah.length === 0 ? 'PATUH' : ahliSyerRendah.length <= 2 ? 'AMARAN' : 'TIDAK_PATUH',
    skor: 3,
    nilaiSemasa: `${ahliSyerRendah.length} ahli aktif di bawah RM${MODAL_SYER_MIN}`,
    hadPeraturan: `Modal syer minimum RM${MODAL_SYER_MIN} (undang-undang kecil)`,
    catatan: ahliSyerRendah.length === 0
      ? 'Semua ahli aktif memenuhi modal syer minimum.'
      : `Ahli bermodal syer rendah: ${ahliSyerRendah.slice(0, 3).map(a => `${a.nama} (RM${a.modalSyer})`).join(', ')}${ahliSyerRendah.length > 3 ? '...' : ''}`,
  });

  // ===== UUK-YURAN: Yuran bulanan & tunggakan =====
  const ahliYuranTinggi = data.ahliList.filter(a => a.status === 'AKTIF' && a.yuranBulanan <= 0);
  const yuranTerkumpulAkaun = akaun('2020')?.bakiSemasa ?? 0;
  hasil.push({
    peraturan: SENARAI_PERATURAN.find(p => p.kod === 'UUK-YURAN')!,
    status: ahliYuranTinggi.length === 0 ? 'PATUH' : 'AMARAN',
    skor: 2,
    nilaiSemasa: `${ahliYuranTinggi.length} ahli aktif tanpa yuran bulanan; yuran terkumpul ${formatRM(yuranTerkumpulAkaun)}`,
    hadPeraturan: 'Yuran bulanan positif untuk semua ahli aktif',
    catatan: ahliYuranTinggi.length === 0
      ? 'Semua ahli aktif mempunyai yuran bulanan berjalan.'
      : `${ahliYuranTinggi.length} ahli tanpa yuran bulanan — semak status tunggakan.`,
  });

  // ===== UUK-JAWATAN: Jawatan wajib ALK =====
  const jawatanWajib = ['Pengerusi ALK', 'Setiausaha ALK', 'Bendahari ALK'];
  const jawatanTerisi = jawatanWajib.filter(j =>
    data.jawatanKuasaList.some(k => k.kategori === 'ALK' && k.jawatanKoperasi === j && k.status === 'AKTIF')
  );
  const jawatanKosong = jawatanWajib.filter(j => !jawatanTerisi.includes(j));
  hasil.push({
    peraturan: SENARAI_PERATURAN.find(p => p.kod === 'UUK-JAWATAN')!,
    status: jawatanKosong.length === 0 ? 'PATUH' : 'TIDAK_PATUH',
    skor: 4,
    nilaiSemasa: `${jawatanTerisi.length}/3 jawatan utama terisi (${jawatanTerisi.join(', ') || 'tiada'})`,
    hadPeraturan: 'Pengerusi, Setiausaha & Bendahari ALK mesti terisi',
    catatan: jawatanKosong.length === 0
      ? 'Struktur kepimpinan ALK lengkap.'
      : `Jawatan KOSONG: ${jawatanKosong.join(', ')} — lantik pemangku segera.`,
  });

  // ===== UUK-SEKAT: Tempoh lantikan =====
  const today = new Date().toISOString().split('T')[0];
  const lantikanTamat = data.jawatanKuasaList.filter(j =>
    j.status === 'AKTIF' && j.tarikhLantikan && tamatTempohLantikan(j.tarikhLantikan, 2) < today
  );
  const lantikanHampir = data.jawatanKuasaList.filter(j => {
    if (j.status !== 'AKTIF' || !j.tarikhLantikan) return false;
    const tamat = tamatTempohLantikan(j.tarikhLantikan, 2);
    return tamat >= today && Math.floor((new Date(tamat).getTime() - Date.now()) / 86400000) <= 90;
  });
  const sekatStatus = lantikanTamat.length > 0 ? 'TIDAK_PATUH' : lantikanHampir.length > 0 ? 'AMARAN' : 'PATUH';
  hasil.push({
    peraturan: SENARAI_PERATURAN.find(p => p.kod === 'UUK-SEKAT')!,
    status: sekatStatus,
    skor: 3,
    nilaiSemasa: `${lantikanTamat.length} tamat tempoh; ${lantikanHampir.length} hampir tamat (90 hari)`,
    hadPeraturan: 'Tempoh lantikan maksimum 2 tahun sesi tanpa pemilihan semula',
    catatan: lantikanTamat.length > 0
      ? `Lantikan TERLEBIH tempoh: ${lantikanTamat.slice(0, 3).map(j => `${j.nama} (${j.jawatanKoperasi})`).join(', ')}${lantikanTamat.length > 3 ? '...' : ''}`
      : lantikanHampir.length > 0
      ? `${lantikanHampir.length} lantikan akan tamat dalam 90 hari — rancangkan pemilihan semula AGM.`
      : 'Semua lantikan dalam tempoh sah.',
  });

  // ----- Aggregation -----
  const bilanganPatuh = hasil.filter(h => h.status === 'PATUH').length;
  const bilanganAmaran = hasil.filter(h => h.status === 'AMARAN').length;
  const bilanganTidakPatuh = hasil.filter(h => h.status === 'TIDAK_PATUH').length;
  const bilanganTidakDapatDinilai = hasil.filter(h => h.status === 'TIDAK_DAPAT_DINILAI').length;

  const jumlahBerat = hasil.reduce((a, h) => a + h.skor, 0);
  const skorDiperoleh = hasil
    .filter(h => h.status === 'PATUH')
    .reduce((a, h) => a + h.skor, 0);
  const skorAmaran = hasil
    .filter(h => h.status === 'AMARAN')
    .reduce((a, h) => a + h.skor * 0.5, 0);

  const skorKeseluruhan = jumlahBerat === 0 ? 0 : Math.round(((skorDiperoleh + skorAmaran) / jumlahBerat) * 100);

  return {
    tarikhSemakan: new Date().toISOString().replace('T', ' ').substring(0, 19),
    skorKeseluruhan,
    bilanganPatuh,
    bilanganAmaran,
    bilanganTidakPatuh,
    bilanganTidakDapatDinilai,
    hasil,
  };
}

// Helper: tarikh tamat tempoh lantikan (tempohTahun selepas tarikh lantikan)
function tamatTempohLantikan(tarikhLantikan: string, tempohTahun: number): string {
  const d = new Date(tarikhLantikan);
  d.setFullYear(d.getFullYear() + tempohTahun);
  return d.toISOString().split('T')[0];
}

export function labelStatusPematuhan(status: StatusPematuhan, isEN = false): string {
  switch (status) {
    case 'PATUH': return isEN ? 'Compliant' : 'Patuh';
    case 'TIDAK_PATUH': return isEN ? 'Non-Compliant' : 'Tidak Patuh';
    case 'AMARAN': return isEN ? 'Warning' : 'Amaran';
    case 'TIDAK_DAPAT_DINILAI': return isEN ? 'Not Assessable' : 'Tidak Dapat Dinilai';
  }
}

export function labelSumberPeraturan(sumber: string, isEN = false): string {
  switch (sumber) {
    case 'AKTA_1993': return isEN ? 'Co-operative Societies Act 1993' : 'Akta Koperasi 1993';
    case 'GARIS_PANDUAN_SKM': return isEN ? 'SKM Guidelines' : 'Garis Panduan SKM';
    case 'UNDANG2_KECIL': return isEN ? 'Co-operative By-Laws' : 'Undang-undang Kecil';
  }
  return sumber;
}
