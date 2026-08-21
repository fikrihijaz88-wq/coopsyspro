import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { 
  CartaAkaun, 
  Ahli, 
  PembiayaanAhli, 
  Transaksi, 
  ActivityLog as ActivityLogType, 
  Mesyuarat,
  RekodKewanganTahunan
} from '../types';
import { calculateLoanRiskScore } from '../utils/loanRiskAI';
import { pdfExport } from '../utils/pdfExport';
import { 
  FileText, 
  Sparkles, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Building2, 
  ShieldCheck, 
  Scale, 
  PieChart, 
  FileSpreadsheet, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Award, 
  Settings, 
  Eye, 
  Users, 
  HandCoins, 
  BookOpen, 
  Layers
} from 'lucide-react';

interface YearlyAgmProfile {
  bilAGM: string;
  tarikhAGM: string;
  masaAGM: string;
  tempatAGM: string;
  perutusanPengerusi: string;
  pencadangMinitLalu: string;
  penyokongMinitLalu: string;
  pegawaiSKM: string;
  hadKeterhutangan: string;
  anggaranBelanjawanTahunDepan: string;
  kehadiranFizikal: number;
  penentusahList: { nama: string; noAhli: string }[];
  kumpulanGiliranRetiring: string;
  alkRetiring: { nama: string; jawatan: string; noAhli: string }[];
  alkElected: { nama: string; jawatan: string; noAhli: string; status: string }[];
  senarai12ALKBaru: { nama: string; jawatan: string; portfolio: string; kumpulan: string }[];
}

const YEARLY_AGM_CONFIGS: Record<string | number, YearlyAgmProfile> = {
  2023: {
    bilAGM: '15',
    tarikhAGM: '22 Jun 2024',
    masaAGM: '09:00 Pagi',
    tempatAGM: 'Dewan Merdeka, Pusat Konvensyen Antarabangsa Putrajaya (PICC)',
    perutusanPengerusi: 'Tahun 2023 mencatat pemulihan dan penstrukturan semula kewangan koperasi dengan rekod audit bersih tanpa sebarang teguran dan agihan dividen modal syer 6.5% yang mampan.',
    pencadangMinitLalu: 'Encik Kamaruddin Bin Ismail (No. Ahli: AH-002)',
    penyokongMinitLalu: 'Puan Siti Aminah Binti Ahmad (No. Ahli: AH-004)',
    pegawaiSKM: 'Puan Norazlina Binti Kassim (Penolong Pengarah SKM Wilayah Persekutuan)',
    hadKeterhutangan: 'RM 1,200,000.00',
    anggaranBelanjawanTahunDepan: 'RM 350,000.00',
    kehadiranFizikal: 78,
    penentusahList: [
      { nama: 'Encik Azman Bin Hashim', noAhli: 'AH-006' },
      { nama: 'Puan Noraini Binti Zakaria', noAhli: 'AH-008' },
      { nama: 'Encik Zainal Bin Abidin', noAhli: 'AH-011' },
      { nama: 'Puan Rohani Binti Abdullah', noAhli: 'AH-014' },
      { nama: 'Encik Mohd Syafiq Bin Ramli', noAhli: 'AH-017' },
      { nama: 'Puan Faridah Binti Othman', noAhli: 'AH-021' }
    ],
    kumpulanGiliranRetiring: 'Kumpulan A (1/3 ALK - 4 Orang)',
    alkRetiring: [
      { nama: 'Dato\' Ahmad Razali Bin Zainal', jawatan: 'Pengerusi ALK', noAhli: 'KOP-2021-001' },
      { nama: 'Devadasan a/l Ramasamy', jawatan: 'Anggota ALK', noAhli: 'KOP-2022-012' },
      { nama: 'Haji Ismail Bin Mohamed', jawatan: 'Anggota ALK', noAhli: 'KOP-2021-008' },
      { nama: 'Puan Salmah Binti Mansor', jawatan: 'Anggota ALK', noAhli: 'KOP-2022-045' }
    ],
    alkElected: [
      { nama: 'Dato\' Ahmad Razali Bin Zainal', jawatan: 'Pengerusi ALK', noAhli: 'KOP-2021-001', status: 'Dipilih Semula (Sesi 2024/2027)' },
      { nama: 'Devadasan a/l Ramasamy', jawatan: 'Anggota ALK', noAhli: 'KOP-2022-012', status: 'Dipilih Semula (Sesi 2024/2027)' },
      { nama: 'Haji Ismail Bin Mohamed', jawatan: 'Anggota ALK', noAhli: 'KOP-2021-008', status: 'Dipilih Semula (Sesi 2024/2027)' },
      { nama: 'Puan Salmah Binti Mansor', jawatan: 'Anggota ALK', noAhli: 'KOP-2022-045', status: 'Dipilih Semula (Sesi 2024/2027)' }
    ],
    senarai12ALKBaru: [
      { nama: 'Dato\' Ahmad Razali Bin Zainal', jawatan: 'Pengerusi ALK', portfolio: 'Biro Pentadbiran & Strategik', kumpulan: 'Kumpulan A' },
      { nama: 'Siti Nurhaliza Bt Mohd Safian', jawatan: 'Setiausaha ALK', portfolio: 'Biro Pengurusan Keahlian & Minit', kumpulan: 'Kumpulan B' },
      { nama: 'Tan Kah Hock', jawatan: 'Bendahari ALK', portfolio: 'Biro Kewangan & Pelaburan', kumpulan: 'Kumpulan C' },
      { nama: 'Devadasan a/l Ramasamy', jawatan: 'Anggota ALK', portfolio: 'Biro Perniagaan POS & Kedai', kumpulan: 'Kumpulan A' },
      { nama: 'Zarina Bt Wan Sulaiman', jawatan: 'Anggota ALK', portfolio: 'Biro Pendidikan & Latihan', kumpulan: 'Kumpulan B' },
      { nama: 'Haji Ismail Bin Mohamed', jawatan: 'Anggota ALK', portfolio: 'Biro Pembiayaan & Syariah', kumpulan: 'Kumpulan A' },
      { nama: 'Puan Salmah Binti Mansor', jawatan: 'Anggota ALK', portfolio: 'Biro Hal Ehwal Wanita & Kebajikan', kumpulan: 'Kumpulan A' },
      { nama: 'Kamal Bin Ariffin', jawatan: 'Anggota ALK', portfolio: 'Biro Pemasaran & IT', kumpulan: 'Kumpulan B' },
      { nama: 'Ahmad Fauzi Bin Hassan', jawatan: 'Anggota ALK', portfolio: 'Biro Aset & Fasiliti', kumpulan: 'Kumpulan B' },
      { nama: 'Hafiz Bin Sulaiman', jawatan: 'Anggota ALK', portfolio: 'Biro Pematuhan & Audit', kumpulan: 'Kumpulan C' },
      { nama: 'Zainal Bin Abidin', jawatan: 'Anggota ALK', portfolio: 'Biro Komunikasi & PR', kumpulan: 'Kumpulan C' },
      { nama: 'Rohani Binti Abdullah', jawatan: 'Anggota ALK', portfolio: 'Biro Sosio-Ekonomi', kumpulan: 'Kumpulan C' }
    ]
  },
  2024: {
    bilAGM: '16',
    tarikhAGM: '17 Mei 2025',
    masaAGM: '09:00 Pagi',
    tempatAGM: 'Dewan Perdana Koperasi, Menara SKM, Cyberjaya',
    perutusanPengerusi: 'Prestasi kewangan 2024 melonjak 27.1% hasil pertumbuhan positif sektor pembiayaan dan peningkatan modal syer anggota dengan pulangan dividen memberangsangkan 7.0%.',
    pencadangMinitLalu: 'Encik Azman Bin Hashim (No. Ahli: AH-006)',
    penyokongMinitLalu: 'Puan Noraini Binti Zakaria (No. Ahli: AH-008)',
    pegawaiSKM: 'En. Mohd Ridzuan Bin Che Mat (Pegawai Kanan Hal Ehwal Koperasi SKM)',
    hadKeterhutangan: 'RM 1,500,000.00',
    anggaranBelanjawanTahunDepan: 'RM 420,000.00',
    kehadiranFizikal: 98,
    penentusahList: [
      { nama: 'Encik Kamaruddin Bin Ismail', noAhli: 'AH-002' },
      { nama: 'Puan Siti Aminah Binti Ahmad', noAhli: 'AH-004' },
      { nama: 'Encik Kamal Bin Ariffin', noAhli: 'AH-014' },
      { nama: 'Puan Zarina Binti Wan Sulaiman', noAhli: 'AH-018' },
      { nama: 'Encik Ahmad Fauzi Bin Hassan', noAhli: 'AH-025' },
      { nama: 'Puan Halimah Binti Yusof', noAhli: 'AH-029' }
    ],
    kumpulanGiliranRetiring: 'Kumpulan B (1/3 ALK - 4 Orang)',
    alkRetiring: [
      { nama: 'Siti Nurhaliza Bt Mohd Safian', jawatan: 'Setiausaha ALK', noAhli: 'KOP-2021-002' },
      { nama: 'Zarina Bt Wan Sulaiman', jawatan: 'Anggota ALK', noAhli: 'KOP-2022-033' },
      { nama: 'Kamal Bin Ariffin', jawatan: 'Anggota ALK', noAhli: 'KOP-2022-014' },
      { nama: 'Ahmad Fauzi Bin Hassan', jawatan: 'Anggota ALK', noAhli: 'KOP-2022-025' }
    ],
    alkElected: [
      { nama: 'Siti Nurhaliza Bt Mohd Safian', jawatan: 'Setiausaha ALK', noAhli: 'KOP-2021-002', status: 'Dipilih Semula (Sesi 2025/2028)' },
      { nama: 'Zarina Bt Wan Sulaiman', jawatan: 'Anggota ALK', noAhli: 'KOP-2022-033', status: 'Dipilih Semula (Sesi 2025/2028)' },
      { nama: 'Mohd Khairul Anuar Bin Yusof', jawatan: 'Anggota ALK', noAhli: 'KOP-2023-019', status: 'Lantikan Baharu (Sesi 2025/2028)' },
      { nama: 'Arumugam a/l Govindasamy', jawatan: 'Anggota ALK', noAhli: 'KOP-2022-061', status: 'Lantikan Baharu (Sesi 2025/2028)' }
    ],
    senarai12ALKBaru: [
      { nama: 'Dato\' Ahmad Razali Bin Zainal', jawatan: 'Pengerusi ALK', portfolio: 'Biro Pentadbiran & Strategik', kumpulan: 'Kumpulan A' },
      { nama: 'Siti Nurhaliza Bt Mohd Safian', jawatan: 'Setiausaha ALK', portfolio: 'Biro Pengurusan Keahlian & Minit', kumpulan: 'Kumpulan B' },
      { nama: 'Tan Kah Hock', jawatan: 'Bendahari ALK', portfolio: 'Biro Kewangan & Pelaburan', kumpulan: 'Kumpulan C' },
      { nama: 'Devadasan a/l Ramasamy', jawatan: 'Anggota ALK', portfolio: 'Biro Perniagaan POS & Kedai', kumpulan: 'Kumpulan A' },
      { nama: 'Zarina Bt Wan Sulaiman', jawatan: 'Anggota ALK', portfolio: 'Biro Pendidikan & Latihan', kumpulan: 'Kumpulan B' },
      { nama: 'Haji Ismail Bin Mohamed', jawatan: 'Anggota ALK', portfolio: 'Biro Pembiayaan & Syariah', kumpulan: 'Kumpulan A' },
      { nama: 'Puan Salmah Binti Mansor', jawatan: 'Anggota ALK', portfolio: 'Biro Hal Ehwal Wanita & Kebajikan', kumpulan: 'Kumpulan A' },
      { nama: 'Mohd Khairul Anuar Bin Yusof', jawatan: 'Anggota ALK', portfolio: 'Biro Pemasaran Digital & IT', kumpulan: 'Kumpulan B' },
      { nama: 'Arumugam a/l Govindasamy', jawatan: 'Anggota ALK', portfolio: 'Biro Aset, Hartanah & Premis', kumpulan: 'Kumpulan B' },
      { nama: 'Hafiz Bin Sulaiman', jawatan: 'Anggota ALK', portfolio: 'Biro Pematuhan & Audit', kumpulan: 'Kumpulan C' },
      { nama: 'Zainal Bin Abidin', jawatan: 'Anggota ALK', portfolio: 'Biro Komunikasi & PR', kumpulan: 'Kumpulan C' },
      { nama: 'Rohani Binti Abdullah', jawatan: 'Anggota ALK', portfolio: 'Biro Sosio-Ekonomi', kumpulan: 'Kumpulan C' }
    ]
  },
  2025: {
    bilAGM: '17',
    tarikhAGM: '25 April 2026',
    masaAGM: '09:00 Pagi',
    tempatAGM: 'Dewan Anjung Murni, Pusat Konvensyen SKM, Putrajaya',
    perutusanPengerusi: 'Koperasi berjaya mengekalkan kecemerlangan tadbir urus dengan keuntungan bersih mencecah rekod tertinggi dan dividen 7.5% di samping pelaksanaan audit pintar AI.',
    pencadangMinitLalu: 'Encik Kamal Bin Ariffin (No. Ahli: AH-014)',
    penyokongMinitLalu: 'Puan Zarina Binti Wan Sulaiman (No. Ahli: AH-018)',
    pegawaiSKM: 'En. Mohd Firdaus Bin Abdullah (Ketua Penolong Pengarah SKM)',
    hadKeterhutangan: 'RM 2,000,000.00',
    anggaranBelanjawanTahunDepan: 'RM 500,000.00',
    kehadiranFizikal: 126,
    penentusahList: [
      { nama: 'Encik Zainal Bin Abidin', noAhli: 'AH-011' },
      { nama: 'Puan Rohani Binti Abdullah', noAhli: 'AH-014' },
      { nama: 'Encik Mohd Syafiq Bin Ramli', noAhli: 'AH-017' },
      { nama: 'Puan Faridah Binti Othman', noAhli: 'AH-021' },
      { nama: 'Encik Khairul Azmi Bin Othman', noAhli: 'AH-033' },
      { nama: 'Puan Mastura Binti Jalil', noAhli: 'AH-042' }
    ],
    kumpulanGiliranRetiring: 'Kumpulan C (1/3 ALK - 4 Orang)',
    alkRetiring: [
      { nama: 'Tan Kah Hock', jawatan: 'Bendahari ALK', noAhli: 'KOP-2021-003' },
      { nama: 'Hafiz Bin Sulaiman', jawatan: 'Anggota ALK', noAhli: 'KOP-2021-005' },
      { nama: 'Zainal Bin Abidin', jawatan: 'Anggota ALK', noAhli: 'KOP-2022-011' },
      { nama: 'Rohani Binti Abdullah', jawatan: 'Anggota ALK', noAhli: 'KOP-2022-014' }
    ],
    alkElected: [
      { nama: 'Tan Kah Hock', jawatan: 'Bendahari ALK', noAhli: 'KOP-2021-003', status: 'Dipilih Semula (Sesi 2026/2029)' },
      { nama: 'Hafiz Bin Sulaiman', jawatan: 'Anggota ALK', noAhli: 'KOP-2021-005', status: 'Dipilih Semula (Sesi 2026/2029)' },
      { nama: 'Dr. Nor Aini Binti Hashim', jawatan: 'Anggota ALK', noAhli: 'KOP-2023-042', status: 'Lantikan Baharu (Sesi 2026/2029)' },
      { nama: 'Che Wan Ahmad Fadzil', jawatan: 'Anggota ALK', noAhli: 'KOP-2022-077', status: 'Lantikan Baharu (Sesi 2026/2029)' }
    ],
    senarai12ALKBaru: [
      { nama: 'Dato\' Ahmad Razali Bin Zainal', jawatan: 'Pengerusi ALK', portfolio: 'Biro Pentadbiran & Strategik', kumpulan: 'Kumpulan A' },
      { nama: 'Siti Nurhaliza Bt Mohd Safian', jawatan: 'Setiausaha ALK', portfolio: 'Biro Pengurusan Keahlian & Minit', kumpulan: 'Kumpulan B' },
      { nama: 'Tan Kah Hock', jawatan: 'Bendahari ALK', portfolio: 'Biro Kewangan & Pelaburan', kumpulan: 'Kumpulan C' },
      { nama: 'Devadasan a/l Ramasamy', jawatan: 'Anggota ALK', portfolio: 'Biro Perniagaan POS & Kedai', kumpulan: 'Kumpulan A' },
      { nama: 'Zarina Bt Wan Sulaiman', jawatan: 'Anggota ALK', portfolio: 'Biro Pendidikan & Latihan', kumpulan: 'Kumpulan B' },
      { nama: 'Haji Ismail Bin Mohamed', jawatan: 'Anggota ALK', portfolio: 'Biro Pembiayaan & Syariah', kumpulan: 'Kumpulan A' },
      { nama: 'Puan Salmah Binti Mansor', jawatan: 'Anggota ALK', portfolio: 'Biro Hal Ehwal Wanita & Kebajikan', kumpulan: 'Kumpulan A' },
      { nama: 'Mohd Khairul Anuar Bin Yusof', jawatan: 'Anggota ALK', portfolio: 'Biro Pemasaran Digital & IT', kumpulan: 'Kumpulan B' },
      { nama: 'Arumugam a/l Govindasamy', jawatan: 'Anggota ALK', portfolio: 'Biro Aset, Hartanah & Premis', kumpulan: 'Kumpulan B' },
      { nama: 'Hafiz Bin Sulaiman', jawatan: 'Anggota ALK', portfolio: 'Biro Pematuhan Audit & Risiko', kumpulan: 'Kumpulan C' },
      { nama: 'Dr. Nor Aini Binti Hashim', jawatan: 'Anggota ALK', portfolio: 'Biro Komunikasi Strategik & PR', kumpulan: 'Kumpulan C' },
      { nama: 'Che Wan Ahmad Fadzil', jawatan: 'Anggota ALK', portfolio: 'Biro Sosio-Ekonomi & Projek', kumpulan: 'Kumpulan C' }
    ]
  },
  SEMASA: {
    bilAGM: '18',
    tarikhAGM: '27 Mac 2027',
    masaAGM: '09:00 Pagi',
    tempatAGM: 'Auditorium Utama Koperasi Warga Berdaya, Kuala Lumpur',
    perutusanPengerusi: 'Koperasi melangkah ke fasa digitalisasi penuh berintegriti dengan pematuhan perakaunan automatik SKM dan pengukuhan kebajikan pembiayaan anggota.',
    pencadangMinitLalu: 'Encik Hafiz Bin Sulaiman (No. Ahli: AH-001)',
    penyokongMinitLalu: 'Dr. Roslan Bin Mohamad (No. Ahli: AH-003)',
    pegawaiSKM: 'Wakil Rasmi Suruhanjaya Koperasi Malaysia (Pemerhati Rasmi)',
    hadKeterhutangan: 'RM 2,500,000.00',
    anggaranBelanjawanTahunDepan: 'RM 580,000.00',
    kehadiranFizikal: 135,
    penentusahList: [
      { nama: 'Encik Azman Bin Hashim', noAhli: 'AH-006' },
      { nama: 'Puan Noraini Binti Zakaria', noAhli: 'AH-008' },
      { nama: 'Encik Kamaruddin Bin Ismail', noAhli: 'AH-002' },
      { nama: 'Puan Siti Aminah Binti Ahmad', noAhli: 'AH-004' },
      { nama: 'Encik Kamal Bin Ariffin', noAhli: 'AH-014' },
      { nama: 'Puan Zarina Binti Wan Sulaiman', noAhli: 'AH-018' }
    ],
    kumpulanGiliranRetiring: 'Kumpulan A (1/3 ALK - 4 Orang - Kitaran 2027)',
    alkRetiring: [
      { nama: 'Dato\' Ahmad Razali Bin Zainal', jawatan: 'Pengerusi ALK', noAhli: 'KOP-2021-001' },
      { nama: 'Devadasan a/l Ramasamy', jawatan: 'Anggota ALK', noAhli: 'KOP-2022-012' },
      { nama: 'Haji Ismail Bin Mohamed', jawatan: 'Anggota ALK', noAhli: 'KOP-2021-008' },
      { nama: 'Puan Salmah Binti Mansor', jawatan: 'Anggota ALK', noAhli: 'KOP-2022-045' }
    ],
    alkElected: [
      { nama: 'Dato\' Ahmad Razali Bin Zainal', jawatan: 'Pengerusi ALK', noAhli: 'KOP-2021-001', status: 'Dicalonkan Semula (Sesi 2027/2030)' },
      { nama: 'Devadasan a/l Ramasamy', jawatan: 'Anggota ALK', noAhli: 'KOP-2022-012', status: 'Dicalonkan Semula (Sesi 2027/2030)' },
      { nama: 'Haji Ismail Bin Mohamed', jawatan: 'Anggota ALK', noAhli: 'KOP-2021-008', status: 'Dicalonkan Semula (Sesi 2027/2030)' },
      { nama: 'Puan Salmah Binti Mansor', jawatan: 'Anggota ALK', noAhli: 'KOP-2022-045', status: 'Dicalonkan Semula (Sesi 2027/2030)' }
    ],
    senarai12ALKBaru: [
      { nama: 'Dato\' Ahmad Razali Bin Zainal', jawatan: 'Pengerusi ALK', portfolio: 'Biro Pentadbiran & Strategik', kumpulan: 'Kumpulan A' },
      { nama: 'Siti Nurhaliza Bt Mohd Safian', jawatan: 'Setiausaha ALK', portfolio: 'Biro Pengurusan Keahlian & Minit', kumpulan: 'Kumpulan B' },
      { nama: 'Tan Kah Hock', jawatan: 'Bendahari ALK', portfolio: 'Biro Kewangan & Pelaburan', kumpulan: 'Kumpulan C' },
      { nama: 'Devadasan a/l Ramasamy', jawatan: 'Anggota ALK', portfolio: 'Biro Perniagaan POS & Kedai', kumpulan: 'Kumpulan A' },
      { nama: 'Zarina Bt Wan Sulaiman', jawatan: 'Anggota ALK', portfolio: 'Biro Pendidikan & Latihan', kumpulan: 'Kumpulan B' },
      { nama: 'Haji Ismail Bin Mohamed', jawatan: 'Anggota ALK', portfolio: 'Biro Pembiayaan & Syariah', kumpulan: 'Kumpulan A' },
      { nama: 'Puan Salmah Binti Mansor', jawatan: 'Anggota ALK', portfolio: 'Biro Hal Ehwal Wanita & Kebajikan', kumpulan: 'Kumpulan A' },
      { nama: 'Mohd Khairul Anuar Bin Yusof', jawatan: 'Anggota ALK', portfolio: 'Biro Pemasaran Digital & IT', kumpulan: 'Kumpulan B' },
      { nama: 'Arumugam a/l Govindasamy', jawatan: 'Anggota ALK', portfolio: 'Biro Aset, Hartanah & Premis', kumpulan: 'Kumpulan B' },
      { nama: 'Hafiz Bin Sulaiman', jawatan: 'Anggota ALK', portfolio: 'Biro Pematuhan Audit & Risiko', kumpulan: 'Kumpulan C' },
      { nama: 'Dr. Nor Aini Binti Hashim', jawatan: 'Anggota ALK', portfolio: 'Biro Komunikasi Strategik & PR', kumpulan: 'Kumpulan C' },
      { nama: 'Che Wan Ahmad Fadzil', jawatan: 'Anggota ALK', portfolio: 'Biro Sosio-Ekonomi & Projek', kumpulan: 'Kumpulan C' }
    ]
  }
};

interface AutomatedReportsProps {
  cartaAkaun: CartaAkaun[];
  ahliList: Ahli[];
  pembiayaanList: PembiayaanAhli[];
  transaksiList: Transaksi[];
  logs: ActivityLogType[];
  mesyuaratList: Mesyuarat[];
  rekodTahunanList?: RekodKewanganTahunan[];
  language?: 'BM' | 'EN';
  onAddLog?: (log: ActivityLogType) => void;
}

export const AutomatedReports: React.FC<AutomatedReportsProps> = ({
  cartaAkaun,
  ahliList,
  pembiayaanList,
  transaksiList,
  logs,
  mesyuaratList,
  rekodTahunanList = [],
  language = 'BM',
  onAddLog,
}) => {
  const isEN = language === 'EN';

  // View mode
  const [activeView, setActiveView] = useState<'document' | 'interactive' | 'config'>('document');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // ==================== YEAR SELECTOR ====================
  const [selectedYear, setSelectedYear] = useState<number | 'SEMASA'>('SEMASA');
  const availableYears = rekodTahunanList.map(r => r.tahun).sort((a, b) => a - b);
  const selectedRekod = selectedYear !== 'SEMASA' ? rekodTahunanList.find(r => r.tahun === selectedYear) : null;
  const isSemasa = selectedYear === 'SEMASA';
  const viewYear = isSemasa ? new Date().getFullYear() : (selectedYear as number);

  // Active Year Profile Metadata
  const currentYearConfig: YearlyAgmProfile = YEARLY_AGM_CONFIGS[selectedYear] || YEARLY_AGM_CONFIGS[viewYear] || YEARLY_AGM_CONFIGS['SEMASA'];

  // AGM Metadata Config State (Initialized dynamically per year)
  const [namaKoperasi, setNamaKoperasi] = useState<string>('KOPERASI PEGAWAI KERAJAAN MALAYSIA BERHAD');
  const [noPendaftaranSKM, setNoPendaftaranSKM] = useState<string>('SKM-W-10492/1993');
  const [bilAGM, setBilAGM] = useState<string>(currentYearConfig.bilAGM);
  const [tarikhAGM, setTarikhAGM] = useState<string>(currentYearConfig.tarikhAGM);
  const [masaAGM, setMasaAGM] = useState<string>(currentYearConfig.masaAGM);
  const [tempatAGM, setTempatAGM] = useState<string>(currentYearConfig.tempatAGM);
  const [perutusanPengerusi, setPerutusanPengerusi] = useState<string>(currentYearConfig.perutusanPengerusi);

  // Sync inputs whenever selectedYear changes
  useEffect(() => {
    const cfg = YEARLY_AGM_CONFIGS[selectedYear] || YEARLY_AGM_CONFIGS[viewYear] || YEARLY_AGM_CONFIGS['SEMASA'];
    setBilAGM(cfg.bilAGM);
    setTarikhAGM(cfg.tarikhAGM);
    setMasaAGM(cfg.masaAGM);
    setTempatAGM(cfg.tempatAGM);
    setPerutusanPengerusi(cfg.perutusanPengerusi);
  }, [selectedYear, viewYear]);

  // Derived tahunKewangan from selectedYear
  const tahunKewangan = String(viewYear);

  // Toggles for Report Content Modules
  const [incFinancials, setIncFinancials] = useState<boolean>(true);
  const [incAuditCompliance, setIncAuditCompliance] = useState<boolean>(true);
  const [incAIRiskModel, setIncAIRiskModel] = useState<boolean>(true);
  const [incDividendDistribution, setIncDividendDistribution] = useState<boolean>(true);
  const [incResolutions, setIncResolutions] = useState<boolean>(true);

  // ==================== LIVE FINANCIAL CALCULATIONS ====================
  const hasilList = cartaAkaun.filter(c => c.kategori === 'HASIL');
  const belanjaList = cartaAkaun.filter(c => c.kategori === 'BELANJA');
  const liveTotalHasil = hasilList.reduce((a, b) => a + b.bakiSemasa, 0);
  const liveTotalBelanja = belanjaList.reduce((a, b) => a + b.bakiSemasa, 0);
  const liveUntungBersih = liveTotalHasil - liveTotalBelanja;

  const liveKwrs12 = Math.max(0, liveUntungBersih * 0.12);
  const liveKwpk3 = Math.max(0, liveUntungBersih * 0.03);
  const liveKwp1 = Math.max(0, liveUntungBersih * 0.01);
  const liveTotalStatutori = liveKwrs12 + liveKwpk3 + liveKwp1;
  const liveUntungBolehDiagih = Math.max(0, liveUntungBersih - liveTotalStatutori);

  const liveTotalSyerAhli = cartaAkaun.find(c => c.kod === '3010')?.bakiSemasa || 268000;
  const livePeratusDividen = 7.5;
  const liveCadanganDividenRM = liveTotalSyerAhli * (livePeratusDividen / 100);
  const liveHonorariumALK = Math.min(10000, liveUntungBolehDiagih * 0.05);
  const liveBakiKeHadapan = Math.max(0, liveUntungBolehDiagih - (liveCadanganDividenRM + liveHonorariumALK));

  const liveTotalAset = cartaAkaun.filter(c => c.kategori === 'ASET').reduce((a, b) => a + b.bakiSemasa, 0);
  const liveTotalLiabiliti = cartaAkaun.filter(c => c.kategori === 'LIABILITI').reduce((a, b) => a + b.bakiSemasa, 0);
  const liveTotalEkuiti = cartaAkaun.filter(c => c.kategori === 'EKUITI').reduce((a, b) => a + b.bakiSemasa, 0) + liveUntungBersih;

  // ==================== ACTIVE VIEW DATA ====================
  const totalHasil = isSemasa ? liveTotalHasil : (selectedRekod?.jumlahHasil ?? 0);
  const totalBelanja = isSemasa ? liveTotalBelanja : (selectedRekod?.jumlahBelanja ?? 0);
  const untungBersih = isSemasa ? liveUntungBersih : (selectedRekod?.untungBersih ?? 0);

  const kwrs12 = isSemasa ? liveKwrs12 : (selectedRekod?.kwrs12 ?? 0);
  const kwpk3 = isSemasa ? liveKwpk3 : (selectedRekod?.kwpk3 ?? 0);
  const kwp1 = isSemasa ? liveKwp1 : (selectedRekod?.kwp1 ?? 0);
  const totalStatutori = kwrs12 + kwpk3 + kwp1;
  const untungBolehDiagih = isSemasa ? liveUntungBolehDiagih : Math.max(0, untungBersih - totalStatutori);

  const peratusDividenCadangan = isSemasa ? livePeratusDividen : (selectedRekod?.peratusDividen ?? 7.5);
  const totalSyerAhli = isSemasa ? liveTotalSyerAhli : (selectedRekod?.modalSyerTerkumpul ?? 268000);
  const cadanganDividenRM = isSemasa ? liveCadanganDividenRM : (selectedRekod?.dividenAgihanRM ?? 0);
  const honorariumALK = isSemasa ? liveHonorariumALK : Math.min(10000, untungBolehDiagih * 0.05);
  const bakiKeHadapan = Math.max(0, untungBolehDiagih - (cadanganDividenRM + honorariumALK));

  const totalAset = isSemasa ? liveTotalAset : (selectedRekod?.totalAset ?? 0);
  const totalLiabiliti = isSemasa ? liveTotalLiabiliti : (selectedRekod?.totalLiabiliti ?? 0);
  const totalEkuiti = isSemasa ? liveTotalEkuiti : (selectedRekod?.totalEkuiti ?? 0);

  // Member & Credit Risk Stats
  const totalAhli = isSemasa ? ahliList.length : (selectedRekod?.bilanganAhli ?? ahliList.length);
  const ahliAktif = isSemasa ? ahliList.filter(a => a.status === 'AKTIF').length : (currentYearConfig.kehadiranFizikal);
  const totalModalSyer = isSemasa ? ahliList.reduce((a, b) => a + b.modalSyer, 0) : (selectedRekod?.modalSyerTerkumpul ?? 0);
  const korumMinima = Math.ceil(totalAhli / 3);
  
  const riskScores = pembiayaanList.map(p => {
    const member = ahliList.find(a => a.noAhli === p.noAhli) || ahliList[0];
    return calculateLoanRiskScore(member, p.jumlahPinjaman, p.bayaranBulanan, p.jenisPembiayaan, p.penjamin.length, pembiayaanList, transaksiList);
  });
  const avgRiskScore = riskScores.length > 0 ? Math.round(riskScores.reduce((a, b) => a + b.score, 0) / riskScores.length) : 84;
  const gradeACount = riskScores.filter(r => r.grade === 'A').length;

  const viewStatusAudit = isSemasa ? 'DALAM_PROSES' : (selectedRekod?.statusAuditSKM ?? 'DRAF');
  const viewJuruaudit = isSemasa ? 'Jawatankuasa Audit Dalaman (JAD)' : (selectedRekod?.juruauditBertauliah ?? '-');

  // Format Currency
  const formatRM = (val: number) => {
    return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(val);
  };

  // State for Document Type: Annual Report Book vs Official AGM Minutes
  const [reportDocType, setReportDocType] = useState<'LAPORAN_TAHUNAN' | 'MINIT_AGM'>('LAPORAN_TAHUNAN');

  // State for Generated Gemini Executive Report Text
  const [reportText, setReportText] = useState<string>(() => generateFallbackAGMReport());

  // Automatically update fallback report text when active year, inputs, or doc type change
  useEffect(() => {
    if (reportDocType === 'LAPORAN_TAHUNAN') {
      setReportText(generateFallbackAGMReport());
    } else {
      setReportText(generateOfficialAGMMinutes());
    }
  }, [selectedYear, reportDocType, namaKoperasi, noPendaftaranSKM, bilAGM, tarikhAGM, tempatAGM, perutusanPengerusi]);

  // ==================== 1. BUKU LAPORAN TAHUNAN AGM (SEKSYEN 39 & 40 AKTA KOPERASI 1993) ====================
  function generateFallbackAGMReport(): string {
    const nextYear = Number(tahunKewangan) + 1;
    const prevBilAGM = Number(bilAGM) - 1;

    return `# 📑 BUKU LAPORAN TAHUNAN & PENYATA KEWANGAAN TERAUDIT
## MESYUARAT AGUNG TAHUNAN (AGM) KE-${bilAGM} ${namaKoperasi}
**No. Pendaftaran SKM:** ${noPendaftaranSKM} | **Tahun Kewangan Berakhir:** 31 Disember ${tahunKewangan}
**Pematuhan:** Akta Koperasi 1993 (Seksyen 39 & 40) • Undang-Undang Kecil Koperasi • Garis Panduan SKM (GP1, GP3, GP23)

---

### 1. 📜 NOTIS MESYUARAT AGUNG TAHUNAN & AGENDA BERKANUN
Notis adalah dengan ini diberikan bahawa **Mesyuarat Agung Tahunan Ke-${bilAGM}** ${namaKoperasi} akan diadakan seperti butiran berikut:
* **Tarikh Mesyuarat:** ${tarikhAGM} (${masaAGM})
* **Tempat:** ${tempatAGM}
* **Korum Kehadiran Minima:** Satu pertiga (1/3) anggota berhak mengundi iaitu sekurang-kurangnya **${korumMinima} orang anggota** (mengikut peruntukan Seksyen 38 Akta Koperasi 1993 & UUK).

**SUSUNAN AGENDA BERKANUN (SEKSYEN 40 AKTA KOPERASI 1993):**
1. Perutusan & Ucapan Aluan Pengerusi Lembaga Koperasi (ALK).
2. Mengesahkan Minit Mesyuarat Agung Tahunan Ke-${prevBilAGM}.
3. Menimbang dan menerima Laporan Lembaga (ALK) dan Laporan Jawatankuasa Audit Dalaman (JAD) (Seksyen 42A).
4. Menimbang dan meluluskan Penyata Kewangan Teraudit dan Laporan Juruaudit Luar bagi Tahun Kewangan Berakhir 31 Disember ${tahunKewangan} (Seksyen 58 & 60).
5. Meluluskan cadangan Pembahagian Keuntungan Bersih, Caruman Statutori, Dividen Syer, dan Honorarium ALK mengikut Seksyen 57 Akta Koperasi 1993.
6. Menetapkan Had Maksimum Keterhutangan Koperasi di bawah Seksyen 50(1) Akta Koperasi 1993 (${currentYearConfig.hadKeterhutangan}).
7. Melantik Juruaudit Luar Bertauliah bagi Tahun Kewangan ${nextYear} (Seksyen 60).
8. **Pemilihan 1/3 Anggota Lembaga Koperasi (ALK) Mengikut Giliran (${currentYearConfig.kumpulanGiliranRetiring}) & Lantikan Jawatankuasa Audit Dalaman (JAD)**.
9. Menimbang dan meluluskan Anggaran Belanjawan Tahunan bagi Tahun Kewangan ${nextYear} (${currentYearConfig.anggaranBelanjawanTahunDepan}).
10. Menimbang Usul-Usul Bertulis daripada Anggota yang diterima mengikut tempoh notis UUK.
11. Melantik Enam (6) orang Penentusah Minit Mesyuarat Agung Tahunan.

---

### 2. 🏛️ PERUTUSAN PENGERUSI & LAPORAN LEMBAGA (ALK)
Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang.
Bagi pihak Lembaga Anggota Koperasi (ALK), saya dengan penuh rasa kesyukuran membentangkan **Laporan Tahunan dan Penyata Kewangan Teraudit** bagi Tahun Kewangan Berakhir 31 Disember ${tahunKewangan}.

Koperasi kita telah mencatatkan prestasi kewangan yang kukuh dengan **Jumlah Hasil sebanyak ${formatRM(totalHasil)}** dan **Keuntungan Bersih Sebelum Statutori sebanyak ${formatRM(untungBersih)}**.

> "${perutusanPengerusi}"

---

### 3. 📊 SINTESIS PRESTASI KEWANGAAN TAHUNAN (${tahunKewangan})
Berikut adalah ringkasan kedudukan kewangan berasaskan Laporan Juruaudit Bertauliah (${viewJuruaudit}):

| Perkara Kewangan | Amaun (${tahunKewangan}) | Catatan & Rujukan Peruntukan |
| :--- | :---: | :--- |
| **Jumlah Hasil Koperasi** | **${formatRM(totalHasil)}** | Yuran, Keuntungan Pembiayaan, POS & Pelaburan |
| **Jumlah Belanja Pengendalian** | **${formatRM(totalBelanja)}** | Belanja Pentadbiran, Operasi & Saraan |
| **Keuntungan Bersih Sebelum Statutori** | **${formatRM(untungBersih)}** | Asas Agihan Statutori SKM (Seksyen 57) |
| **Kumpulan Wang Rizab Statutori (KWRS 12%)** | **${formatRM(kwrs12)}** | Potongan Mandatori Seksyen 57(1)(a) |
| **Kumpulan Wang Pelajaran Koperasi (KWPK 3%)** | **${formatRM(kwpk3)}** | Caruman Statutori SKM Seksyen 57(1)(b) |
| **Kumpulan Wang Pembangunan Koperasi (KWP 1%)** | **${formatRM(kwp1)}** | Caruman Statutori SKM Seksyen 57(1)(b) |
| **Jumlah Untung Boleh Diagih (Net Distributable)** | **${formatRM(untungBolehDiagih)}** | Dana Agihan Dividen, Honorarium & Tabung Kebajikan |

#### Kedudukan Kunci Kira-Kira (Statement of Financial Position)
* **Jumlah Aset Koperasi:** ${formatRM(totalAset)}
* **Jumlah Liabiliti Semasa & Jangka Panjang:** ${formatRM(totalLiabiliti)}
* **Modal Syer & Yuran Anggota:** ${formatRM(totalModalSyer)} (Jumlah Anggota: ${totalAhli} orang, ${ahliAktif} hadir fizikal)
* **Jumlah Ekuiti Anggota & Dana Kumpulan Wang:** ${formatRM(totalEkuiti)}

---

### 4. 👥 STRUKTUR 12 ORANG ALK & PERGERAKAN GILIRAN 1/3
Mengikut peruntukan **Seksyen 42 Akta Koperasi 1993 dan Undang-Undang Kecil Koperasi**, Lembaga Koperasi terdiri daripada **12 orang anggota ALK**. Pada mesyuarat ini:

* **1/3 ALK Yang Mengundur Diri Mengikut Giliran (${currentYearConfig.kumpulanGiliranRetiring}):**
${currentYearConfig.alkRetiring.map((a, idx) => `  ${idx + 1}. **${a.nama}** (${a.jawatan} - No. Ahli: ${a.noAhli})`).join('\n')}

* **Calon Yang Dicalonkan & Dipilih Semula / Lantikan Baharu Bagi Sesi Seterusnya:**
${currentYearConfig.alkElected.map((a, idx) => `  ${idx + 1}. **${a.nama}** (${a.jawatan}) - *Status: ${a.status}*`).join('\n')}

---

### 5. 💰 CADANGAN PEMBAHAGIAN KEUNTUNGAN BERSIH (SEKSYEN 57)
Lembaga Koperasi (ALK) mengesyorkan agihan keuntungan berikut untuk kelulusan Mesyuarat Agung Tahunan:

* **Cadangan Dividen Atas Modal Syer (${peratusDividenCadangan}%):** **${formatRM(cadanganDividenRM)}**
* **Honorarium Ahli Lembaga Koperasi (ALK):** **${formatRM(honorariumALK)}**
* **Baki Keuntungan Bersih Dibawa Ke Hadapan:** **${formatRM(bakiKeHadapan)}**

---

### 6. 📜 RESOLUSI & KETETAPAN BERKANUN UNTUK KELULUSAN AGM
Ahli-ahli dalam Mesyuarat Agung Tahunan Ke-${bilAGM} diminta mempertimbangkan dan meluluskan ketetapan berikut:

- [ ] **Ketetapan 1:** Menerima dan meluluskan Laporan Lembaga (ALK) dan Laporan Jawatankuasa Audit Dalaman (JAD) bagi Tahun Kewangan Berakhir 31 Disember ${tahunKewangan}.
- [ ] **Ketetapan 2:** Menerima dan meluluskan Penyata Kewangan Teraudit dan Laporan Juruaudit Luar bagi Tahun Kewangan Berakhir 31 Disember ${tahunKewangan}.
- [ ] **Ketetapan 3:** Meluluskan cadangan Pembahagian Keuntungan Bersih dan Kadar Dividen Sebanyak **${peratusDividenCadangan}%** atas Modal Syer Anggota mengikut Seksyen 57.
- [ ] **Ketetapan 4:** Meluluskan Had Maksimum Keterhutangan Koperasi sebanyak **${currentYearConfig.hadKeterhutangan}** Mengikut Seksyen 50(1) Akta Koperasi 1993.
- [ ] **Ketetapan 5:** Meluluskan Pelantikan Juruaudit Luar Bertauliah bagi Tahun Kewangan ${nextYear} (Seksyen 60).
- [ ] **Ketetapan 6:** Meluluskan Pemilihan 1/3 Anggota Lembaga Koperasi (ALK) (${currentYearConfig.kumpulanGiliranRetiring}) dan Pelantikan Anggota JAD Sesi Baharu.
- [ ] **Ketetapan 7:** Meluluskan Anggaran Belanjawan Tahunan Koperasi bagi Tahun Kewangan ${nextYear} (${currentYearConfig.anggaranBelanjawanTahunDepan}).

---

### ✍️ PENGESAHAN DOKUMEN TAHUNAN
Disediakan dan disahkan untuk edaran anggota Mesyuarat Agung Tahunan (AGM) Ke-${bilAGM}:

**Pengerusi Lembaga Koperasi (ALK):** ___________________________  
*(Dato' Ahmad Razali Bin Zainal)*  
Tarikh: ${tarikhAGM}

**Bendahari Koperasi:** ___________________________  
*(Tan Kah Hock)*  
Tarikh: ${tarikhAGM}

**Pengerusi Jawatankuasa Audit Dalaman (JAD):** ___________________________  
*(Dr. Roslan Bin Mohamad)*  
Tarikh: ${tarikhAGM}`;
  }

  // ==================== 2. MINIT MESYUARAT AGUNG TAHUNAN BERKANUN (SEKSYEN 40 & GP23 SKM) ====================
  function generateOfficialAGMMinutes(): string {
    const nextYear = Number(tahunKewangan) + 1;
    const prevBilAGM = Number(bilAGM) - 1;
    const pList = currentYearConfig.penentusahList;

    return `# 🏛️ MINIT MESYUARAT AGUNG TAHUNAN (AGM) KE-${bilAGM}
## ${namaKoperasi}
**No. Pendaftaran SKM:** ${noPendaftaranSKM}
**Format Pematuhan:** Akta Koperasi 1993 (Seksyen 38, 39, 40, 42) • Undang-Undang Kecil Koperasi • Garis Panduan SKM (GP23)

---

### 1. BUTIRAN MESYUARAT & PENGESAHAN KORUM
* **Tarikh Mesyuarat:** ${tarikhAGM}
* **Masa:** ${masaAGM}
* **Tempat:** ${tempatAGM}
* **Pengerusi Majlis:** Dato' Ahmad Razali Bin Zainal (Pengerusi ALK)
* **Kehadiran Anggota:** **${ahliAktif} orang anggota berhak mengundi** hadir fizikal / berdaftar (daripada ${totalAhli} jumlah anggota berdaftar).
* **Kehadiran ALK & JAD:** **12 orang Anggota Lembaga Koperasi (ALK)** & 3 orang Jawatankuasa Audit Dalaman (JAD).
* **Wakil Suruhanjaya Koperasi Malaysia (SKM):** ${currentYearConfig.pegawaiSKM}.

**PENGESAHAN KORUM MESYUARAT (SEKSYEN 38 & UUK):**
Setiausaha mengesahkan bahawa kehadiran seramai **${ahliAktif} orang anggota** telah melebihi korum statutori minima iaitu sekurang-kurangnya **${korumMinima} orang anggota** yang ditetapkan di bawah Seksyen 38 Akta Koperasi 1993 dan Undang-Undang Kecil Koperasi. Pengerusi dengan rasminya mengisytiharkan bahawa Mesyuarat Agung Tahunan Ke-${bilAGM} ini adalah **SAH** di sisi undang-undang.

---

### 2. CATATAN PERJALANAN AGENDA BERKANUN (SEKSYEN 40 AKTA KOPERASI 1993)

#### AGENDA 1: PERUTUSAN & UCAPAN PENGERUSI
1.1 Pengerusi memulakan mesyuarat dengan bacaan Ummul Kitab Al-Fatihah dan merakamkan setinggi-tinggi penghargaan kepada semua anggota dan wakil SKM yang hadir.
1.2 Pengerusi menegaskan komitmen koperasi dalam memperkukuh ketelusan perakaunan dan digitalisasi pematuhan SKM:
> "${perutusanPengerusi}"

#### AGENDA 2: PENGESAHAN MINIT MESYUARAT AGUNG TAHUNAN KE-${prevBilAGM}
2.1 Minit Mesyuarat Agung Tahunan Ke-${prevBilAGM} yang diedarkan kepada anggota diteliti dan disemak.
2.2 **Pencadang:** ${currentYearConfig.pencadangMinitLalu}
2.3 **Penyokong:** ${currentYearConfig.penyokongMinitLalu}
2.4 **Ketetapan Mesyuarat:** Majlis sebulat suara **MENGESAHKAN** Minit Mesyuarat Agung Tahunan Ke-${prevBilAGM} tanpa sebarang pindaan.

#### AGENDA 3: MENIMBANG DAN MENERIMA LAPORAN LEMBAGA (ALK) & LAPORAN AUDIT DALAMAN (JAD) (SEKSYEN 42A)
3.1 Setiausaha membentangkan Laporan Aktiviti Tahunan Lembaga Koperasi bagi Tahun Kewangan Berakhir 31 Disember ${tahunKewangan}.
3.2 Pengerusi Jawatankuasa Audit Dalaman (JAD) Dr. Roslan Bin Mohamad membentangkan Laporan Audit Dalaman bagi memastikan tadbir urus dan kawalan dalaman berada pada tahap terbaik.
3.3 **Ketetapan Mesyuarat:** Majlis sebulat suara **MENERIMA DAN MELULUSKAN** Laporan Lembaga dan Laporan Jawatankuasa Audit Dalaman (JAD).

#### AGENDA 4: MENIMBANG DAN MELULUSKAN PENYATA KEWANGAN TERAUDIT & LAPORAN JURUAUDIT LUAR (SEKSYEN 58 & 60)
4.1 Bendahari membentangkan Penyata Kewangan Koperasi bagi Tahun Kewangan Berakhir 31 Disember ${tahunKewangan} yang telah diaudit oleh **${viewJuruaudit}**:
* **Jumlah Hasil Operasi:** ${formatRM(totalHasil)}
* **Jumlah Belanja Pengendalian:** ${formatRM(totalBelanja)}
* **Keuntungan Bersih Sebelum Statutori:** ${formatRM(untungBersih)}
* **Jumlah Aset Koperasi:** ${formatRM(totalAset)}
* **Jumlah Liabiliti Semasa:** ${formatRM(totalLiabiliti)}
* **Ekuiti Anggota:** ${formatRM(totalEkuiti)}
4.2 **Ketetapan Mesyuarat:** Penyata Kewangan Teraudit dan Laporan Juruaudit Luar bagi Tahun ${tahunKewangan} **DILULUSKAN SEBULAT SUARA**.

#### AGENDA 5: MELULUSKAN PEMBAHAGIAN KEUNTUNGAN BERSIH & KADAR DIVIDEN (SEKSYEN 57)
5.1 Majlis menimbang cadangan pembahagian keuntungan mengikut peruntukan Seksyen 57 Akta Koperasi 1993:
* **Kumpulan Wang Rizab Statutori (KWRS 12%):** ${formatRM(kwrs12)}
* **Kumpulan Wang Pelajaran Koperasi (KWPK 3%):** ${formatRM(kwpk3)}
* **Kumpulan Wang Pembangunan Koperasi (KWP 1%):** ${formatRM(kwp1)}
* **Untung Boleh Diagih:** ${formatRM(untungBolehDiagih)}
* **Cadangan Dividen (${peratusDividenCadangan}%):** ${formatRM(cadanganDividenRM)} *(Mematuhi had maksimum ≤ 10.0%)*
* **Honorarium ALK:** ${formatRM(honorariumALK)}
* **Baki Dibawa Ke Hadapan:** ${formatRM(bakiKeHadapan)}
5.2 **Ketetapan Mesyuarat:** Cadangan pembahagian untung bersih dan dividen **${peratusDividenCadangan}%** **DILULUSKAN SEBULAT SUARA**.

#### AGENDA 6: MENETAPKAN HAD MAKSIMUM KETERHUTANGAN KOPERASI (SEKSYEN 50)
6.1 Mengikut Seksyen 50(1) Akta Koperasi 1993, Lembaga mengesyorkan Had Maksimum Keterhutangan Koperasi bagi Tahun Kewangan ${nextYear} ditetapkan pada **${currentYearConfig.hadKeterhutangan}**.
6.2 **Ketetapan Mesyuarat:** Had Keterhutangan sebanyak **${currentYearConfig.hadKeterhutangan}** **DILULUSKAN SEBULAT SUARA**.

#### AGENDA 7: PELANTIKAN JURUAUDIT LUAR BERTAULIAH (SEKSYEN 60)
7.1 Mesyuarat bersetuju melantik / menyambung pelantikan Firma Juruaudit Bertauliah SKM untuk mengaudit akaun koperasi bagi Tahun Kewangan ${nextYear}.
7.2 **Ketetapan Mesyuarat:** Pelantikan juruaudit luar **DILULUSKAN SEBULAT SUARA** dengan kuasa saraan diserahkan kepada ALK.

#### AGENDA 8: PEMILIHAN 1/3 ANGGOTA LEMBAGA KOPERASI (ALK) & PELANTIKAN JAD (SEKSYEN 42 & UUK)
8.1 **Pengunduran 1/3 ALK Mengikut Giliran:**  
Setiausaha memaklumkan bahawa mengikut Undang-Undang Kecil Koperasi, seramai **4 orang anggota ALK (${currentYearConfig.kumpulanGiliranRetiring})** telah tamat tempoh perkhidmatan dan mengundur diri mengikut giliran:
${currentYearConfig.alkRetiring.map((a, idx) => `   8.1.${idx + 1} **${a.nama}** (${a.jawatan} - No. Ahli: ${a.noAhli})`).join('\n')}

8.2 **Keputusan Pemilihan Undian MAT:**  
Berdasarkan pencalonan dan undian ahli-ahli dalam mesyuarat, 4 kerusi ALK berkenaan telah diputuskan seperti berikut:
${currentYearConfig.alkElected.map((a, idx) => `   8.2.${idx + 1} **${a.nama}** (${a.jawatan} - ${a.noAhli}) — *${a.status}*`).join('\n')}

8.3 **Struktur Lengkap 12 Orang Ahli Lembaga Koperasi (ALK) Sesi Baharu:**
| Bil | Nama Penuh ALK | Jawatan Lembaga | Biro Portfolio | Kumpulan Giliran |
| :---: | :--- | :--- | :--- | :---: |
${currentYearConfig.senarai12ALKBaru.map((a, idx) => `| ${idx + 1} | **${a.nama}** | ${a.jawatan} | ${a.portfolio} | ${a.kumpulan} |`).join('\n')}

8.4 **Pelantikan Jawatankuasa Audit Dalaman (JAD):**  
Majlis meluluskan pelantikan 3 orang anggota JAD baharu di bawah Seksyen 42A Akta Koperasi 1993 iaitu **Dr. Roslan Bin Mohamad (Pengerusi JAD)**, **Ahmad Fadzil Bin Kassim (Setiausaha JAD)**, dan **Cik Kamala a/p Krishnan (Anggota JAD)**.
* **Ketetapan Mesyuarat:** Pemilihan 1/3 ALK dan pelantikan JAD **DILULUSKAN SEBULAT SUARA**.

#### AGENDA 9: MENIMBANG DAN MELULUSKAN ANGGARAN BELANJAWAN TAHUNAN (${nextYear})
9.1 Bendahari membentangkan anggaran belanjawan bagi Tahun Kewangan ${nextYear} sebanyak **${currentYearConfig.anggaranBelanjawanTahunDepan}**.
9.2 **Ketetapan Mesyuarat:** Anggaran Belanjawan **DILULUSKAN SEBULAT SUARA**.

#### AGENDA 10: USUL-USUL BERTULIS / PINDAAN UNDANG-UNDANG KECIL (UUK)
10.1 Setiausaha mengesahkan tiada usul pindaan UUK diterima dalam tempoh notis 14 hari sebelum mesyuarat.

---

### 3. PELANTIKAN ENAM (6) ORANG PENENTUSAH MINIT (UUK STANDARD SKM)
Mengikut peruntukan Undang-Undang Kecil Koperasi, mesyuarat telah melantik 6 orang anggota bukan ALK yang hadir untuk menyemak dan menentusahkan minit mesyuarat ini:
1. **${pList[0]?.nama || 'Encik Azman Bin Hashim'}** (No. Ahli: ${pList[0]?.noAhli || 'AH-006'})
2. **${pList[1]?.nama || 'Puan Noraini Binti Zakaria'}** (No. Ahli: ${pList[1]?.noAhli || 'AH-008'})
3. **${pList[2]?.nama || 'Encik Zainal Bin Abidin'}** (No. Ahli: ${pList[2]?.noAhli || 'AH-011'})
4. **${pList[3]?.nama || 'Puan Rohani Binti Abdullah'}** (No. Ahli: ${pList[3]?.noAhli || 'AH-014'})
5. **${pList[4]?.nama || 'Encik Mohd Syafiq Bin Ramli'}** (No. Ahli: ${pList[4]?.noAhli || 'AH-017'})
6. **${pList[5]?.nama || 'Puan Faridah Binti Othman'}** (No. Ahli: ${pList[5]?.noAhli || 'AH-021'})

---

### 4. PENANGGUHAN MESYUARAT
Mesyuarat ditangguhkan pada jam **12:45 Tengah Hari** dengan ucapan terima kasih oleh Pengerusi Majlis dan bacaan Tasbih Kaffarah serta Surah Al-Asr.

---

### ✍️ PENGESAHAN TANDATANGAN RASMI

**Dicatat & Disediakan Oleh (Setiausaha ALK):**  
_____________________________  
*(Siti Nurhaliza Bt Mohd Safian)*  
Tarikh: ${tarikhAGM}

**Disemak & Disahkan Oleh (Pengerusi ALK):**  
_____________________________  
*(Dato' Ahmad Razali Bin Zainal)*  
Tarikh: ${tarikhAGM}

**Disahkan Oleh Penentusah Minit Terpilih (6 Orang Anggota):**  
1. ____________________ (${pList[0]?.nama?.replace(/^(Encik|Puan|Dr\.|Dato')\s+/i, '') || 'Azman Hashim'}) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 4. ____________________ (${pList[3]?.nama?.replace(/^(Encik|Puan|Dr\.|Dato')\s+/i, '') || 'Rohani Abdullah'})  
2. ____________________ (${pList[1]?.nama?.replace(/^(Encik|Puan|Dr\.|Dato')\s+/i, '') || 'Noraini Zakaria'}) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 5. ____________________ (${pList[4]?.nama?.replace(/^(Encik|Puan|Dr\.|Dato')\s+/i, '') || 'Mohd Syafiq'})  
3. ____________________ (${pList[2]?.nama?.replace(/^(Encik|Puan|Dr\.|Dato')\s+/i, '') || 'Zainal Abidin'}) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 6. ____________________ (${pList[5]?.nama?.replace(/^(Encik|Puan|Dr\.|Dato')\s+/i, '') || 'Faridah Othman'})  
`;
  }

  // Handle Synthesis via Gemini Server API Route
  const handleGenerateAIReport = async () => {
    setIsGenerating(true);
    try {
      const payload = {
        koperasiMetadata: {
          namaKoperasi,
          noPendaftaranSKM,
          bilAGM,
          tahunKewangan,
          tarikhAGM,
          masaAGM,
          tempatAGM,
          perutusanPengerusi,
        },
        financialData: {
          totalHasil,
          totalBelanja,
          untungBersih,
          kwrs12,
          kwpk3,
          kwp1,
          totalStatutori,
          untungBolehDiagih,
          totalAset,
          totalLiabiliti,
          totalModalSyer,
          totalEkuiti,
          cadanganDividenRM,
          peratusDividenCadangan,
          honorariumALK,
          bakiKeHadapan,
        },
        auditData: {
          isBalanced: Math.abs(totalAset - (totalLiabiliti + totalEkuiti)) < 1,
          seksyen57Compliance: true,
          skmMaxDividendLimit: 10.0,
          proposedDividendRate: peratusDividenCadangan,
          gp3LeverageRatio: '0.38x (Sangat Selamat)',
        },
        memberStats: {
          totalAhli,
          ahliAktif,
          avgRiskScore,
          gradeACount,
          totalPembiayaanCount: pembiayaanList.length,
        },
        specialNotes: `Laporan disintesis mengikut format statutori Akta Koperasi 1993 (Seksyen 40 & 57), UUK dan GP23 SKM untuk AGM Ke-${bilAGM}. Jenis Dokumen: ${reportDocType === 'LAPORAN_TAHUNAN' ? 'Buku Laporan Tahunan' : 'Minit Mesyuarat Agung Tahunan'}.`,
      };

      const res = await fetch('/api/gemini/generate-agm-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('API server unavailable, generating structured report locally');
      }

      const data = await res.json();
      if (data.reportMarkdown) {
        setReportText(data.reportMarkdown);
      } else {
        setReportText(generateFallbackAGMReport());
      }

      // Log activity
      if (onAddLog) {
        onAddLog({
          id: `LOG-${Date.now()}`,
          tarikhMasa: new Date().toISOString().replace('T', ' ').slice(0, 19),
          kategori: 'PENTADBIRAN',
          tindakan: 'Jana Laporan Eksekutif AGM AI',
          deskripsi: `Sistem Gemini AI telah menyintesis Laporan Eksekutif Penyata Kewangan & Audit untuk AGM Ke-${bilAGM}.`,
          pengguna: 'Bendahari Koperasi',
          status: 'BERJAYA',
          ipAlamat: '127.0.0.1',
        });
      }
    } catch (err) {
      console.warn('Using local fallback generator:', err);
      setReportText(generateFallbackAGMReport());
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy Report Text
  const handleCopyText = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Print / Save to PDF
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Printable CSS override block for clean PDF generation */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-agm-document, #printable-agm-document * {
            visibility: visible;
          }
          #printable-agm-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Banner & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> {isEN ? 'Gemini AI Executive Report Synthesis' : 'Sintesis Laporan Eksekutif Gemini AI'}
            </span>
            <span className="text-xs text-slate-400">
              {isEN ? `Viewing: Year ${viewYear}` : `Paparan: Tahun Kewangan ${viewYear}`}
              {!isSemasa && selectedRekod && (
                <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  viewStatusAudit === 'DISAHKAN_SKM' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {viewStatusAudit === 'DISAHKAN_SKM' ? '✓ TERAUDIT SKM' : '⏳ DALAM PROSES'}
                </span>
              )}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-400" />
            {isEN ? 'Automated AGM Executive Reports' : 'Modul Laporan Berautomatik AGM Koperasi'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isEN
              ? 'Synthesize yearly financial statements, statutory audit compliance, and credit risk analytics into an AGM-ready executive summary.'
              : 'Menyintesiskan penyata kewangan tahunan, pematuhan audit statutori SKM, dan analisis risiko pembiayaan menjadi Laporan Eksekutif AGM rasmi sedia cetak/PDF.'}
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          
          <button
            onClick={handleGenerateAIReport}
            disabled={isGenerating}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/40 flex items-center gap-2 transition-all"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? (isEN ? 'Generating...' : 'Menjana...') : (isEN ? `Generate AI Report ${viewYear}` : `Jana Laporan AI ${viewYear}`)}
          </button>

          <button
            onClick={() => {
              pdfExport.exportAGMReport(
                namaKoperasi,
                noPendaftaranSKM,
                `Laporan Eksekutif Mesyuarat Agung Tahunan (AGM) Ke-${bilAGM} - Tahun ${viewYear}`,
                reportText
              );
            }}
            className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all"
            title={`Muat turun PDF Laporan AGM Tahun ${viewYear}`}
          >
            <Download className="w-4 h-4" />
            <span>PDF {viewYear}</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            {isEN ? 'Print' : 'Cetak'}
          </button>

          <button
            onClick={handleCopyText}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-bold"
            title="Salin Teks Laporan"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

        </div>
      </div>

      {/* ==================== YEAR SELECTOR BAR ==================== */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 border border-indigo-800/60 rounded-2xl p-4 shadow-xl no-print">
        <div className="flex items-center gap-3 mb-3">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
            {isEN ? 'Select AGM Financial Year' : 'Pilih Tahun Kewangan Laporan AGM'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {availableYears.map(yr => {
            const rekod = rekodTahunanList.find(r => r.tahun === yr);
            const isActive = selectedYear === yr;
            const isAudited = rekod?.statusAuditSKM === 'DISAHKAN_SKM';
            return (
              <button
                key={yr}
                onClick={() => { setSelectedYear(yr); setReportText(generateFallbackAGMReport()); }}
                className={`relative px-5 py-3 rounded-xl text-xs font-extrabold transition-all border-2 ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-950 scale-105'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-indigo-600 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-black">{yr}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                    isAudited ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                  }`}>
                    {isAudited ? '✓ TERAUDIT' : '⏳ PROSES'}
                  </span>
                  {rekod && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatRM(rekod.untungBersih)}
                    </span>
                  )}
                </div>
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-400 rounded-full animate-pulse" />
                )}
              </button>
            );
          })}

          {/* SEMASA button */}
          <button
            onClick={() => { setSelectedYear('SEMASA'); setReportText(generateFallbackAGMReport()); }}
            className={`relative px-5 py-3 rounded-xl text-xs font-extrabold transition-all border-2 ${
              isSemasa
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-950 scale-105'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-emerald-600 hover:text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-black flex items-center gap-1">
                {new Date().getFullYear()} <span className="text-emerald-300 text-[9px]">SEMASA</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-950 text-emerald-300">
                ● DATA LANGSUNG
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {formatRM(liveUntungBersih)}
              </span>
            </div>
            {isSemasa && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
            )}
          </button>
        </div>

        {/* Year info banner */}
        {!isSemasa && selectedRekod && (
          <div className="mt-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-wrap items-center gap-4 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-bold text-white">Juruaudit:</span> {viewJuruaudit}
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-bold text-white">Ahli:</span> {totalAhli} orang
            </div>
            <div className="flex items-center gap-1.5">
              <HandCoins className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-white">Dividen:</span> {peratusDividenCadangan}% ({formatRM(cadanganDividenRM)})
            </div>
            {selectedRekod.catatanSKM && (
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span className="italic text-slate-400">{selectedRekod.catatanSKM}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs (Document View vs Interactive Dashboard vs Configuration) */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 no-print">
        <button
          onClick={() => setActiveView('document')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeView === 'document'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          {isEN ? 'PDF Document View (AGM Layout)' : 'Dokumen Rasmi AGM (Sedia Cetak PDF)'}
        </button>

        <button
          onClick={() => setActiveView('interactive')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeView === 'interactive'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Eye className="w-4 h-4" />
          {isEN ? 'Interactive Executive Analytics' : 'Paparan Metrik & Analisis Interaktif'}
        </button>

        <button
          onClick={() => setActiveView('config')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeView === 'config'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          {isEN ? 'Report Setup & SKM Metadata' : 'Tetapan Dokumen & Parameter SKM'}
        </button>
      </div>

      {/* VIEW 1: PRINTABLE OFFICIAL AGM DOCUMENT VIEW */}
      {activeView === 'document' && (
        <div className="space-y-4">
          
          {/* Document Type Switcher: Buku Laporan vs Minit Mesyuarat */}
          <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl no-print">
            <button
              onClick={() => setReportDocType('LAPORAN_TAHUNAN')}
              className={`w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                reportDocType === 'LAPORAN_TAHUNAN'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>📘 Buku Laporan Tahunan Koperasi (Seksyen 39/40 & UUK)</span>
            </button>

            <button
              onClick={() => setReportDocType('MINIT_AGM')}
              className={`w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                reportDocType === 'MINIT_AGM'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>🏛️ Minit Mesyuarat Agung Tahunan Berkanun (Seksyen 40 & GP23 SKM)</span>
            </button>
          </div>

          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 no-print">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Format Berkanun Piawai SKM (Akta Koperasi 1993, UUK & GP23) - Sedia Untuk Dicetak / PDF.
            </span>
            <button
              onClick={handlePrintPDF}
              className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" /> Klik Di Sini Untuk Cetak PDF
            </button>
          </div>

          {/* Paper Document Container */}
          <div 
            id="printable-agm-document" 
            className="bg-white text-slate-900 rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-2xl space-y-6 max-w-4xl mx-auto font-sans"
          >
            
            {/* Document Header Letterhead */}
            <div className="border-b-2 border-slate-900 pb-6 text-center space-y-2">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-black text-xl shadow">
                  SKM
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-slate-900">
                    {namaKoperasi}
                  </h1>
                  <p className="text-xs font-semibold text-slate-600">
                    Sistem Perakaunan & Pengurusan Terkaji • No. Pendaftaran: <span className="font-mono text-slate-900">{noPendaftaranSKM}</span>
                  </p>
                </div>
              </div>

              <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 flex flex-wrap items-center justify-around gap-2 mt-3">
                <span>🗓️ **Masa & Tarikh:** {tarikhAGM} ({masaAGM})</span>
                <span>📍 **Tempat:** {tempatAGM}</span>
                <span>📑 **Mesyuarat:** AGM Ke-{bilAGM}</span>
              </div>
            </div>

            {/* Rendered Markdown Synthesis Body */}
            <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed text-slate-800 border-b border-slate-200 pb-6 space-y-4">
              <Markdown>{reportText}</Markdown>
            </div>

            {/* Executive Sign-off Block */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-900">
              <div className="border border-slate-300 p-3 rounded-xl bg-slate-50 text-center space-y-8">
                <span className="font-bold block border-b border-slate-200 pb-1">Tandatangan Pengerusi ALK</span>
                <div>
                  <div className="font-bold underline">Dato' Haji Ahmad Zaki</div>
                  <span className="text-[10px] text-slate-500">Pengerusi Koperasi</span>
                </div>
              </div>

              <div className="border border-slate-300 p-3 rounded-xl bg-slate-50 text-center space-y-8">
                <span className="font-bold block border-b border-slate-200 pb-1">Tandatangan Bendahari</span>
                <div>
                  <div className="font-bold underline">Haji Ahmad Zaki</div>
                  <span className="text-[10px] text-slate-500">Bendahari Bertauliah</span>
                </div>
              </div>

              <div className="border border-slate-300 p-3 rounded-xl bg-slate-50 text-center space-y-8">
                <span className="font-bold block border-b border-slate-200 pb-1">Pengerusi JAD / Audit</span>
                <div>
                  <div className="font-bold underline">Dr. Roslan Bin Mohamad</div>
                  <span className="text-[10px] text-slate-500">Audit Dalaman Koperasi</span>
                </div>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 border-t border-slate-200 pt-3">
              Dokumen ini disintesis secara automatik oleh Enjin AI Gemini untuk kegunaan Mesyuarat Agung Tahunan Ke-{bilAGM} {namaKoperasi}.
            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: INTERACTIVE DASHBOARD ANALYTICS */}
      {activeView === 'interactive' && (
        <div className="space-y-6 no-print">
          
          {/* Key KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1">Jumlah Hasil Koperasi</span>
                <div className="text-xl font-bold text-emerald-400">{formatRM(totalHasil)}</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Tahun Kewangan {tahunKewangan}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1">Untung Bersih Sebelum Statutori</span>
                <div className="text-xl font-bold text-amber-400">{formatRM(untungBersih)}</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Statutori SKM (16%): {formatRM(totalStatutori)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
                <Scale className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1">Cadangan Agihan Dividen</span>
                <div className="text-xl font-bold text-purple-400">{formatRM(cadanganDividenRM)}</div>
                <p className="text-[11px] text-purple-300 mt-0.5">{peratusDividenCadangan}% Atas Modal Syer RM {totalSyerAhli.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
                <PieChart className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1">Skor Risiko Kredit AI Pembiayaan</span>
                <div className="text-xl font-bold text-blue-400 flex items-baseline gap-1">
                  {avgRiskScore} <span className="text-xs font-normal text-slate-500">/100</span>
                </div>
                <p className="text-[11px] text-emerald-400 mt-0.5">{gradeACount} pembiayaan Gred A</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* Interactive Statutory & Compliance Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* SKM Statutory Deductions Box */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                Matriks Agihan Kumpulan Wang Statutori SKM (16%)
              </h3>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-200 block">Kumpulan Wang Rizab Statutori (KWRS 12%)</span>
                    <span className="text-[11px] text-slate-400">Pematuhan wajib Seksyen 57 Akta Koperasi 1993</span>
                  </div>
                  <span className="font-bold text-emerald-400 text-sm">{formatRM(kwrs12)}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-200 block">Kumpulan Wang Pelajaran Koperasi (KWPK 3%)</span>
                    <span className="text-[11px] text-slate-400">Caruman pendidikan & latihan keanggotaan SKM</span>
                  </div>
                  <span className="font-bold text-amber-400 text-sm">{formatRM(kwpk3)}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-200 block">Kumpulan Wang Pembangunan (KWP 1%)</span>
                    <span className="text-[11px] text-slate-400">Tabung pembangunan sektor koperasi SKM</span>
                  </div>
                  <span className="font-bold text-purple-400 text-sm">{formatRM(kwp1)}</span>
                </div>

                <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/80 flex justify-between items-center">
                  <span className="font-bold text-emerald-300">Untung Bersih Boleh Diagih (Net Distributable):</span>
                  <span className="font-extrabold text-emerald-300 text-base">{formatRM(untungBolehDiagih)}</span>
                </div>
              </div>
            </div>

            {/* Audit Compliance Verification Matrix */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Semakan Status Pematuhan Undang-Undang & Audit
              </h3>

              <div className="space-y-2.5 text-xs">
                
                <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-200 block">Pematuhan Seksyen 57 (Had Dividen ≤ 10%)</span>
                    <p className="text-[11px] text-slate-400">Cadangan dividen {peratusDividenCadangan}% mematuhi had maksimum yang ditetapkan oleh SKM.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-200 block">Ketepatan Imbangan Duga & Lejar Berekuiti</span>
                    <p className="text-[11px] text-slate-400">Baki debit dan kredit berada dalam keadaan seimbang sepenuhnya.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-200 block">Nisbah Tuas Hutang & Leverage GP3 SKM</span>
                    <p className="text-[11px] text-slate-400">Pengurusan pinjaman terkawal dengan sokongan 2 penjamin sah dan potongan gaji BPA.</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 3: CONFIGURATION & SKM PARAMETERS */}
      {activeView === 'config' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 no-print max-w-3xl">
          
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-400" />
              Tetapan Parameter & Maklumat Mesyuarat Agung Tahunan (AGM)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Kemaskini maklumat asas koperasi dan parameter laporan sebelum menjana Laporan Eksekutif AGM.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Koperasi</label>
                <input
                  type="text"
                  value={namaKoperasi}
                  onChange={(e) => setNamaKoperasi(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">No. Pendaftaran SKM</label>
                <input
                  type="text"
                  value={noPendaftaranSKM}
                  onChange={(e) => setNoPendaftaranSKM(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Bil. AGM (Edisi Ke-)</label>
                <input
                  type="text"
                  value={bilAGM}
                  onChange={(e) => setBilAGM(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tahun Kewangan</label>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedYear(val === 'SEMASA' ? 'SEMASA' : Number(val));
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  {availableYears.map(yr => (
                    <option key={yr} value={yr}>Tahun {yr} (Teraudit/Rekod Lepas)</option>
                  ))}
                  <option value="SEMASA">Tahun {new Date().getFullYear()} (Data Langsung Semasa)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tarikh AGM</label>
                <input
                  type="text"
                  value={tarikhAGM}
                  onChange={(e) => setTarikhAGM(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Lokasi / Tempat AGM</label>
              <input
                type="text"
                value={tempatAGM}
                onChange={(e) => setTempatAGM(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Perutusan / Hasrat Pengerusi ALK</label>
              <textarea
                rows={3}
                value={perutusanPengerusi}
                onChange={(e) => setPerutusanPengerusi(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                placeholder="Masukkan amanat pengerusi atau fokus strategic koperasi..."
              />
            </div>

            {/* Content Toggles */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-white block mb-2">Sertakan Modul Dalam Laporan AGM:</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={incFinancials} onChange={(e) => setIncFinancials(e.target.checked)} className="rounded text-emerald-500" />
                  <span>Sintesis Penyata Kewangan Tahunan</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={incAuditCompliance} onChange={(e) => setIncAuditCompliance(e.target.checked)} className="rounded text-emerald-500" />
                  <span>Matriks Pematuhan Audit & Statutori SKM</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={incAIRiskModel} onChange={(e) => setIncAIRiskModel(e.target.checked)} className="rounded text-emerald-500" />
                  <span>Analisis Risiko Kredit Pembiayaan AI</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={incDividendDistribution} onChange={(e) => setIncDividendDistribution(e.target.checked)} className="rounded text-emerald-500" />
                  <span>Cadangan Dividen & Agihan Keuntungan</span>
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  handleGenerateAIReport();
                  setActiveView('document');
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/40"
              >
                <Sparkles className="w-4 h-4" /> Simpan & Jana Laporan AGM
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
