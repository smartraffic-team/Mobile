import type { MapInteraction } from '@/components/map/leaflet-document';

export function dispatchLeafletMessage(
  value: string,
  onInteraction: (interaction: MapInteraction) => void,
  onLoadError: (message: string) => void,
  onReady: () => void,
) {
  let message: unknown;

  try {
    message = JSON.parse(value);
  } catch {
    onLoadError('O mapa retornou uma resposta inválida. Tente carregá-lo novamente.');
    return;
  }

  if (!message || typeof message !== 'object' || !('type' in message)) {
    onLoadError('O mapa retornou uma resposta inválida. Tente carregá-lo novamente.');
    return;
  }

  if (message.type === 'ready') {
    onReady();
  } else if (message.type === 'error' && 'message' in message && typeof message.message === 'string') {
    onLoadError(message.message);
  } else if (
    message.type === 'camera-selected' &&
    'cameraId' in message &&
    typeof message.cameraId === 'string'
  ) {
    onInteraction({ type: 'camera-selected', cameraId: message.cameraId });
  }
}
