import Feature from 'ol/Feature';
import Map from 'ol/Map';
import View from 'ol/View';
import {
  DragAndDrop,
  defaults as defaultInteractions,
} from 'ol/interaction';
import {GPX, GeoJSON, IGC, KML, MVT, TopoJSON} from 'ol/format';
import {XYZ, Vector as VectorSource} from 'ol/source';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {createXYZ} from 'ol/tilegrid';
import {Style, Fill, Stroke} from 'ol/style';

// Define a custom MVT format as ol/format/MVT requires an extent

const tileCoordZ = document.getElementById('tileCoordZ');
const tileCoordX = document.getElementById('tileCoordX');
const tileCoordY = document.getElementById('tileCoordY');

class customMVT extends MVT {
  constructor() {
    super({featureClass: Feature});
  }
  readFeatures(source, options) {
    options.extent = createXYZ().getTileCoordExtent([
      parseInt(tileCoordZ.value),
      parseInt(tileCoordX.value),
      parseInt(tileCoordY.value),
    ]);
    return super.readFeatures(source, options);
  }
}

// Define a style for the vector tiles
const vectorTileStyle = new Style({
  fill: new Fill({
    color: 'rgb(0, 65, 185)',
  }),
  stroke: new Stroke({
    color: '#319FD3',
    width: 1,
  }),
});

// Set up map with Drag and Drop interaction

const dragAndDropInteraction = new DragAndDrop({
  formatConstructors: [customMVT, GPX, GeoJSON, IGC, KML, TopoJSON],
});

const map = new Map({
  interactions: defaultInteractions().extend([dragAndDropInteraction]),
  layers: [
    new TileLayer({
      source: new XYZ({
        url: 'tiles/{z}/{x}/{y}.mvt',
        tileGrid: createXYZ({
          minZoom: 0,
          maxZoom: 22 // Adjust maxZoom as needed
        })
      }),
    }),
  ],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 1, // Initial zoom level
    minZoom: 0, // Minimum zoom level
    maxZoom: 22 // Adjust maxZoom as needed
  }),
});

dragAndDropInteraction.on('addfeatures', function (event) {
  const vectorSource = new VectorSource({
    features: event.features,
  });
  map.addLayer(
    new VectorLayer({
      source: vectorSource,
      style: vectorTileStyle, // Apply the style to the vector layer
    }),
  );
  map.getView().fit(vectorSource.getExtent());
});

const displayFeatureInfo = function (pixel) {
  const features = [];
  map.forEachFeatureAtPixel(pixel, function (feature) {
    features.push(feature);
  });
  if (features.length > 0) {
    const info = [];
    let i, ii;
    for (i = 0, ii = features.length; i < ii; ++i) {
      const description =
        features[i].get('name') ||
        features[i].get('_name') ||
        features[i].get('layer');
      if (description) {
        info.push(description);
      }
    }
    document.getElementById('info').innerHTML = info.join(', ') || '&nbsp';
  } else {
    document.getElementById('info').innerHTML = '&nbsp;';
  }
};

map.on('pointermove', function (evt) {
  if (evt.dragging) {
    return;
  }
  displayFeatureInfo(evt.pixel);
});

map.on('click', function (evt) {
  displayFeatureInfo(evt.pixel);
});

// Sample data download

const link = document.getElementById('download');

function download(fullpath, filename) {
  fetch(fullpath)
    .then(function (response) {
      return response.blob();
    })
    .then(function (blob) {
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    });
}

document.getElementById('download-mvt').addEventListener('click', function () {
  const fullpath =
    '/tiles/' +
    tileCoordZ.value +
    '/' +
    tileCoordY.value +
    '/' +
    tileCoordX.value +
    '.pbf';
  const filename =
    tileCoordZ.value + '-' + tileCoordX.value + '-' + tileCoordY.value + '.pbf';
  download(fullpath, filename);
});
