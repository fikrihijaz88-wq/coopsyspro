import React, { useState, useMemo } from 'react';
import { TransaksiPOS, ItemProdukPOS } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  DollarSign,
  Calendar,
  Layers,
  UserCheck,
  CreditCard,
  Award,
  Zap,
  ArrowUpRight
} from 'lucide-react';

interface POSAnalyticsDashboardProps {
  transaksiPosList: TransaksiPOS[];
  produkList: ItemProdukPOS[];
  language?: 'BM' | 'EN';
}

const COLOR_PALETTE = [
  '#10b981', // Emerald
  '#6366f1', // Indigo
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#f97316'  // Orange
];

export const POSAnalyticsDashboard: React.FC<POSAnalyticsDashboardProps> = ({
  transaksiPosList,
  produkList,
  language = 'BM'
}) => {
  const isEN = language === 'EN';
  const [timeFilter, setTimeFilter] = useState<'SEMUA' | '7HARI' | 'HARI_INI'>('SEMUA');

  // Filter transactions based on date timeFilter
  const filteredTransactions = useMemo(() => {
    if (timeFilter === 'SEMUA') return transaksiPosList;
    const now = new Date();

    if (timeFilter === 'HARI_INI') {
      const todayStr = now.toISOString().split('T')[0];
      return transaksiPosList.filter(t => t.tarikhMasa.startsWith(todayStr));
    }

    if (timeFilter === '7HARI') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return transaksiPosList.filter(t => {
        const tDate = new Date(t.tarikhMasa.replace(' ', 'T'));
        return tDate >= sevenDaysAgo;
      });
    }

    return transaksiPosList;
  }, [transaksiPosList, timeFilter]);

  // Format currency helper
  const formatRM = (val: number) => `RM ${val.toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // 1. Core Summary Metrics
  const totalRevenue = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => acc + t.jumlahKeseluruhan, 0);
  }, [filteredTransactions]);

  const totalItemsSold = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      return acc + t.itemSenarai.reduce((sum, item) => sum + item.kuantiti, 0);
    }, 0);
  }, [filteredTransactions]);

  const totalTransactionsCount = filteredTransactions.length;
  const averageTicketSize = totalTransactionsCount > 0 ? totalRevenue / totalTransactionsCount : 0;

  // 2. Daily Sales Trend Data
  const dailySalesData = useMemo(() => {
    const mapByDate: Record<string, { tarikh: string; JumlahJualan: number; BilTransaksi: number; Tunai: number; DuitNowQR_Kad: number; PotonganGaji: number }> = {};

    filteredTransactions.forEach(t => {
      const datePart = t.tarikhMasa.split(' ')[0] || 'Lain-lain';
      if (!mapByDate[datePart]) {
        mapByDate[datePart] = {
          tarikh: datePart,
          JumlahJualan: 0,
          BilTransaksi: 0,
          Tunai: 0,
          DuitNowQR_Kad: 0,
          PotonganGaji: 0
        };
      }

      mapByDate[datePart].JumlahJualan += t.jumlahKeseluruhan;
      mapByDate[datePart].BilTransaksi += 1;

      if (t.caraBayaran === 'TUNAI') {
        mapByDate[datePart].Tunai += t.jumlahKeseluruhan;
      } else if (t.caraBayaran === 'DUITNOW_QR' || t.caraBayaran === 'KAD') {
        mapByDate[datePart].DuitNowQR_Kad += t.jumlahKeseluruhan;
      } else if (t.caraBayaran === 'POTONGAN_GAJI_AHLI') {
        mapByDate[datePart].PotonganGaji += t.jumlahKeseluruhan;
      }
    });

    const sortedDates = Object.keys(mapByDate).sort();
    return sortedDates.map(d => ({
      ...mapByDate[d],
      // Friendly date label e.g., "07 Aug"
      tarikhLabel: new Date(d).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short' })
    }));
  }, [filteredTransactions]);

  // 3. Top-Selling Items Data
  const topSellingItemsData = useMemo(() => {
    const mapByProduct: Record<string, { id: string; namaPenuh: string; nama: string; kuantiti: number; hasil: number }> = {};

    filteredTransactions.forEach(t => {
      t.itemSenarai.forEach(item => {
        const prodId = item.idProduk || item.namaProduk;
        if (!mapByProduct[prodId]) {
          mapByProduct[prodId] = {
            id: prodId,
            namaPenuh: item.namaProduk,
            nama: item.namaProduk.length > 22 ? item.namaProduk.substring(0, 20) + '...' : item.namaProduk,
            kuantiti: 0,
            hasil: 0
          };
        }
        mapByProduct[prodId].kuantiti += item.kuantiti;
        mapByProduct[prodId].hasil += item.jumlah;
      });
    });

    return Object.values(mapByProduct)
      .sort((a, b) => b.hasil - a.hasil)
      .slice(0, 7);
  }, [filteredTransactions]);

  // 4. Hourly Transaction Volume Data
  const hourlyData = useMemo(() => {
    const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    const hourMap: Record<string, { jam: string; Transaksi: number; HasilRM: number }> = {};

    hours.forEach(h => {
      hourMap[h] = { jam: h, Transaksi: 0, HasilRM: 0 };
    });

    filteredTransactions.forEach(t => {
      const timePart = t.tarikhMasa.split(' ')[1] || '00:00:00';
      const hourNum = parseInt(timePart.split(':')[0], 10);
      const hourSlot = `${hourNum < 10 ? '0' + hourNum : hourNum}:00`;

      if (hourMap[hourSlot]) {
        hourMap[hourSlot].Transaksi += 1;
        hourMap[hourSlot].HasilRM += t.jumlahKeseluruhan;
      }
    });

    return Object.values(hourMap);
  }, [filteredTransactions]);

  // 5. Category Breakdown Data
  const categoryData = useMemo(() => {
    const mapCategory: Record<string, number> = {};

    filteredTransactions.forEach(t => {
      t.itemSenarai.forEach(item => {
        // Find product category from produkList or fallback
        const prod = produkList.find(p => p.id === item.idProduk || p.namaProduk === item.namaProduk);
        const catName = prod ? prod.kategori : 'Barangan Am';
        mapCategory[catName] = (mapCategory[catName] || 0) + item.jumlah;
      });
    });

    return Object.entries(mapCategory).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value);
  }, [filteredTransactions, produkList]);

  // 6. Member vs Public Customer Distribution
  const customerRatioData = useMemo(() => {
    let memberSales = 0;
    let publicSales = 0;

    filteredTransactions.forEach(t => {
      if (t.isAhli) {
        memberSales += t.jumlahKeseluruhan;
      } else {
        publicSales += t.jumlahKeseluruhan;
      }
    });

    return [
      { name: isEN ? 'Co-op Members' : 'Ahli Koperasi', value: memberSales },
      { name: isEN ? 'Public Walk-in' : 'Pelanggan Awam', value: publicSales }
    ];
  }, [filteredTransactions, isEN]);

  // Custom Dark Mode Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs space-y-1 z-50">
          <p className="font-extrabold text-white border-b border-slate-800 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-slate-300">
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-white">
                {typeof entry.value === 'number' && entry.name.toLowerCase().includes('jualan') || entry.name.toLowerCase().includes('hasil') || entry.name.toLowerCase().includes('rm') || entry.name.toLowerCase().includes('tunai') || entry.name.toLowerCase().includes('potongan')
                  ? formatRM(entry.value)
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Filter Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800/80 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400" />
              Recharts Analytics Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-950 text-indigo-400 border border-indigo-800/80">
              {filteredTransactions.length} {isEN ? 'Records Analyzed' : 'Rekod Jualan Diproses'}
            </span>
          </div>
          <h3 className="text-lg font-black text-white mt-1 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <span>{isEN ? 'POS Business Intelligence & Analytics' : 'Analitis Prestasi Jualan & Trend POS Kedai'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isEN 
              ? 'Real-time visual insights on sales volume, top products, hourly traffic & member rebate trends.' 
              : 'Visualisasi grafik jualan harian, barangan laris, waktu puncak kedai & taburan pelanggan ahli.'}
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 shrink-0">
          <button
            onClick={() => setTimeFilter('SEMUA')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              timeFilter === 'SEMUA'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isEN ? 'All Time' : 'Semua Masa'}
          </button>
          <button
            onClick={() => setTimeFilter('7HARI')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              timeFilter === '7HARI'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isEN ? 'Last 7 Days' : '7 Hari Terakhir'}
          </button>
          <button
            onClick={() => setTimeFilter('HARI_INI')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              timeFilter === 'HARI_INI'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isEN ? 'Today' : 'Hari Ini'}
          </button>
        </div>
      </div>

      {/* KPI Metric Scorecards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-3.5">
          <div className="w-11 h-11 bg-emerald-950 border border-emerald-800 rounded-xl flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {isEN ? 'Total POS Revenue' : 'Jumlah Hasil Jualan'}
            </span>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{formatRM(totalRevenue)}</div>
            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              {totalTransactionsCount} {isEN ? 'completed checkout receipts' : 'resit jualan dikeluarkan'}
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-3.5">
          <div className="w-11 h-11 bg-indigo-950 border border-indigo-800 rounded-xl flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {isEN ? 'Total Units Sold' : 'Kuantiti Barangan Terjual'}
            </span>
            <div className="text-xl font-black text-white mt-0.5">{totalItemsSold} {isEN ? 'units' : 'unit'}</div>
            <span className="text-[10px] text-indigo-400 font-semibold block mt-0.5">
              {isEN ? 'Across all categories' : 'Merangkumi semua kategori barangan'}
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-3.5">
          <div className="w-11 h-11 bg-amber-950 border border-amber-800 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {isEN ? 'Avg Transaction Value' : 'Purata Puris Jualan (ATV)'}
            </span>
            <div className="text-xl font-black text-amber-300 mt-0.5">{formatRM(averageTicketSize)}</div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {isEN ? 'Per receipt transaction' : 'Setiap resit pelanggan'}
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-3.5">
          <div className="w-11 h-11 bg-pink-950 border border-pink-800 rounded-xl flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {isEN ? 'Top Category' : 'Kategori Paling Laris'}
            </span>
            <div className="text-sm font-black text-white mt-0.5 truncate max-w-[140px]">
              {categoryData[0]?.name || 'N/A'}
            </div>
            <span className="text-[10px] text-pink-400 font-semibold block mt-0.5">
              {categoryData[0] ? formatRM(categoryData[0].value) : 'RM 0.00'}
            </span>
          </div>
        </div>

      </div>

      {/* CHART SECTION 1: DAILY SALES TREND (AREA CHART WITH GRADIENT) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>{isEN ? 'Daily Sales Revenue & Method Breakdown' : 'Trend Jualan Harian & Pecahan Kaedah Bayaran'}</span>
            </h4>
            <p className="text-xs text-slate-400">
              {isEN ? 'Daily total revenue (RM) compared across Cash, QR/Card & Member Payroll Deductions.' : 'Jumlah hasil jualan harian (RM) merangkumi Tunai, DuitNow QR/Kad, & Potongan Gaji Ahli.'}
            </p>
          </div>
          <span className="text-[10px] bg-slate-800 text-emerald-400 border border-emerald-800/80 font-bold px-2.5 py-1 rounded-full">
            Area Chart Gradient
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          {dailySalesData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySalesData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorQR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorGaji" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="tarikhLabel" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `RM${val}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="JumlahJualan" name="Jumlah Hasil Jualan (RM)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="DuitNowQR_Kad" name="DuitNow QR / Kad (RM)" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorQR)" />
                <Area type="monotone" dataKey="PotonganGaji" name="Potongan Gaji Ahli (RM)" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorGaji)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs font-semibold">
              {isEN ? 'No sales data available for selected filter.' : 'Tiada data jualan ditemui untuk tempoh tapisan ini.'}
            </div>
          )}
        </div>
      </div>

      {/* CHART SECTION 2 & 3: GRID (TOP SELLING PRODUCTS & HOURLY TRANSACTION VOLUME) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* TOP SELLING PRODUCTS (BAR CHART) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>{isEN ? 'Top-Selling Products by Revenue' : 'Produk Paling Laris (Hasil Jualan RM)'}</span>
              </h4>
              <p className="text-xs text-slate-400">
                {isEN ? 'Top performing inventory items ranked by total revenue generated.' : 'Barangan kedai paling menguntungkan mengikut jumlah kutipan RM.'}
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            {topSellingItemsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSellingItemsData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `RM${val}`} />
                  <YAxis type="category" dataKey="nama" stroke="#cbd5e1" fontSize={11} tickLine={false} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="hasil" name="Hasil Jualan (RM)" radius={[0, 6, 6, 0]}>
                    {topSellingItemsData.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLOR_PALETTE[idx % COLOR_PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs font-semibold">
                {isEN ? 'No product sales recorded yet.' : 'Belum ada jualan produk direkodkan.'}
              </div>
            )}
          </div>
        </div>

        {/* HOURLY TRANSACTION VOLUME (BAR CHART) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>{isEN ? 'Hourly Store Traffic & Transactions' : 'Trafik Kaunter & Waktu Puncak Kedai'}</span>
              </h4>
              <p className="text-xs text-slate-400">
                {isEN ? 'Transaction count per hour slot to optimize cashier staffing.' : 'Bilangan transaksi resit mengikut blok jam waktu operasi kedai.'}
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="jam" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Transaksi" name="Bil. Resit Transaksi" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* CHART SECTION 4 & 5: CATEGORY PIE CHART & MEMBER DEMOGRAPHICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CATEGORY REVENUE PIE CHART */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-amber-400" />
                <span>{isEN ? 'Revenue Share by Category' : 'Sumbangan Hasil Mengikut Kategori'}</span>
              </h4>
              <p className="text-xs text-slate-400">
                {isEN ? 'Percentage share of store revenue by product type.' : 'Pecahan peratusan hasil jualan mengikut kategori barangan.'}
              </p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center pt-2">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 text-xs font-semibold">
                {isEN ? 'No category breakdown available.' : 'Tiada pecahan kategori.'}
              </div>
            )}
          </div>
        </div>

        {/* MEMBER VS PUBLIC DEMOGRAPHIC RATIO */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>{isEN ? 'Member vs Public Sales Distribution' : 'Nisbah Belian Ahli vs Pelanggan Awam'}</span>
              </h4>
              <p className="text-xs text-slate-400">
                {isEN ? 'Revenue contribution from Co-op Members vs Public Walk-in customers.' : 'Sumbangan jualan daripada Ahli Koperasi berbanding Pelanggan Awam.'}
              </p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={customerRatioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value, percent }) => `${name}: ${formatRM(value)} (${(percent * 100).toFixed(0)}%)`}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#3b82f6" />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
