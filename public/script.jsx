import { useEffect } from "react"

const app = () => {
  useEffect(() => {
    const layer = new deck.DeckLayer({
      "deck.layers": [],
    })    
    
    const mapView = new deck.MapView({
      container: "map", 
      zoom: 5,
      center: [0.11, 52.2],
      map: new deck.ArcGISMap({
        baseMap: "dark-gray-vector",
        layers: [layer],
      })
    })
  }, [])
  return (
    <div id={"map"} style={{width: '100vw', height: '100vh'}}>

    </div>
  )
}

const INITIAL_VIEW_STATE = {
  longitude: -122,
  latitude: 37,
  zoom: 13,
  pitch: 0,
  bearing: 0
}

ReactDOM.render(app(), document.getElementById("app"));