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
  if (format === 'pdf') {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('O navegador bloqueou a janela de impressão. Permita pop-ups e tente novamente.');
    }

    printWindow.document.open();
    printWindow.document.write(createDashboardPrintHtml(report));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    return;
  }

  const blob = new Blob([createDashboardCsv(report)], {
    type: 'text/csv;charset=utf-8',
  });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = `smarttraffic-dashboard-${report.period}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
