import { useEffect, useState } from 'react'
import {Map} from '@esri/react-arcgis'
import {loadArcGISModules} from '@deck.gl/arcgis';

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
  useEffect(() => {
    
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
          layers={[]}
        />
      </Map>
    </div>
  );
}

export default App;
