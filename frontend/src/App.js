import { useEffect, useState } from 'react'
import {Map} from '@esri/react-arcgis'
import {loadArcGISModules} from '@deck.gl/arcgis';
import { GeoJsonLayer } from '@deck.gl/layers'
import './App.css'

const INITIAL_VIEW_STATE = {
  longitude: -122,
  latitude: 37,
  zoom: 13,
  pitch: 0,
  bearing: 0
}

function DeckGLLayer(props) {
  const [layer, setLayer] = useState(null);

  useEffect(() => {
    let deckLayer;
    loadArcGISModules().then(({DeckLayer}) => {
      deckLayer = new DeckLayer({});
      setLayer(deckLayer);
      props.map.add(deckLayer);
    });

    // clean up
    return () => deckLayer && props.map.remove(deckLayer);
  }, []);

  if (layer) {
    layer.deck.set(props);
  }

  return null;
}

function App() {
  const [layers, setLayers] = useState([])

  useEffect(() => {
    fetch('/mapData')
    .then(res => res.json())
    .then(data => {
      let newLayers = [new GeoJsonLayer({
        id: 'fires',
        data: '/mapData',
        // Styles
        filled: true,
        pointRadiusMinPixels: 2,
        pointRadiusScale: 2000,
        getPointRadius: 11,
        getFillColor: [200, 0, 80, 180],
      })]
      setLayers([...newLayers])
    })

  }, [])

  return (
    <div style={{width: '100vw', height: '100vh'}}>
      <Map
        mapProperties={{basemap: 'dark-gray-vector'}}
        viewProperties={{
          center: [-100.119167, 40.205276],
          zoom: 4
        }}
      >
        <DeckGLLayer
          layers={layers}
        />
      </Map>

      <div className="mapContainer">
gy
      </div>
    </div>
  );
}

export default App;
