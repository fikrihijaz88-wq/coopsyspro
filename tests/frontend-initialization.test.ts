import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import App from '../src/App';
import { DashboardOverview } from '../src/components/DashboardOverview';
import { MemberManagement } from '../src/components/MemberManagement';
import { AccountingTransactions } from '../src/components/AccountingTransactions';
import { FinancialStatements } from '../src/components/FinancialStatements';
import { MemberSavingsDeposit } from '../src/components/MemberSavingsDeposit';
import { FixedAssetManagement } from '../src/components/FixedAssetManagement';
import { BankReconciliation } from '../src/components/BankReconciliation';
import { LoanFinancing } from '../src/components/LoanFinancing';
import { DividendDistribution } from '../src/components/DividendDistribution';
import { createEmptyDatabase } from '../src/data/emptyData';

test('frontend waits for operational data without exposing sample/editable fallback records', () => {
  const html = renderToStaticMarkup(React.createElement(App));
  assert.match(html, /Loading database/);
  assert.doesNotMatch(html, /Haji Ahmad Zaki|KOP-2021|245,800|268,000/);
});

test('core screens can initialize from empty operational arrays/configuration', () => {
  const empty = createEmptyDatabase();
  const noop = () => {};
  const screens = [
    React.createElement(DashboardOverview, {
      ahliList: [], cartaAkaun: [], transaksiList: [], pembiayaanList: [], mesyuaratList: [],
      setActiveTab: noop, onOpenNewMemberModal: noop, onOpenNewTxModal: noop,
    }),
    React.createElement(MemberManagement, {
      ahliList: [], onAddAhli: noop, onUpdateStatusAhli: noop, onTambahSyerAhli: noop, searchQuery: '',
    }),
    React.createElement(AccountingTransactions, {
      cartaAkaun: [], transaksiList: [], onAddTransaksi: noop, searchQuery: '',
      showNewTxModalDirect: false, onCloseNewTxModalDirect: noop,
    }),
    React.createElement(FinancialStatements, { cartaAkaun: [], rekodTahunanList: [], onOpenAIAudit: noop }),
    React.createElement(MemberSavingsDeposit, {
      savingsList: [], ahliList: [], onAddSavingsAccount: noop, onUpdateSavingsAccount: noop, onAddTransaction: noop,
    }),
    React.createElement(FixedAssetManagement, {
      assetList: [], onAddAsset: noop, onUpdateAsset: noop, onRunDepreciation: noop,
    }),
    React.createElement(BankReconciliation, {
      bankItems: [], reconSummary: empty.bankReconSummary, transaksiList: [], cartaAkaun: [],
      onAddBankItem: noop, onUpdateBankItem: noop, onUpdateReconSummary: noop,
    }),
    React.createElement(LoanFinancing, {
      pembiayaanList: [], ahliList: [], transaksiList: [], onAddPembiayaan: noop, onUpdateStatusPembiayaan: noop,
    }),
    React.createElement(DividendDistribution, { ahliList: [], totalUntungBersih: 0 }),
  ];
  for (const screen of screens) assert.doesNotThrow(() => renderToStaticMarkup(screen));
});
