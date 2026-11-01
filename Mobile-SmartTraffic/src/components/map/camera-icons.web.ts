import { Asset } from 'expo-asset';

import { createCameraMarkerIcons } from './camera-icon-utils';
import type { CameraMarkerIcons } from './camera-icon-utils';

const cameraIconModules = [
  require('../../../assets/Assets/camera-ativa.svg'),
  require('../../../assets/Assets/camera-desativada.svg'),
  require('../../../assets/Assets/camera-selecionada.svg'),
];

export async function loadCameraMarkerIcons(): Promise<CameraMarkerIcons> {
  const assets = cameraIconModules.map((moduleId) => Asset.fromModule(moduleId));
  const svgDocuments = await Promise.all(
    assets.map(async (asset) => {
      await asset.downloadAsync();
      const response = await fetch(asset.localUri ?? asset.uri);

      if (!response.ok) {
        throw new Error(`Não foi possível carregar o ícone ${asset.name}.`);
      }

      return response.text();
    }),
  );

  return createCameraMarkerIcons(svgDocuments);
}
