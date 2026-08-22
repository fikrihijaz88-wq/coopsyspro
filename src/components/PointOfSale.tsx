import React, { useState } from 'react';
import { 
  ItemProdukPOS, 
  TransaksiPOS, 
  Ahli, 
  CartaAkaun, 
  Transaksi, 
  ItemCartPOS,
  CaraBayaranPOS,
  ActivityLog
} from '../types';
import { POSAnalyticsDashboard } from './POSAnalyticsDashboard';
import { excelExport } from '../utils/excelExport';
import { pdfExport } from '../utils/pdfExport';
import { 
  ShoppingCart, 
  Package, 
  History, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  QrCode, 
  Banknote, 
  UserCheck, 
  Receipt, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  Tag, 
  Barcode, 
  Download, 
  Globe, 
  ShieldCheck, 
  RefreshCw, 
  FileSpreadsheet, 
  Layers, 
  X,
  XCircle,
  Zap,
  Percent,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Building2,
  BarChart3
} from 'lucide-react';

interface PointOfSaleProps {
  produkList: ItemProdukPOS[];
  setProdukList: React.Dispatch<React.SetStateAction<ItemProdukPOS[]>>;
  transaksiPosList: TransaksiPOS[];
  setTransaksiPosList: React.Dispatch<React.SetStateAction<TransaksiPOS[]>>;
  ahliList: Ahli[];
  cartaAkaun: CartaAkaun[];
  setCartaAkaun: React.Dispatch<React.SetStateAction<CartaAkaun[]>>;
  onAddTransaksiLejar: (tx: Transaksi) => void;
  onAddLog: (newLog: ActivityLog) => void;
  currentUser: { name: string; role: string; email: string } | null;
  language?: 'BM' | 'EN';
  setLanguage?: (lang: 'BM' | 'EN') => void;
}

export const PointOfSale: React.FC<PointOfSaleProps> = ({
  produkList,
  setProdukList,
  transaksiPosList,
  setTransaksiPosList,
  ahliList,
  cartaAkaun,
  setCartaAkaun,
  onAddTransaksiLejar,
  onAddLog,
  currentUser,
  language = 'BM',
  setLanguage,
}) => {
  const isEN = language === 'EN';

  // Active Main Sub-Tab: 'KAUNTER' | 'INVENTORI' | 'SEJARAH' | 'ANALITIS'
  const [activeSubTab, setActiveSubTab] = useState<'KAUNTER' | 'INVENTORI' | 'SEJARAH' | 'ANALITIS'>('KAUNTER');

  // POS Cashier Counter State
  const [cart, setCart] = useState<ItemCartPOS[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [productSearch, setProductSearch] = useState<string>('');
  const [barcodeSearch, setBarcodeSearch] = useState<string>('');

  // Customer Selection State
  const [isCustomerAhli, setIsCustomerAhli] = useState<boolean>(false);
  const [selectedNoAhli, setSelectedNoAhli] = useState<string>('');
  const [customCustomerName, setCustomCustomerName] = useState<string>('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<CaraBayaranPOS>('TUNAI');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [customDiscountRM, setCustomDiscountRM] = useState<number>(0);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [completedSaleReceipt, setCompletedSaleReceipt] = useState<TransaksiPOS | null>(null);

  // New Product Modal State
  const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Alat Tulis & Buku');
  const [newProdBarcode, setNewProdBarcode] = useState('');
  const [newProdCostPrice, setNewProdCostPrice] = useState(0);
  const [newProdRetailPrice, setNewProdRetailPrice] = useState(0);
  const [newProdMemberPrice, setNewProdMemberPrice] = useState(0);
  const [newProdStock, setNewProdStock] = useState(10);
  const [newProdMinStock, setNewProdMinStock] = useState(5);
  const [newProdUnit, setNewProdUnit] = useState('Unit');

  // Categories list
  const categories = [
    'Semua',
    'Alat Tulis & Buku',
    'Makanan & Minuman',
    'Pakaian & Uniform',
    'Barangan Komputer',
    'Produk Keluaran Ahli'
  ];

  // Selected Ahli details
  const currentAhliObj = ahliList.find(a => a.noAhli === selectedNoAhli);

  // Cart Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.jumlah, 0);
  const finalDiscount = customDiscountRM > cartSubtotal ? cartSubtotal : customDiscountRM;
  const cartGrandTotal = Math.max(0, cartSubtotal - finalDiscount);

  const tenderedAmountNumber = parseFloat(cashTendered) || 0;
  const cashChangeRM = paymentMethod === 'TUNAI' ? Math.max(0, tenderedAmountNumber - cartGrandTotal) : 0;

  // Add Item to Cart
  const handleAddToCart = (product: ItemProdukPOS) => {
    if (product.stok <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.produk.id === product.id);
      const effectivePrice = isCustomerAhli ? product.hargaAhli : product.hargaJualan;

      if (existing) {
        if (existing.kuantiti >= product.stok) return prev; // Cannot exceed available stock
        return prev.map(item => {
          if (item.produk.id === product.id) {
            const newQty = item.kuantiti + 1;
            return {
              ...item,
              kuantiti: newQty,
              hargaSebenar: effectivePrice,
              jumlah: newQty * effectivePrice
            };
          }
          return item;
        });
      } else {
        return [
          ...prev,
          {
            produk: product,
            kuantiti: 1,
            hargaSebenar: effectivePrice,
            jumlah: effectivePrice
          }
        ];
      }
    });
  };

  // Recalculate cart prices when Ahli / Non-Ahli toggle changes
  const handleToggleAhliCustomer = (isAhli: boolean) => {
    setIsCustomerAhli(isAhli);
    if (!isAhli) {
      setSelectedNoAhli('');
    }
    setCart(prev => prev.map(item => {
      const newPrice = isAhli ? item.produk.hargaAhli : item.produk.hargaJualan;
      return {
        ...item,
        hargaSebenar: newPrice,
        jumlah: item.kuantiti * newPrice
      };
    }));
  };

  // Quantity Change
  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.produk.id === productId) {
          const newQty = item.kuantiti + delta;
          if (newQty <= 0) return null as any;
          if (newQty > item.produk.stok) return item; // stock cap
          return {
            ...item,
            kuantiti: newQty,
            jumlah: newQty * item.hargaSebenar
          };
        }
        return item;
      }).filter(Boolean);
    });
  };

  // Barcode quick search / scan simulation
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeSearch.trim()) return;

    const matched = produkList.find(p => p.kodBar.toLowerCase() === barcodeSearch.trim().toLowerCase());
    if (matched) {
      handleAddToCart(matched);
      setBarcodeSearch('');
    } else {
      alert(isEN ? `No product found matching barcode: ${barcodeSearch}` : `Tiada produk dijumpai bagi kod bar: ${barcodeSearch}`);
    }
  };

  // Complete POS Sale
  const handleProcessSale = () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'TUNAI' && tenderedAmountNumber < cartGrandTotal) {
      alert(isEN ? "Tendered cash amount is insufficient!" : "Jumlah tunai diserah tidak mencukupi bagi jumlah jualan!");
      return;
    }

    if (paymentMethod === 'POTONGAN_GAJI_AHLI' && !isCustomerAhli) {
      alert(isEN ? "Payroll deduction is strictly for registered co-op members." : "Bayaran Potongan Gaji hanya sah untuk Ahli Koperasi yang berdaftar.");
      return;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const timeStamp = Date.now();
    const receiptNo = `RST-POS-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(100 + Math.random() * 900)}`;
    const txLejarId = `TX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const customerName = isCustomerAhli
      ? (currentAhliObj ? `${currentAhliObj.nama} (${currentAhliObj.noAhli})` : 'Ahli Koperasi')
      : (customCustomerName || 'Pelanggan Awam');

    const newPosTx: TransaksiPOS = {
      id: `POS-${timeStamp}`,
      noResit: receiptNo,
      tarikhMasa: nowStr,
      isAhli: isCustomerAhli,
      noAhli: isCustomerAhli ? selectedNoAhli : undefined,
      namaPelanggan: customerName,
      itemSenarai: cart.map(item => ({
        idProduk: item.produk.id,
        namaProduk: item.produk.namaProduk,
        kuantiti: item.kuantiti,
        hargaUnit: item.hargaSebenar,
        jumlah: item.jumlah
      })),
      subtotal: cartSubtotal,
      diskaun: finalDiscount,
      jumlahKeseluruhan: cartGrandTotal,
      caraBayaran: paymentMethod,
      jumlahBayar: paymentMethod === 'TUNAI' ? tenderedAmountNumber : cartGrandTotal,
      bakiTunai: cashChangeRM,
      juruwang: currentUser?.name || 'Pembantu Kaunter POS',
      noTransaksiLejar: txLejarId
    };

    // 1. Update Product Inventory Stock
    setProdukList(prev => prev.map(p => {
      const cartItem = cart.find(c => c.produk.id === p.id);
      if (cartItem) {
        return {
          ...p,
          stok: Math.max(0, p.stok - cartItem.kuantiti)
        };
      }
      return p;
    }));

    // 2. Add POS Transaction History
    setTransaksiPosList(prev => [newPosTx, ...prev]);

    // 3. Post Double-Entry Accounting Journal to General Ledger
    // Debit: Bank Islam (1010) / Tunai (1020) / Penghutang Ahli (1030)
    // Kredit: Hasil Jualan Kedai (4010)
    let debitAccKod = '1010'; // Default Bank
    if (paymentMethod === 'TUNAI') debitAccKod = '1020';
    if (paymentMethod === 'POTONGAN_GAJI_AHLI') debitAccKod = '1030';

    const newLedgerTx: Transaksi = {
      id: txLejarId,
      tarikh: new Date().toISOString().split('T')[0],
      noRujukan: receiptNo,
      perihal: `Jualan POS Kedai Koperasi (${receiptNo}) - ${customerName}`,
      noAhli: isCustomerAhli ? selectedNoAhli : undefined,
      namaAhli: isCustomerAhli ? currentAhliObj?.nama : undefined,
      debitAkaunKod: debitAccKod,
      kreditAkaunKod: '4010', // Hasil Jualan Kedai & Perniagaan
      jumlah: cartGrandTotal,
      kategori: 'JUALAN_PERNIAGAAN',
      dikemaskiniOleh: currentUser?.name || 'Sistem POS Koperasi'
    };

    onAddTransaksiLejar(newLedgerTx);

    // 4. Update Chart of Accounts balances
    setCartaAkaun(prev => prev.map(acc => {
      if (acc.kod === debitAccKod) {
        return { ...acc, bakiSemasa: acc.bakiSemasa + cartGrandTotal };
      }
      if (acc.kod === '4010') {
        return { ...acc, bakiSemasa: acc.bakiSemasa + cartGrandTotal };
      }
      return acc;
    }));

    // 5. Audit Log
    onAddLog({
      id: `LOG-${timeStamp}`,
      tarikhMasa: nowStr,
      kategori: 'PERAKAUNAN',
      tindakan: 'Jualan POS & Kemaskini Lejar Automatik',
      deskripsi: `Jualan POS No. Resit ${receiptNo} berjaya diselesaikan. Jumlah: RM ${cartGrandTotal.toFixed(2)} (${paymentMethod}). Diposting ke Lejar Am (Debit: ${debitAccKod}, Kredit: 4010).`,
      pengguna: currentUser?.name || 'Sistem POS Koperasi',
      noAhli: isCustomerAhli ? selectedNoAhli : undefined,
      namaAhli: isCustomerAhli ? currentAhliObj?.nama : undefined,
      status: 'BERJAYA',
      jumlahRM: cartGrandTotal
    });

    // Reset Cart & Show Receipt Modal
    setCompletedSaleReceipt(newPosTx);
    setCart([]);
    setCashTendered('');
    setCustomDiscountRM(0);
    setShowCheckoutModal(false);
  };

  // Add New Product Handler
  const handleAddNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || newProdRetailPrice <= 0) return;

    const newProd: ItemProdukPOS = {
      id: `PRD-${Math.floor(100 + Math.random() * 900)}`,
      kodBar: newProdBarcode || `9556${Math.floor(100000000 + Math.random() * 900000000)}`,
      namaProduk: newProdName,
      kategori: newProdCategory,
      hargaKos: Number(newProdCostPrice),
      hargaJualan: Number(newProdRetailPrice),
      hargaAhli: Number(newProdMemberPrice) || Number(newProdRetailPrice),
      stok: Number(newProdStock),
      stokMinima: Number(newProdMinStock),
      unit: newProdUnit || 'Unit'
    };

    setProdukList(prev => [newProd, ...prev]);

    onAddLog({
      id: `LOG-${Date.now()}`,
      tarikhMasa: new Date().toISOString().replace('T', ' ').substring(0, 19),
      kategori: 'PENTADBIRAN',
      tindakan: 'Tambah Barangan Stok POS Baru',
      deskripsi: `Barangan baru "${newProd.namaProduk}" (${newProd.kategori}) didaftarkan ke dalam inventori kedai koperasi.`,
      pengguna: currentUser?.name || 'Pentadbir Stok',
      status: 'INFO'
    });

    setShowAddProductModal(false);
    setNewProdName('');
    setNewProdBarcode('');
    setNewProdCostPrice(0);
    setNewProdRetailPrice(0);
    setNewProdMemberPrice(0);
  };

  // Filter products by category and search
  const filteredProducts = produkList.filter(p => {
    const matchCategory = selectedCategory === 'Semua' || p.kategori === selectedCategory;
    const matchSearch = p.namaProduk.toLowerCase().includes(productSearch.toLowerCase()) || 
                        p.kodBar.toLowerCase().includes(productSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Calculate POS Daily Sales Metrics
  const totalPosSalesToday = transaksiPosList.reduce((sum, tx) => sum + tx.jumlahKeseluruhan, 0);
  const totalReceiptsCount = transaksiPosList.length;
  const lowStockCount = produkList.filter(p => p.stok <= p.stokMinima).length;

  const cashSalesTotal = transaksiPosList.filter(t => t.caraBayaran === 'TUNAI').reduce((sum, t) => sum + t.jumlahKeseluruhan, 0);
  const qrSalesTotal = transaksiPosList.filter(t => t.caraBayaran === 'DUITNOW_QR' || t.caraBayaran === 'KAD').reduce((sum, t) => sum + t.jumlahKeseluruhan, 0);
  const memberCreditSalesTotal = transaksiPosList.filter(t => t.caraBayaran === 'POTONGAN_GAJI_AHLI').reduce((sum, t) => sum + t.jumlahKeseluruhan, 0);

  // Format currency
  const formatRM = (val: number) => `RM ${val.toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      
      {/* Top Header Banner & Navigation Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                Pautan Lejar Am SKM Seksyen 57
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-950 text-indigo-400 border border-indigo-800/80">
                Resit & Rebat Belian Ahli
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-1 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-emerald-400" />
              <span>{isEN ? 'POS Store Register & Inventory System' : 'Sistem POS & Inventori Kedai Koperasi'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEN 
                ? 'Integrates point-of-sale checkout with SKM General Ledger, inventory stock control & member rebates.' 
                : 'Pautan automatik kaunter jualan kedai ke Lejar Am SKM, kawalan stok inventori & rebat belian ahli.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {setLanguage && (
              <button
                onClick={() => setLanguage(isEN ? 'BM' : 'EN')}
                className="px-3 py-2 bg-indigo-950 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/80 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Globe className="w-4 h-4 text-indigo-400" />
                <span>{isEN ? '🇲🇾 BM' : '🇬🇧 EN'}</span>
              </button>
            )}

            <button
              onClick={() => {
                excelExport.exportPOSSales(transaksiPosList, 'Koperasi_Warga_Berdaya');
              }}
              className="px-3.5 py-2 bg-teal-800 hover:bg-teal-700 text-teal-100 border border-teal-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              title="Eksport rekod jualan POS lengkap ke format Excel (.xlsx)"
            >
              <Download className="w-4 h-4 text-teal-300" />
              <span>{isEN ? 'Export Excel' : 'Eksport Excel'}</span>
            </button>

            <button
              onClick={() => {
                // Export POS Sales to CSV
                const headers = ["No Resit", "Tarikh & Masa", "Pelanggan", "Status Ahli", "Item Dibeli", "Cara Bayaran", "Jumlah (RM)", "Juruwang", "No Lejar"];
                const rows = transaksiPosList.map(t => [
                  `"${t.noResit}"`,
                  `"${t.tarikhMasa}"`,
                  `"${t.namaPelanggan.replace(/"/g, '""')}"`,
                  `"${t.isAhli ? 'AHLI KOPERASI' : 'AWAM'}"`,
                  `"${t.itemSenarai.map(i => `${i.namaProduk} x${i.kuantiti}`).join(', ')}"`,
                  `"${t.caraBayaran}"`,
                  t.jumlahKeseluruhan.toFixed(2),
                  `"${t.juruwang}"`,
                  `"${t.noTransaksiLejar}"`
                ]);
                const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `Laporan_Jualan_POS_Koperasi_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{isEN ? 'CSV' : 'CSV'}</span>
            </button>
          </div>
        </div>

        {/* Daily Metrics Dashboard Widgets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-xl">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
              {isEN ? "Today's POS Revenue" : "Jumlah Jualan Hari Ini"}
            </span>
            <div className="text-lg font-black text-emerald-400 mt-0.5">{formatRM(totalPosSalesToday)}</div>
            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              {totalReceiptsCount} {isEN ? 'receipts issued' : 'resit jualan dikeluarkan'}
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-xl">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
              {isEN ? 'Tunai & DuitNow QR' : 'Terimaan Tunai & QR'}
            </span>
            <div className="text-lg font-black text-white mt-0.5">{formatRM(cashSalesTotal + qrSalesTotal)}</div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Tunai: {formatRM(cashSalesTotal)} | QR: {formatRM(qrSalesTotal)}
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-xl">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
              {isEN ? 'Member Payroll Credit' : 'Potongan Gaji Ahli'}
            </span>
            <div className="text-lg font-black text-indigo-300 mt-0.5">{formatRM(memberCreditSalesTotal)}</div>
            <span className="text-[10px] text-indigo-400/80 block mt-1">
              {isEN ? 'Linked to BPA Deductions' : 'Dipotong dari gaji bulanan BPA'}
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-xl">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
              {isEN ? 'Inventory Alert' : 'Amaran Stok Minima'}
            </span>
            <div className={`text-lg font-black mt-0.5 ${lowStockCount > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-300'}`}>
              {lowStockCount} {isEN ? 'Products Low' : 'Barangan Low Stock'}
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {isEN ? 'Reorder threshold reached' : 'Perlu pesanan bekalan baru'}
            </span>
          </div>
        </div>

        {/* Sub-tab Toggle Bar */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSubTab('KAUNTER')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              activeSubTab === 'KAUNTER'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{isEN ? 'Cashier Register' : 'Kaunter Jualan (POS Register)'}</span>
            {cart.length > 0 && (
              <span className="bg-white text-emerald-950 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                {cart.reduce((a,c) => a + c.kuantiti, 0)}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('INVENTORI')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              activeSubTab === 'INVENTORI'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{isEN ? 'Stock Inventory Catalog' : 'Katalog Stok & Produk'}</span>
            {lowStockCount > 0 && (
              <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                {lowStockCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('SEJARAH')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              activeSubTab === 'SEJARAH'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{isEN ? 'Sales Receipts History' : 'Sejarah Jualan & Resit'}</span>
            <span className="bg-slate-700 text-slate-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {transaksiPosList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('ANALITIS')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              activeSubTab === 'ANALITIS'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>{isEN ? 'Sales Analytics & Visual Dashboard' : 'Analitis & Visual Graf Jualan'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================================= */}
      {/* SUB-TAB 1: KAUNTER JUALAN (POS REGISTER) */}
      {/* ========================================================================================= */}
      {activeSubTab === 'KAUNTER' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT 2 COLUMNS: PRODUCT SELECTION GRID */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Search & Barcode Simulator */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder={isEN ? "Search product name or barcode..." : "Cari nama produk atau kod bar..."}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Barcode className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={barcodeSearch}
                      onChange={(e) => setBarcodeSearch(e.target.value)}
                      placeholder={isEN ? "Scan Barcode..." : "Imbas Kod Bar..."}
                      className="w-full sm:w-44 bg-slate-800 border border-emerald-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                  >
                    <span>Imbas</span>
                  </button>
                </form>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/50'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredProducts.map((prod) => {
                const isOutOfStock = prod.stok <= 0;
                const isLowStock = prod.stok > 0 && prod.stok <= prod.stokMinima;

                return (
                  <div
                    key={prod.id}
                    className={`bg-slate-900 border rounded-2xl p-3.5 flex flex-col justify-between transition-all ${
                      isOutOfStock 
                        ? 'border-red-900/50 opacity-60' 
                        : isLowStock 
                        ? 'border-amber-700/80 hover:border-amber-500' 
                        : 'border-slate-800 hover:border-emerald-500/80 shadow-md hover:shadow-emerald-900/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md truncate">
                          {prod.kategori}
                        </span>
                        {isOutOfStock ? (
                          <span className="bg-red-950 text-red-400 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-red-800">
                            HABIS
                          </span>
                        ) : isLowStock ? (
                          <span className="bg-amber-950 text-amber-300 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border border-amber-800 animate-pulse">
                            STOK RENDAH
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-bold">
                            {prod.stok} {prod.unit}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-white line-clamp-2 min-h-[32px] mt-1">
                        {prod.namaProduk}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5 truncate">
                        Kod: {prod.kodBar}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-extrabold text-white">
                          {formatRM(isCustomerAhli ? prod.hargaAhli : prod.hargaJualan)}
                        </div>
                        {isCustomerAhli && prod.hargaAhli < prod.hargaJualan && (
                          <span className="text-[9px] text-emerald-400 font-semibold line-through block">
                            {formatRM(prod.hargaJualan)}
                          </span>
                        )}
                      </div>

                      <button
                        disabled={isOutOfStock}
                        onClick={() => handleAddToCart(prod)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all ${
                          isOutOfStock
                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-900/40 active:scale-95'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isEN ? 'Add' : 'Kart'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                <Package className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-semibold">{isEN ? 'No products match search filter.' : 'Tiada produk ditemui mengikut tapisan carian.'}</p>
              </div>
            )}
          </div>

          {/* RIGHT 1 COLUMN: ACTIVE CART & CHECKOUT PANEL */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4 sticky top-4">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-emerald-400" />
                  <span>{isEN ? 'Current Sale Cart' : 'Resit & Kart Jualan'}</span>
                </h3>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-[11px] text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{isEN ? 'Clear Cart' : 'Kosongkan'}</span>
                  </button>
                )}
              </div>

              {/* Customer Type Selector */}
              <div className="space-y-2 bg-slate-800/80 border border-slate-700/80 p-3 rounded-xl text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">{isEN ? 'Customer Type:' : 'Kategori Pelanggan:'}</span>
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-700">
                    <button
                      type="button"
                      onClick={() => handleToggleAhliCustomer(false)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                        !isCustomerAhli ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isEN ? 'Public' : 'Awam'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAhliCustomer(true)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                        isCustomerAhli ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isEN ? 'Co-op Member' : 'Ahli Koperasi'}
                    </button>
                  </div>
                </div>

                {isCustomerAhli ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {isEN ? 'Select Co-op Member *' : 'Pilih Ahli Koperasi (Harga Ahli) *'}
                    </label>
                    <select
                      value={selectedNoAhli}
                      onChange={(e) => setSelectedNoAhli(e.target.value)}
                      className="w-full bg-slate-900 border border-emerald-700/80 rounded-lg px-2.5 py-1.5 text-xs text-emerald-300 font-semibold focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- Pilih Ahli Koperasi --</option>
                      {ahliList.map(a => (
                        <option key={a.id} value={a.noAhli}>
                          {a.noAhli} - {a.nama} ({a.status})
                        </option>
                      ))}
                    </select>
                    {selectedNoAhli && currentAhliObj && (
                      <div className="mt-1.5 text-[10px] text-emerald-400/90 bg-emerald-950/60 p-1.5 rounded-md border border-emerald-800">
                        ✓ Kelayakan Harga Ahli disahkan. Baki Pembiayaan: {formatRM(currentAhliObj.bakiPinjaman)}. Potongan Gaji Aktif.
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={customCustomerName}
                      onChange={(e) => setCustomCustomerName(e.target.value)}
                      placeholder={isEN ? "Customer Name (Optional)..." : "Nama Pelanggan (Pilihan)..."}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                )}
              </div>

              {/* Cart Items List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 no-scrollbar">
                {cart.map((item) => (
                  <div key={item.produk.id} className="bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-xl text-xs space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-white line-clamp-1">{item.produk.namaProduk}</h5>
                        <span className="text-[10px] text-slate-400">
                          {formatRM(item.hargaSebenar)} / {item.produk.unit}
                        </span>
                      </div>
                      <span className="font-extrabold text-emerald-400 shrink-0">
                        {formatRM(item.jumlah)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.produk.id, -1)}
                          className="w-5 h-5 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 flex items-center justify-center text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="font-extrabold text-white w-6 text-center">{item.kuantiti}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.produk.id, 1)}
                          className="w-5 h-5 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 flex items-center justify-center text-xs font-bold"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleUpdateQuantity(item.produk.id, -item.kuantiti)}
                        className="text-slate-500 hover:text-red-400 text-[10px]"
                      >
                        {isEN ? 'Remove' : 'Buang'}
                      </button>
                    </div>
                  </div>
                ))}

                {cart.length === 0 && (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    <ShoppingCart className="w-6 h-6 text-slate-600 mx-auto mb-1 opacity-50" />
                    <p>{isEN ? 'Cart is currently empty.' : 'Kart jualan masih kosong. Pilih barangan dari senarai.'}</p>
                  </div>
                )}
              </div>

              {/* Order Summary & Discounts */}
              <div className="border-t border-slate-800 pt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">{formatRM(cartSubtotal)}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-amber-400" />
                    <span>{isEN ? 'Discount (RM)' : 'Diskaun (RM)'}</span>
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.50"
                    value={customDiscountRM || ''}
                    onChange={(e) => setCustomDiscountRM(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-right text-xs text-amber-300 font-bold"
                  />
                </div>

                <div className="flex items-center justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                  <span>{isEN ? 'Total Payable:' : 'Jumlah Jualan:'}</span>
                  <span className="text-emerald-400">{formatRM(cartGrandTotal)}</span>
                </div>
              </div>

              {/* Payment Method Option Selector */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                <label className="block text-slate-300 font-bold mb-1">
                  {isEN ? 'Payment Method *' : 'Kaedah Pembayaran *'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('TUNAI')}
                    className={`p-2 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'TUNAI'
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-sm'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    <span>Tunai</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('DUITNOW_QR')}
                    className={`p-2 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'DUITNOW_QR'
                        ? 'bg-pink-950 border-pink-500 text-pink-300 shadow-sm'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-pink-400" />
                    <span>DuitNow QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('KAD')}
                    className={`p-2 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'KAD'
                        ? 'bg-indigo-950 border-indigo-500 text-indigo-300 shadow-sm'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-indigo-400" />
                    <span>Kad Debit/Kredit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('POTONGAN_GAJI_AHLI')}
                    disabled={!isCustomerAhli}
                    className={`p-2 rounded-xl border text-center font-bold flex items-center justify-center gap-1 transition-all ${
                      paymentMethod === 'POTONGAN_GAJI_AHLI'
                        ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-sm'
                        : !isCustomerAhli
                        ? 'bg-slate-800/40 border-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] truncate">{isEN ? 'Payroll Deduct' : 'Potongan Gaji'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('SECUREPAY')}
                    className={`p-2 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'SECUREPAY'
                        ? 'bg-blue-950 border-blue-500 text-blue-300 shadow-sm'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[11px] truncate">SecurePay (FPX/Kad)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('TOYYIBPAY')}
                    className={`p-2 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 transition-all ${
                      paymentMethod === 'TOYYIBPAY'
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-sm'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] truncate">ToyyibPay (FPX)</span>
                  </button>
                </div>
              </div>

              {/* SecurePay Summary Info */}
              {paymentMethod === 'SECUREPAY' && (
                <div className="bg-blue-950/60 border border-blue-800/80 p-3 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-blue-200 font-bold">
                    <span>Gerbang Bayaran SecurePay</span>
                    <span className="text-[10px] bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full border border-blue-700">Automatik</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Pelanggan boleh membayar melalui FPX, Kad Debit/Kredit atau DuitNow QR. Duit ditahan di akaun transit Verttere dan dilepaskan ke akaun bank koperasi mengikut kitaran payout.
                  </p>
                </div>
              )}

              {/* ToyyibPay Summary Info */}
              {paymentMethod === 'TOYYIBPAY' && (
                <div className="bg-emerald-950/60 border border-emerald-800/80 p-3 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-emerald-200 font-bold">
                    <span>Gerbang Bayaran ToyyibPay FPX</span>
                    <span className="text-[10px] bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700">Automatik</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Pelanggan akan membayar melalui perbankan internet FPX Direct. Duit ditahan di akaun transit Verttere dan dilepaskan ke akaun bank koperasi mengikut kitaran payout.
                  </p>
                </div>
              )}

              {/* Tunai Tender Input */}
              {paymentMethod === 'TUNAI' && (
                <div className="bg-slate-800/90 border border-slate-700 p-3 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">{isEN ? 'Cash Tendered (RM):' : 'Tunai Diserah (RM):'}</span>
                    <input
                      type="number"
                      step="1"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      placeholder="0.00"
                      className="w-24 bg-slate-900 border border-slate-600 rounded-lg px-2 py-1 text-right text-xs text-white font-extrabold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Quick Tender Buttons */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
                    {[10, 20, 50, 100].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCashTendered(amt.toString())}
                        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-[10px] font-bold"
                      >
                        RM{amt}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCashTendered(cartGrandTotal.toString())}
                      className="px-2 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10px] font-bold"
                    >
                      {isEN ? 'Exact' : 'Tepat'}
                    </button>
                  </div>

                  {tenderedAmountNumber > 0 && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-700 text-xs font-bold">
                      <span className="text-slate-300">{isEN ? 'Change (RM):' : 'Baki Tunai (RM):'}</span>
                      <span className={cashChangeRM >= 0 ? 'text-emerald-400 font-black text-sm' : 'text-red-400'}>
                        {formatRM(cashChangeRM)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Process Sale CTA Button */}
              <button
                disabled={cart.length === 0 || (isCustomerAhli && !selectedNoAhli)}
                onClick={handleProcessSale}
                className={`w-full py-3 rounded-xl font-extrabold text-xs shadow-xl flex items-center justify-center gap-2 transition-all ${
                  cart.length === 0 || (isCustomerAhli && !selectedNoAhli)
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50 active:scale-98'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEN ? 'Complete Sale & Post Ledger' : 'Selesaikan Jualan & Impak Lejar'}</span>
              </button>

            </div>
          </div>

        </div>
      )}

      {/* ========================================================================================= */}
      {/* SUB-TAB 2: KATALOG STOK & PRODUK (INVENTORY MANAGEMENT) */}
      {/* ========================================================================================= */}
      {activeSubTab === 'INVENTORI' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                <span>{isEN ? 'Co-op Store Inventory & Price Catalog' : 'Senarai Stok & Katalog Barangan Kedai Koperasi'}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {isEN ? 'Manage cost price, selling price, member special pricing & stock limits.' : 'Urus harga kos, harga jualan awam, harga khas ahli & takat amaran stok minima.'}
              </p>
            </div>

            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isEN ? 'Add New Product' : 'Tambah Produk Baru'}</span>
            </button>
          </div>

          {/* Product Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-950/60">
                  <th className="p-3">Kod Bar / ID</th>
                  <th className="p-3">Nama Produk</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3 text-right">Harga Kos</th>
                  <th className="p-3 text-right">Harga Jualan</th>
                  <th className="p-3 text-right text-emerald-400">Harga Ahli</th>
                  <th className="p-3 text-center">Baki Stok</th>
                  <th className="p-3 text-center">Status Stok</th>
                  <th className="p-3 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {produkList.map((p) => {
                  const isLow = p.stok <= p.stokMinima;
                  const isZero = p.stok <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-mono text-[11px] text-slate-400">{p.kodBar}</td>
                      <td className="p-3 font-bold text-white">{p.namaProduk}</td>
                      <td className="p-3">
                        <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-md font-semibold">
                          {p.kategori}
                        </span>
                      </td>
                      <td className="p-3 text-right text-slate-400">{formatRM(p.hargaKos)}</td>
                      <td className="p-3 text-right font-bold text-white">{formatRM(p.hargaJualan)}</td>
                      <td className="p-3 text-right font-black text-emerald-400">{formatRM(p.hargaAhli)}</td>
                      <td className="p-3 text-center font-bold text-white">{p.stok} {p.unit}</td>
                      <td className="p-3 text-center">
                        {isZero ? (
                          <span className="bg-red-950 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-800">
                            HABIS
                          </span>
                        ) : isLow ? (
                          <span className="bg-amber-950 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-800 animate-pulse">
                            STOK RENDAH
                          </span>
                        ) : (
                          <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-800">
                            MENCUKUPI
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            const newQtyStr = prompt(`Kemaskini jumlah stok bagi ${p.namaProduk}:`, p.stok.toString());
                            if (newQtyStr !== null) {
                              const newQty = parseInt(newQtyStr, 10);
                              if (!isNaN(newQty) && newQty >= 0) {
                                setProdukList(prev => prev.map(item => item.id === p.id ? { ...item, stok: newQty } : item));
                              }
                            }
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[10px] font-bold"
                        >
                          {isEN ? 'Restock' : 'Kemaskini Stok'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================================================= */}
      {/* SUB-TAB 3: SEJARAH JUALAN & RESIT (SALES HISTORY) */}
      {/* ========================================================================================= */}
      {activeSubTab === 'SEJARAH' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" />
              <span>{isEN ? 'POS Sales Receipts & Audit Trail' : 'Sejarah Transaksi Resit Jualan POS & Pautan Lejar'}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {isEN 
                ? 'Every POS sale is permanently recorded with its linked General Ledger Transaction ID.' 
                : 'Setiap transaksi jualan POS dicatat lengkap bersama ID Transaksi Lejar Am untuk tujuan semakan audit SKM.'}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-950/60">
                  <th className="p-3">No. Resit</th>
                  <th className="p-3">Tarikh & Masa</th>
                  <th className="p-3">Pelanggan</th>
                  <th className="p-3">Kaedah Bayaran</th>
                  <th className="p-3 text-right">Jumlah (RM)</th>
                  <th className="p-3 text-center">Pautan Lejar</th>
                  <th className="p-3 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {transaksiPosList.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-emerald-400">{tx.noResit}</td>
                    <td className="p-3 text-slate-400">{tx.tarikhMasa}</td>
                    <td className="p-3 font-semibold text-white">
                      {tx.namaPelanggan}
                      {tx.isAhli && (
                        <span className="ml-2 bg-emerald-950 text-emerald-300 text-[9px] px-1.5 py-0.2 rounded border border-emerald-800">
                          AHLI
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-bold">
                        {tx.caraBayaran}
                      </span>
                    </td>
                    <td className="p-3 text-right font-black text-white">{formatRM(tx.jumlahKeseluruhan)}</td>
                    <td className="p-3 text-center font-mono text-[11px] text-indigo-300">
                      <span className="bg-indigo-950 border border-indigo-800/80 px-2 py-0.5 rounded-md">
                        {tx.noTransaksiLejar}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setCompletedSaleReceipt(tx)}
                        className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-lg text-[10px] font-bold flex items-center gap-1 mx-auto"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Cetak Resit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================================================= */}
      {/* SUB-TAB 4: ANALITIS & DASHBOARD VISUAL (RECHARTS) */}
      {/* ========================================================================================= */}
      {activeSubTab === 'ANALITIS' && (
        <POSAnalyticsDashboard
          transaksiPosList={transaksiPosList}
          produkList={produkList}
          language={language}
        />
      )}

      {/* ========================================================================================= */}
      {/* MODAL: ADD NEW PRODUCT */}
      {/* ========================================================================================= */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>{isEN ? 'Add New Product Item' : 'Pendaftaran Produk / Stok Kedai Baru'}</span>
              </h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">{isEN ? 'Product Name *' : 'Nama Produk *'}</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Contoh: Kopi Pracampur Koperasi 20 Sachet"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">{isEN ? 'Category *' : 'Kategori *'}</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    {categories.filter(c => c !== 'Semua').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">{isEN ? 'Barcode / Code' : 'Kod Bar'}</label>
                  <input
                    type="text"
                    value={newProdBarcode}
                    onChange={(e) => setNewProdBarcode(e.target.value)}
                    placeholder="9556XXXXXXXXX"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">{isEN ? 'Cost Price (RM)' : 'Harga Kos (RM)'}</label>
                  <input
                    type="number"
                    step="0.10"
                    required
                    value={newProdCostPrice}
                    onChange={(e) => setNewProdCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">{isEN ? 'Retail Price (RM)' : 'Harga Jualan (RM)'}</label>
                  <input
                    type="number"
                    step="0.10"
                    required
                    value={newProdRetailPrice}
                    onChange={(e) => setNewProdRetailPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold text-emerald-400">{isEN ? 'Member Price (RM)' : 'Harga Ahli (RM)'}</label>
                  <input
                    type="number"
                    step="0.10"
                    required
                    value={newProdMemberPrice}
                    onChange={(e) => setNewProdMemberPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-emerald-700 rounded-lg px-3 py-2 text-emerald-300 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">{isEN ? 'Initial Stock' : 'Jumlah Stok Awal'}</label>
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">{isEN ? 'Min Alert' : 'Stok Minima'}</label>
                  <input
                    type="number"
                    required
                    value={newProdMinStock}
                    onChange={(e) => setNewProdMinStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">{isEN ? 'Unit' : 'Unit Ukuran'}</label>
                  <input
                    type="text"
                    required
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    placeholder="Buku / Kotak / Botol"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  {isEN ? 'Cancel' : 'Batal'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg"
                >
                  {isEN ? 'Save Product' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* MODAL: THERMAL RECEIPT DISPLAY & PRINT */}
      {/* ========================================================================================= */}
      {completedSaleReceipt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative font-mono text-xs border border-slate-200">
            
            {/* Header Thermal Slip */}
            <div className="text-center border-b border-dashed border-slate-400 pb-3 mb-3">
              <div className="font-extrabold text-sm uppercase tracking-wide">KOPERASI MALAYSIA BERHAD</div>
              <div className="text-[10px] text-slate-600">Sistem Pengurusan & Perakaunan SPPKM</div>
              <div className="text-[10px] text-slate-500 mt-1 font-sans">No. Pendaftaran SKM: KOP-1993-8821</div>
              <div className="text-[11px] font-bold text-emerald-800 mt-2 bg-emerald-50 py-1 rounded border border-emerald-200">
                *** RESIT RASMI JUALAN POS ***
              </div>
            </div>

            {/* Receipt Meta */}
            <div className="space-y-1 text-[11px] border-b border-dashed border-slate-400 pb-3 mb-3">
              <div className="flex justify-between">
                <span>No. Resit:</span>
                <span className="font-bold">{completedSaleReceipt.noResit}</span>
              </div>
              <div className="flex justify-between">
                <span>Tarikh/Masa:</span>
                <span>{completedSaleReceipt.tarikhMasa}</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span className="font-bold">{completedSaleReceipt.namaPelanggan}</span>
              </div>
              <div className="flex justify-between">
                <span>Juruwang:</span>
                <span>{completedSaleReceipt.juruwang}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Pautan Lejar:</span>
                <span>{completedSaleReceipt.noTransaksiLejar}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="border-b border-dashed border-slate-400 pb-3 mb-3 space-y-1.5 text-[11px]">
              <div className="flex justify-between font-bold border-b border-slate-300 pb-1">
                <span>Item / Produk</span>
                <span>Kuantiti x Harga = Jumlah</span>
              </div>
              {completedSaleReceipt.itemSenarai.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-bold">{item.namaProduk}</div>
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>{item.kuantiti} x {formatRM(item.hargaUnit)}</span>
                    <span className="font-bold text-slate-900">{formatRM(item.jumlah)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals & Payment Breakdown */}
            <div className="space-y-1 text-[11px] border-b border-dashed border-slate-400 pb-3 mb-3 font-sans">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatRM(completedSaleReceipt.subtotal)}</span>
              </div>
              {completedSaleReceipt.diskaun > 0 && (
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>Diskaun / Rebat:</span>
                  <span>-{formatRM(completedSaleReceipt.diskaun)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-sm text-slate-950 pt-1 border-t border-slate-300">
                <span>JUMLAH BERSIH:</span>
                <span>{formatRM(completedSaleReceipt.jumlahKeseluruhan)}</span>
              </div>

              <div className="flex justify-between text-[10px] text-slate-600 pt-1">
                <span>Cara Bayaran:</span>
                <span className="font-bold uppercase">{completedSaleReceipt.caraBayaran}</span>
              </div>
              {completedSaleReceipt.caraBayaran === 'TUNAI' && (
                <>
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>Tunai Diserah:</span>
                    <span>{formatRM(completedSaleReceipt.jumlahBayar)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-emerald-800 font-bold">
                    <span>Baki Tunai:</span>
                    <span>{formatRM(completedSaleReceipt.bakiTunai)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Footer Notice */}
            <div className="text-center text-[10px] text-slate-500 font-sans space-y-1">
              <p>Terima Kasih Kerana Menyokong Perniagaan Koperasi Anda!</p>
              <p className="text-[9px] text-slate-400">Jualan ini menjana Rebat Belian Ahli mengikut Seksyen 57 Akta Koperasi 1993.</p>
            </div>

            {/* Print & Close Controls */}
            <div className="flex items-center gap-2 mt-5 font-sans">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Resit</span>
              </button>
              <button
                onClick={() => setCompletedSaleReceipt(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
