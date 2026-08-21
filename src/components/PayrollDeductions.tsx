import React, { useState } from 'react';
import { Ahli, PembiayaanAhli } from '../types';
import { 
  Receipt, 
  CheckCircle2, 
  Download, 
  Building, 
  FileSpreadsheet, 
  RefreshCw, 
  Send,
  AlertCircle
} from 'lucide-react';

interface PayrollDeductionsProps {
  ahliList: Ahli[];
  pembiayaanList: PembiayaanAhli[];
  onPostMonthlyPayroll: (bulkEntries: Array<{ noAhli: string; syer: number; yuran: number; pinjaman: number }>) => void;
  language?: 'BM' | 'EN';
  setLanguage?: (lang: 'BM' | 'EN') => void;
}

export const PayrollDeductions: React.FC<PayrollDeductionsProps> = ({
  ahliList,
  pembiayaanList,
  onPostMonthlyPayroll,
  language = 'BM',
  setLanguage,
}) => {
  const isEN = language === 'EN';
  const [selectedBulan, setSelectedBulan] = useState<string>('2026-08');
  const [postedSuccess, setPostedSuccess] = useState<boolean>(false);

  // Filter active members
  const activeMembers = ahliList.filter(a => a.status === 'AKTIF');

  // Build deduction items
  const payrollItems = activeMembers.map((ahli) => {
    // Check if member has active loan
    const activeLoan = pembiayaanList.find(p => p.noAhli === ahli.noAhli && p.status === 'DILULUSKAN');
    const potonganPinjaman = activeLoan ? activeLoan.bayaranBulanan : 0;
    const potonganSyer = 50; // Standard monthly share deduction
    const potonganYuran = ahli.yuranBulanan;
    const jumlahPotongan = potonganSyer + potonganYuran + potonganPinjaman;

    return {
      noAhli: ahli.noAhli,
      nama: ahli.nama,
      noGaji: ahli.noGaji,
      noKp: ahli.noKp,
      majikan: ahli.majikan,
      potonganSyer,
      potonganYuran,
      potonganPinjaman,
      jumlahPotongan,
    };
  });

  const totalKeseluruhanSyer = payrollItems.reduce((acc, curr) => acc + curr.potonganSyer, 0);
  const totalKeseluruhanYuran = payrollItems.reduce((acc, curr) => acc + curr.potonganYuran, 0);
  const totalKeseluruhanPinjaman = payrollItems.reduce((acc, curr) => acc + curr.potonganPinjaman, 0);
  const totalKeseluruhanPotongan = payrollItems.reduce((acc, curr) => acc + curr.jumlahPotongan, 0);

  const handleBulkPosting = () => {
    const entries = payrollItems.map(item => ({
      noAhli: item.noAhli,
      syer: item.potonganSyer,
      yuran: item.potonganYuran,
      pinjaman: item.potonganPinjaman,
    }));

    onPostMonthlyPayroll(entries);
    setPostedSuccess(true);
    setTimeout(() => setPostedSuccess(false), 5000);
  };

  const formatRM = (val: number) => {
    return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" /> {isEN ? 'Monthly Payroll Deduction Schedule (BPA / Employer)' : 'Modul Jadual Potongan Gaji Bulanan (BPA / Majikan)'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isEN
              ? 'Generation of employer salary deduction forms, share deductions, monthly fees, & member loan repayments.'
              : 'Penjanaan borang potongan gaji majikan, potongan syer, yuran bulanan, & bayaran balik pembiayaan ahli.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedBulan}
            onChange={(e) => setSelectedBulan(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2"
          />

          <button
            onClick={handleBulkPosting}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/40 flex items-center gap-2 transition-all"
          >
            <Send className="w-4 h-4" /> {isEN ? 'Confirm & Post to General Ledger' : 'Sahkan & Posting ke Lejar Am'}
          </button>
        </div>
      </div>

      {postedSuccess && (
        <div className="p-4 bg-emerald-950 border border-emerald-800 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          {isEN
            ? 'Monthly payroll deductions successfully posted to General Ledger (Bank Islam 1010, Share Capital 3010, & Member Financing 1040).'
            : 'Potongan gaji bulanan berjaya diposting ke Lejar Am (Bank Islam 1010, Modal Syer 3010, & Pembiayaan Ahli 1040).'}
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400">{isEN ? 'Total Share Deductions' : 'Jumlah Potongan Syer'}</span>
          <p className="text-lg font-bold text-emerald-400 mt-1">{formatRM(totalKeseluruhanSyer)}</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400">{isEN ? 'Total Fee Deductions' : 'Jumlah Potongan Yuran'}</span>
          <p className="text-lg font-bold text-blue-400 mt-1">{formatRM(totalKeseluruhanYuran)}</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400">{isEN ? 'Total Loan Repayments' : 'Jumlah Bayaran Pinjaman'}</span>
          <p className="text-lg font-bold text-purple-400 mt-1">{formatRM(totalKeseluruhanPinjaman)}</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 bg-emerald-950/40 border-emerald-800/80">
          <span className="text-xs text-emerald-300 font-bold">{isEN ? 'TOTAL MONTHLY DEDUCTIONS' : 'JUMLAH POTONGAN BULANAN'}</span>
          <p className="text-xl font-extrabold text-emerald-400 mt-1">{formatRM(totalKeseluruhanPotongan)}</p>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider">
            Senarai Potongan Gaji Ahli untuk Bulan {selectedBulan}
          </h3>
          <span className="text-xs text-slate-400 font-mono">Borang BPA / Jabatan Kerajaan & Swasta</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Bil / No. Ahli</th>
                <th className="px-4 py-3.5">Nama Ahli & Majikan</th>
                <th className="px-4 py-3.5">No. Gaji & KP</th>
                <th className="px-4 py-3.5 text-right">Potongan Syer</th>
                <th className="px-4 py-3.5 text-right">Potongan Yuran</th>
                <th className="px-4 py-3.5 text-right">Bayaran Pinjaman</th>
                <th className="px-4 py-3.5 text-right">Jumlah Potongan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {payrollItems.map((item, idx) => (
                <tr key={item.noAhli} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-slate-400">
                    {idx + 1}. <span className="text-emerald-400 font-bold ml-1">{item.noAhli}</span>
                  </td>

                  <td className="px-4 py-3.5 font-bold text-white">
                    {item.nama}
                    <div className="text-[11px] text-slate-400 font-normal">{item.majikan}</div>
                  </td>

                  <td className="px-4 py-3.5 text-slate-300">
                    <div>{item.noGaji}</div>
                    <div className="text-[11px] text-slate-400">{item.noKp}</div>
                  </td>

                  <td className="px-4 py-3.5 text-right font-medium text-emerald-400">
                    {formatRM(item.potonganSyer)}
                  </td>

                  <td className="px-4 py-3.5 text-right font-medium text-blue-300">
                    {formatRM(item.potonganYuran)}
                  </td>

                  <td className="px-4 py-3.5 text-right font-medium text-purple-300">
                    {item.potonganPinjaman > 0 ? formatRM(item.potonganPinjaman) : '—'}
                  </td>

                  <td className="px-4 py-3.5 text-right font-bold text-emerald-400 text-sm">
                    {formatRM(item.jumlahPotongan)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
