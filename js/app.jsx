var React = require('react');
var ReactDOM = require('react-dom');
var LE = require('leaflet-editable');
var L = require('leaflet');
var RL = require('react-leaflet');

var Util = require('./util.js');

const attribution = '<a href="https://dev3map.github.io">dev3map.github.io</a>';
const tilesUrl = 'https://raw.githubusercontent.com/dev3map/tiles/master/world/';
const claimsUrl = 'data/claims.json';

var mcCRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, 1, 0)
});

class Centered extends React.Component {
  render() {
    return (
      <div className='center-outer full'>
      <div className='center-middle'>
      <div className='center-inner'>
        {this.props.children}
      </div></div></div>);
  }
}

class CoordsDisplay extends React.Component {
  render() {
    const [z, x] = Util.intCoords(this.props.cursor);
    return <div className='coords-display control-box leaflet-control leaflet-control-layers'>
      {'X ' + x + ' ' + z + ' Z'}</div>;
  }
}

function EditablePolygonClaim(claim, key) {
  var poly;
  return <RL.Polygon key={key}
        {...claim}
        color='#fff'
        fillColor={claim.color}
        ref={r => {if (r) poly = r.leafletElement}}
        >
      <RL.Popup><span>
        {claim.name}
        <br />
        <a onClick={e => {
            if (poly) {
              Util.printShape(claim.name, poly._latlngs);
              poly.toggleEdit();
            }
          }}>
          edit</a>
      </span></RL.Popup>
    </RL.Polygon>;
}

class McMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: Util.hashToView(location.hash),
      cursorPos: L.latLng(0,0),
      claims: [],
    };
  }

  componentWillMount() {
    Util.getJSON(claimsUrl, claims => {
      this.setState({claims: claims});
    });
  }

  onmoveend(o) {
    const stateUrl = '#' + Util.viewToHash(o.target);
    history.replaceState({}, document.title, stateUrl);
  }

  onmousemove(o) {
    this.setState({cursorPos: o.latlng});
  }

  onMapRef(ref) {
    if (ref && !this.map) {
      var map = this.map = ref.leafletElement;

      map.on('editable:drawing:click', (e) => Util.printShape("new shape", e.layer._latlngs));
      map.on('editable:drawing:end', (e) => Util.printShape("new shape", e.layer._latlngs));

      L.NewPolygonControl = L.Control.extend({
        options: {
          position: 'topleft'
        },
        onAdd: function (map) {
          var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar'),
          link = L.DomUtil.create('a', '', container);
          link.href = '#';
          link.title = 'Create a new polygon';
          link.innerHTML = '▱';
          L.DomEvent.on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', () => map.editTools.startPolygon());
          return container;
        }
      });
      map.addControl(new L.NewPolygonControl());
    }
  }

  render() {
    var tileBounds = L.latLngBounds([-5120, -5120], [5120, 5120]);
    var borderBounds = L.latLngBounds([-5000, -5000], [5000, 5000]);
    var minZoom = -4;
    return (
      <RL.Map
          className="map"
          ref={this.onMapRef.bind(this)}
          crs={mcCRS}
          maxBounds={tileBounds}
          center={Util.xz(this.state.view.x, this.state.view.z)}
          zoom={this.state.view.zoom}
          maxZoom={5}
          minZoom={minZoom}
          onmoveend={this.onmoveend.bind(this)}
          onmousemove={this.onmousemove.bind(this)}
          editable={true}
          >

        <RL.TileLayer
          attribution={attribution}
          url={tilesUrl + 'z{z}/{x},{y}.png'}
          errorTileUrl={'img/no-tile.png'}
          tileSize={256}
          bounds={tileBounds}
          minZoom={minZoom}
          maxNativeZoom={0}
          continuousWorld={true}
          />

        <CoordsDisplay cursor={this.state.cursorPos} />

        <RL.LayersControl position='topright'>

          { this.state.claims.length <= 0 ? null :
            <RL.LayersControl.Overlay name='claims' checked={true}>
              <RL.LayerGroup>
                { this.state.claims.map(EditablePolygonClaim) }
              </RL.LayerGroup>
            </RL.LayersControl.Overlay>
          }

          <RL.LayersControl.Overlay name='world border' checked={true}>
            <RL.Rectangle
              bounds={borderBounds}
              color='#ff8888'
              fill={false}
              />
          </RL.LayersControl.Overlay>

          <RL.LayersControl.Overlay name='world center'>
            <RL.Marker position={[0, 0]} title='world center' />
          </RL.LayersControl.Overlay>

        </RL.LayersControl>
      </RL.Map>
    );
  }
}

ReactDOM.render(
  <McMap />,
  document.getElementById('map-root')
);
