export type CameraStatus = 'online' | 'offline' | 'maintenance';

export type Camera = {
  id: string;
  address: string;
  neighborhood: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  status: CameraStatus;
};

export type CameraNetworkSummary = {
  total: number;
  online: number;
  offline: number;
  maintenance: number;
  updatedAt: string;
};
