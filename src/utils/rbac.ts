export type UserRole = 
  | 'BENDAHARI' 
  | 'PENGERUSI_ALK' 
  | 'SETIAUSAHA' 
  | 'AUDITOR_JAD' 
  | 'JURUWANG_POS' 
  | 'AHLI_KOPERASI';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  noAhli?: string;
  lastLogin?: string;
}

export const ROLE_DEFINITIONS: Record<UserRole, {
  label: string;
  description: string;
  badgeColor: string;
  allowedTabs: string[];
}> = {
  BENDAHARI: {
    label: 'Bendahari Koperasi',
    description: 'Akses penuh kewangan, lejar, dividen, pembiayaan, simpanan khas, penyesuaian bank, e-invois, POS dan dokumen.',
    badgeColor: 'bg-emerald-500 text-slate-950',
    allowedTabs: [
      'dashboard',
      'members',
      'savings',
      'governance',
      'welfare',
      'meetings',
      'pos',
      'accounting',
      'bank-recon',
      'fixed-assets',
      'financing',
      'skm-funds',
      'e-invoice',
      'gateway',
      'payroll',
      'financials',
      'documents',
      'dividend',
      'compliance',
      'automated-reports',
      'logs',
      'ai-audit',
    ],
  },
  PENGERUSI_ALK: {
    label: 'Pengerusi ALK',
    description: 'Akses tadbir urus tertinggi, AGM, kelulusan pembiayaan, laporan eksekutif, e-Koperasi dan semakan audit.',
    badgeColor: 'bg-indigo-500 text-white',
    allowedTabs: [
      'dashboard',
      'members',
      'savings',
      'governance',
      'welfare',
      'meetings',
      'bank-recon',
      'fixed-assets',
      'financing',
      'skm-funds',
      'e-invoice',
      'gateway',
      'financials',
      'documents',
      'dividend',
      'compliance',
      'automated-reports',
      'logs',
      'ai-audit',
    ],
  },
  SETIAUSAHA: {
    label: 'Setiausaha Pentadbiran',
    description: 'Akses pengurusan keahlian, mesyuarat, minit AGM, resolusi undian dan repositori dokumen.',
    badgeColor: 'bg-teal-500 text-slate-950',
    allowedTabs: [
      'dashboard',
      'members',
      'governance',
      'welfare',
      'meetings',
      'documents',
      'compliance',
      'automated-reports',
      'logs',
    ],
  },
  AUDITOR_JAD: {
    label: 'Pemeriksa Akaun (JAD)',
    description: 'Audit dalaman, semakan pematuhan Akta Koperasi 1993, penyesuaian bank, laporan statutori dan nasihat AI.',
    badgeColor: 'bg-amber-500 text-slate-950',
    allowedTabs: [
      'dashboard',
      'members',
      'savings',
      'governance',
      'welfare',
      'meetings',
      'accounting',
      'bank-recon',
      'fixed-assets',
      'financing',
      'skm-funds',
      'e-invoice',
      'gateway',
      'financials',
      'documents',
      'dividend',
      'compliance',
      'automated-reports',
      'logs',
      'ai-audit',
    ],
  },
  JURUWANG_POS: {
    label: 'Juruwang Kedai POS',
    description: 'Pengendalian kaunter jualan kedai koperasi, imbasan produk, inventori dan resit ahli.',
    badgeColor: 'bg-rose-500 text-white',
    allowedTabs: [
      'pos',
      'dashboard',
      'e-invoice',
    ],
  },
  AHLI_KOPERASI: {
    label: 'Anggota Koperasi',
    description: 'Portal peribadi anggota bagi menyemak baki syer, simpanan khas, yuran, permohonan pinjaman dan dividen.',
    badgeColor: 'bg-cyan-500 text-slate-950',
    allowedTabs: [
      'dashboard',
      'members',
      'savings',
      'welfare',
      'financing',
      'skm-funds',
      'gateway',
      'dividend',
      'pos',
    ],
  },
};

export function isTabAllowedForRole(role: UserRole | string, tabId: string): boolean {
  const normRole = (role as UserRole) || 'BENDAHARI';
  const roleDef = ROLE_DEFINITIONS[normRole];
  if (!roleDef) return true;
  return roleDef.allowedTabs.includes(tabId);
}
