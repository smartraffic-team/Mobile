import type { DashboardPeriod, DashboardReport } from '@/services/contracts/dashboard';

const todayReport: DashboardReport = {
  period: 'today',
  updatedAt: '26 out 2026 · 14:32',
  metrics: {
    camerasOnline: { label: 'Câmeras online', value: '42/48', detail: '87,5% da rede' },
    vehicles: { label: 'Veículos hoje', value: '18.420', detail: 'Acumulado até 14:32' },
    averageWait: { label: 'Espera média', value: '−27%', detail: 'vs. semáforos fixos' },
    openTickets: { label: 'Chamados abertos', value: '5', detail: '2 de alta prioridade' },
  },
  vehicleFlow: [
    { label: '06h', value: 20 },
    { label: '', value: 150 },
    { label: '08h', value: 900 },
    { label: '', value: 1900 },
    { label: '10h', value: 2250 },
    { label: '', value: 1560 },
    { label: '12h', value: 760 },
    { label: '', value: 500 },
    { label: '14h', value: 700 },
    { label: '', value: 1050 },
    { label: '16h', value: 800 },
    { label: '', value: 1100 },
    { label: '18h', value: 1500 },
    { label: '', value: 2000 },
    { label: '20h', value: 2120 },
    { label: '', value: 1800 },
    { label: '22h', value: 1400 },
  ],
  roads: [
    {
      id: 'road-1',
      address: 'Av. Pref. Jonas Banks Leite',
      cameraId: 'CAM-0012',
      percentage: 92,
      level: 'high',
    },
    {
      id: 'road-2',
      address: 'Rua Dom Pedro II',
      cameraId: 'CAM-0033',
      percentage: 86,
      level: 'high',
    },
    {
      id: 'road-3',
      address: 'Av. Clara Gianotti de Souza',
      cameraId: 'CAM-0021',
      percentage: 72,
      level: 'moderate',
    },
    {
      id: 'road-4',
      address: 'Rua Seiji Sumida',
      cameraId: 'CAM-0007',
      percentage: 48,
      level: 'moderate',
    },
  ],
  fleet: [
    { key: 'cars', label: 'Carros', count: 12710, percentage: 69 },
    { key: 'motorcycles', label: 'Motos', count: 3316, percentage: 18 },
    { key: 'buses', label: 'Ônibus', count: 921, percentage: 5 },
    { key: 'trucks', label: 'Caminhões', count: 1473, percentage: 8 },
  ],
  edgePerformance: {
    latencyMs: 84,
    framesPerSecond: 28,
    detectionAccuracy: 94.6,
    model: 'YOLO / OpenCV',
  },
  trafficLights: { normal: 19, contingency: 3, serialFailure: 2 },
  impact: { minutesSavedPerDay: 1260, kilogramsCo2AvoidedPerDay: 84 },
  alerts: [
    { id: 'alert-1', message: 'CAM-0034 · Câmera offline', time: '14:28', severity: 'critical' },
    { id: 'alert-2', message: 'CAM-0019 · Baixa luz noturna', time: '14:16', severity: 'warning' },
    {
      id: 'alert-3',
      message: 'SEM-0006 · Falha de comunicação serial',
      time: '14:03',
      severity: 'critical',
    },
  ],
  overloadedVehiclePercentage: 2.3,
  overloadedFlowPercentage: 17,
};

const weeklyReport: DashboardReport = {
  ...todayReport,
  period: '7days',
  updatedAt: '26 out 2026 · 14:32',
  metrics: {
    camerasOnline: { label: 'Câmeras online', value: '42/48', detail: '87,5% da rede' },
    vehicles: { label: 'Veículos na semana', value: '126.840', detail: 'Últimos 7 dias' },
    averageWait: { label: 'Espera média', value: '−23%', detail: 'vs. semáforos fixos' },
    openTickets: { label: 'Chamados abertos', value: '5', detail: '2 de alta prioridade' },
  },
  vehicleFlow: [
    { label: 'Seg', value: 14800 },
    { label: 'Ter', value: 16700 },
    { label: 'Qua', value: 18200 },
    { label: 'Qui', value: 17400 },
    { label: 'Sex', value: 20100 },
    { label: 'Sáb', value: 16300 },
    { label: 'Dom', value: 13340 },
  ],
};

export const demoDashboardReports: Partial<Record<DashboardPeriod, DashboardReport>> = {
  today: todayReport,
  '7days': weeklyReport,
};
