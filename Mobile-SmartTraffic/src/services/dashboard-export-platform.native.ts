import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import {
  createDashboardCsv,
  createDashboardPrintHtml,
  type DashboardExportFormat,
} from '@/services/dashboard-export';
import type { DashboardReport } from '@/services/contracts/dashboard';

export async function exportDashboardReport(
  report: DashboardReport,
  format: DashboardExportFormat,
) {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('O compartilhamento de arquivos não está disponível neste dispositivo.');
  }

  if (format === 'pdf') {
    const { uri } = await Print.printToFileAsync({
      html: createDashboardPrintHtml(report),
      base64: false,
    });
    await Sharing.shareAsync(uri, {
      dialogTitle: 'Exportar relatório SmartTraffic em PDF',
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
    });
    return;
  }

  if (!FileSystem.documentDirectory) {
    throw new Error('Não foi possível acessar a pasta de documentos do dispositivo.');
  }

  const uri = `${FileSystem.documentDirectory}smarttraffic-dashboard-${report.period}.csv`;
  await FileSystem.writeAsStringAsync(uri, createDashboardCsv(report), {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await Sharing.shareAsync(uri, {
    dialogTitle: 'Exportar relatório SmartTraffic em CSV',
    mimeType: 'text/csv',
    UTI: 'public.comma-separated-values-text',
  });
}
