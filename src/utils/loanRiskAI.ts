import { Ahli, PembiayaanAhli, Transaksi, JenisPembiayaan } from '../types';

export interface AIRiskBreakdown {
  syerScore: number;       // Kecukupan Modal Syer & Yuran (25%)
  paymentScore: number;    // Rekod Bayaran & Potongan Gaji (30%)
  dsrScore: number;        // Nisbah Khidmat Hutang & Pendedahan (25%)
  tenureScore: number;     // Tempoh Keahlian (10%)
  guarantorScore: number;  // Kekuatan Penjamin (10%)
}

export interface AIRiskAssessment {
  score: number; // 0 - 100
  grade: 'A' | 'B' | 'C';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  labelBM: string;
  labelEN: string;
  recommendationBM: string;
  recommendationEN: string;
  maxRecommendedLoan: number;
  syerToLoanRatioPercent: number;
  loanToSyerMultiplier: number;
  totalDebtExposure: number;
  breakdown: AIRiskBreakdown;
  positiveFactorsBM: string[];
  riskFactorsBM: string[];
  positiveFactorsEN: string[];
  riskFactorsEN: string[];
}

export function calculateLoanRiskScore(
  ahli: Ahli,
  jumlahPinjaman: number,
  bayaranBulanan: number,
  jenisPembiayaan: JenisPembiayaan,
  penjaminCount: number,
  allPembiayaanList: PembiayaanAhli[] = [],
  allTransaksiList: Transaksi[] = []
): AIRiskAssessment {
  // 1. Kecukupan Modal Syer & Yuran (Weight: 25%)
  const totalSyerYuran = (ahli.modalSyer || 0) + (ahli.yuranBulanan || 0) * 12; // Syer + 1 tahun Yuran
  const syerToLoanRatio = totalSyerYuran / Math.max(1, jumlahPinjaman);
  const syerToLoanRatioPercent = Math.round(syerToLoanRatio * 100);
  const loanToSyerMultiplier = Number((jumlahPinjaman / Math.max(1, ahli.modalSyer || 100)).toFixed(1));

  let syerScore = 30;
  if (syerToLoanRatio >= 0.5) syerScore = 100;
  else if (syerToLoanRatio >= 0.35) syerScore = 90;
  else if (syerToLoanRatio >= 0.20) syerScore = 75;
  else if (syerToLoanRatio >= 0.10) syerScore = 55;

  // 2. Rekod Bayaran & Potongan Gaji (Weight: 30%)
  // Search transactions for this member
  const memberTxs = allTransaksiList.filter(
    t => (t.noAhli === ahli.noAhli || t.namaAhli?.toLowerCase() === ahli.nama.toLowerCase())
  );
  const payrollCount = memberTxs.filter(
    t => t.kategori === 'POTONGAN_GAJI' || t.kategori === 'YURAN_SYER' || t.kategori === 'BAYARAN_BALIK_PINJAMAN'
  ).length;

  let paymentScore = 70; // baseline neutral
  if (payrollCount >= 5) paymentScore = 98;
  else if (payrollCount >= 3) paymentScore = 88;
  else if (payrollCount >= 1) paymentScore = 78;
  else paymentScore = 60; // new member or no transaction history

  // Deduct points if member has any failed or warning logs/status
  if (ahli.status === 'DIGANTUNG') paymentScore = 20;

  // 3. Nisbah Khidmat Hutang (DSR) & Pendedahan Terkumpul (Weight: 25%)
  const existingActiveLoans = allPembiayaanList.filter(
    p => p.noAhli === ahli.noAhli && p.status === 'DILULUSKAN' && p.bakiPinjaman > 0
  );
  const totalExistingDebt = existingActiveLoans.reduce((sum, p) => sum + p.bakiPinjaman, 0);
  const totalDebtExposure = totalExistingDebt + jumlahPinjaman;
  const totalExposureToSyerRatio = totalDebtExposure / Math.max(1, ahli.modalSyer || 1);

  let dsrScore = 40;
  if (totalExposureToSyerRatio <= 2.5) dsrScore = 100;
  else if (totalExposureToSyerRatio <= 4.0) dsrScore = 85;
  else if (totalExposureToSyerRatio <= 6.0) dsrScore = 70;
  else if (totalExposureToSyerRatio <= 8.0) dsrScore = 50;

  // 4. Tempoh Keahlian (Weight: 10%)
  const joinYear = new Date(ahli.tarikhSertai || '2022-01-01').getFullYear();
  const currentYear = new Date().getFullYear();
  const yearsActive = Math.max(0, currentYear - joinYear);

  let tenureScore = 55;
  if (yearsActive >= 4) tenureScore = 100;
  else if (yearsActive >= 2) tenureScore = 85;
  else if (yearsActive >= 1) tenureScore = 70;

  // 5. Kekuatan Penjamin (Weight: 10%)
  let guarantorScore = 40;
  if (penjaminCount >= 2) guarantorScore = 100;
  else if (penjaminCount === 1) guarantorScore = 70;

  // Weighted Score Calculation
  const finalScore = Math.round(
    syerScore * 0.25 +
    paymentScore * 0.30 +
    dsrScore * 0.25 +
    tenureScore * 0.10 +
    guarantorScore * 0.10
  );

  // Maximum recommended loan (Rule of thumb: max 5x Modal Syer, capped at RM 50,000)
  const maxRecommendedLoan = Math.min(50000, Math.max(5000, Math.round((ahli.modalSyer || 1000) * 5)));

  // Risk Classification
  let grade: 'A' | 'B' | 'C' = 'A';
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  let labelBM = 'Risiko Rendah (Cemerlang)';
  let labelEN = 'Low Risk (Excellent)';
  let recommendationBM = 'Sangat disyorkan untuk Kelulusan ALK tanpa syarat tambahan.';
  let recommendationEN = 'Highly recommended for ALK approval without additional conditions.';

  if (finalScore >= 80) {
    grade = 'A';
    riskLevel = 'LOW';
    labelBM = 'Risiko Rendah (Gred A)';
    labelEN = 'Low Risk (Grade A)';
    recommendationBM = 'Profil pembiayaan sangat cemerlang. Disyorkan untuk kelulusan penuh oleh ALK.';
    recommendationEN = 'Excellent financing profile. Fully recommended for ALK approval.';
  } else if (finalScore >= 60) {
    grade = 'B';
    riskLevel = 'MEDIUM';
    labelBM = 'Risiko Sederhana (Gred B)';
    labelEN = 'Moderate Risk (Grade B)';
    recommendationBM = 'Kelulusan bersyarat. Disyorkan pemotongan gaji secara terus melalui BPA & sekurang-kurangnya 2 penjamin sah.';
    recommendationEN = 'Conditional approval. Direct salary deduction via BPA & minimum 2 valid guarantors recommended.';
  } else {
    grade = 'C';
    riskLevel = 'HIGH';
    labelBM = 'Risiko Tinggi (Gred C)';
    labelEN = 'High Risk (Grade C)';
    recommendationBM = 'Risiko pembiayaan tinggi! Disyorkan mengecilkan amaun pinjaman kepada bawah RM ' + maxRecommendedLoan.toLocaleString() + ' atau kemukakan jaminan tambahan.';
    recommendationEN = 'High financing risk! Recommended to reduce loan amount below RM ' + maxRecommendedLoan.toLocaleString() + ' or provide extra collateral.';
  }

  // Generate Positive Factors & Risk Warning Factors
  const positiveFactorsBM: string[] = [];
  const riskFactorsBM: string[] = [];
  const positiveFactorsEN: string[] = [];
  const riskFactorsEN: string[] = [];

  if (syerToLoanRatio >= 0.3) {
    positiveFactorsBM.push(`Modal Syer kukuh (RM ${ahli.modalSyer.toLocaleString()}) menampung ${syerToLoanRatioPercent}% amaun pembiayaan.`);
    positiveFactorsEN.push(`Strong Share Capital (RM ${ahli.modalSyer.toLocaleString()}) covers ${syerToLoanRatioPercent}% of loan amount.`);
  } else {
    riskFactorsBM.push(`Gandaan pinjaman tinggi (${loanToSyerMultiplier}x ganda Modal Syer ahli RM ${ahli.modalSyer.toLocaleString()}).`);
    riskFactorsEN.push(`High loan multiplier (${loanToSyerMultiplier}x member Share Capital RM ${ahli.modalSyer.toLocaleString()}).`);
  }

  if (payrollCount >= 3) {
    positiveFactorsBM.push(`Rekod konsistensi caruman & potongan gaji bulanan teratur (${payrollCount} transaksi direkodkan).`);
    positiveFactorsEN.push(`Regular monthly contribution & payroll deduction record (${payrollCount} transactions logged).`);
  } else {
    riskFactorsBM.push(`Rekod caruman belum meluas atau ahli baru mendaftar (${payrollCount} rekod potongan).`);
    riskFactorsEN.push(`Limited contribution history or newly registered member (${payrollCount} deduction records).`);
  }

  if (totalExistingDebt > 0) {
    riskFactorsBM.push(`Ahli mempunyai pembiayaan aktif sedia ada sebanyak RM ${totalExistingDebt.toLocaleString()}.`);
    riskFactorsEN.push(`Member has existing active loan balance of RM ${totalExistingDebt.toLocaleString()}.`);
  } else {
    positiveFactorsBM.push('Tiada baki pinjaman aktif sedia ada (Pendedahan hutang sifar).');
    positiveFactorsEN.push('No existing active loan balance (Zero current debt exposure).');
  }

  if (yearsActive >= 2) {
    positiveFactorsBM.push(`Keahlian matang selama ${yearsActive} tahun dalam koperasi.`);
    positiveFactorsEN.push(`Mature membership tenure of ${yearsActive} years in the co-op.`);
  }

  if (penjaminCount >= 2) {
    positiveFactorsBM.push(`Syarat 2 Penjamin Sah dipenuhi.`);
    positiveFactorsEN.push(`Requirement of 2 Valid Guarantors met.`);
  } else {
    riskFactorsBM.push(`Bilangan penjamin kurang daripada 2 orang.`);
    riskFactorsEN.push(`Fewer than 2 guarantors provided.`);
  }

  return {
    score: finalScore,
    grade,
    riskLevel,
    labelBM,
    labelEN,
    recommendationBM,
    recommendationEN,
    maxRecommendedLoan,
    syerToLoanRatioPercent,
    loanToSyerMultiplier,
    totalDebtExposure,
    breakdown: {
      syerScore,
      paymentScore,
      dsrScore,
      tenureScore,
      guarantorScore,
    },
    positiveFactorsBM,
    riskFactorsBM,
    positiveFactorsEN,
    riskFactorsEN,
  };
}
