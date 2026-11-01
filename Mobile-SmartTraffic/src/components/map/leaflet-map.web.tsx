import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { AppColors } from '@/constants/theme';

import { loadCameraMarkerIcons } from './camera-icons.web';
import { createLeafletDocument } from './leaflet-document';
import type {
  LeafletMapCommand,
  LeafletMapHandle,
  LeafletMapProps,
} from './leaflet-map.types';
import { dispatchLeafletMessage } from './map-messages';

export const LeafletMap = forwardRef<LeafletMapHandle, LeafletMapProps>(function LeafletMap(
  { cameras, selectedCameraId, onInteraction, onLoadError, onReady },
  ref,
) {
  const [icons, setIcons] = useState<Awaited<ReturnType<typeof loadCameraMarkerIcons>> | null>(
    null,
  );
  const frameRef = useRef<HTMLIFrameElement>(null);
  const mapReadyRef = useRef(false);
  const latestMapPropsRef = useRef({ cameras, selectedCameraId });
  const previousMapPropsRef = useRef({ cameras, selectedCameraId });
  latestMapPropsRef.current = { cameras, selectedCameraId };
  const mapDocumentRef = useRef<string | null>(null);

  if (icons && !mapDocumentRef.current) {
    mapDocumentRef.current = createLeafletDocument(cameras, selectedCameraId, icons);
  }

  useEffect(() => {
    let active = true;

    loadCameraMarkerIcons()
      .then((loadedIcons) => {
        if (active) setIcons(loadedIcons);
      })
      .catch((error: unknown) => {
        if (active) {
          onLoadError(
            error instanceof Error ? error.message : 'Não foi possível carregar os ícones do mapa.',
          );
        }
      });

    return () => {
      active = false;
    };
  }, [onLoadError]);

  const sendCommand = useCallback((command: LeafletMapCommand) => {
    frameRef.current?.contentWindow?.postMessage(JSON.stringify(command), '*');
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      sendCommand,
    }),
    [sendCommand],
  );

  useEffect(() => {
    if (!mapReadyRef.current) return;

    const previousMapProps = previousMapPropsRef.current;
    if (previousMapProps.cameras !== cameras) {
      sendCommand({ type: 'replace-cameras', cameras });
    }
    if (previousMapProps.selectedCameraId !== selectedCameraId) {
      sendCommand({ type: 'select-camera', cameraId: selectedCameraId });
    }
    previousMapPropsRef.current = { cameras, selectedCameraId };
  }, [cameras, selectedCameraId, sendCommand]);

  const handleMapReady = useCallback(() => {
    mapReadyRef.current = true;
    const previousMapProps = previousMapPropsRef.current;
    const latestMapProps = latestMapPropsRef.current;
    if (previousMapProps.cameras !== latestMapProps.cameras) {
      sendCommand({ type: 'replace-cameras', cameras: latestMapProps.cameras });
    }
    if (previousMapProps.selectedCameraId !== latestMapProps.selectedCameraId) {
      sendCommand({ type: 'select-camera', cameraId: latestMapProps.selectedCameraId });
    }
    previousMapPropsRef.current = latestMapProps;
    onReady();
  }, [onReady, sendCommand]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== frameRef.current?.contentWindow || typeof event.data !== 'string') {
        return;
      }

      dispatchLeafletMessage(event.data, onInteraction, onLoadError, handleMapReady);
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMapReady, onInteraction, onLoadError]);

  return (
    <View style={styles.container}>
      {mapDocumentRef.current ? (
        <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(140)} style={styles.map}>
          <iframe
            ref={frameRef}
            aria-label="Mapa demonstrativo de câmeras de trânsito"
            title="Mapa de câmeras de trânsito de Registro"
            srcDoc={mapDocumentRef.current}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </Animated.View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: AppColors.background,
  },
  map: {
    flex: 1,
  },
});
