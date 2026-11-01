export type CameraMarkerIcons = {
  active: string;
  disabled: string;
  selected: string;
  maintenance: string;
};

export function createCameraMarkerIcons(svgDocuments: readonly string[]): CameraMarkerIcons {
  const [active, disabled, selected] = svgDocuments;

  if (!active || !disabled || !selected) {
    throw new Error('Os ícones de câmera do mapa estão incompletos.');
  }

  const toDataUri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

  return {
    active: toDataUri(active),
    disabled: toDataUri(disabled),
    selected: toDataUri(selected),
    maintenance: toDataUri(active.replace(/#80DBA7/g, '#F59E42')),
  };
}
