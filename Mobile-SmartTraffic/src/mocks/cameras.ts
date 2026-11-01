import type { Camera, CameraNetworkSummary } from '@/services/contracts/cameras';

export const demoCameras: Camera[] = [
  {
    id: 'CAM-0012',
    address: 'Av. Pref. Jonas Banks Leite',
    neighborhood: 'Centro',
    coordinates: { latitude: -24.49012, longitude: -47.84231 },
    status: 'online',
  },
  {
    id: 'CAM-0008',
    address: 'Praça Beira Rio',
    neighborhood: 'Centro',
    coordinates: { latitude: -24.48732, longitude: -47.83943 },
    status: 'online',
  },
  {
    id: 'CAM-0003',
    address: 'Rua Dom Pedro II',
    neighborhood: 'Vila Nova',
    coordinates: { latitude: -24.49302, longitude: -47.84623 },
    status: 'offline',
  },
  {
    id: 'CAM-0024',
    address: 'Av. Clara Gianotti de Souza',
    neighborhood: 'Vila São Francisco',
    coordinates: { latitude: -24.4963, longitude: -47.83845 },
    status: 'maintenance',
  },
  {
    id: 'CAM-0019',
    address: 'Rua Seis de Setembro',
    neighborhood: 'Centro',
    coordinates: { latitude: -24.48497, longitude: -47.84471 },
    status: 'online',
  },
  {
    id: 'CAM-0006',
    address: 'Rua Nestor Leite',
    neighborhood: 'Vila Nova',
    coordinates: { latitude: -24.49041, longitude: -47.85023 },
    status: 'online',
  },
];

export const demoCameraNetwork: CameraNetworkSummary = {
  total: 48,
  online: 42,
  offline: 4,
  maintenance: 2,
  updatedAt: '14:32',
};
