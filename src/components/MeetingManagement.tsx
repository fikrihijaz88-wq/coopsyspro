import React, { useState, useRef, useEffect } from 'react';
import { Mesyuarat, JenisMesyuarat, StatusMesyuarat, AgendaItem, UsulResolusi, KehadiranRecord, Ahli, ActivityLog, TandatanganDigital } from '../types';
import QRCode from 'qrcode';
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  PlusCircle, 
  Sparkles, 
  Printer, 
  Copy, 
  Check, 
  Sliders, 
  Vote, 
  BookOpen, 
  ShieldCheck, 
  ListOrdered, 
  UserCheck, 
  FileEdit,
  Building,
  Filter,
  Info,
  ChevronRight,
  Download,
  Search,
  Radio,
  Lock,
  Unlock,
  Play,
  StopCircle,
  RefreshCw,
  Send,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Minus,
  CheckSquare,
  AlertCircle,
  Gauge,
  Activity,
  TrendingUp,
  PenTool,
  Eraser,
  KeyRound,
  ShieldAlert,
  Trash2,
  Stamp,
  Award,
  FileCheck,
  QrCode,
  Maximize2,
  Smartphone,
  Scan,
  Share2,
  History
} from 'lucide-react';

interface MeetingManagementProps {
  mesyuaratList: Mesyuarat[];
  setMesyuaratList: React.Dispatch<React.SetStateAction<Mesyuarat[]>>;
  ahliList: Ahli[];
  onAddLog?: (log: ActivityLog) => void;
  logs?: ActivityLog[];
  language?: 'BM' | 'EN';
  setLanguage?: (lang: 'BM' | 'EN') => void;
}

export const MeetingManagement: React.FC<MeetingManagementProps> = ({
  mesyuaratList,
  setMesyuaratList,
  ahliList,
  onAddLog,
  logs = [],
  language = 'BM',
  setLanguage,
}) => {
  const isEN = language === 'EN';
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(mesyuaratList[0]?.id || '');
  const [copiedMinutes, setCopiedMinutes] = useState<boolean>(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);

  // E-Voting State
  const [activeMotionId, setActiveMotionId] = useState<string>('');
  const [selectedMemberIdToVote, setSelectedMemberIdToVote] = useState<string>('');
  const [votingChoice, setVotingChoice] = useState<'SETUJU' | 'BANTAH' | 'BERKECUALI'>('SETUJU');
  const [votingFeedback, setVotingFeedback] = useState<{ type: 'SUCCESS' | 'ERROR'; message: string } | null>(null);

  // Digital Signature Workflow State
  const [showSignatureModal, setShowSignatureModal] = useState<boolean>(false);
  const [signatureMode, setSignatureMode] = useState<'DRAW' | 'TYPED'>('DRAW');
  const [signerName, setSignerName] = useState<string>('');
  const [signerRole, setSignerRole] = useState<string>('Pengerusi ALK');
  const [signerNoKp, setSignerNoKp] = useState<string>('');
  const [signerNotes, setSignerNotes] = useState<string>('Disahkan minit mesyuarat adalah tepat dan disetujui di bawah Akta Koperasi 1993.');
  const [signatureFeedback, setSignatureFeedback] = useState<{ type: 'SUCCESS' | 'ERROR'; message: string } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasDrawnContent, setHasDrawnContent] = useState<boolean>(false);

  // Modal State for New Meeting
  const [showNewMeetingModal, setShowNewMeetingModal] = useState<boolean>(false);
  const [newJenis, setNewJenis] = useState<JenisMesyuarat>('ALK');
  const [newBilangan, setNewBilangan] = useState<string>('Bil. 05/2026');
  const [newTajuk, setNewTajuk] = useState<string>('Mesyuarat Ahli Lembaga Koperasi Bil. 5/2026');
  const [newTarikh, setNewTarikh] = useState<string>('2026-09-01');
  const [newMasa, setNewMasa] = useState<string>('02:30 PM');
  const [newTempat, setNewTempat] = useState<string>('Bilik Mesyuarat ALK, Wisma Koperasi');
  const [newPengerusi, setNewPengerusi] = useState<string>('Dato\' Ahmad Razali Bin Othman');
  const [newPencatat, setNewPencatat] = useState<string>('Siti Nurhaliza Bt Mohd Safian');

  // Modal & Selection State for Closing Meeting & Penentusah Minit
  const [showCloseMeetingModal, setShowCloseMeetingModal] = useState<boolean>(false);
  const [selectedPenentusahList, setSelectedPenentusahList] = useState<string[]>([]);
  const [closeMeetingNotes, setCloseMeetingNotes] = useState<string>('Mesyuarat ditangguhkan mengikut jadual. Minit disahkan teratur dan tepat oleh Penentusah Minit.');
  const [penentusahSearchQuery, setPenentusahSearchQuery] = useState<string>('');
  const [customPenentusahInput, setCustomPenentusahInput] = useState<string>('');
  const [closeFeedback, setCloseFeedback] = useState<{ type: 'SUCCESS' | 'ERROR'; message: string } | null>(null);

  // Currently Selected Meeting
  const currentMeeting = mesyuaratList.find(m => m.id === selectedMeetingId) || mesyuaratList[0];

  // Digital QR Code Attendance State
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showQrScanModal, setShowQrScanModal] = useState<boolean>(false);
  const [selectedMemberForQrScan, setSelectedMemberForQrScan] = useState<string>('');
  const [qrScanFeedback, setQrScanFeedback] = useState<{ type: 'SUCCESS' | 'ERROR'; message: string } | null>(null);
  const [qrSearchQuery, setQrSearchQuery] = useState<string>('');
  const [copiedQrLink, setCopiedQrLink] = useState<boolean>(false);

  // Generate Unique QR Code Data URL for Selected Meeting
  useEffect(() => {
    if (currentMeeting) {
      const qrPayload = JSON.stringify({
        app: 'SPPKM Koperasi Malaysia',
        meetingId: currentMeeting.id,
        title: currentMeeting.tajuk,
        bilangan: currentMeeting.bilangan,
        tarikh: currentMeeting.tarikh,
        masa: currentMeeting.masa,
        tempat: currentMeeting.tempat,
        action: 'SELF_REGISTER_ATTENDANCE',
        verificationToken: `VER-QR-${currentMeeting.id}-${currentMeeting.tarikh.replace(/-/g, '')}`,
        url: `${window.location.origin}/attendance?meetingId=${currentMeeting.id}`
      });

      QRCode.toDataURL(qrPayload, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Error generating QR code:', err));
    }
  }, [currentMeeting?.id, currentMeeting?.tajuk, currentMeeting?.tarikh, currentMeeting?.bilangan]);

  // QR Attendance Scan Handler
  const handleProcessQrScan = (memberIdToScan?: string) => {
    if (!currentMeeting) return;
    const targetId = memberIdToScan || selectedMemberForQrScan;
    
    if (!targetId) {
      setQrScanFeedback({ type: 'ERROR', message: 'Sila pilih ahli koperasi untuk mendaftar kehadiran via QR Code.' });
      return;
    }

    const ahli = ahliList.find(a => a.id === targetId);
    if (!ahli) {
      setQrScanFeedback({ type: 'ERROR', message: 'Maklumat ahli tidak ditemui dalam pangkalan data.' });
      return;
    }

    const existingAttendance = currentMeeting.kehadiranSenarai || [];
    const isAlreadyPresent = existingAttendance.some(k => k.noAhli === ahli.noAhli || k.nama.toLowerCase() === ahli.nama.toLowerCase());

    if (isAlreadyPresent) {
      setQrScanFeedback({
        type: 'ERROR',
        message: `Ahli ${ahli.nama} (${ahli.noAhli}) telah pun direkodkan HADIR dalam mesyuarat ini.`
      });
      return;
    }

    const scanTimestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newRecord: KehadiranRecord = {
      id: `KHD-QR-${Date.now()}`,
      noAhli: ahli.noAhli,
      nama: ahli.nama,
      jawatan: ahli.jawatan || 'Ahli Biasa',
      status: 'HADIR',
      tarikhDaftarMasa: `${scanTimestamp} (Imbasan Kod QR)`
    };

    const updatedSenarai = [newRecord, ...existingAttendance];
    const newHadirCount = updatedSenarai.filter(k => k.status === 'HADIR').length;
    const reqQuorum = calculateQuorumRule(currentMeeting.jenis, currentMeeting.jumlahAhliBerhak);

    const updatedMeetings = mesyuaratList.map(m => {
      if (m.id === currentMeeting.id) {
        return {
          ...m,
          kehadiranSenarai: updatedSenarai,
          kehadiranHadir: newHadirCount,
          korumSah: newHadirCount >= reqQuorum
        };
      }
      return m;
    });

    setMesyuaratList(updatedMeetings);

    // Audit Log
    onAddLog?.({
      id: `LOG-QR-${Date.now()}`,
      tarikhMasa: scanTimestamp,
      kategori: 'MESYUARAT',
      tindakan: 'Pendaftaran Kehadiran Kod QR',
      deskripsi: `Ahli ${ahli.nama} (${ahli.noAhli}) mendaftar kehadiran secara digital melalui imbasan Kod QR bagi ${currentMeeting.tajuk}. Status Korum: ${newHadirCount >= reqQuorum ? 'SAH' : 'DEFISIT'}.`,
      pengguna: ahli.nama,
      noAhli: ahli.noAhli,
      namaAhli: ahli.nama,
      status: 'BERJAYA',
      ipAlamat: '192.168.1.120'
    });

    setQrScanFeedback({
      type: 'SUCCESS',
      message: `Imbasan Kod QR Berjaya! Kehadiran ${ahli.nama} (${ahli.noAhli}) disahkan & direkodkan pada ${scanTimestamp}.`
    });

    setSelectedMemberForQrScan('');
    setTimeout(() => setQrScanFeedback(null), 5000);
  };

  const handleDownloadQrCode = () => {
    if (!qrCodeDataUrl || !currentMeeting) return;
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `Kod_QR_Kehadiran_${currentMeeting.bilangan.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyQrLink = () => {
    if (!currentMeeting) return;
    const link = `${window.location.origin}/attendance?meetingId=${currentMeeting.id}`;
    navigator.clipboard.writeText(link);
    setCopiedQrLink(true);
    setTimeout(() => setCopiedQrLink(false), 3000);
  };

  // Open Close Meeting Modal & Initialize Penentusah List
  const handleOpenCloseMeetingModal = () => {
    if (!currentMeeting) return;
    if (currentMeeting.penentusahMinit && currentMeeting.penentusahMinit.length > 0) {
      setSelectedPenentusahList(currentMeeting.penentusahMinit);
    } else if (currentMeeting.jenis === 'AGM' || currentMeeting.jenis === 'EGM') {
      setSelectedPenentusahList([
        currentMeeting.pengerusi || 'Dato\' Ahmad Razali Bin Othman',
        currentMeeting.pencatatMinit || 'Siti Nurhaliza Bt Mohd Safian',
        'Kamal Bin Ariffin (Penentusah #1)',
        'Zarina Bt Wan Sulaiman (Penentusah #2)',
        'Rahim Bin Ismail (Penentusah #3)',
        'Faridah Bt Abdullah (Penentusah #4)',
        'Mohd Amir Bin Yusof (Penentusah #5)',
        'Hjh Aminah Bt Kasim (Penentusah #6)',
      ]);
    } else {
      setSelectedPenentusahList([
        currentMeeting.pengerusi || 'Dato\' Ahmad Razali Bin Othman',
        currentMeeting.pencatatMinit || 'Siti Nurhaliza Bt Mohd Safian',
      ]);
    }
    setCloseFeedback(null);
    setShowCloseMeetingModal(true);
  };

  const handleTogglePenentusahMember = (memberName: string) => {
    if (selectedPenentusahList.includes(memberName)) {
      setSelectedPenentusahList(selectedPenentusahList.filter(n => n !== memberName));
    } else {
      setSelectedPenentusahList([...selectedPenentusahList, memberName]);
    }
  };

  const handleAddCustomPenentusah = () => {
    if (!customPenentusahInput.trim()) return;
    const nameToAdd = customPenentusahInput.trim();
    if (!selectedPenentusahList.includes(nameToAdd)) {
      setSelectedPenentusahList([...selectedPenentusahList, nameToAdd]);
    }
    setCustomPenentusahInput('');
  };

  const handlePresetSelectAGM6 = () => {
    const agmPresets = [
      currentMeeting?.pengerusi || 'Dato\' Ahmad Razali Bin Othman',
      currentMeeting?.pencatatMinit || 'Siti Nurhaliza Bt Mohd Safian',
      'Kamal Bin Ariffin',
      'Zarina Bt Wan Sulaiman',
      'Rahim Bin Ismail',
      'Faridah Bt Abdullah',
      'Mohd Amir Bin Yusof',
      'Hjh Aminah Bt Kasim',
    ];
    setSelectedPenentusahList(agmPresets);
  };

  const handlePresetSelectALKAll = () => {
    const alkNames = ahliList
      .filter(a => a.jawatan?.includes('ALK') || a.jawatan?.includes('Pengerusi') || a.jawatan?.includes('Setiausaha') || a.jawatan?.includes('Bendahari') || a.jawatan?.includes('Audit'))
      .map(a => a.nama);
    if (alkNames.length > 0) {
      setSelectedPenentusahList(alkNames);
    } else {
      setSelectedPenentusahList([
        'Dato\' Ahmad Razali Bin Othman',
        'Siti Nurhaliza Bt Mohd Safian',
        'Mohd Rosli Bin Hashim',
      ]);
    }
  };

  // Confirm Closing Meeting & Save Penentusah Minit
  const handleConfirmCloseMeeting = () => {
    if (!currentMeeting) return;
    if (selectedPenentusahList.length === 0) {
      setCloseFeedback({ type: 'ERROR', message: 'Sila pilih sekurang-kurangnya seorang Penentusah Minit sebelum menutup mesyuarat.' });
      return;
    }

    const nowStamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const existingSigs = currentMeeting.tandatanganDigital || [];
    const updatedSigs: TandatanganDigital[] = [...existingSigs];

    selectedPenentusahList.forEach((pName, idx) => {
      const alreadyHasSig = updatedSigs.some(s => s.namaSigner.toLowerCase().includes(pName.toLowerCase()) || pName.toLowerCase().includes(s.namaSigner.toLowerCase()));
      if (!alreadyHasSig) {
        const randomHash = `SHA256: ${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-VERTTERE-CLOSE-${idx + 1}`;
        updatedSigs.push({
          id: `SIG-CLOSE-${Date.now()}-${idx}`,
          namaSigner: pName,
          jawatan: idx === 0 ? 'Pengerusi Mesyuarat / ALK' : idx === 1 ? 'Pencatat Minit / Setiausaha' : `Penentusah Minit #${idx - 1} (Lantikan AGM)`,
          noKpOrAhli: `KOP-2026-0${idx + 1}`,
          tarikhTandatangan: nowStamp,
          signatureType: 'TYPED_DIGITAL',
          status: 'DISAHKAN',
          catatan: closeMeetingNotes || 'Disahkan sebagai rekod tepat minit mesyuarat.',
          hashAuditan: randomHash,
          ipAlamat: '192.168.1.100'
        });
      }
    });

    const updatedMeetings = mesyuaratList.map(m => {
      if (m.id === currentMeeting.id) {
        const updatedObj: Mesyuarat = {
          ...m,
          status: 'SELESAI',
          penentusahMinit: selectedPenentusahList,
          tandatanganDigital: updatedSigs,
        };
        return {
          ...updatedObj,
          minitMesyuaratText: generateOfficialMinutesText(updatedObj)
        };
      }
      return m;
    });

    setMesyuaratList(updatedMeetings);

    // Activity Log Record
    onAddLog?.({
      id: `LOG-CLOSE-${Date.now()}`,
      tarikhMasa: nowStamp,
      kategori: 'MESYUARAT',
      tindakan: 'Penutupan Mesyuarat & Lantikan Penentusah Minit',
      deskripsi: `Mesyuarat "${currentMeeting.tajuk}" telah ditutup rasmi (Status: SELESAI). Senarai Penentusah Minit dilantik (${selectedPenentusahList.length} orang): ${selectedPenentusahList.join(', ')}. [Mematuhi Akta Koperasi 1993]`,
      pengguna: currentMeeting.pengerusi || 'Pengerusi ALK',
      namaAhli: currentMeeting.pengerusi || 'Pengerusi ALK',
      status: 'BERJAYA',
      ipAlamat: '192.168.1.100'
    });

    setShowCloseMeetingModal(false);
    setCloseFeedback(null);
  };

  // Currently active motion for voting
  const activeMotion = currentMeeting?.resolusi?.find(r => r.id === activeMotionId) || currentMeeting?.resolusi?.[0];

  // Canvas Signature Methods
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawnContent(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#10b981'; // emerald-500
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnContent(false);
  };

  // Open Signature Modal with Defaults
  const handleOpenSignatureModal = () => {
    if (!currentMeeting) return;
    const defaultName = currentMeeting.pengerusi || currentMeeting.pencatatMinit || 'Dato\' Ahmad Razali Bin Othman';
    setSignerName(defaultName);
    setSignerRole('Pengerusi ALK');
    setSignerNoKp('KOP-2026-0001');
    setSignerNotes('Disahkan minit mesyuarat adalah tepat dan disetujui sebulat suara.');
    setSignatureMode('DRAW');
    setHasDrawnContent(false);
    setShowSignatureModal(true);
  };

  // Save Digital Signature
  const handleSaveDigitalSignature = () => {
    if (!currentMeeting) return;
    if (!signerName.trim()) {
      setSignatureFeedback({ type: 'ERROR', message: 'Sila masukkan nama penandatangan.' });
      return;
    }

    let signatureImgUrl: string | undefined = undefined;

    if (signatureMode === 'DRAW') {
      if (!canvasRef.current || !hasDrawnContent) {
        setSignatureFeedback({ type: 'ERROR', message: 'Sila lukis tandatangan anda pada canvas sebelum menyimpan.' });
        return;
      }
      signatureImgUrl = canvasRef.current.toDataURL('image/png');
    }

    const randomHash = `SHA256: ${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-VERTTERE-SKM-2026`;
    const nowStamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const newSig: TandatanganDigital = {
      id: `SIG-${Date.now()}`,
      namaSigner: signerName.trim(),
      jawatan: signerRole,
      noKpOrAhli: signerNoKp || 'ALK-KOPERASI',
      tarikhTandatangan: nowStamp,
      signatureDataUrl: signatureImgUrl,
      signatureType: signatureMode === 'DRAW' ? 'DRAWN' : 'TYPED_DIGITAL',
      status: 'DISAHKAN',
      catatan: signerNotes,
      hashAuditan: randomHash,
      ipAlamat: '192.168.1.105'
    };

    const existingSigs = currentMeeting.tandatanganDigital || [];
    const updatedMeetings = mesyuaratList.map(m => {
      if (m.id === currentMeeting.id) {
        const newSigList = [...existingSigs, newSig];
        return {
          ...m,
          tandatanganDigital: newSigList,
          minitMesyuaratText: generateOfficialMinutesText({ ...m, tandatanganDigital: newSigList })
        };
      }
      return m;
    });

    setMesyuaratList(updatedMeetings);

    // Auto-Log to Activity Log
    onAddLog?.({
      id: `LOG-${Date.now()}`,
      tarikhMasa: nowStamp,
      kategori: 'MESYUARAT',
      tindakan: 'Tandatangan Digital Minit Mesyuarat',
      deskripsi: `${signerName} (${signerRole}) memetrik tandatangan digital bagi Minit Mesyuarat "${currentMeeting.tajuk}". Hash Auditan: ${randomHash}.`,
      pengguna: signerName,
      namaAhli: signerName,
      status: 'BERJAYA',
      ipAlamat: '192.168.1.105'
    });

    setShowSignatureModal(false);
    setSignatureFeedback(null);
  };

  // Revoke / Delete Signature
  const handleDeleteSignature = (sigId: string) => {
    if (!currentMeeting) return;
    const existingSigs = currentMeeting.tandatanganDigital || [];
    const sigToDelete = existingSigs.find(s => s.id === sigId);
    const updatedSigs = existingSigs.filter(s => s.id !== sigId);

    const updatedMeetings = mesyuaratList.map(m => {
      if (m.id === currentMeeting.id) {
        return {
          ...m,
          tandatanganDigital: updatedSigs,
          minitMesyuaratText: generateOfficialMinutesText({ ...m, tandatanganDigital: updatedSigs })
        };
      }
      return m;
    });

    setMesyuaratList(updatedMeetings);

    if (sigToDelete) {
      onAddLog?.({
        id: `LOG-${Date.now()}`,
        tarikhMasa: new Date().toISOString().replace('T', ' ').slice(0, 19),
        kategori: 'MESYUARAT',
        tindakan: 'Batal Tandatangan Digital',
        deskripsi: `Tandatangan digital oleh ${sigToDelete.namaSigner} (${sigToDelete.jawatan}) dipadam daripada Minit ${currentMeeting.tajuk}.`,
        pengguna: 'Urus Setia',
        status: 'AMARAN'
      });
    }
  };

  // Batch generate standard SKM 6 Penentusah Minit AGM
  const handleAutoGenerateAGMSignatures = () => {
    if (!currentMeeting) return;
    const nowStamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const standardPenentusahList = [
      { name: currentMeeting.pengerusi || 'Dato\' Ahmad Razali Bin Othman', role: 'Pengerusi Mesyuarat / ALK', noAhli: 'KOP-2021-001' },
      { name: currentMeeting.pencatatMinit || 'Siti Nurhaliza Bt Mohd Safian', role: 'Setiausaha ALK', noAhli: 'KOP-2021-002' },
      { name: 'Kamal Bin Ariffin', role: 'Penentusah Minit #1 (Ahli Lantikan AGM)', noAhli: 'KOP-2022-014' },
      { name: 'Zarina Bt Wan Sulaiman', role: 'Penentusah Minit #2 (Ahli Lantikan AGM)', noAhli: 'KOP-2022-018' },
      { name: 'Rahim Bin Ismail', role: 'Penentusah Minit #3 (Ahli Lantikan AGM)', noAhli: 'KOP-2023-033' },
      { name: 'Faridah Bt Abdullah', role: 'Penentusah Minit #4 (Ahli Lantikan AGM)', noAhli: 'KOP-2023-045' },
      { name: 'Mohd Amir Bin Yusof', role: 'Penentusah Minit #5 (Ahli Lantikan AGM)', noAhli: 'KOP-2024-052' },
      { name: 'Hjh Aminah Bt Kasim', role: 'Penentusah Minit #6 (Ahli Lantikan AGM)', noAhli: 'KOP-2024-060' }
    ];

    const generatedSigs: TandatanganDigital[] = standardPenentusahList.map((p, idx) => {
      const randomHash = `SHA256: ${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-VERTTERE-AGM-${idx + 1}`;
      return {
        id: `SIG-AUTO-${Date.now()}-${idx}`,
        namaSigner: p.name,
        jawatan: p.role,
        noKpOrAhli: p.noAhli,
        tarikhTandatangan: nowStamp,
        signatureType: 'TYPED_DIGITAL',
        status: 'DISAHKAN',
        catatan: `Penentusah Minit Mesyuarat Agung Tahunan disahkan mengikut Akta Koperasi 1993 & UUK Fasal Penentusah.`,
        hashAuditan: randomHash,
        ipAlamat: '192.168.1.100'
      };
    });

    const updatedMeetings = mesyuaratList.map(m => {
      if (m.id === currentMeeting.id) {
        return {
          ...m,
          tandatanganDigital: generatedSigs,
          minitMesyuaratText: generateOfficialMinutesText({ ...m, tandatanganDigital: generatedSigs })
        };
      }
      return m;
    });

    setMesyuaratList(updatedMeetings);

    // Auto Log to Activity Log
    standardPenentusahList.forEach((p, idx) => {
      onAddLog?.({
        id: `LOG-AUTO-${Date.now()}-${idx}`,
        tarikhMasa: nowStamp,
        kategori: 'MESYUARAT',
        tindakan: 'Pengesahan Penentusah Minit AGM',
        deskripsi: `${p.name} (${p.role}, ID: ${p.noAhli}) mengesahkan Minit Mesyuarat "${currentMeeting.tajuk}". [Garis Panduan SKM & Akta Koperasi 1993]`,
        pengguna: p.name,
        namaAhli: p.name,
        status: 'BERJAYA',
        ipAlamat: '192.168.1.100'
      });
    });
  };

  // E-Voting Handlers
  const handleCastVote = () => {
    if (!currentMeeting || !activeMotion) {
      setVotingFeedback({ type: 'ERROR', message: 'Sila pilih usul yang sah untuk mengundi.' });
      return;
    }

    const selectedMember = ahliList.find(a => a.id === selectedMemberIdToVote);
    if (!selectedMember) {
      setVotingFeedback({ type: 'ERROR', message: 'Sila pilih ahli yang sah dari senarai untuk mengundi.' });
      return;
    }

    const votedIds = activeMotion.votedMemberIds || [];
    if (votedIds.includes(selectedMember.id)) {
      setVotingFeedback({
        type: 'ERROR',
        message: `Ahli ${selectedMember.nama} (${selectedMember.noAhli}) telah pun mendaftar undian untuk usul ini.`
      });
      return;
    }

    const currentSetuju = activeMotion.undiSetuju || 0;
    const currentBantah = activeMotion.undiBantah || 0;
    const currentKecuali = activeMotion.undiKecuali || 0;

    let newSetuju = currentSetuju;
    let newBantah = currentBantah;
    let newKecuali = currentKecuali;

    if (votingChoice === 'SETUJU') newSetuju += 1;
    if (votingChoice === 'BANTAH') newBantah += 1;
    if (votingChoice === 'BERKECUALI') newKecuali += 1;

    const newVotedIds = [...votedIds, selectedMember.id];

    const updatedMeetings = mesyuaratList.map(m => {
      if (m.id === currentMeeting.id) {
        return {
          ...m,
          resolusi: m.resolusi.map(res => {
            if (res.id === activeMotion.id) {
              return {
                ...res,
                undiSetuju: newSetuju,
                undiBantah: newBantah,
                undiKecuali: newKecuali,
                votedMemberIds: newVotedIds,
                eVotingStatus: res.eVotingStatus || 'OPEN'
              };
            }
            return res;
          })
        };
      }
      return m;
    });

    setMesyuaratList(updatedMeetings);

    // Auto-Log to ActivityLog
    onAddLog?.({
      id: `LOG-${Date.now()}`,
      tarikhMasa: new Date().toISOString().replace('T', ' ').slice(0, 19),
      kategori: 'MESYUARAT',
      tindakan: 'Undian E-Voting Diterima',
      deskripsi: `Ahli ${selectedMember.nama} (${selectedMember.noAhli}) membuat undian [${votingChoice}] untuk Usul: "${activeMotion.tajuk}" dalam ${currentMeeting.tajuk}.`,
      pengguna: selectedMember.nama,
      noAhli: selectedMember.noAhli,
      namaAhli: selectedMember.nama,
      status: 'INFO',
      ipAlamat: '127.0.0.1'
    });

    setVotingFeedback({
      type: 'SUCCESS',
      message: `Undian [${votingChoice}] oleh ${selectedMember.nama} (${selectedMember.noAhli}) berjaya direkodkan & dicatat dalam Log Aktiviti!`
    });

    setTimeout(() => setVotingFeedback(null), 4000);
  };

  const handleOpenCloseEVoting = (newStatus: 'OPEN' | 'CLOSED' | 'DRAFT') => {
    if (!currentMeeting || !activeMotion) return;

    const currentSetuju = activeMotion.undiSetuju || 0;
    const currentBantah = activeMotion.undiBantah || 0;
    const currentKecuali = activeMotion.undiKecuali || 0;
    const totalVotes = currentSetuju + currentBantah + currentKecuali;

    let calculatedDecision = activeMotion.keputusan;
    if (newStatus === 'CLOSED') {
      if (totalVotes > 0 && currentSetuju === totalVotes) {
        calculatedDecision = 'SEBULAT_SUARA';
      } else if (currentSetuju > currentBantah) {
        calculatedDecision = 'LULUS_MAJORITI';
      } else {
        calculatedDecision = 'DITOLAK';
      }
    }

    const updatedMeetings = mesyuaratList.map(m => {
      if (m.id === currentMeeting.id) {
        return {
          ...m,
          resolusi: m.resolusi.map(res => {
            if (res.id === activeMotion.id) {
              return {
                ...res,
                eVotingStatus: newStatus,
                keputusan: calculatedDecision
              };
            }
            return res;
          })
        };
      }
      return m;
    });

    setMesyuaratList(updatedMeetings);

    if (newStatus === 'CLOSED') {
      onAddLog?.({
        id: `LOG-${Date.now()}`,
        tarikhMasa: new Date().toISOString().replace('T', ' ').slice(0, 19),
        kategori: 'MESYUARAT',
        tindakan: 'Penutupan E-Voting & Tabulasi',
        deskripsi: `Pusat E-Voting ditutup bagi Usul "${activeMotion.tajuk}" (${currentMeeting.tajuk}). Keputusan Rasmi: ${calculatedDecision.replace('_', ' ')} (${currentSetuju} Setuju, ${currentBantah} Bantah, ${currentKecuali} Berkecuali).`,
        pengguna: 'Urus Setia Mesyuarat SKM',
        status: 'BERJAYA',
        ipAlamat: '127.0.0.1'
      });
      setVotingFeedback({
        type: 'SUCCESS',
        message: `Pusat undian ditutup secara rasmi. Keputusan: ${calculatedDecision.replace('_', ' ')} telah dikemas kini!`
      });
    } else if (newStatus === 'OPEN') {
      onAddLog?.({
        id: `LOG-${Date.now()}`,
        tarikhMasa: new Date().toISOString().replace('T', ' ').slice(0, 19),
        kategori: 'MESYUARAT',
        tindakan: 'Sesi E-Voting Dibuka',
        deskripsi: `Sesi e-voting dibuka bagi Usul "${activeMotion.tajuk}" dalam ${currentMeeting.tajuk}.`,
        pengguna: 'Urus Setia Mesyuarat',
        status: 'INFO',
        ipAlamat: '127.0.0.1'
      });
      setVotingFeedback({ type: 'SUCCESS', message: 'Sesi E-Voting kini DIBUKA untuk undian ahli secara langsung!' });
    }

    setTimeout(() => setVotingFeedback(null), 4000);
  };

  const handleSimulateBulkVoting = () => {
    if (!currentMeeting || !activeMotion) return;

    const votedIds = activeMotion.votedMemberIds || [];
    const unvotedMembers = ahliList.filter(a => a.status === 'AKTIF' && !votedIds.includes(a.id));

    if (unvotedMembers.length === 0) {
      setVotingFeedback({ type: 'ERROR', message: 'Semua ahli aktif telah pun mendaftar undi bagi usul ini.' });
      return;
    }

    const membersToSimulate = unvotedMembers.slice(0, 5);
    let addSetuju = 0;
    let addBantah = 0;
    let addKecuali = 0;
    const newVotedIds = [...votedIds];

    membersToSimulate.forEach((member, index) => {
      newVotedIds.push(member.id);
      let choice: 'SETUJU' | 'BANTAH' | 'BERKECUALI' = 'SETUJU';
      if (index === 3) choice = 'BANTAH';
      else if (index === 4) choice = 'BERKECUALI';

      if (choice === 'SETUJU') addSetuju++;
      else if (choice === 'BANTAH') addBantah++;
      else addKecuali++;

      onAddLog?.({
        id: `LOG-${Date.now()}-${index}`,
        tarikhMasa: new Date().toISOString().replace('T', ' ').slice(0, 19),
        kategori: 'MESYUARAT',
        tindakan: 'Undian E-Voting (Simulasi)',
        deskripsi: `Ahli ${member.nama} (${member.noAhli}) menghantar undi [${choice}] bagi Usul: "${activeMotion.tajuk}".`,
        pengguna: member.nama,
        noAhli: member.noAhli,
        namaAhli: member.nama,
        status: 'INFO',
        ipAlamat: '127.0.0.1'
      });
    });

    const currentSetuju = activeMotion.undiSetuju || 0;
    const currentBantah = activeMotion.undiBantah || 0;
    const currentKecuali = activeMotion.undiKecuali || 0;

    const updatedMeetings = mesyuaratList.map(m => {
      if (m.id === currentMeeting.id) {
        return {
          ...m,
          resolusi: m.resolusi.map(res => {
            if (res.id === activeMotion.id) {
              return {
                ...res,
                undiSetuju: currentSetuju + addSetuju,
                undiBantah: currentBantah + addBantah,
                undiKecuali: currentKecuali + addKecuali,
                votedMemberIds: newVotedIds,
                eVotingStatus: res.eVotingStatus || 'OPEN'
              };
            }
            return res;
          })
        };
      }
      return m;
    });

    setMesyuaratList(updatedMeetings);
    setVotingFeedback({
      type: 'SUCCESS',
      message: `Berjaya memasukkan undian simulasi bagi ${membersToSimulate.length} ahli & dicatat dalam Log Aktiviti!`
    });
    setTimeout(() => setVotingFeedback(null), 4000);
  };

  // Helper for Quorum Rule based on SKM & Akta Koperasi 1993
  const calculateQuorumRule = (jenis: JenisMesyuarat, totalEligible: number) => {
    switch (jenis) {
      case 'AGM':
      case 'EGM':
        // SKM Rule: 1/3 of total eligible members or minimum 50 (whichever is lower, or based on bylaws)
        return Math.min(Math.ceil(totalEligible / 3), 50);
      case 'ALK':
        // SKM Rule: Majority (> 50%) of ALK members
        return Math.floor(totalEligible / 2) + 1;
      case 'JAD':
        // SKM Rule: Min 2 of 3 JAD members
        return Math.min(2, totalEligible);
      case 'JK_KHAS':
        return Math.floor(totalEligible / 2) + 1;
      default:
        return Math.ceil(totalEligible / 3);
    }
  };

  const getQuorumRuleDescription = (jenis: JenisMesyuarat) => {
    switch (jenis) {
      case 'AGM':
        return 'Akta Koperasi 1993 Seksyen 39: Minimum 1/3 daripada jumlah ahli berhak mengundi (atau min 50 ahli).';
      case 'EGM':
        return 'Akta Koperasi 1993 Seksyen 39: Minimum 1/3 daripada jumlah ahli berhak mengundi. Perlu Notis 14 hari.';
      case 'ALK':
        return 'Akta Koperasi 1993 Seksyen 44: Melebihi 50% (Majoriti) kehadiran Ahli Lembaga Koperasi.';
      case 'JAD':
        return 'Akta Koperasi 1993 Seksyen 47: Minimum 2 orang Jawatankuasa Audit Dalaman.';
      case 'JK_KHAS':
        return 'Garis Panduan SKM: Majoriti keanggotaan Jawatankuasa Khas yang dilantik ALK.';
    }
  };

  const getJenisLabel = (jenis: JenisMesyuarat) => {
    switch (jenis) {
      case 'AGM': return 'Mesyuarat Agung Tahunan (AGM)';
      case 'EGM': return 'Mesyuarat Agung Luar Biasa (EGM)';
      case 'ALK': return 'Mesyuarat Ahli Lembaga (ALK)';
      case 'JAD': return 'Audit Dalaman (JAD)';
      case 'JK_KHAS': return 'Jawatankuasa Khas';
    }
  };

  const getJenisBadgeColor = (jenis: JenisMesyuarat) => {
    switch (jenis) {
      case 'AGM': return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'EGM': return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'ALK': return 'bg-indigo-950 text-indigo-300 border-indigo-800';
      case 'JAD': return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'JK_KHAS': return 'bg-amber-950 text-amber-300 border-amber-800';
    }
  };

  // Filter meetings
  const filteredMeetings = mesyuaratList.filter(m => {
    const matchCat = selectedCategory === 'ALL' || m.jenis === selectedCategory;
    const matchStatus = selectedStatusFilter === 'ALL' || m.status === selectedStatusFilter;
    const matchQuery = m.tajuk.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      m.bilangan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchStatus && matchQuery;
  });

  // Dynamic Update Attendance in Current Meeting
  const handleUpdateAttendanceCount = (newCount: number) => {
    if (!currentMeeting) return;
    const reqQuorum = calculateQuorumRule(currentMeeting.jenis, currentMeeting.jumlahAhliBerhak);
    const isSah = newCount >= reqQuorum;

    const updated = mesyuaratList.map(m => {
      if (m.id === currentMeeting.id) {
        return {
          ...m,
          kehadiranHadir: newCount,
          korumMinimaDiperlukan: reqQuorum,
          korumSah: isSah,
        };
      }
      return m;
    });

    setMesyuaratList(updated);
  };

  // Add Agenda Item
  const [newAgendaTitle, setNewAgendaTitle] = useState('');
  const [newAgendaPresenter, setNewAgendaPresenter] = useState('');

  const handleAddAgenda = () => {
    if (!newAgendaTitle.trim() || !currentMeeting) return;
    const newAg: AgendaItem = {
      id: `AG-${Date.now()}`,
      no: currentMeeting.agenda.length + 1,
      tajuk: newAgendaTitle,
      pembawa: newAgendaPresenter || 'Pengerusi',
      keputusan: 'Dalam Perbincangan',
    };

    const updated = mesyuaratList.map(m => {
      if (m.id === currentMeeting.id) {
        return {
          ...m,
          agenda: [...m.agenda, newAg],
        };
      }
      return m;
    });

    setMesyuaratList(updated);
    setNewAgendaTitle('');
    setNewAgendaPresenter('');
  };

  // Add Resolution Item
  const [newResTitle, setNewResTitle] = useState('');
  const [newResProposer, setNewResProposer] = useState('');
  const [newResSeconder, setNewResSeconder] = useState('');
  const [newResDecision, setNewResDecision] = useState<'SEBULAT_SUARA' | 'LULUS_MAJORITI' | 'DITOLAK'>('SEBULAT_SUARA');

  const handleAddResolution = () => {
    if (!newResTitle.trim() || !currentMeeting) return;
    const newRes: UsulResolusi = {
      id: `RES-${Date.now()}`,
      tajuk: newResTitle,
      pencadang: newResProposer || 'Ahli Koperasi',
      penyokong: newResSeconder || 'Ahli Koperasi',
      keputusan: newResDecision,
      undiSetuju: currentMeeting.kehadiranHadir,
      undiBantah: 0,
    };

    const updated = mesyuaratList.map(m => {
      if (m.id === currentMeeting.id) {
        return {
          ...m,
          resolusi: [...m.resolusi, newRes],
        };
      }
      return m;
    });

    setMesyuaratList(updated);
    setNewResTitle('');
    setNewResProposer('');
    setNewResSeconder('');
  };

  // Automated Minit Mesyuarat Generator
  const generateOfficialMinutesText = (m: Mesyuarat) => {
    const isQuorumOk = m.kehadiranHadir >= m.korumMinimaDiperlukan;
    const signaturesList = m.tandatanganDigital || [];
    
    return `MINIT ${getJenisLabel(m.jenis).toUpperCase()} (${m.bilangan.toUpperCase()})
KOPERASI BERHAD MALAYSIA

========================================================================
1. BUTIRAN MESYUARAT
========================================================================
Tajuk Mesyuarat : ${m.tajuk}
Jenis Mesyuarat : ${getJenisLabel(m.jenis)}
Tarikh          : ${m.tarikh}
Masa            : ${m.masa}
Tempat          : ${m.tempat}
Pengerusi       : ${m.pengerusi}
Pencatat Minit  : ${m.pencatatMinit}

========================================================================
2. PENGESAHAN KORUM & KEHADIRAN (AKTA KOPERASI 1993)
========================================================================
Jumlah Ahli Berhak Mengundi : ${m.jumlahAhliBerhak} Orang
Jumlah Kehadiran Ahli       : ${m.kehadiranHadir} Orang
Korum Minima Diperlukan     : ${m.korumMinimaDiperlukan} Orang
Status Korum SKM            : ${isQuorumOk ? 'SAH & MEMATUHI UNDANG-UNDANG' : 'TIDAK CUKUP KORUM (DEFISIT)'}
Ulasan Pematuhan            : ${m.notaPematuhanSKM || getQuorumRuleDescription(m.jenis)}

========================================================================
3. AGENDA MESYUARAT
========================================================================
${m.agenda.length > 0 ? m.agenda.map((ag) => `${ag.no}. ${ag.tajuk}
   Pembawa  : ${ag.pembawa || 'Pengerusi'}
   Keputusan: ${ag.keputusan || 'Diluluskan'}
`).join('\n') : 'Tiada agenda direkodkan.'}

========================================================================
4. RESOLUSI & KEPUTUSAN USUL MESYUARAT
========================================================================
${m.resolusi.length > 0 ? m.resolusi.map((res, idx) => `Usul ${idx + 1}: ${res.tajuk}
   Pencadang : ${res.pencadang}
   Penyokong : ${res.penyokong}
   Keputusan : ${res.keputusan.replace('_', ' ')} (${res.undiSetuju || m.kehadiranHadir} Setuju / ${res.undiBantah || 0} Bantah)
   Nota SKM  : ${res.notaSKM || 'Pematuhan Garis Panduan SKM disahkan.'}
`).join('\n') : 'Tiada resolusi khusus yang didaftarkan.'}

========================================================================
5. SENARAI PENENTUSAH MINIT MESYUARAT (LANTIKAN AHLI / ALK)
========================================================================
${(m.penentusahMinit && m.penentusahMinit.length > 0) 
  ? m.penentusahMinit.map((p, idx) => `[Penentusah Minit #${idx + 1}] : ${p}`).join('\n')
  : `1. ${m.pengerusi} (Pengerusi Mesyuarat / ALK)\n2. ${m.pencatatMinit} (Pencatat Minit / Setiausaha ALK)`}

========================================================================
6. PENANGGUHAN MESYUARAT
========================================================================
Mesyuarat ditangguhkan pada jam 12:30 tengah hari dengan ucapan penghargaan daripada Pengerusi.

========================================================================
7. REKOD TANDATANGAN DIGITAL & AUDIT TRAIL (AKTA KOPERASI 1993)
========================================================================
${signaturesList.length > 0 ? signaturesList.map((sig, idx) => `[TANDATANGAN DIGITAL #${idx + 1}]
Nama Penandatangan : ${sig.namaSigner}
Jawatan            : ${sig.jawatan} (${sig.noKpOrAhli || 'ALK'})
Status Pengesahan  : ${sig.status} (${sig.signatureType === 'DRAWN' ? 'Tandatangan Melukis Canvas' : 'Tandatangan Taip Digital'})
Tarikh & Masa      : ${sig.tarikhTandatangan}
Hash Auditan SKM   : ${sig.hashAuditan}
Catatan            : ${sig.catatan || 'Minit mesyuarat disahkan secara digital.'}
`).join('\n------------------------------------------------------------------------\n') : `Disediakan Oleh:                             Disahkan Oleh:


______________________________               ______________________________
(${m.pencatatMinit})                          (${m.pengerusi})
Pencatat Minit / Setiausaha ALK               Pengerusi Mesyuarat / ALK
Tarikh: ${m.tarikh}                            Tarikh: ${m.tarikh}`}

------------------------------------------------------------------------
Hak Cipta Software © 2026 Verttere Solutions (IP0430882-T) - Enjin Pengesahan Digital SPPKM
========================================================================`;
  };

  const handleCopyMinutes = () => {
    if (!currentMeeting) return;
    const text = currentMeeting.minitMesyuaratText || generateOfficialMinutesText(currentMeeting);
    navigator.clipboard.writeText(text);
    setCopiedMinutes(true);
    setTimeout(() => setCopiedMinutes(false), 3000);
  };

  const handleGenerateAIMinutes = () => {
    if (!currentMeeting) return;
    setIsGeneratingAI(true);
    setTimeout(() => {
      const generated = generateOfficialMinutesText(currentMeeting);
      const updated = mesyuaratList.map(m => {
        if (m.id === currentMeeting.id) {
          return {
            ...m,
            minitMesyuaratText: generated,
            status: 'SELESAI' as StatusMesyuarat,
          };
        }
        return m;
      });
      setMesyuaratList(updated);
      setIsGeneratingAI(false);
    }, 1000);
  };

  // Submit New Meeting
  const handleCreateNewMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    const reqQuorum = calculateQuorumRule(newJenis, 50);

    const newMsy: Mesyuarat = {
      id: `MSY-${Date.now()}`,
      bilangan: newBilangan,
      jenis: newJenis,
      tajuk: newTajuk,
      tarikh: newTarikh,
      masa: newMasa,
      tempat: newTempat,
      pengerusi: newPengerusi,
      pencatatMinit: newPencatat,
      status: 'DIJADUALKAN',
      jumlahAhliBerhak: newJenis === 'ALK' ? 6 : newJenis === 'JAD' ? 3 : 50,
      kehadiranHadir: 0,
      kehadiranBersebab: 0,
      korumMinimaDiperlukan: reqQuorum,
      korumSah: false,
      notaPematuhanSKM: getQuorumRuleDescription(newJenis),
      agenda: [
        { no: 1, id: 'AG-N1', tajuk: 'Ucapan Aluan Pengerusi', pembawa: newPengerusi },
        { no: 2, id: 'AG-N2', tajuk: 'Pengesahan Minit Mesyuarat Lalu', pembawa: newPencatat },
      ],
      resolusi: [],
      kehadiranSenarai: [],
    };

    setMesyuaratList([newMsy, ...mesyuaratList]);
    setSelectedMeetingId(newMsy.id);
    setShowNewMeetingModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Pematuhan Akta Koperasi 1993 (Seksyen 39-47)
            </span>
            <span className="text-xs text-slate-400">Modul Tadbir Urus SKM</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" /> Pengurusan Mesyuarat & Minit Koperasi Malaysia
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Menguruskan Mesyuarat Agung Tahunan (AGM), Mesyuarat ALK, Audit Dalaman (JAD), Jawatankuasa Khas, dan EGM lengkap dengan pengiraan korum automatik & penjana minit mesyuarat.
          </p>
        </div>

        <button
          onClick={() => setShowNewMeetingModal(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Daftar / Jadual Mesyuarat Baru
        </button>
      </div>

      {/* 5 Quick Category Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { key: 'AGM', label: 'AGM Tahunan', count: mesyuaratList.filter(m => m.jenis === 'AGM').length, icon: Building },
          { key: 'ALK', label: 'Mesyuarat ALK', count: mesyuaratList.filter(m => m.jenis === 'ALK').length, icon: Users },
          { key: 'JAD', label: 'Audit Dalaman (JAD)', count: mesyuaratList.filter(m => m.jenis === 'JAD').length, icon: ShieldCheck },
          { key: 'JK_KHAS', label: 'Jawatankuasa Khas', count: mesyuaratList.filter(m => m.jenis === 'JK_KHAS').length, icon: BookOpen },
          { key: 'EGM', label: 'Mesyuarat EGM', count: mesyuaratList.filter(m => m.jenis === 'EGM').length, icon: AlertTriangle },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = selectedCategory === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setSelectedCategory(selectedCategory === item.key ? 'ALL' : item.key)}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isActive 
                  ? 'bg-indigo-950 border-indigo-500 text-white ring-2 ring-indigo-500/30' 
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                  {item.count}
                </span>
              </div>
              <div className="mt-2 text-xs font-bold">{item.label}</div>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari mengikut tajuk mesyuarat, rujukan, atau bilangan..."
            className="w-full bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 pl-9 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-indigo-400" /> Status:
          </span>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="DIJADUALKAN">Dijadualkan</option>
            <option value="SELESAI">Selesai (Minit Ada)</option>
            <option value="DRAF">Draf</option>
          </select>
        </div>
      </div>

      {/* Main 2-Column Split View: Left Meeting List, Right Detailed Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (4 cols): Meetings List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Senarai Mesyuarat ({filteredMeetings.length})
          </h3>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {filteredMeetings.length > 0 ? (
              filteredMeetings.map((m) => {
                const isSelected = m.id === selectedMeetingId;
                const reqQuorum = calculateQuorumRule(m.jenis, m.jumlahAhliBerhak);
                const isQuorumMet = m.kehadiranHadir >= reqQuorum;

                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMeetingId(m.id)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all space-y-2.5 ${
                      isSelected
                        ? 'bg-slate-800/90 border-indigo-500 shadow-xl ring-1 ring-indigo-500/50'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getJenisBadgeColor(m.jenis)}`}>
                        {m.jenis}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        m.status === 'SELESAI' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        'bg-blue-950 text-blue-400 border border-blue-800'
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                        {m.tajuk}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 font-mono">
                        {m.bilangan}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                      <div className="flex items-center gap-1.5 truncate">
                        <Calendar className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span className="truncate">{m.tarikh}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Clock className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span className="truncate">{m.masa}</span>
                      </div>
                    </div>

                    {/* Quorum status indicator badge */}
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-400">Status Korum:</span>
                      <span className={`font-bold flex items-center gap-1 ${isQuorumMet ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {isQuorumMet ? (
                          <> <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sah ({m.kehadiranHadir}/{reqQuorum})</>
                        ) : (
                          <> <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Defisit ({m.kehadiranHadir}/{reqQuorum})</>
                        )}
                      </span>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
                Tiada mesyuarat ditemui mengikut tapisan.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (8 cols): Selected Meeting Comprehensive Workspace */}
        {currentMeeting ? (
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header Details Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getJenisBadgeColor(currentMeeting.jenis)}`}>
                      {getJenisLabel(currentMeeting.jenis)}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{currentMeeting.bilangan}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    {currentMeeting.tajuk}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={handleOpenCloseMeetingModal}
                    className={`px-4 py-2 text-xs font-extrabold rounded-xl shadow-lg flex items-center gap-2 transition-all ${
                      currentMeeting.status === 'SELESAI'
                        ? 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-700'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
                    }`}
                  >
                    {currentMeeting.status === 'SELESAI' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Mesyuarat Selesai (Kemaskini Penentusah)
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" /> Tutup Mesyuarat & Assign Penentusah Minit
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCopyMinutes}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    {copiedMinutes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedMinutes ? 'Minit Disalin!' : 'Salin Minit'}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" /> Cetak Minit
                  </button>
                </div>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Tarikh & Masa</span>
                  <span className="font-bold text-white mt-0.5 block">{currentMeeting.tarikh} ({currentMeeting.masa})</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Tempat / Lokasi</span>
                  <span className="font-bold text-white mt-0.5 block truncate">{currentMeeting.tempat}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Pengerusi Mesyuarat</span>
                  <span className="font-bold text-white mt-0.5 block truncate">{currentMeeting.pengerusi}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Pencatat Minit</span>
                  <span className="font-bold text-white mt-0.5 block truncate">{currentMeeting.pencatatMinit}</span>
                </div>
              </div>

              {/* STATUTORY ASSIGNED PENENTUSAH MINIT DISPLAY CARD */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-extrabold text-white uppercase tracking-wide">
                      Senarai Penentusah Minit Lantikan ({currentMeeting.penentusahMinit?.length || 2} Orang)
                    </span>
                    <span className="bg-emerald-950 border border-emerald-800 text-emerald-300 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
                      AKTA KOPERASI 1993
                    </span>
                  </div>

                  <button
                    onClick={handleOpenCloseMeetingModal}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    <FileEdit className="w-3.5 h-3.5" /> Tetapkan / Kemaskini Penentusah
                  </button>
                </div>

                {currentMeeting.penentusahMinit && currentMeeting.penentusahMinit.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {currentMeeting.penentusahMinit.map((pName, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-all"
                      >
                        <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-mono font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-white block text-[11px] line-clamp-1">{pName}</span>
                          <span className="text-[9px] text-slate-400 font-mono block">
                            {idx === 0 ? 'Pengerusi ALK' : idx === 1 ? 'Setiausaha ALK' : `Penentusah Lantikan #${idx - 1}`}
                          </span>
                        </div>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs text-slate-400 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                    <span>Penentusah minit rasmi belum ditetapkan. Klik butang "Assign Penentusah Minit" untuk melantik sekurang-kurangnya 2-6 orang penentusah mengikut UUK Koperasi.</span>
                    <button
                      onClick={handleOpenCloseMeetingModal}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs not-italic shrink-0 ml-2"
                    >
                      Pilih Sekarang
                    </button>
                  </div>
                )}
              </div>

              {/* DIGITAL QR CODE ATTENDANCE MODULE (MODUL PENDAFTARAN KEHADIRAN KOD QR) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                
                {/* Module Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                      </span>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-indigo-400" /> Modul Pendaftaran Kehadiran Kod QR Mesyuarat
                      </h3>
                      <span className="bg-indigo-950 border border-indigo-800 text-indigo-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                        PENDAFTARAN DIGITAL MASA-NYATA
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Jana Kod QR unik untuk mesyuarat ini. Ahli boleh mengimbas Kod QR menggunakan telefon pintar untuk pendaftaran kehadiran automatik.
                    </p>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => setShowQrModal(true)}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
                      title="Paparkan Kod QR bersaiz besar untuk Skrin Dewan / Projektor"
                    >
                      <Maximize2 className="w-4 h-4" /> Papar Skrin Projektor
                    </button>

                    <button
                      onClick={() => setShowQrScanModal(true)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
                      title="Simulasi pendaftaran imbasan Kod QR oleh Ahli"
                    >
                      <Scan className="w-4 h-4" /> Imbas / Sah Kehadiran QR
                    </button>

                    <button
                      onClick={handleDownloadQrCode}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                      title="Muat turun imej PNG Kod QR"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" /> Muat Turun QR
                    </button>
                  </div>
                </div>

                {/* Feedback Toast */}
                {qrScanFeedback && (
                  <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 font-semibold ${
                    qrScanFeedback.type === 'SUCCESS' ? 'bg-emerald-950/90 border-emerald-700 text-emerald-200' : 'bg-rose-950/90 border-rose-700 text-rose-200'
                  }`}>
                    {qrScanFeedback.type === 'SUCCESS' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    <span>{qrScanFeedback.message}</span>
                  </div>
                )}

                {/* Card Content Grid: QR Display Box vs Live QR Attendance Stats */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Left Column (5 cols): Visual QR Display Frame */}
                  <div className="md:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden group">
                    
                    <span className="text-[10px] font-extrabold text-indigo-300 font-mono uppercase bg-indigo-950 border border-indigo-800 px-3 py-1 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-indigo-400" /> TOKEN KOD QR SAH
                    </span>

                    {/* QR Code Container */}
                    <div className="p-3 bg-white rounded-2xl shadow-2xl border-4 border-indigo-500/30 group-hover:border-indigo-500 transition-all">
                      {qrCodeDataUrl ? (
                        <img src={qrCodeDataUrl} alt={`Kod QR Kehadiran ${currentMeeting.tajuk}`} className="w-44 h-44 object-contain rounded-lg" />
                      ) : (
                        <div className="w-44 h-44 bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-mono">
                          Memuatkan Kod QR...
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white line-clamp-1">{currentMeeting.tajuk}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{currentMeeting.bilangan} • {currentMeeting.tarikh}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-1 w-full">
                      <button
                        onClick={handleCopyQrLink}
                        className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-indigo-300 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        {copiedQrLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedQrLink ? 'Pautan Disalin!' : 'Salin Pautan Digital'}
                      </button>
                    </div>
                  </div>

                  {/* Right Column (7 cols): QR Check-In Statistics & Live Scanned Attendees */}
                  <div className="md:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                    
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-emerald-400" /> Rekod Imbasan QR & Pendaftaran Digital
                        </h4>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800">
                          {currentMeeting.kehadiranSenarai?.filter(k => k.tarikhDaftarMasa?.includes('Kod QR')).length || 0} Terdaftar via QR
                        </span>
                      </div>

                      {/* 2 Quick Summary Stat Badges */}
                      <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                          <span className="text-[10px] text-slate-400 block font-semibold">Nisbah Imbasan QR vs Total</span>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-lg font-extrabold text-white font-mono">
                              {currentMeeting.kehadiranSenarai?.filter(k => k.tarikhDaftarMasa?.includes('Kod QR')).length || 0}
                            </span>
                            <span className="text-slate-400 text-[11px]">/ {currentMeeting.kehadiranHadir} Hadir</span>
                          </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                          <span className="text-[10px] text-slate-400 block font-semibold">Kaedah Pendaftaran</span>
                          <span className="text-xs font-bold text-emerald-400 block mt-1">
                            ✓ Kod QR & Self Check-in
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* List of Recent QR Scanned Attendees */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-300 block">
                        Senarai Ahli Terkini Mendaftar Melalui Imbasan QR:
                      </span>

                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 max-h-40 overflow-y-auto space-y-1.5">
                        {currentMeeting.kehadiranSenarai && currentMeeting.kehadiranSenarai.length > 0 ? (
                          currentMeeting.kehadiranSenarai.map((record, idx) => (
                            <div key={record.id || idx} className="p-2 bg-slate-950 rounded-lg border border-slate-800/80 text-xs flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <div>
                                  <span className="font-bold text-white block text-[11px]">{record.nama}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">No. Ahli: {record.noAhli || '-'} • {record.jawatan}</span>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] px-2 py-0.5 rounded font-bold block">
                                  {record.tarikhDaftarMasa?.includes('Kod QR') ? '✓ QR Sah' : 'Daftar Manual'}
                                </span>
                                <span className="text-[9px] text-slate-500 font-mono block mt-0.5">
                                  {record.tarikhDaftarMasa || 'Masa Tidak Tercatat'}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-slate-500 text-xs italic">
                            Belum ada pendaftaran ahli melalui imbasan Kod QR. Klik "Imbas / Sah Kehadiran QR" di atas untuk simulasi.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Trigger Scan Modal Button inside panel */}
                    <button
                      onClick={() => setShowQrScanModal(true)}
                      className="w-full py-2.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                      <Scan className="w-4 h-4 text-indigo-400" /> Buka Pengimbas QR & Pendaftaran Ahli
                    </button>

                  </div>

                </div>

              </div>

              {/* REAL-TIME QUORUM TRACKER STATUS BAR (PENJEJAK KORUM MASA-NYATA STATUTORI) */}
              {(() => {
                const reqQuorum = calculateQuorumRule(currentMeeting.jenis, currentMeeting.jumlahAhliBerhak);
                const currentHadir = currentMeeting.kehadiranHadir;
                const totalEligible = currentMeeting.jumlahAhliBerhak;

                const attendancePct = totalEligible > 0 ? ((currentHadir / totalEligible) * 100).toFixed(1) : '0';
                const reqQuorumPct = totalEligible > 0 ? ((reqQuorum / totalEligible) * 100).toFixed(1) : '0';
                const quorumAchievedPct = reqQuorum > 0 ? Math.min(100, Math.round((currentHadir / reqQuorum) * 100)) : 0;

                const isQuorumOk = currentHadir >= reqQuorum;
                const diffCount = currentHadir - reqQuorum;

                // Sync count with registered kehadiran entries if any
                const registeredCount = currentMeeting.senaraiKehadiran?.filter(k => k.status === 'HADIR').length || 0;

                return (
                  <div className="bg-slate-950 border border-emerald-900/60 p-5 rounded-2xl shadow-2xl space-y-4 relative overflow-hidden">
                    {/* Background Subtle Gradient Accents */}
                    <div className={`absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-20 ${
                      isQuorumOk ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} />

                    {/* Top Status Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3 relative z-10">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl border ${
                          isQuorumOk
                            ? 'bg-emerald-950 border-emerald-700/60 text-emerald-400'
                            : 'bg-amber-950 border-amber-700/60 text-amber-400'
                        }`}>
                          <Gauge className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-extrabold text-white tracking-wide uppercase">
                              Penjejak Korum Masa-Nyata (Real-Time Quorum Tracker)
                            </h4>
                            <span className="flex items-center gap-1 bg-emerald-950 border border-emerald-800 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                              LIVE TALLY
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Kiraan kehadiran statutori automatik mematuhi Akta Koperasi 1993 & Bylaws Koperasi.
                          </p>
                        </div>
                      </div>

                      {/* Quorum Verdict Badge */}
                      <div className="shrink-0">
                        <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-extrabold shadow-lg ${
                          isQuorumOk
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-700 shadow-emerald-950/50'
                            : 'bg-amber-950 text-amber-300 border-amber-700 shadow-amber-950/50'
                        }`}>
                          {isQuorumOk ? (
                            <> <CheckCircle2 className="w-4 h-4 text-emerald-400" /> KORUM DICAPAI & PROSIDING SAH </>
                          ) : (
                            <> <AlertTriangle className="w-4 h-4 text-amber-400" /> DEFISIT KORUM ({Math.abs(diffCount)} AHLI LAGI) </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* 4 Metrics Cards Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
                      
                      {/* Card 1: Attendance Present */}
                      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          Kehadiran Ahli Semasa
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-black text-white font-mono">{currentHadir}</span>
                          <span className="text-xs text-slate-400 font-medium">/ {totalEligible} orang</span>
                        </div>
                        <div className="text-[10px] font-bold text-indigo-400 font-mono">
                          {attendancePct}% Nisbah Kehadiran
                        </div>
                      </div>

                      {/* Card 2: Required Statutory Quorum */}
                      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          Syarat Korum Minima
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-black text-indigo-300 font-mono">{reqQuorum}</span>
                          <span className="text-xs text-slate-400 font-medium">orang</span>
                        </div>
                        <div className="text-[10px] font-bold text-indigo-400 font-mono">
                          {reqQuorumPct}% Syarat Statutori SKM
                        </div>
                      </div>

                      {/* Card 3: Percentage Quorum Achieved */}
                      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          Pencapaian Syarat Korum
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-2xl font-black font-mono ${isQuorumOk ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {quorumAchievedPct}%
                          </span>
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 font-mono">
                          {isQuorumOk ? '✓ Lulus 100% Korum' : `${quorumAchievedPct}% Daripada Minima`}
                        </div>
                      </div>

                      {/* Card 4: Lebihan / Defisit Count */}
                      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          Tally Lebihan / Defisit
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-2xl font-black font-mono ${diffCount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {diffCount >= 0 ? `+${diffCount}` : diffCount}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">orang</span>
                        </div>
                        <div className={`text-[10px] font-bold font-mono ${diffCount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {diffCount >= 0 ? 'Lebihan Korum' : 'Ahli Diperlukan Lagi'}
                        </div>
                      </div>

                    </div>

                    {/* VISUAL MULTI-LAYER GAUGE PROGRESS BAR */}
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2 relative z-10">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-emerald-400" />
                          Visual Kemajuan Kehadiran vs Korum
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          0% ─── <strong className="text-indigo-400">Min Korum ({reqQuorumPct}%)</strong> ─── Max ({totalEligible} Ahli)
                        </span>
                      </div>

                      {/* Progress Bar Container with Threshold Marker */}
                      <div className="relative h-6 w-full bg-slate-950 rounded-full border border-slate-800 overflow-hidden p-1 flex items-center">
                        {/* Attendance Filled Bar */}
                        <div
                          style={{ width: `${Math.min(100, Number(attendancePct))}%` }}
                          className={`h-full rounded-full transition-all duration-500 shadow-md ${
                            isQuorumOk
                              ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 shadow-emerald-500/40'
                              : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 shadow-amber-500/40'
                          }`}
                        />

                        {/* Statutory Threshold Marker Line */}
                        <div
                          style={{ left: `${reqQuorumPct}%` }}
                          className="absolute top-0 bottom-0 w-0.5 bg-indigo-400 z-20 shadow-[0_0_8px_rgba(129,140,248,1)]"
                          title={`Batas Korum Minima SKM: ${reqQuorum} Orang (${reqQuorumPct}%)`}
                        />
                      </div>

                      {/* Marker Labels Legend */}
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                        <span>0 Orang</span>
                        <span className="text-indigo-300 font-bold bg-indigo-950/80 border border-indigo-800 px-2 py-0.5 rounded">
                          ▲ Batas Korum: {reqQuorum} Ahli ({reqQuorumPct}%)
                        </span>
                        <span>{totalEligible} Orang (100%)</span>
                      </div>
                    </div>

                    {/* INTERACTIVE ATTENDANCE ADJUSTMENT TALLY & SYNC CONTROLS */}
                    <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs relative z-10">
                      
                      {/* Interactive Slider & Quick Tally Buttons */}
                      <div className="flex flex-wrap items-center gap-2 flex-1">
                        <span className="text-slate-300 font-bold text-[11px] shrink-0">Pelarasan Tally Kehadiran:</span>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleUpdateAttendanceCount(Math.max(0, currentHadir - 5))}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg border border-slate-700 transition-colors"
                            title="Tolak 5 Ahli"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => handleUpdateAttendanceCount(Math.max(0, currentHadir - 1))}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg border border-slate-700 transition-colors"
                            title="Tolak 1 Ahli"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => handleUpdateAttendanceCount(Math.min(totalEligible, currentHadir + 1))}
                            className="px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-[11px] font-bold rounded-lg border border-emerald-700 transition-colors"
                            title="Tambah 1 Ahli"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleUpdateAttendanceCount(Math.min(totalEligible, currentHadir + 5))}
                            className="px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-[11px] font-bold rounded-lg border border-emerald-700 transition-colors"
                            title="Tambah 5 Ahli"
                          >
                            +5
                          </button>
                        </div>

                        {/* Slider bar */}
                        <div className="flex-1 min-w-[120px] px-2">
                          <input
                            type="range"
                            min={0}
                            max={totalEligible}
                            value={currentHadir}
                            onChange={(e) => handleUpdateAttendanceCount(Number(e.target.value))}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Sync with Registered Checked-In List */}
                      {registeredCount > 0 && (
                        <button
                          onClick={() => handleUpdateAttendanceCount(registeredCount)}
                          className="px-3 py-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-200 text-[11px] font-bold rounded-lg flex items-center gap-1.5 shrink-0 transition-all shadow"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                          Kemaskini Dari Pendaftaran ({registeredCount} Hadir)
                        </button>
                      )}

                    </div>

                    {/* Statutory Citation Footnote */}
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2 relative z-10">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-200 font-bold block">
                          Rujukan Undang-Undang Kecil & Akta Koperasi 1993:
                        </strong>
                        <p className="mt-0.5 opacity-90 leading-relaxed">
                          {getQuorumRuleDescription(currentMeeting.jenis)} Ditentu ukur oleh Enjin Pengiraan Statutori SPPKM Verttere Solutions (IP0430882-T).
                        </p>
                      </div>
                    </div>

                  </div>
                );
              })()}

            </div>

            {/* Agenda & Resolutions Tabs / Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Agenda Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-indigo-400" /> Agenda Mesyuarat ({currentMeeting.agenda.length})
                  </h4>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 text-xs">
                  {currentMeeting.agenda.map((ag) => (
                    <div key={ag.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-white font-bold">
                        <span>{ag.no}. {ag.tajuk}</span>
                        <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                          {ag.keputusan || 'Diluluskan'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">Pembawa: {ag.pembawa || 'Pengerusi'}</p>
                    </div>
                  ))}
                </div>

                {/* Add Agenda Input */}
                <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
                  <input
                    type="text"
                    value={newAgendaTitle}
                    onChange={(e) => setNewAgendaTitle(e.target.value)}
                    placeholder="Tambah tajuk agenda baru..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-400"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAgendaPresenter}
                      onChange={(e) => setNewAgendaPresenter(e.target.value)}
                      placeholder="Pembawa Agenda (Contoh: Bendahari)"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-400"
                    />
                    <button
                      onClick={handleAddAgenda}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Tambah
                    </button>
                  </div>
                </div>
              </div>

              {/* Resolutions / Voting Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Vote className="w-4 h-4 text-emerald-400" /> Usul & Keputusan Undian ({currentMeeting.resolusi.length})
                  </h4>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 text-xs">
                  {currentMeeting.resolusi.length > 0 ? (
                    currentMeeting.resolusi.map((res) => (
                      <div key={res.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-white">
                          <span className="line-clamp-1">{res.tajuk}</span>
                          <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded font-mono">
                            {res.keputusan}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex justify-between">
                          <span>Dicadang: {res.pencadang}</span>
                          <span>Disokong: {res.penyokong}</span>
                        </div>
                        {res.notaSKM && (
                          <p className="text-[10px] text-emerald-400 bg-emerald-950/40 p-1 rounded border border-emerald-900">
                            ✓ {res.notaSKM}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic py-4 text-center">Tiada usul/resolusi khusus direkodkan.</p>
                  )}
                </div>

                {/* Add Resolution Input */}
                <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
                  <input
                    type="text"
                    value={newResTitle}
                    onChange={(e) => setNewResTitle(e.target.value)}
                    placeholder="Tajuk usul/resolusi baru (Contoh: Kelulusan Dividen 7.5%)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-400"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newResProposer}
                      onChange={(e) => setNewResProposer(e.target.value)}
                      placeholder="Pencadang Usul"
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-400"
                    />
                    <input
                      type="text"
                      value={newResSeconder}
                      onChange={(e) => setNewResSeconder(e.target.value)}
                      placeholder="Penyokong Usul"
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-400"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={newResDecision}
                      onChange={(e: any) => setNewResDecision(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-semibold"
                    >
                      <option value="SEBULAT_SUARA">Sebulat Suara</option>
                      <option value="LULUS_MAJORITI">Lulus Majoriti</option>
                      <option value="DITOLAK">Ditolak</option>
                    </select>
                    <button
                      onClick={handleAddResolution}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Tambah Usul
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* LIVE E-VOTING MODULE (MODUL UNDIAN ELEKTRONIK LANGSUNG) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              {/* Header & Motion Selector */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Vote className="w-5 h-5 text-emerald-400" /> Pusat Undian E-Voting Langsung Mesyuarat Agung
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Sistem undian masa-nyata untuk usul mesyuarat. Keputusan ditabulasi secara automatik dan diaudit dalam Log Aktiviti.
                  </p>
                </div>

                {/* Urus Setia Session Control Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {activeMotion?.eVotingStatus === 'OPEN' ? (
                    <button
                      onClick={() => handleOpenCloseEVoting('CLOSED')}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-all"
                    >
                      <Lock className="w-4 h-4" /> Tutup & Tabulasi Undi
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenCloseEVoting('OPEN')}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-all"
                    >
                      <Unlock className="w-4 h-4" /> Buka Sesi Undian
                    </button>
                  )}

                  <button
                    onClick={handleSimulateBulkVoting}
                    className="px-3.5 py-2 bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-700/60 text-indigo-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-400" /> Simulasi Undi (5 Ahli)
                  </button>
                </div>
              </div>

              {/* Feedback Alert Toast */}
              {votingFeedback && (
                <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                  votingFeedback.type === 'SUCCESS' 
                    ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200' 
                    : 'bg-rose-950/80 border-rose-700 text-rose-200'
                }`}>
                  {votingFeedback.type === 'SUCCESS' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{votingFeedback.message}</span>
                </div>
              )}

              {/* Motion Selector Tabs / Dropdown */}
              {currentMeeting.resolusi.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="text-xs font-semibold text-slate-300">
                      Pilih Usul / Resolusi Aktif:
                    </div>
                    <select
                      value={activeMotionId || currentMeeting.resolusi[0]?.id}
                      onChange={(e) => setActiveMotionId(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold max-w-full sm:max-w-md"
                    >
                      {currentMeeting.resolusi.map((res, idx) => (
                        <option key={res.id} value={res.id}>
                          Usul #{idx + 1}: {res.tajuk} ({res.keputusan.replace('_', ' ')})
                        </option>
                      ))}
                    </select>
                  </div>

                  {activeMotion && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left Side: Balloting Panel (Bilik Mengundi Ahli) */}
                      <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Radio className="w-4 h-4 text-indigo-400 animate-pulse" /> Peti Undian Elektronik Ahli
                          </h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            activeMotion.eVotingStatus === 'OPEN'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border-amber-800'
                          }`}>
                            {activeMotion.eVotingStatus === 'OPEN' ? 'SESI DIBUKA' : 'SESI DITUTUP / DRAF'}
                          </span>
                        </div>

                        {/* Motion Summary Card */}
                        <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1 text-xs">
                          <p className="font-bold text-white text-sm">{activeMotion.tajuk}</p>
                          <div className="text-slate-400 flex flex-wrap gap-x-4 gap-y-1 text-[11px] pt-1">
                            <span>Dicadang: <strong className="text-slate-200">{activeMotion.pencadang}</strong></span>
                            <span>Disokong: <strong className="text-slate-200">{activeMotion.penyokong}</strong></span>
                          </div>
                        </div>

                        {/* Member Selector */}
                        <div className="space-y-2 text-xs">
                          <label className="block text-slate-300 font-semibold">
                            Pilih Ahli Mengundi (Dari Senarai Ahli Aktif):
                          </label>
                          <select
                            value={selectedMemberIdToVote}
                            onChange={(e) => setSelectedMemberIdToVote(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium text-xs focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="">-- Pilih Ahli Koperasi --</option>
                            {ahliList.filter(a => a.status === 'AKTIF').map((ahli) => {
                              const hasVoted = activeMotion.votedMemberIds?.includes(ahli.id);
                              return (
                                <option key={ahli.id} value={ahli.id}>
                                  {ahli.nama} ({ahli.noAhli}) {hasVoted ? '✓ [Telah Mengundi]' : ''}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        {/* Vote Options Buttons */}
                        <div className="space-y-2 text-xs">
                          <label className="block text-slate-300 font-semibold">Pilihan Undian Ahli:</label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => setVotingChoice('SETUJU')}
                              className={`p-3 rounded-xl border text-center transition-all ${
                                votingChoice === 'SETUJU'
                                  ? 'bg-emerald-950 border-emerald-500 text-emerald-200 font-bold shadow-lg shadow-emerald-950/50 scale-105'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <ThumbsUp className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                              <span>SETUJU</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setVotingChoice('BANTAH')}
                              className={`p-3 rounded-xl border text-center transition-all ${
                                votingChoice === 'BANTAH'
                                  ? 'bg-rose-950 border-rose-500 text-rose-200 font-bold shadow-lg shadow-rose-950/50 scale-105'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <ThumbsDown className="w-5 h-5 mx-auto mb-1 text-rose-400" />
                              <span>BANTAH</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setVotingChoice('BERKECUALI')}
                              className={`p-3 rounded-xl border text-center transition-all ${
                                votingChoice === 'BERKECUALI'
                                  ? 'bg-slate-800 border-slate-500 text-slate-200 font-bold shadow-lg scale-105'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <Minus className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                              <span>BERKECUALI</span>
                            </button>
                          </div>
                        </div>

                        {/* Submit Vote Button */}
                        <button
                          onClick={handleCastVote}
                          disabled={!selectedMemberIdToVote || activeMotion.eVotingStatus === 'CLOSED'}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                        >
                          <Send className="w-4 h-4" /> Hantar Undian Secara Langsung
                        </button>
                      </div>

                      {/* Right Side: Tabulation Gauges & Real-time Live Graph */}
                      <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-emerald-400" /> Penyata Tabulasi Undian Masa-Nyata
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Jumlah Undi: {(activeMotion.undiSetuju || 0) + (activeMotion.undiBantah || 0) + (activeMotion.undiKecuali || 0)}
                          </span>
                        </div>

                        {/* Calculation Numbers */}
                        {(() => {
                          const setuju = activeMotion.undiSetuju || 0;
                          const bantah = activeMotion.undiBantah || 0;
                          const kecuali = activeMotion.undiKecuali || 0;
                          const total = setuju + bantah + kecuali;

                          const pSetuju = total > 0 ? Math.round((setuju / total) * 100) : 0;
                          const pBantah = total > 0 ? Math.round((bantah / total) * 100) : 0;
                          const pKecuali = total > 0 ? Math.round((kecuali / total) * 100) : 0;

                          return (
                            <div className="space-y-4 text-xs">
                              <div className="grid grid-cols-3 gap-2">
                                <div className="bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-xl text-center">
                                  <span className="text-[10px] text-emerald-400 font-bold uppercase block">Setuju</span>
                                  <span className="text-xl font-extrabold text-emerald-200">{setuju}</span>
                                  <span className="text-[10px] text-emerald-400 font-mono block">({pSetuju}%)</span>
                                </div>

                                <div className="bg-rose-950/40 border border-rose-800/60 p-3 rounded-xl text-center">
                                  <span className="text-[10px] text-rose-400 font-bold uppercase block">Bantah</span>
                                  <span className="text-xl font-extrabold text-rose-200">{bantah}</span>
                                  <span className="text-[10px] text-rose-400 font-mono block">({pBantah}%)</span>
                                </div>

                                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Berkecuali</span>
                                  <span className="text-xl font-extrabold text-slate-200">{kecuali}</span>
                                  <span className="text-[10px] text-slate-400 font-mono block">({pKecuali}%)</span>
                                </div>
                              </div>

                              {/* Multi-colored Visual Progress Bar */}
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[11px] font-semibold text-slate-300">
                                  <span>Tabulasi Peratusan Undi</span>
                                  <span>{total} / {currentMeeting.kehadiranHadir || 50} Hadir</span>
                                </div>
                                <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800 p-0.5">
                                  <div
                                    style={{ width: `${pSetuju}%` }}
                                    className="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
                                    title={`Setuju: ${pSetuju}%`}
                                  />
                                  <div
                                    style={{ width: `${pBantah}%` }}
                                    className="bg-rose-500 h-full transition-all duration-500"
                                    title={`Bantah: ${pBantah}%`}
                                  />
                                  <div
                                    style={{ width: `${pKecuali}%` }}
                                    className="bg-slate-500 h-full rounded-r-full transition-all duration-500"
                                    title={`Berkecuali: ${pKecuali}%`}
                                  />
                                </div>
                              </div>

                              {/* SKM Status Threshold Badge */}
                              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                                <span className="text-[10px] text-slate-400 uppercase font-bold block">Status Keputusan Semasa:</span>
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-white text-sm">
                                    {activeMotion.keputusan.replace('_', ' ')}
                                  </span>
                                  <span className="text-[11px] text-emerald-400 font-mono">
                                    {setuju > bantah ? '✓ LULUS (Majoriti Syarat Dipertimbangkan)' : '✗ DITOLAK (Bantahan Melebihi Setuju)'}
                                  </span>
                                </div>
                              </div>

                              {/* Member Voted Count List */}
                              <div className="pt-2 text-[11px] text-slate-400">
                                <span>Jumlah ahli berdaftar mengundi: </span>
                                <strong className="text-white">{activeMotion.votedMemberIds?.length || 0} orang</strong>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-xs">
                  Sila tambah usul/resolusi dalam senarai di atas untuk memulakan undian e-voting.
                </div>
              )}
            </div>

            {/* DIGITAL SIGNATURE WORKFLOW PANEL (MODUL TANDATANGAN DIGITAL MINIT MESYUARAT) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-bold text-white">
                      Modul Tandatangan Digital & Penentusah Minit (DigitalSignature Workflow)
                    </h3>
                    <span className="bg-emerald-950 border border-emerald-800 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                      AKTA KOPERASI 1993 & SKM COMPLIANT
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Membolehkan Pengerusi, Setiausaha & 6 Orang Penentusah Minit (Lantikan AGM) menandatangani minit mesyuarat secara digital lengkap dengan Hash Auditan SHA-256.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {(currentMeeting.jenis === 'AGM' || currentMeeting.jenis === 'EGM') && (
                    <button
                      onClick={handleAutoGenerateAGMSignatures}
                      className="px-3.5 py-2 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-200 text-xs font-bold rounded-xl shadow flex items-center gap-2 transition-all"
                      title="Jana secara automatik set 6 Penentusah Minit Lantikan AGM mengikut Akta Koperasi 1993 & UUK Koperasi"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-400" /> Auto-Jana 6 Penentusah Minit AGM
                    </button>
                  )}

                  <button
                    onClick={handleOpenSignatureModal}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all"
                  >
                    <PenTool className="w-4 h-4" /> Tandatangani Minit Sekarang
                  </button>
                </div>
              </div>

              {/* Statutory Penentusah Minit Guidance Notice for AGM/EGM */}
              {(currentMeeting.jenis === 'AGM' || currentMeeting.jenis === 'EGM') && (
                <div className="p-3.5 bg-amber-950/40 border border-amber-800/80 rounded-xl text-xs text-amber-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>SYARAT STATUTORI AKTA KOPERASI 1993 & GARIS PANDUAN SKM (PENENTUSAH MINIT)</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    Minit Mesyuarat Agung Tahunan (AGM) / Mesyuarat Agung Khas (EGM) yang lepas hendaklah disahkan oleh <strong>Penentusah Minit Mesyuarat Agung</strong> yang dilantik semasa mesyuarat (kebiasaannya <strong>6 orang Ahli Lantikan AGM</strong> yang bukan ALK) bersama <strong>Pengerusi Mesyuarat</strong> dan <strong>Setiausaha ALK</strong>.
                  </p>
                </div>
              )}

              {/* Signatures List Grid */}
              {currentMeeting.tandatanganDigital && currentMeeting.tandatanganDigital.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentMeeting.tandatanganDigital.map((sig, idx) => (
                    <div key={sig.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 relative overflow-hidden group">
                      {/* Top Status Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 font-mono block">
                            TANDATANGAN DIGITAL #{idx + 1}
                          </span>
                          <h4 className="text-sm font-bold text-white">{sig.namaSigner}</h4>
                          <span className="text-xs text-indigo-400 font-medium">{sig.jawatan} ({sig.noKpOrAhli})</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> DISAHKAN
                          </span>
                          <button
                            onClick={() => handleDeleteSignature(sig.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                            title="Batal / Padam Tandatangan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Signature Rendering Box */}
                      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center flex flex-col items-center justify-center min-h-[70px]">
                        {sig.signatureDataUrl ? (
                          <img src={sig.signatureDataUrl} alt={`Signature by ${sig.namaSigner}`} className="max-h-14 object-contain filter invert" />
                        ) : (
                          <div className="space-y-0.5">
                            <span className="text-lg font-serif italic tracking-wide text-emerald-400 block font-bold" style={{ fontFamily: 'Georgia, serif' }}>
                              {sig.namaSigner}
                            </span>
                            <span className="text-[9px] text-slate-400 uppercase font-mono tracking-widest block">
                              ✓ DISAHKAN MELALUI TOKEN IDENTITI DIGITAL
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Signature Meta & Cryptographic Hash */}
                      <div className="space-y-1 text-[11px] text-slate-400 font-mono pt-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span>Masa: <strong className="text-slate-300">{sig.tarikhTandatangan}</strong></span>
                          <span>IP: <strong className="text-slate-300">{sig.ipAlamat || '127.0.0.1'}</strong></span>
                        </div>
                        <div className="p-1.5 bg-slate-900 rounded border border-slate-800/80 text-[10px] text-emerald-400 truncate font-mono">
                          <KeyRound className="w-3 h-3 inline mr-1 text-emerald-500" />
                          {sig.hashAuditan}
                        </div>
                        {sig.catatan && (
                          <p className="text-[10px] text-slate-300 italic pt-1 border-t border-slate-800/60 font-sans">
                            "{sig.catatan}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-8 text-center space-y-3">
                  <Stamp className="w-10 h-10 text-slate-600 mx-auto" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-300">Belum Ada Tandatangan Digital Direkodkan</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Minit mesyuarat ini belum ditandatangani oleh Penentusah Minit / ALK. Klik butang di atas untuk melukis, menaip atau auto-isi 6 Penentusah Minit AGM.
                    </p>
                  </div>
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={handleOpenSignatureModal}
                      className="px-4 py-2 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-200 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition-all"
                    >
                      <PenTool className="w-4 h-4 text-indigo-400" /> Tandatangani Minit Mesyuarat
                    </button>
                    {(currentMeeting.jenis === 'AGM' || currentMeeting.jenis === 'EGM') && (
                      <button
                        onClick={handleAutoGenerateAGMSignatures}
                        className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-200 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition-all"
                      >
                        <Sparkles className="w-4 h-4 text-emerald-400" /> Auto-Jana 6 Penentusah Minit AGM
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* INTEGRATED ACTIVITY LOG TRAIL (SEJARAH & REKOD AUDIT TANDATANGAN TIMESTAMPED) */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2 font-mono uppercase tracking-wider">
                    <History className="w-4 h-4 text-amber-400" />
                    Sejarah & Jejak Masa Auditan ActivityLog Tandatangan
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {logs.filter(l => l.kategori === 'MESYUARAT' && (l.tindakan.includes('Tandatangan') || l.tindakan.includes('Penentusah'))).length} Rekod Log
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-52 overflow-y-auto space-y-2">
                  {logs.filter(l => l.kategori === 'MESYUARAT' && (l.tindakan.includes('Tandatangan') || l.tindakan.includes('Penentusah') || l.deskripsi.includes(currentMeeting.tajuk))).length > 0 ? (
                    logs
                      .filter(l => l.kategori === 'MESYUARAT' && (l.tindakan.includes('Tandatangan') || l.tindakan.includes('Penentusah') || l.deskripsi.includes(currentMeeting.tajuk)))
                      .slice(0, 10)
                      .map((log) => (
                        <div key={log.id} className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-amber-400 font-bold">{log.tarikhMasa}</span>
                              <span className="bg-slate-800 text-slate-300 text-[9px] px-2 py-0.2 rounded font-sans font-bold">
                                {log.tindakan}
                              </span>
                              <span className="text-emerald-400 font-semibold">{log.pengguna || log.namaAhli}</span>
                            </div>
                            <p className="text-slate-400 font-sans text-xs">{log.deskripsi}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] px-2 py-0.5 rounded font-bold">
                              {log.status || 'BERJAYA'}
                            </span>
                            <span className="block text-[9px] text-slate-400 mt-0.5">IP: {log.ipAlamat || '192.168.1.100'}</span>
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-[11px] text-slate-500 text-center py-3 italic">
                      Belum ada aktiviti tandatangan yang dicatat dalam log auditan bagi mesyuarat ini.
                    </p>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-center justify-between font-mono">
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Enjin Pengesahan Digital & Penentusah Minit SPPKM
                </span>
                <span className="text-slate-400 text-[10px]">
                  Software Hak Cipta © 2026 Verttere Solutions (IP0430882-T)
                </span>
              </div>
            </div>

            {/* FULL MINIT MESYUARAT PREVIEW & GENERATOR BOX */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-400" /> Teks Minit Mesyuarat Rasmi Koperasi (Format SKM)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Minit mesyuarat dikemas kini mengikut senarai kehadiran, semakan korum, agenda, dan usul yang disahkan.
                  </p>
                </div>

                <button
                  onClick={handleGenerateAIMinutes}
                  disabled={isGeneratingAI}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all shrink-0 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  {isGeneratingAI ? 'Penjana Minit AI...' : 'Jana Ulang Minit Mesyuarat'}
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                {currentMeeting.minitMesyuaratText || generateOfficialMinutesText(currentMeeting)}
              </div>
            </div>

          </div>
        ) : null}

      </div>

      {/* CREATE NEW MEETING MODAL */}
      {showNewMeetingModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-400" /> Daftar / Jadual Mesyuarat Baru
              </h3>
              <button
                onClick={() => setShowNewMeetingModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewMeeting} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Jenis Mesyuarat Koperasi</label>
                <select
                  value={newJenis}
                  onChange={(e) => setNewJenis(e.target.value as JenisMesyuarat)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="AGM">Mesyuarat Agung Tahunan (AGM)</option>
                  <option value="ALK">Mesyuarat Ahli Lembaga Koperasi (ALK)</option>
                  <option value="JAD">Mesyuarat Audit Dalaman (JAD)</option>
                  <option value="JK_KHAS">Mesyuarat Jawatankuasa Khas</option>
                  <option value="EGM">Mesyuarat Agung Luar Biasa (EGM)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Bilangan / Rujukan</label>
                  <input
                    type="text"
                    required
                    value={newBilangan}
                    onChange={(e) => setNewBilangan(e.target.value)}
                    placeholder="Contoh: Bil. 05/2026"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tarikh Mesyuarat</label>
                  <input
                    type="date"
                    required
                    value={newTarikh}
                    onChange={(e) => setNewTarikh(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tajuk Mesyuarat</label>
                <input
                  type="text"
                  required
                  value={newTajuk}
                  onChange={(e) => setNewTajuk(e.target.value)}
                  placeholder="Contoh: Mesyuarat Ahli Lembaga Koperasi Bil. 5 Tahun 2026"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Masa</label>
                  <input
                    type="text"
                    required
                    value={newMasa}
                    onChange={(e) => setNewMasa(e.target.value)}
                    placeholder="Contoh: 02:30 PM"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tempat / Lokasi</label>
                  <input
                    type="text"
                    required
                    value={newTempat}
                    onChange={(e) => setNewTempat(e.target.value)}
                    placeholder="Bilik Mesyuarat Wisma Koperasi"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Pengerusi</label>
                  <input
                    type="text"
                    required
                    value={newPengerusi}
                    onChange={(e) => setNewPengerusi(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Pencatat Minit</label>
                  <input
                    type="text"
                    required
                    value={newPencatat}
                    onChange={(e) => setNewPencatat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-950/60 border border-indigo-800 rounded-xl text-[11px] text-indigo-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  Korum minima required bagi jenis <strong>{newJenis}</strong> dialokasi automatik sebanyak{' '}
                  <strong>{calculateQuorumRule(newJenis, 50)} orang</strong> mengikut Akta Koperasi 1993.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewMeetingModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg"
                >
                  Simpan & Jadualkan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DIGITAL SIGNATURE CANVAS MODAL */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PenTool className="w-5 h-5 text-emerald-400" /> Penandatanganan Digital Minit Mesyuarat
              </h3>
              <button
                onClick={() => setShowSignatureModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {signatureFeedback && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                signatureFeedback.type === 'SUCCESS' ? 'bg-emerald-950 border-emerald-700 text-emerald-200' : 'bg-rose-950 border-rose-700 text-rose-200'
              }`}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{signatureFeedback.message}</span>
              </div>
            )}

            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSignatureMode('DRAW')}
                className={`pb-2.5 px-4 flex items-center gap-2 border-b-2 transition-all ${
                  signatureMode === 'DRAW'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <PenTool className="w-4 h-4" /> Lukis Tandatangan (Pad Canvas)
              </button>
              <button
                type="button"
                onClick={() => setSignatureMode('TYPED')}
                className={`pb-2.5 px-4 flex items-center gap-2 border-b-2 transition-all ${
                  signatureMode === 'TYPED'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCheck className="w-4 h-4" /> Taip Tandatangan Digital
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nama Penandatangan</label>
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="Contoh: Dato' Ahmad Razali"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Jawatan / Peranan</label>
                  <select
                    value={signerRole}
                    onChange={(e) => setSignerRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <optgroup label="Lantikan Penentusah Minit AGM (Akta Koperasi 1993)">
                      <option value="Penentusah Minit #1 (Ahli Lantikan AGM)">Penentusah Minit #1 (Ahli Lantikan AGM)</option>
                      <option value="Penentusah Minit #2 (Ahli Lantikan AGM)">Penentusah Minit #2 (Ahli Lantikan AGM)</option>
                      <option value="Penentusah Minit #3 (Ahli Lantikan AGM)">Penentusah Minit #3 (Ahli Lantikan AGM)</option>
                      <option value="Penentusah Minit #4 (Ahli Lantikan AGM)">Penentusah Minit #4 (Ahli Lantikan AGM)</option>
                      <option value="Penentusah Minit #5 (Ahli Lantikan AGM)">Penentusah Minit #5 (Ahli Lantikan AGM)</option>
                      <option value="Penentusah Minit #6 (Ahli Lantikan AGM)">Penentusah Minit #6 (Ahli Lantikan AGM)</option>
                    </optgroup>
                    <optgroup label="Kepimpinan & ALK Koperasi">
                      <option value="Pengerusi Mesyuarat / ALK">Pengerusi Mesyuarat / ALK</option>
                      <option value="Setiausaha ALK / Pencatat Minit">Setiausaha ALK / Pencatat Minit</option>
                      <option value="Bendahari ALK">Bendahari ALK</option>
                      <option value="Ahli Lembaga (ALK)">Ahli Lembaga (ALK)</option>
                      <option value="Pengerusi JAD">Pengerusi Audit Dalaman (JAD)</option>
                      <option value="Pemeriksa Akaun">Pemeriksa Akaun / JAD</option>
                      <option value="Urus Setia">Urus Setia Koperasi</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">No. Ahli / Kad Pengenalan</label>
                <input
                  type="text"
                  value={signerNoKp}
                  onChange={(e) => setSignerNoKp(e.target.value)}
                  placeholder="Contoh: KOP-2026-0001"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {/* Canvas or Typed Section */}
              {signatureMode === 'DRAW' ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-slate-300 font-semibold">
                    <span>Pad Lukisan Tandatangan (Mouse / Touch Pad):</span>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                    >
                      <Eraser className="w-3.5 h-3.5" /> Padam Pad
                    </button>
                  </div>
                  
                  <div className="border-2 border-dashed border-slate-700 rounded-xl bg-slate-950 p-1 flex justify-center items-center touch-none">
                    <canvas
                      ref={canvasRef}
                      width={420}
                      height={160}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-40 bg-slate-950 cursor-crosshair rounded-lg"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 text-center">
                    * Sila gunakan tetikus atau skrin sentuh untuk melukis menurunkan tandatangan di petak di atas.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-300">Pratonton Tandatangan Taip Digital:</label>
                  <div className="p-6 bg-slate-950 border border-indigo-900/60 rounded-xl text-center space-y-2">
                    <span className="text-2xl font-serif italic text-emerald-400 font-bold tracking-wider block">
                      {signerName || 'Tandatangan Digital'}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono">
                      ✓ DISAHKAN DENGAN KOD AUDIT SHA-256 AUTOMATIK
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Catatan Pengesahan Minit</label>
                <textarea
                  rows={2}
                  value={signerNotes}
                  onChange={(e) => setSignerNotes(e.target.value)}
                  placeholder="Catatan pengesahan..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[10px] text-slate-400 flex items-start gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Pemetrikan tandatangan ini dilindungi dengan Enjin Pengesahan Verttere Solutions (IP0430882-T) untuk audit SKM & Akta Koperasi 1993.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowSignatureModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveDigitalSignature}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Simpan & Metrikkan Tandatangan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PENUTUPAN MESYUARAT & SELEKSI PENENTUSAH MINIT STATUTORI */}
      {showCloseMeetingModal && currentMeeting && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-950 border border-emerald-700 text-emerald-400 rounded-xl">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wide">
                    Pengesahan Penutupan Mesyuarat & Lantikan Penentusah Minit
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mematuhi Akta Koperasi 1993 (Seksyen 39-47) & Undang-Undang Kecil Koperasi
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCloseMeetingModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Error / Success Feedback */}
            {closeFeedback && (
              <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                closeFeedback.type === 'ERROR' ? 'bg-rose-950/80 border-rose-800 text-rose-300' : 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              }`}>
                {closeFeedback.type === 'ERROR' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                <span>{closeFeedback.message}</span>
              </div>
            )}

            {/* Statutory Compliance Notice Banner */}
            <div className="bg-slate-950 border border-indigo-900/60 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-indigo-300 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Rujukan Peraturan Penentusah Minit (Syarat SKM):</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Di bawah peruntukan Akta Koperasi 1993, minit mesyuarat bagi Mesyuarat Agung (AGM/EGM) atau Mesyuarat ALK mestilah disahkan tepat oleh <strong className="text-emerald-400">Penentusah Minit</strong> yang dilantik dalam mesyuarat sebelum minit ditutup dan dikunci sebagai rekod rasmi.
              </p>
            </div>

            {/* Preset Quick Selection Buttons */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">Pilihan Pantas Preset Penentusah:</label>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={handlePresetSelectAGM6}
                  className="px-3 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-200 border border-indigo-700 font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Award className="w-3.5 h-3.5 text-indigo-400" /> Auto-Pilih 6 Penentusah AGM (Lantikan Ahli)
                </button>
                <button
                  type="button"
                  onClick={handlePresetSelectALKAll}
                  className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-700 font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Users className="w-3.5 h-3.5 text-emerald-400" /> Auto-Pilih Semua Barisan ALK
                </button>
              </div>
            </div>

            {/* Currently Selected Penentusah Badges */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-white">
                  Penentusah Minit Terpilih ({selectedPenentusahList.length} Orang):
                </label>
                {selectedPenentusahList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedPenentusahList([])}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    Kosongkan Semua
                  </button>
                )}
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl min-h-[70px] flex flex-wrap gap-2 items-center">
                {selectedPenentusahList.length > 0 ? (
                  selectedPenentusahList.map((name, i) => (
                    <span
                      key={i}
                      className="bg-slate-900 border border-emerald-700/80 text-emerald-200 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm"
                    >
                      <span className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-400 text-[10px] font-mono flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span>{name}</span>
                      <button
                        type="button"
                        onClick={() => handleTogglePenentusahMember(name)}
                        className="text-slate-400 hover:text-rose-400 font-bold ml-1"
                        title="Nyahpilih"
                      >
                        ×
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">Tiada penentusah dipilih lagi. Sila tandakan dari senarai di bawah atau tambah nama secara manual.</span>
                )}
              </div>
            </div>

            {/* Search & Ahli Checkbox Selection List */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">Pilih Dari Senarai Ahli / ALK Koperasi:</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={penentusahSearchQuery}
                  onChange={(e) => setPenentusahSearchQuery(e.target.value)}
                  placeholder="Cari nama ahli atau ALK..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400"
                />
              </div>

              <div className="max-h-44 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl p-2 space-y-1">
                {ahliList
                  .filter(a => a.nama.toLowerCase().includes(penentusahSearchQuery.toLowerCase()) || a.noAhli.toLowerCase().includes(penentusahSearchQuery.toLowerCase()))
                  .slice(0, 15)
                  .map((ahli) => {
                    const isChecked = selectedPenentusahList.includes(ahli.nama) || selectedPenentusahList.some(p => p.includes(ahli.nama));
                    return (
                      <label
                        key={ahli.id}
                        onClick={() => handleTogglePenentusahMember(ahli.nama)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                          isChecked ? 'bg-emerald-950/60 border border-emerald-800 text-white' : 'hover:bg-slate-900 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                          />
                          <div>
                            <span className="font-bold block">{ahli.nama}</span>
                            <span className="text-[10px] text-slate-400 font-mono">No. Ahli: {ahli.noAhli} • {ahli.jawatan || 'Ahli Biasa'}</span>
                          </div>
                        </div>

                        {isChecked && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                            ✓ Terpilih
                          </span>
                        )}
                      </label>
                    );
                  })}
              </div>
            </div>

            {/* Custom Input for External/Unlisted Verifiers */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">Atau Tambah Nama Penentusah Manual:</label>
              <div className="flex gap-2 text-xs">
                <input
                  type="text"
                  value={customPenentusahInput}
                  onChange={(e) => setCustomPenentusahInput(e.target.value)}
                  placeholder="Taip nama penentusah (Contoh: En. Wan Sulaiman Bin Abdullah)..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={handleAddCustomPenentusah}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Tambah
                </button>
              </div>
            </div>

            {/* Closing Resolution Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">Catatan / Minit Penutupan Mesyuarat:</label>
              <textarea
                rows={2}
                value={closeMeetingNotes}
                onChange={(e) => setCloseMeetingNotes(e.target.value)}
                placeholder="Catatan penutupan..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            {/* Modal Footer Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCloseMeetingModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmCloseMeeting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs shadow-xl shadow-emerald-950/60 flex items-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" /> Sahkan Penutupan & Kunci Minit
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 1: PAPARAN SKRIN PROJEKSI KOD QR MESYUARAT DEWAN (PROJECTOR / FULL SCREEN MODE) */}
      {showQrModal && currentMeeting && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-left">
                <QrCode className="w-6 h-6 text-indigo-400" />
                <div>
                  <h3 className="text-base font-extrabold text-white">Paparan Skrin Projeksi Kod QR Mesyuarat</h3>
                  <p className="text-xs text-slate-400">Papar di skrin dewan / projektor untuk pendaftaran imbasan ahli</p>
                </div>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full border bg-indigo-950 text-indigo-300 border-indigo-800">
                {currentMeeting.jenis} ({currentMeeting.bilangan})
              </span>
              <h2 className="text-xl font-black text-white pt-2">{currentMeeting.tajuk}</h2>
              <p className="text-xs text-slate-300 font-mono">
                Tarikh: {currentMeeting.tarikh} • Masa: {currentMeeting.masa} • Lokasi: {currentMeeting.tempat}
              </p>
            </div>

            {/* Large Center QR Code Frame */}
            <div className="p-5 bg-white rounded-3xl inline-block shadow-2xl border-8 border-indigo-500/40 my-2">
              {qrCodeDataUrl ? (
                <img src={qrCodeDataUrl} alt="Kod QR Mesyuarat Skrin Besar" className="w-64 h-64 object-contain mx-auto" />
              ) : (
                <div className="w-64 h-64 bg-slate-100 flex items-center justify-center text-slate-500 font-mono text-xs">
                  Memuatkan Kod QR...
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1 max-w-md mx-auto">
              <span className="font-bold text-emerald-400 flex items-center justify-center gap-1">
                <Smartphone className="w-4 h-4 text-emerald-400 animate-bounce" />
                SILA IMBAS KOD QR DENGAN TELEFON PINTAR ANDA
              </span>
              <p className="text-[11px] text-slate-400">
                Arahkan kamera telefon anda pada Kod QR di atas untuk mengesahkan dan mendaftar kehadiran secara automatik.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleDownloadQrCode}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Muat Turun Kod QR (PNG)
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                Tutup Paparan
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: PENGIMBAS & PENDAFTARAN KEHADIRAN KOD QR AHLI */}
      {showQrScanModal && currentMeeting && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h3 className="text-base font-bold text-white">Pengimbas & Pendaftaran Kehadiran Kod QR</h3>
              </div>
              <button
                onClick={() => setShowQrScanModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {qrScanFeedback && (
              <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 font-semibold ${
                qrScanFeedback.type === 'SUCCESS' ? 'bg-emerald-950 border-emerald-700 text-emerald-200' : 'bg-rose-950 border-rose-700 text-rose-200'
              }`}>
                {qrScanFeedback.type === 'SUCCESS' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                <span>{qrScanFeedback.message}</span>
              </div>
            )}

            {/* Simulated Scanner Viewfinder Overlay */}
            <div className="relative bg-slate-950 border-2 border-dashed border-emerald-500/60 rounded-2xl p-6 text-center space-y-3 overflow-hidden">
              <div className="w-20 h-20 border-2 border-emerald-400 rounded-xl mx-auto flex items-center justify-center bg-emerald-950/30 relative">
                <Scan className="w-10 h-10 text-emerald-400 animate-pulse" />
                <div className="absolute inset-0 border-t-2 border-emerald-400 animate-ping opacity-30 rounded-xl" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-300 block">Kamera Pengimbas QR Diaktifkan</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Sedia menerima imbasan dari aplikasi atau imbasan simulasi pendaftaran ahli.</p>
              </div>
            </div>

            {/* Select Ahli to Simulate QR Scan */}
            <div className="space-y-3 text-xs">
              <label className="block font-bold text-slate-300">Pilih Ahli Koperasi Untuk Mendaftar Hadir via QR:</label>
              
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={qrSearchQuery}
                  onChange={(e) => setQrSearchQuery(e.target.value)}
                  placeholder="Cari nama atau No. Ahli..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-400"
                />
              </div>

              <div className="max-h-48 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl p-2 space-y-1">
                {ahliList
                  .filter(a => a.status === 'AKTIF' && (a.nama.toLowerCase().includes(qrSearchQuery.toLowerCase()) || a.noAhli.toLowerCase().includes(qrSearchQuery.toLowerCase())))
                  .slice(0, 15)
                  .map((ahli) => {
                    const isAlreadyPresent = currentMeeting.kehadiranSenarai?.some(k => k.noAhli === ahli.noAhli || k.nama.toLowerCase() === ahli.nama.toLowerCase());
                    return (
                      <div
                        key={ahli.id}
                        onClick={() => setSelectedMemberForQrScan(ahli.id)}
                        className={`p-2.5 rounded-lg cursor-pointer flex items-center justify-between transition-all ${
                          selectedMemberForQrScan === ahli.id
                            ? 'bg-emerald-950 border border-emerald-600 text-white font-bold'
                            : 'hover:bg-slate-900 text-slate-300 border border-transparent'
                        }`}
                      >
                        <div>
                          <span className="block font-bold">{ahli.nama}</span>
                          <span className="text-[10px] text-slate-400 font-mono">No. Ahli: {ahli.noAhli} • {ahli.jawatan || 'Ahli Biasa'}</span>
                        </div>

                        {isAlreadyPresent ? (
                          <span className="text-[10px] bg-slate-800 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                            ✓ Telah Hadir
                          </span>
                        ) : selectedMemberForQrScan === ahli.id ? (
                          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-bold">
                            Terpilih
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowQrScanModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleProcessQrScan()}
                disabled={!selectedMemberForQrScan}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs shadow-lg flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Sahkan Kehadiran Imbasan QR
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
