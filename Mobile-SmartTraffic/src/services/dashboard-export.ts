import type { DashboardReport } from '@/services/contracts/dashboard';

export type DashboardExportFormat = 'csv' | 'pdf';

function escapeCsvCell(value: string | number) {
  const text = String(value).replace(/[\r\n]/g, ' ');
  const safeText = /^[=+\-@\t]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
}

export function createDashboardCsv(report: DashboardReport) {
  const rows: (string | number)[][] = [
    ['SmartTraffic · Relatório demonstrativo', report.updatedAt],
    ['Período', report.period],
    [],
    ['Indicador', 'Valor', 'Detalhe'],
    ...Object.values(report.metrics).map((metric) => [
      metric.label,
      metric.value,
      metric.detail,
    ]),
    [],
    ['Fluxo de veículos', 'Veículos'],
    ...report.vehicleFlow.map((point) => [point.label || report.period, point.value]),
    [],
    ['Densidade por via', 'Câmera', 'Densidade', 'Classificação'],
    ...report.roads.map((road) => [
      road.address,
      road.cameraId,
      `${road.percentage}%`,
      road.level === 'high' ? 'Alta densidade' : 'Fluxo moderado',
    ]),
    [],
    ['Composição da frota', 'Quantidade', 'Participação'],
    ...report.fleet.map((category) => [
      category.label,
      category.count,
      `${category.percentage}%`,
    ]),
    [],
    ['Alerta', 'Horário', 'Severidade'],
    ...report.alerts.map((alert) => [
      alert.message,
      alert.time,
      alert.severity === 'critical' ? 'Crítica' : 'Atenção',
    ]),
  ];

  return `\uFEFF${rows.map((row) => row.map(escapeCsvCell).join(';')).join('\r\n')}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function createDashboardPrintHtml(report: DashboardReport) {
  const metricRows = Object.values(report.metrics)
    .map(
      (metric) =>
        `<tr><th>${escapeHtml(metric.label)}</th><td>${escapeHtml(metric.value)}</td><td>${escapeHtml(metric.detail)}</td></tr>`,
    )
    .join('');
  const roadRows = report.roads
    .map(
      (road) =>
        `<tr><td>${escapeHtml(road.address)}</td><td>${escapeHtml(road.cameraId)}</td><td>${road.percentage}%</td></tr>`,
    )
    .join('');
  const fleetRows = report.fleet
    .map(
      (category) =>
        `<tr><td>${escapeHtml(category.label)}</td><td>${category.count}</td><td>${category.percentage}%</td></tr>`,
    )
    .join('');
  const alertRows = report.alerts
    .map(
      (alert) =>
        `<tr><td>${escapeHtml(alert.message)}</td><td>${escapeHtml(alert.time)}</td><td>${alert.severity === 'critical' ? 'Crítica' : 'Atenção'}</td></tr>`,
    )
    .join('');

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>SmartTraffic · Dashboard</title><style>
    @page { margin: 18mm; }
    body { font-family: Arial, sans-serif; color: #181C2B; }
    h1 { margin: 0 0 6px; font-size: 24px; }
    h2 { margin: 22px 0 8px; font-size: 16px; }
    p { color: #5E6477; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th, td { padding: 8px; border-bottom: 1px solid #D9DCE4; text-align: left; }
    th { font-weight: 600; }
    .note { margin-top: 20px; font-size: 10px; }
  </style></head><body>
    <h1>SmartTraffic · Dashboard</h1>
    <p>${escapeHtml(report.updatedAt)} · Dados ilustrativos</p>
    <h2>Indicadores</h2><table>${metricRows}</table>
    <h2>Densidade por via</h2><table>${roadRows}</table>
    <h2>Composição da frota</h2><table>${fleetRows}</table>
    <h2>Alertas recentes</h2><table>${alertRows}</table>
    <p class="note">Dados demonstrativos para visualização da interface. Não representam medições operacionais oficiais.</p>
  </body></html>`;
}
