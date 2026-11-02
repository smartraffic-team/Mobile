import { Platform } from 'react-native';

import type { DashboardExportFormat } from '@/services/dashboard-export';
import type { DashboardReport } from '@/services/contracts/dashboard';

export async function exportDashboardReport(
  report: DashboardReport,
  format: DashboardExportFormat,
) {
  const exporter =
    Platform.OS === 'web'
      ? await import('@/services/dashboard-export-platform.web')
      : await import('@/services/dashboard-export-platform.native');

  await exporter.exportDashboardReport(report, format);
}
