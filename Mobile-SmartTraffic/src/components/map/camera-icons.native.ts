import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

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

      if (!asset.localUri) {
        throw new Error(`O ícone ${asset.name} não está disponível no dispositivo.`);
      }

      return FileSystem.readAsStringAsync(asset.localUri);
    }),
  );

  return createCameraMarkerIcons(svgDocuments);
}
