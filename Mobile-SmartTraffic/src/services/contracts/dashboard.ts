export type DashboardPeriod = 'today' | '7days' | '30days';

export type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
};

export type VehicleFlowPoint = {
  label: string;
  value: number;
};

export type RoadDensity = {
  id: string;
  address: string;
  cameraId: string;
  percentage: number;
  level: 'high' | 'moderate';
};

export type FleetCategory = {
  key: 'cars' | 'motorcycles' | 'buses' | 'trucks';
  label: string;
  count: number;
  percentage: number;
};

export type DashboardAlert = {
  id: string;
  message: string;
  time: string;
  severity: 'warning' | 'critical';
};

export type DashboardReport = {
  period: DashboardPeriod;
  updatedAt: string;
  metrics: {
    camerasOnline: DashboardMetric;
    vehicles: DashboardMetric;
    averageWait: DashboardMetric;
    openTickets: DashboardMetric;
  };
  vehicleFlow: VehicleFlowPoint[];
  roads: RoadDensity[];
  fleet: FleetCategory[];
  edgePerformance: {
    latencyMs: number;
    framesPerSecond: number;
    detectionAccuracy: number;
    model: string;
  };
  trafficLights: {
    normal: number;
    contingency: number;
    serialFailure: number;
  };
  impact: {
    minutesSavedPerDay: number;
    kilogramsCo2AvoidedPerDay: number;
  };
  alerts: DashboardAlert[];
  overloadedVehiclePercentage: number;
  overloadedFlowPercentage: number;
};
