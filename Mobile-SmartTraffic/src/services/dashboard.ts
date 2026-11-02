import { demoDashboardReports } from '@/mocks/dashboard';
import type { DashboardPeriod, DashboardReport } from '@/services/contracts/dashboard';

export interface DashboardDataSource {
  getReport(period: DashboardPeriod): Promise<DashboardReport | null>;
}

export const dashboardDataSource: DashboardDataSource = {
  async getReport(period) {
    await new Promise((resolve) => setTimeout(resolve, 220));
    return demoDashboardReports[period] ?? null;
  },
};
