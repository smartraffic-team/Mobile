import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { AppColors } from '@/constants/theme';

import { loadCameraMarkerIcons } from './camera-icons.native';
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
  const webViewRef = useRef<WebView<unknown>>(null);
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
    webViewRef.current?.injectJavaScript(
      `window.handleSmartTrafficCommand(${JSON.stringify(command)});true;`,
    );
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

  function handleMessage(event: WebViewMessageEvent) {
    dispatchLeafletMessage(event.nativeEvent.data, onInteraction, onLoadError, handleMapReady);
  }

  return (
    <View style={styles.container}>
      {mapDocumentRef.current ? (
        <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(140)} style={styles.map}>
          <WebView<unknown>
            ref={webViewRef}
            accessibilityLabel="Mapa demonstrativo de câmeras de trânsito"
            javaScriptEnabled
            onError={(event) => onLoadError(event.nativeEvent.description)}
            onMessage={handleMessage}
            onShouldStartLoadWithRequest={(request) => request.url === 'about:blank'}
            originWhitelist={['*']}
            scrollEnabled={false}
            source={{ html: mapDocumentRef.current }}
            style={styles.webView}
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
  webView: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
});
