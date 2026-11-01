import { AppColors, MapCenter } from '@/constants/theme';
import type { Camera } from '@/services/contracts/cameras';

import type { CameraMarkerIcons } from './camera-icon-utils';

export type MapInteraction =
  | { type: 'ready' }
  | { type: 'error'; message: string }
  | { type: 'camera-selected'; cameraId: string };

type MapCamera = Pick<Camera, 'id' | 'address' | 'coordinates' | 'status'>;

const LEAFLET_VERSION = '1.9.4';
const DEFAULT_CENTER = MapCenter;

function escapeScriptData(data: string) {
  return data
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function createLeafletDocument(
  cameras: Camera[],
  selectedCameraId: string | null,
  icons: CameraMarkerIcons,
) {
  const mapCameras: MapCamera[] = cameras.map((camera) => ({
    id: camera.id,
    address: camera.address,
    coordinates: camera.coordinates,
    status: camera.status,
  }));
  const camerasJson = escapeScriptData(JSON.stringify(mapCameras));
  const selectedCameraJson = escapeScriptData(JSON.stringify(selectedCameraId));
  const iconsJson = escapeScriptData(JSON.stringify(icons));

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css">
<style>
html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; background: ${AppColors.background}; }
.leaflet-container { background: ${AppColors.background}; font-family: sans-serif; }
.leaflet-control-attribution { background: ${AppColors.backgroundElement}dd !important; color: ${AppColors.textSecondary} !important; font-size: 10px !important; }
.leaflet-control-attribution a { color: ${AppColors.text} !important; }
.leaflet-marker-icon { border: 0; background: transparent; }
.leaflet-tooltip { padding: 4px 8px; border: 0; border-radius: 4px; background: ${AppColors.background}; color: ${AppColors.primary}; box-shadow: none; font-size: 12px; }
.leaflet-tooltip:before { display: none; }
</style>
<script>window.reportMapError=function(){var m={type:'error',message:'Não foi possível carregar o mapa. Verifique a conexão e tente novamente.'};if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(JSON.stringify(m))}else{window.parent.postMessage(JSON.stringify(m),'*')}}</script>
<script src="https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js" onerror="window.reportMapError()"></script>
</head>
<body>
<div id="map" role="application" aria-label="Mapa demonstrativo de câmeras de trânsito de Registro"></div>
<script>
(function(){
  if(!window.L){window.reportMapError();return}
  var initialCameras=${camerasJson};
  var selectedCameraId=${selectedCameraJson};
  var markerIcons=${iconsJson};
  var cameraMarkers={};
  var hasLoadedTiles=false;
  var hasReportedError=false;
  var center=[${DEFAULT_CENTER.latitude},${DEFAULT_CENTER.longitude}];
  var map=L.map('map',{zoomControl:false,attributionControl:true,preferCanvas:true}).setView(center,16);
  var attribution='Tiles &copy; Esri &mdash; Esri, HERE, Garmin, (c) OpenStreetMap contributors, and GIS user community';
  var tiles=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',{
    maxZoom:19,
    maxNativeZoom:16,
    attribution:attribution
  }).addTo(map);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',{
    maxZoom:19,
    maxNativeZoom:16,
    attribution:''
  }).addTo(map);
  function send(message){
    var data=JSON.stringify(message);
    if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(data)}
    else{window.parent.postMessage(data,'*')}
  }
  function iconFor(camera){
    var url=    camera.id===selectedCameraId?markerIcons.selected:
    camera.status==='offline'?markerIcons.disabled:
    camera.status==='maintenance'?markerIcons.maintenance:markerIcons.active;
    return L.icon({iconUrl:url,iconSize:[44,44],iconAnchor:[22,22],tooltipAnchor:[0,-22]});
  }
  function removeMarkers(){
    Object.keys(cameraMarkers).forEach(function(id){
      map.removeLayer(cameraMarkers[id]);
    });
    cameraMarkers={};
  }
  function drawMarkers(cameras){
    removeMarkers();
    cameras.forEach(function(camera){
      var marker=L.marker([camera.coordinates.latitude,camera.coordinates.longitude],{icon:iconFor(camera)});
      marker.on('click',function(){
        map.flyTo(marker.getLatLng(),17,{duration:0.45});
        selectedCameraId=camera.id;
        Object.keys(cameraMarkers).forEach(function(id){
          cameraMarkers[id].setIcon(iconFor(cameraMarkers[id].smartTrafficCamera));
          cameraMarkers[id].closeTooltip();
        });
        showTooltip(marker,camera.id);
        send({type:'camera-selected',cameraId:camera.id});
      });
      marker.smartTrafficCamera=camera;
      cameraMarkers[camera.id]=marker.addTo(map);
      if(camera.id===selectedCameraId){
        showTooltip(marker,camera.id);
      }
    });
  }
  function showTooltip(marker,label){
    if(marker.getTooltip()){
      marker.setTooltipContent(label);
    }else{
      marker.bindTooltip(label,{permanent:true,direction:'bottom',offset:[0,12]});
    }
    marker.openTooltip();
  }
  drawMarkers(initialCameras);
  tiles.on('tileload',function(){
    if(!hasLoadedTiles){
      hasLoadedTiles=true;
      send({type:'ready'});
      setTimeout(function(){map.invalidateSize()},100);
    }
  });
  setTimeout(function(){
    if(!hasLoadedTiles&&!hasReportedError){
      hasReportedError=true;
      window.reportMapError();
    }
  },12000);
  window.handleSmartTrafficCommand=function(command){
    if(!command){return}
    if(command.type==='zoom-in'){map.zoomIn()}
    else if(command.type==='zoom-out'){map.zoomOut()}
    else if(command.type==='recenter'){map.flyTo(center,16,{duration:0.45})}
    else if(command.type==='focus-camera'){
      var marker=cameraMarkers[command.cameraId];
      if(marker){marker.fire('click')}
    }else if(command.type==='select-camera'){
      selectedCameraId=command.cameraId||null;
      Object.keys(cameraMarkers).forEach(function(id){
        var marker=cameraMarkers[id];
        marker.setIcon(iconFor(marker.smartTrafficCamera));
        marker.closeTooltip();
        if(id===selectedCameraId){
          showTooltip(marker,id);
        }
      });
    }else if(command.type==='replace-cameras'){
      drawMarkers(command.cameras||[]);
    }else if(command.type==='retry'){
      hasLoadedTiles=false;
      hasReportedError=false;
      tiles.redraw();
      map.invalidateSize();
      setTimeout(function(){
        if(!hasLoadedTiles&&!hasReportedError){
          hasReportedError=true;
          window.reportMapError();
        }
      },12000);
    }
  };
  window.addEventListener('message',function(event){
    if(event.source!==window.parent||typeof event.data!=='string'){return}
    try{
      window.handleSmartTrafficCommand(JSON.parse(event.data));
    }catch{
      window.reportMapError();
    }
  });
})();
</script>
</body>
</html>`;
}
