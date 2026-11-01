import type { Camera } from '@/services/contracts/cameras';
import type { MapInteraction } from './leaflet-document';

export type LeafletMapCommand =
  | { type: 'zoom-in' }
  | { type: 'zoom-out' }
  | { type: 'recenter' }
  | { type: 'retry' }
  | { type: 'focus-camera'; cameraId: string }
  | { type: 'select-camera'; cameraId: string | null }
  | { type: 'replace-cameras'; cameras: Camera[] };

export type LeafletMapHandle = {
  sendCommand: (command: LeafletMapCommand) => void;
};

export type LeafletMapProps = {
  cameras: Camera[];
  selectedCameraId: string | null;
  onInteraction: (interaction: MapInteraction) => void;
  onLoadError: (message: string) => void;
  onReady: () => void;
};
