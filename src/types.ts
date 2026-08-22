/**
 * Type definitions for Sistem Pengurusan & Perakaunan Koperasi Malaysia (SPPKM)
 * Fully compliant with Akta Koperasi 1993 & Garis Panduan Suruhanjaya Koperasi Malaysia (SKM)
 */

export type StatusAhli = 'AKTIF' | 'PENDING_AL' | 'BERHENTI' | 'DIGANTUNG';

export type KategoriKepimpinan = 'ALK' | 'JAD';

export interface AnggotaJawatankuasa {
  id: string;
  noAhli: string;
  nama: string;
  noKp: string;
  kategori: KategoriKepimpinan; // 'ALK' (Ahli Lembaga Koperasi) or 'JAD' (Jawatankuasa Audit Dalaman)
  jawatanKoperasi: string; // e.g. 'Pengerusi ALK', 'Setiausaha ALK', 'Bendahari ALK', 'Anggota ALK', 'Pengerusi JAD', 'Setiausaha JAD', 'Anggota JAD'
  jawatan?: string;
  portfolio?: string; // e.g. 'Biro Kewangan & Pelaburan', 'Biro Kebajikan', 'Audit Kewangan SKM'
  tarikhLantikan: string; // e.g. "2024-06-15"
  tempohKhidmat: string; // e.g. "Sesi 2024/2026 (2 Tahun)"
  status: 'AKTIF' | 'TAMAT_TEMPOH' | 'PELEPASAN';
  noTelefon: string;
  eMel: string;
  catatanSKM?: string;
  kumpulanGiliran?: 'KUMPULAN_A' | 'KUMPULAN_B' | 'KUMPULAN_C'; // 1/3 Rotational Group (4 members each out of 12 ALK)
  tahunGiliranBersara?: number; // e.g. 2024, 2025, 2026, 2027
  statusGiliran?: 'KEKAL' | 'BERSARA_GILIRAN' | 'DIPILIH_SEMULA' | 'LANTIKAN_BAHARU';
}

export interface WarisAhli {
  nama: string;
  hubungan: string;
  noKp: string;
  noTelefon: string;
}

export interface MaklumatBank {
  namaBank: string;
  noAkaun: string;
}

export interface Ahli {
  id: string;
  noAhli: string;
  nama: string;
  noKp: string;
  noTelefon: string;
  eMel: string;
  jawatanStaf: string;
  jawatan?: string;
  noGaji: string;
  majikan: string;
  pendidikanTertinggi?: string; // Highest Education Background
  pekerjaanPerniagaanSemasa?: string; // Current Occupation / Business
  tarikhSertai: string;
  status: StatusAhli;
  yuranMasuk: number; // RM 10.00 (Yuran Masuk tidak boleh dipulangkan)
  modalSyer: number; // Modal Syer Terbitan (Terkumpul)
  modalYuran?: number;
  yuranBulanan: number; // Yuran Bulanan/Yuran Yuran
  bakiPinjaman: number; // Baki Pembiayaan Ahli
  waris: WarisAhli;
  maklumatBank: MaklumatBank;
}

export type KategoriDokumen = 
  | 'KAD_PENGENALAN' 
  | 'SIJIL_PENDAFTARAN' 
  | 'BIL_INVOIS' 
  | 'BAUCAR_PEMBAYARAN' 
  | 'MINIT_MESYUARAT'
  | 'LAIN_LAIN';

export type StatusPengesahanDokumen = 'DISAHKAN' | 'PENDING_SEMAKAN' | 'DITOLAK';

export interface DokumenSokongan {
  id: string;
  namaFail: string;
  kategori: KategoriDokumen;
  rujukan: string;
  tarikhMuatNaik: string;
  saizFail: string;
  status: StatusPengesahanDokumen;
  sumberMuatNaik: string;
  catatanPengesahan?: string;
  pautanFail?: string;
  jumlahPengeluaranRM?: number;
  peringatanHantarAt?: string;
  bilPeringatan?: number;
}

export type KategoriAkaun = 'ASET' | 'LIABILITI' | 'EKUITI' | 'HASIL' | 'BELANJA';
export type JenisBaki = 'DEBIT' | 'KREDIT';

export interface CartaAkaun {
  kod: string;
  namaAkaun: string;
  kategori: KategoriAkaun;
  jenisBaki: JenisBaki;
  bakiAwal: number;
  bakiSemasa: number;
  notaSKM: string;
}

export type KategoriTransaksi = 
  | 'YURAN_SYER' 
  | 'POTONGAN_GAJI' 
  | 'PEMBIAYAN' 
  | 'BAYARAN_BALIK_PINJAMAN' 
  | 'JUALAN_PERNIAGAAN' 
  | 'BELANJA_PENTADBIRAN' 
  | 'AGIHAN_DIVIDEN' 
  | 'STATUTORI_SKM' 
  | 'JURNAL_AM';

export interface Transaksi {
  id: string;
  tarikh: string;
  noRujukan: string; // No Resit / Baucer Pembayaran
  perihal: string;
  noAhli?: string; // Jika berkaitan ahli
  namaAhli?: string;
  debitAkaunKod: string;
  kreditAkaunKod: string;
  jumlah: number;
  kategori: KategoriTransaksi;
  dikemaskiniOleh: string;
}

export type StatusPembiayaan = 'PERMOHONAN' | 'DILULUSKAN' | 'DITOLAK' | 'SELESAI';
export type JenisPembiayaan = 'MURABAHAH_BARANGAN' | 'PINJAMAN_DIRI' | 'PEMBIAYAN_PENDIDIKAN' | 'KENDERAAN';

export interface PembiayaanAhli {
  id: string;
  noAhli: string;
  namaAhli: string;
  jenisPembiayaan: JenisPembiayaan;
  jumlahPinjaman: number;
  kadarKeuntungan: number; // % p.a.
  tempohBulan: number;
  bayaranBulanan: number;
  bakiPinjaman: number;
  tarikhPermohonan: string;
  tarikhLulus?: string;
  status: StatusPembiayaan;
  penjamin: string[];
}

export interface JadualPotonganGaji {
  noAhli: string;
  nama: string;
  noGaji: string;
  noKp: string;
  potonganSyer: number;
  potonganYuran: number;
  potonganPinjaman: number;
  jumlahPotongan: number;
  statusPotongan: 'PENDING' | 'TERIMA' | 'GAGAL';
}

export interface RingkasanStatutoriSKM {
  keuntunganKasar: number;
  jumlahBelanja: number;
  untungBersihSebelumStatutori: number;
  
  // Statutori Koperasi (Akta Koperasi 1993)
  kwrs12: number; // Kumpulan Wang Rizab Statutori 12%
  kwpk3: number; // Kumpulan Wang Pendidikan Koperasi 3%
  kwp1: number;  // Kumpulan Wang Pembangunan Koperasi 1%
  
  untungBersihBolehDiagih: number;
  dividenSyerCadangan: number; // Max 10%
  peratusDividen: number;
  honorariumALK: number;
  bakiDibawaKeHadapan: number;
}

export interface RekodKewanganTahunan {
  tahun: number; // e.g. 2023, 2024, 2025, 2026
  jumlahHasil: number;
  jumlahBelanja: number;
  untungBersih: number;
  keuntunganBersih?: number;
  pendapatanKasar?: number;
  jumlahAset?: number;
  jumlahLiabiliti?: number;
  modalSyer?: number;
  modalYuran?: number;
  kadarDividenSyer?: number;
  kadarDividenYuran?: number;
  kwrs12: number;
  kwpk3: number;
  kwp1: number;
  dividenAgihanRM: number;
  peratusDividen: number;
  totalAset: number;
  totalLiabiliti: number;
  totalEkuiti: number;
  modalSyerTerkumpul: number;
  bilanganAhli: number;
  statusAuditSKM: 'DISAHKAN_SKM' | 'DALAM_PROSES' | 'DRAF';
  juruauditBertauliah: string;
  catatanSKM?: string;
}

export type ActivityLogCategory = 'AHLI' | 'PEMBIAYAAN' | 'PERAKAUNAN' | 'POTONGAN_GAJI' | 'DIVIDEN' | 'SISTEM' | 'MESYUARAT' | 'PENTADBIRAN';

export interface ActivityLog {
  id: string;
  tarikhMasa: string;
  kategori: ActivityLogCategory;
  tindakan: string;
  deskripsi: string;
  pengguna: string;
  noAhli?: string;
  namaAhli?: string;
  status: 'BERJAYA' | 'AMARAN' | 'INFO' | 'BATAL';
  jumlahRM?: number;
  ipAlamat?: string;
}

export type JenisMesyuarat = 'AGM' | 'ALK' | 'JAD' | 'JK_KHAS' | 'EGM';
export type StatusMesyuarat = 'DIJADUALKAN' | 'SELESAI' | 'DRAF' | 'DIBATALKAN';

export interface AgendaItem {
  id: string;
  no: number;
  tajuk: string;
  deskripsi?: string;
  pembawa?: string;
  keputusan?: string;
}

export interface UsulResolusi {
  id: string;
  tajuk: string;
  pencadang: string;
  penyokong: string;
  keputusan: 'SEBULAT_SUARA' | 'LULUS_MAJORITI' | 'DITOLAK' | 'MENUNGGU_UNDI';
  undiSetuju?: number;
  undiBantah?: number;
  undiKecuali?: number;
  notaSKM?: string;
  eVotingStatus?: 'OPEN' | 'CLOSED' | 'DRAFT';
  votedMemberIds?: string[];
}

export interface KehadiranRecord {
  id: string;
  noAhli?: string;
  nama: string;
  jawatan: string; // e.g. 'Pengerusi ALK', 'Ahli Biasa', 'Pemeriksa Akaun'
  status: 'HADIR' | 'BERSEBAB' | 'TANPA_SEBAB';
  tarikhDaftarMasa?: string;
}

export interface TandatanganDigital {
  id: string;
  namaSigner: string;
  jawatan: string; // e.g. 'Pengerusi ALK', 'Setiausaha ALK', 'Bendahari ALK', 'Pemeriksa Akaun JAD'
  noKpOrAhli?: string;
  tarikhTandatangan: string; // e.g. "2026-08-07 14:30:22"
  signatureDataUrl?: string; // Canvas base64 data image or SVG path
  signatureType: 'DRAWN' | 'TYPED_DIGITAL';
  status: 'DISAHKAN' | 'SEMAKAN_DRAFT' | 'DITOLAK';
  catatan?: string;
  hashAuditan: string; // e.g. "SHA256: 8f9a2b..."
  ipAlamat?: string;
}

export interface Mesyuarat {
  id: string;
  bilangan: string; // e.g., "Bil. 04/2026" or "AGM Ke-15"
  jenis: JenisMesyuarat;
  tajuk: string;
  tarikh: string;
  masa: string;
  tempat: string;
  pengerusi: string;
  pencatatMinit: string;
  status: StatusMesyuarat;
  jumlahAhliBerhak: number;
  kehadiranHadir: number;
  kehadiranBersebab: number;
  korumMinimaDiperlukan: number;
  korumSah: boolean;
  agenda: AgendaItem[];
  resolusi: UsulResolusi[];
  kehadiranSenarai: KehadiranRecord[];
  senaraiKehadiran?: KehadiranRecord[];
  minitMesyuaratText?: string;
  notaPematuhanSKM?: string;
  tandatanganDigital?: TandatanganDigital[];
  penentusahMinit?: string[];
}

// Compliance Module (Akta Koperasi 1993, Garis Panduan SKM & Undang-undang Kecil)
export type SumberPeraturan = 'AKTA_1993' | 'GARIS_PANDUAN_SKM' | 'UNDANG2_KECIL';
export type KategoriPematuhan = 'KEWANGAN' | 'TADBIR_UTUS' | 'MESYUARAT' | 'KEAHLIAN' | 'PEMBIAYAAN' | 'DOKUMEN';
export type StatusPematuhan = 'PATUH' | 'TIDAK_PATUH' | 'AMARAN' | 'TIDAK_DAPAT_DINILAI';

export interface PeraturanPematuhan {
  kod: string; // e.g. 'AKTA-S57', 'GP-SKM-21', 'UUK-15'
  tajuk: string;
  sumber: SumberPeraturan;
  rujukanUndang2?: string; // e.g. 'Seksyen 57(1) Akta Koperasi 1993'
  kategori: KategoriPematuhan;
  deskripsiBM: string;
  deskripsiEN: string;
  tindakanPembetulan: string;
}

export interface HasilSemakanPematuhan {
  peraturan: PeraturanPematuhan;
  status: StatusPematuhan;
  skor: number; // 0-100 contribution weight when passed
  nilaiSemasa?: string; // human-readable current value
  hadPeraturan?: string;
  catatan?: string;
}

export interface LaporanPematuhan {
  tarikhSemakan: string;
  skorKeseluruhan: number; // 0-100
  bilanganPatuh: number;
  bilanganAmaran: number;
  bilanganTidakPatuh: number;
  bilanganTidakDapatDinilai: number;
  hasil: HasilSemakanPematuhan[];
}

// Point of Sale (POS) & Inventory Management Types
export interface ItemProdukPOS {
  id: string;
  kodBar: string;
  namaProduk: string;
  kategori: string;
  hargaKos: number;
  hargaJualan: number;
  hargaAhli: number;
  stok: number;
  stokMinima: number;
  unit: string;
  pautanGambar?: string;
}

export interface ItemCartPOS {
  produk: ItemProdukPOS;
  kuantiti: number;
  hargaSebenar: number;
  jumlah: number;
}

export type CaraBayaranPOS = 'TUNAI' | 'DUITNOW_QR' | 'KAD' | 'POTONGAN_GAJI_AHLI' | 'SECUREPAY';

export interface ItemJualanDetail {
  idProduk: string;
  namaProduk: string;
  kuantiti: number;
  hargaUnit: number;
  jumlah: number;
}

export interface TransaksiPOS {
  id: string;
  noResit: string;
  tarikhMasa: string;
  isAhli: boolean;
  noAhli?: string;
  namaPelanggan: string;
  itemSenarai: ItemJualanDetail[];
  subtotal: number;
  diskaun: number;
  jumlahKeseluruhan: number;
  kaedahBayaran?: 'TUNAI' | 'KAD_DEBIT' | 'QR_PAY' | 'POTONGAN_GAJI' | string;
  caraBayaran?: 'TUNAI' | 'KAD_DEBIT' | 'QR_PAY' | 'POTONGAN_GAJI' | string;
  status?: 'SELESAI' | 'DIBATALKAN' | string;
  dikeluarkanOleh?: string;
  juruwang?: string;
  noTransaksiLejar?: string;
  jumlahBayar?: number;
  bakiTunai?: number;
}

// SKM Loans (TMP-SKM) & Development Grants (Geran SKM / KUSKOP) Tracking Types
export type JenisDanaSKM = 
  | 'PINJAMAN_TMP_SKM' 
  | 'GERAN_BANTUAN_SKM' 
  | 'GERAN_KUSKOP' 
  | 'GERAN_DIGITALISASI' 
  | 'GERAN_KHAS';

export type StatusDanaSKM = 
  | 'DILULUSKAN' 
  | 'AKTIF_BERJALAN' 
  | 'MENUNGGU_PENGELUARAN' 
  | 'SELESAI' 
  | 'AUDIT_SELESAI';

export type KategoriPerbelanjaanDana = 
  | 'PEMBELIAN_ASET_MESIN' 
  | 'PENGUBAHSUAIAN_PREMIS' 
  | 'MODAL_PUSINGAN_STOK' 
  | 'SISTEM_IT_SOFTWARE' 
  | 'LATIHAN_PEMBANGUNAN' 
  | 'OPERASI_KHAS';

export interface RekodPenggunaanDana {
  id: string;
  danaId: string;
  tarikh: string;
  perkara: string;
  kategori: KategoriPerbelanjaanDana;
  jumlahRM: number;
  penerimaBayaran: string;
  noBaucarResit: string;
  dokumenSokonganId?: string;
  pautanDokumen?: string;
  statusVerifikasi: 'DISAHKAN_JAD' | 'MENUNGGU_VERIFIKASI' | 'DITOLAK';
  catatanAudit?: string;
}

export interface RekodBayaranBalikPinjamanSKM {
  id: string;
  danaId: string;
  tarikhBayaran: string;
  noResitSKM: string;
  prinsipalRM: number;
  cajPerkhidmatanRM: number; // e.g. 2% - 3%
  jumlahBayaranRM: number;
  bakiPrinsipalSelepasBayaran: number;
  status: 'BERJAYA' | 'PROSES';
}

export interface DanaGeranSKM {
  id: string;
  rujukanKelulusanSKM: string; // e.g. "SKM/HQ/TMP-2023/089" or "SKM/W/GBP-2024/015"
  tajukProjek: string;
  jenisDana: JenisDanaSKM; // PINJAMAN_TMP_SKM or GERAN_BANTUAN_SKM etc.
  pemberiDana: 'SURUHANJAYA_KOPERASI_MALAYSIA' | 'KUSKOP' | 'KERAJAAN_NEGERI' | 'LAIN_LAIN';
  jumlahDiluluskan: number; // RM
  jumlahDikeluarkan: number; // RM Disbursed to co-op bank
  bakiBelumDibelanja: number; // RM Remaining
  tarikhKelulusan: string;
  tarikhMulaProjek: string;
  tarikhTamatSasaran: string;
  status: StatusDanaSKM;
  
  // For Pinjaman TMP-SKM only
  kadarCajPerkhidmatanTahunan?: number; // e.g. 2.5% setahun
  tempohBayaranBalikBulan?: number; // e.g. 60 bulan (5 tahun)
  ansuranBulanan?: number; // RM
  jumlahTelahDibayarBalik?: number; // RM Principal + Service Fee paid back to SKM
  bakiPinjamanSKMTertunggak?: number; // RM Outstanding loan balance to SKM

  // Milestone & Objective
  objektifProjek: string;
  peratusSiapFizikal: number; // e.g. 85%
  penggunaanDanaList: RekodPenggunaanDana[];
  bayaranBalikList?: RekodBayaranBalikPinjamanSKM[];
  pegawaiPemantauSKM?: string;
  noTelefonPegawaiSKM?: string;
}

// ==========================================
// 12. TABUNG KEBAJIKAN, KHAIRAT KEMATIAN & MANFAAT ANGGOTA
// ==========================================
export type JenisTuntutanKebajikan = 
  | 'KHAIRAT_KEMATIAN_ANGGOTA'
  | 'KHAIRAT_KEMATIAN_WARIS'
  | 'BANTUAN_HOSPITAL_SAKIT'
  | 'BANTUAN_BENCANA_KEBAKARAN'
  | 'KECEMERLANGAN_PENDIDIKAN'
  | 'BANTUAN_PERKAHWINAN'
  | 'LAIN_LAIN_KEBAJIKAN';

export type StatusTuntutanKebajikan = 
  | 'DRAF'
  | 'DISEMAK_SETIAUSAHA'
  | 'DILULUSKAN_ALK'
  | 'DITOLAK'
  | 'DIBAYAR';

export interface TuntutanKebajikan {
  id: string;
  noRujukan: string; // e.g. "TKB-2026/001"
  ahliId: string;
  noAhli: string;
  namaAhli: string;
  noKp: string;
  jenisTuntutan: JenisTuntutanKebajikan;
  tarikhPermohonan: string;
  tarikhKejadian?: string;
  jumlahDipohon: number;
  jumlahDiluluskan: number;
  namaPenerima: string;
  noAkaunBankPenerima: string;
  namaBank: string;
  hubunganPenerima: 'SENDIRI' | 'PASANGAN' | 'ANAK' | 'IBU_BAPA' | 'WARIS_BERDAFTAR';
  dokumenSokongan?: string; // e.g. "Sijil Kematian / Surat Discaj Hospital"
  status: StatusTuntutanKebajikan;
  tarikhKelulusanALK?: string;
  noBaucarBayaran?: string;
  tarikhBayaran?: string;
  catatan?: string;
}

export interface CarumanKebajikanAhli {
  id: string;
  ahliId: string;
  noAhli: string;
  namaAhli: string;
  tahun: number;
  bulan: number;
  tarikhPotongan: string;
  jumlahRM: number; // e.g. RM 10.00
  kaedahBayaran: 'POTONGAN_GAJI' | 'TUNAI' | 'ONLINE_TRANSFER';
  noResit: string;
  status: 'DITERIMA' | 'TERTUNGGAK';
}

export interface TabungKebajikanSummary {
  bakiAwalTahun: number;
  peruntukanUntungStatutori: number; // Agihan Seksyen 57(3)
  jumlahCarumanTahunSemasa: number;
  jumlahTuntutanDibayar: number;
  bakiSemasa: number;
  jumlahAhliMencarum: number;
}

// ==========================================
// 13. DAFTAR HARTA TETAP & SUSUTNILAI (FIXED ASSET REGISTER)
// ==========================================
export type KategoriAsetTetap = 
  | 'PREMIS_BANGUNAN'
  | 'KENDERAAN'
  | 'PERABOT_PERALATAN_PEJABAT'
  | 'KOMPUTER_IT_SOFTWARE'
  | 'MESIN_KELENGKAPAN_POS'
  | 'PENGUBAHSUAIAN_PREMIS';

export type KaedahSusutnilai = 'GARIS_LURUS' | 'BAKI_BERKURANGAN';

export type StatusAset = 'AKTIF' | 'DILUPUSKAN' | 'ROSAK_HAPUSKIRA' | 'DIJUAL';

export interface RekodSusutnilaiTahunan {
  tahun: number;
  nilaiAwalTahun: number;
  kadarSusutnilaiPeratus: number;
  belanjaSusutnilaiTahun: number;
  susutnilaiTerkumpul: number;
  nilaiBukuBersihAkhirTahun: number;
}

export interface AsetTetap {
  id: string;
  tagAset: string; // e.g. "AST-2024/001"
  namaAset: string;
  kategori: KategoriAsetTetap;
  tarikhPerolehan: string;
  pembekal: string;
  noInvoisBaucar: string;
  lokasi: string;
  kosAsal: number;
  nilaiSisa: number; // Residual value (e.g. RM 0 or RM 1,000)
  jangkaHayatTahun: number; // e.g. 5 tahun, 10 tahun, 50 tahun
  kadarSusutnilaiPeratus: number; // e.g. 20%, 10%, 2%
  kaedahSusutnilai: KaedahSusutnilai;
  susutnilaiTerkumpulSemasa: number;
  nilaiBukuBersihSemasa: number; // NBV
  status: StatusAset;
  sejarahSusutnilai: RekodSusutnilaiTahunan[];
  
  // Optional Disposal details
  tarikhPelupusan?: string;
  hargaJualanPelupusan?: number;
  untungRugiPelupusan?: number;
  catatanPelupusan?: string;
}

// ==========================================
// SIMPANAN KHAS & DEPOSIT TETAP ANGGOTA
// ==========================================

export type JenisAkaunSimpanan = 
  | 'SIMPANAN_KHAS' 
  | 'DEPOSIT_TETAP_6B' 
  | 'DEPOSIT_TETAP_12B' 
  | 'DEPOSIT_TETAP_24B';

export type StatusDeposit = 'AKTIF' | 'MATANG' | 'DITUNTUT' | 'DIBATALKAN';

export interface TransaksiSimpanan {
  id: string;
  tarikh: string;
  jenisTransaksi: 'DEPOSIT' | 'PENGELUARAN' | 'KREDIT_HIBAH';
  jumlah: number;
  bakiSelepas: number;
  noRujukan: string;
  catatan: string;
}

export interface AkaunSimpananDeposit {
  id: string;
  noSijilAkaun: string; // e.g. "SD-2026/001" or "FD-2026/001"
  noAhli: string;
  namaAhli: string;
  noKP: string;
  jenis: JenisAkaunSimpanan;
  prinsipalAsal: number;
  bakiSemasa: number;
  kadarHibahTahunanPeratus: number; // e.g. 4.5% for 6M, 5.5% for 12M, 6.0% for 24M, 3.0% for Simpanan Khas
  tarikhMula: string;
  tarikhMatang?: string;
  anggaranPulanganHibah?: number;
  status: StatusDeposit;
  pembaharuanAutomatik: boolean; // Auto-rollover
  sejarahTransaksi: TransaksiSimpanan[];
}

// ==========================================
// PENYATA PENYESUAIAN BANK (BANK RECONCILIATION)
// ==========================================

export type StatusPemadananBank = 'TERPADAN' | 'BELUM_DIPADANKAN';

export interface ItemPenyataBank {
  id: string;
  tarikh: string;
  noRujukan: string;
  keterangan: string;
  jenis: 'DEBIT' | 'KREDIT'; // Debit: Pengeluaran/Caj, Kredit: Masuk wang
  jumlah: number;
  status: StatusPemadananBank;
  dipadankanDenganTxId?: string;
  catatan?: string;
}

export interface PenyataPenyesuaianBank {
  id: string;
  bulanTahun: string; // e.g. "Mac 2026"
  tarikhPenyata: string;
  namaBank: string;
  noAkaunBank: string;
  bakiBukuTunaiLejar: number; // Baki Kod Akaun 1020
  bakiPenyataBank: number;
  depositBelumKredit: number; // Lodgements in transit (+)
  cekBelumDitunaikan: number; // Unpresented cheques (-)
  faedahBankBelumRekod: number; // Bank interest credited directly (+)
  cajBankBelumRekod: number; // Bank service charges directly debited (-)
  bakiDisesuaikan: number;
  perbezaan: number; // Must be 0 for balanced
  status: 'SEIMBANG' | 'TIDAK_SEIMBANG';
}

// ==========================================
// e-INVOIS LHDN MALAYSIA & e-KOPERASI SKM
// ==========================================

export type JenisEInvoisLHDN = 
  | '01_INVOIS' 
  | '02_NOTA_KREDIT' 
  | '03_NOTA_DEBIT' 
  | '04_INVOIS_PENYATUAN';

export type StatusEInvoisLHDN = 'DISAHKAN' | 'DRAF' | 'DITOLAK' | 'DIBATALKAN';

export interface ItemBaranganEInvois {
  id: string;
  perihalan: string;
  kuantiti: number;
  hargaUnit: number;
  kadarCukaiPeratus: number;
  jumlahCukai: number;
  jumlahBersih: number;
  kodKlasifikasiLHDN: string; // e.g. "001: Barangan Runcit", "002: Perkhidmatan", "003: Sewaan"
}

export interface EInvoisLHDN {
  uuid: string; // e.g. "MY-INV-2026-9812-4821"
  noInvois: string; // e.g. "INV-2026/0891"
  noRujukanLHDN: string; // e.g. "LHDN-IRB-2026-VAL-941829"
  tarikhMasa: string;
  jenisInvois: JenisEInvoisLHDN;
  statusLHDN: StatusEInvoisLHDN;
  
  // Maklumat Penjual (Koperasi)
  namaKoperasi: string;
  noTINKoperasi: string;
  noSSM_SKM: string;
  noSST: string;
  alamatKoperasi: string;
  
  // Maklumat Pembeli
  namaPembeli: string;
  noTINPembeli: string;
  noKPPembeli_BRN: string;
  alamatPembeli: string;
  emelPembeli: string;
  
  // Kewangan
  jumlahKasar: number;
  jumlahDiskaun: number;
  jumlahCukaiSST: number;
  jumlahBersihBayaran: number;
  kaedahBayaran: string;
  
  barangan: ItemBaranganEInvois[];
  qrCodePayload: string; // LHDN Validation URL
  ublVersion: string; // "UBL 2.1"
}

export interface DataExportEKoperasi {
  tahunKewangan: number;
  tarikhJana: string;
  koperasi: {
    nama: string;
    noPendaftaranSKM: string;
    kategoriKoperasi: string;
    bilanganAnggota: number;
    bilanganALK: number;
    bilanganJAD: number;
  };
  kewangan: {
    jumlahAset: number;
    jumlahLiabiliti: number;
    modalSyer: number;
    modalYuran: number;
    pendapatanKasar: number;
    keuntunganBersih: number;
    kadarDividenSyerPeratus: number;
    kadarDividenYuranPeratus: number;
    peruntukanKWSKP: number;
    peruntukanKWAP: number;
    peruntukanKWK: number;
  };
  senaraiAnggota: Array<{
    noAhli: string;
    nama: string;
    noKP: string;
    modalSyer: number;
    modalYuran: number;
    status: string;
  }>;
  senaraiALK: Array<{
    nama: string;
    jawatan: string;
    noKP: string;
    tempohKhidmat: string;
  }>;
}

// -------------------------------------------------------------
// Verttere Solutions Payment Gateway & Escrow Settlement Types
// -------------------------------------------------------------

export interface PaymentGatewayConfig {
  provider: 'SECUREPAY' | 'TOYYIBPAY' | 'MANUAL_FPX' | string;
  merchantUid: string; // SecurePay Merchant UID (e.g. 7f4a9b2c-...)
  authToken: string; // SecurePay Authorization Token
  checksumToken: string; // SecurePay Checksum Security Token
  userSecretKey?: string;
  categoryCode?: string;
  platformFeeType: 'FIXED' | 'PERCENTAGE' | 'HYBRID';
  fixedFeeRM: number; // e.g. RM 1.00
  percentageFee: number; // e.g. 0.5%
  isSandbox: boolean;
  settlementCycle: 'T+1' | 'T+2' | 'WEEKLY' | 'MANUAL';
  namaPlatform: string;
  akaunBankPlatform: string;
  namaBankPlatform: string;
}

export interface GatewayTransaction {
  id: string;
  billCode: string;
  kategoriTransaksi: 'TAMBAH_SYER' | 'YURAN_BULANAN' | 'POS_STORE' | 'SIMPANAN_KHAS' | 'BAYARAN_PEMBIAYAAN' | string;
  perihal: string;
  namaKoperasi: string;
  kodKoperasi: string;
  namaPembayar: string;
  noKP: string;
  noAhli?: string;
  emel?: string;
  noTelefon?: string;
  jumlahKasar: number;
  cajPlatformVerttere: number;
  jumlahBersihKoperasi: number;
  status: 'MENUNGGU' | 'BERJAYA' | 'GAGAL' | 'DILEPASKAN_KE_KOPERASI';
  tarikhMasa: string;
  tarikhSelesai?: string;
  noBatchSettlement?: string;
  kaedahBayaran: 'SECUREPAY' | 'DUITNOW_QR' | 'KAD' | 'MANUAL' | string;
  transaksiBankId?: string;
}

export interface SettlementBatch {
  id: string;
  batchNo: string;
  namaKoperasi: string;
  kodKoperasi: string;
  noAkaunBankKoperasi: string;
  namaBankKoperasi: string;
  tarikhMula: string;
  tarikhTamat: string;
  jumlahTransaksi: number;
  jumlahKasar: number;
  jumlahCajVerttere: number;
  jumlahBersihPindahan: number;
  status: 'DRAF' | 'DALAM_PROSES' | 'SELESAI_PINDAH';
  dikeluarkanOleh: string;
  tarikhPindahan?: string;
  noRujukanBank?: string;
  catatan?: string;
}


