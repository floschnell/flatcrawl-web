import * as React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import CardHeader from '@material-ui/core/CardHeader';
import TextField from '@material-ui/core/TextField';
import db from "../database";
import withStyles from '@material-ui/core/styles/withStyles';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import { Map, Marker, Popup, TileLayer, Polygon } from 'react-leaflet';
import { produce } from "immer";
import intersect from "@turf/intersect";
import { Feature, Polygon as TurfPoly, MultiPolygon } from "@turf/helpers";
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { point, featureCollection } from "@turf/helpers";
import bbox from "@turf/bbox";
import { icon } from 'leaflet';

const icons: { [key: string]: any } = {
  bicycling: icon({
    iconUrl: 'img/bike_pin.png',
    iconSize: [32, 37],
    iconAnchor: [16, 37],
    popupAnchor: [0, -32]
  }),
  driving: icon({
    iconUrl: 'img/car_pin.png',
    iconSize: [32, 37],
    iconAnchor: [16, 37],
    popupAnchor: [0, -32]
  }),
  walking: icon({
    iconUrl: 'img/walk_pin.png',
    iconSize: [32, 37],
    iconAnchor: [16, 37],
    popupAnchor: [0, -32]
  }),
};

declare type SearchProps = {
  id: string,
};

declare type Location = {
  geo: {
    lat: number,
    lng: number,
  },
  name: string,
  transport: string,
  limit?: number,
  data?: Feature<TurfPoly, MultiPolygon>,
};

declare type SearchState = {
  map: {
    center: [number, number],
    zoom: number,
    bounds: [[number, number], [number, number]],
  },
  pending: boolean,
  modified: boolean,
  chats: any,
  user: any,
  city: string,
  locations: Location[],
  limits: {
    rent: {
      min: number,
      max: number,
    },
    rooms: {
      min: number,
      max: number,
    },
    squaremeters: {
      min: number,
      max: number,
    }
  }
}

const StyledCardHeader = withStyles(theme => ({
  root: {
    backgroundColor: theme.palette.grey[200],
  }
}))(CardHeader);

const BigTextField = withStyles(theme => ({
  root: {
    flexGrow: 1,
  }
}))(TextField);

export default class Search extends React.Component<SearchProps, SearchState> {

  private refreshLocation$: Subject<number> = new Subject();

  constructor(props: SearchProps) {
    super(props);
    this.state = {
      map: {
        zoom: 5,
        center: [51.071174, 10.464991],
        bounds: null,
      },
      modified: false,
      pending: false,
      city: null,
      locations: [],
      chats: null,
      user: null,
      limits: {
        rent: {
          min: null,
          max: null,
        },
        rooms: {
          min: null,
          max: null,
        },
        squaremeters: {
          min: null,
          max: null,
        }
      }
    };

    this.refreshLocation$.pipe(
      debounceTime(500),
    ).subscribe(async (e) => {
      this.requestTravelArea(this.state.locations[e], e);
    });
  }

  componentDidMount() {
    this.loadSearch();
  }

  render() {
    const number = this.props.id.split("-")[1];

    return <Card raised={true}>
      <StyledCardHeader title={`Search #${number}`}></StyledCardHeader>
      <CardContent>
        <FormControl>
          <InputLabel shrink htmlFor="city">
            City
          </InputLabel>
          <Select
            input={<Input id="city"></Input>}
            value={this.state.city}
            onChange={null}
            displayEmpty
          >
            <MenuItem value="Munich">München</MenuItem>
            <MenuItem value="Augsburg">Augsburg</MenuItem>
            <MenuItem value="Wuerzburg">Würzburg</MenuItem>
          </Select>
        </FormControl>
        {this.renderLimits("rent", this.state.limits.rent)}
        {this.renderLimits("rooms", this.state.limits.rooms)}
        {this.renderLimits("squaremeters", this.state.limits.squaremeters)}
        {this.renderLocations(this.state.locations)}
      </CardContent>
      <CardActions>
        <Button onClick={async () => {
          await this.setState(produce(this.state, (draft) => {
            draft.locations = draft.locations.concat([{
              data: null,
              geo: {
                lat: this.state.map.center[0] + 0.01,
                lng: this.state.map.center[1] + 0.01,
              },
              limit: null,
              name: "New Location",
              transport: "bicycling",
            }]);
            draft.modified = true;
          }));
          this.adjustMap();
        }} variant="contained" size="small" color="secondary" aria-label="Save">
          <Icon>add_circle_icon</Icon> Add Location
        </Button>
        {this.state.modified ? <Button disabled={this.state.pending} onClick={(e) => this.saveSearch()} variant="contained" size="small" color="secondary" aria-label="Save">
          <Icon>save_icon</Icon>
          Save
        </Button> : null}
        {this.state.modified ? <Button disabled={this.state.pending} onClick={(e) => this.loadSearch()} variant="contained" size="small" color="secondary" aria-label="Discard Changes">
          <Icon>undo_icon</Icon>
          Discard Changes
        </Button> : null}
      </CardActions>
    </Card>;
  }

  private requestTravelArea(location: Location, index: number): void {
    if (location.limit != null) {
      const url = `http://${window.location.hostname}:5010?mode=${location.transport}&latitude=${location.geo.lat}&longitude=${location.geo.lng}&time=${location.limit * 60}`;
      fetch(url)
        .then((result) => result.json())
        .then((data) => this.setState(produce(this.state, (draft) => { draft.locations[index].data = data })));
    }
  }

  private renderLocations(locations: Location[]): JSX.Element {
    if (locations.length <= 0) {
      return <div />;
    }

    let renderedLocations = locations.map((location, i) =>
      <div style={{ marginTop: "10px", display: "flex", justifyContent: "stretch" }}>
        <BigTextField onChange={(e) => this.setState(produce(this.state, (draft) => {
          draft.locations[i].name = e.target.value;
          draft.modified = true;
        }))} style={{ flexGrow: 2 }} inputProps={{ size: 20 }} value={location.name} label="Location Name" id={`location_${i}`} type="text" />
        <FormControl style={{ flexGrow: 1, width: 120 }}>
          <InputLabel shrink htmlFor="transport">
            Mode of Transport
          </InputLabel>
          <Select
            input={<Input id="transport"></Input>}
            value={location.transport}
            onChange={async (e) => {
              await this.setState(produce(this.state, (draft) => {
                draft.locations[i].transport = e.target.value;
                draft.modified = true;
              }));
              this.refreshLocation$.next(i);
            }}
            displayEmpty
          >
            <MenuItem value="bicycling">Bike</MenuItem>
            <MenuItem value="driving">Car</MenuItem>
            <MenuItem value="walking">Foot</MenuItem>
          </Select>
        </FormControl>
        <BigTextField onChange={async (e) => {
          await this.setState(produce(this.state, (draft) => {
            draft.locations[i].limit = Search.parseNumber(e.target.value);
            draft.modified = true;
          }));
          this.refreshLocation$.next(i);
        }} style={{ flexGrow: 1 }} value={location.limit || ""} label="Time Limit in Minutes" id={`time_limit_${i}`} type="number" />
        <IconButton onClick={async () => {
          await this.setState(produce(this.state, (draft) => {
            draft.locations = locations.filter((location, n) => n !== i);
            draft.modified = true;
          }));
          this.adjustMap();
        }} color="secondary" aria-label="Remove Location"><Icon>remove_circle_icon</Icon></IconButton>
      </div>
    );

    return <div>
      <h3 style={{ fontFamily: "Roboto", fontWeight: 500 }}>Locations</h3>
      {renderedLocations}
      {locations.length > 0 ? this.renderLocationsMap(locations) : null}
    </div>;
  }

  private renderLocationsMap(locations: Location[]): JSX.Element {

    const convertCoords = (coords: any): any => {
      if (coords.length <= 0) return [];
      if (Array.isArray(coords[0])) {
        return coords.map((sub: any) => convertCoords(sub));
      } else {
        return ({
          lat: coords[1] as number,
          lng: coords[0] as number,
        });
      }
    }

    const polies = locations
      .map(location => location.data)
      .filter(data => data != null)
      .map(data => <Polygon color="#666666" fillColor="none" positions={convertCoords(data.geometry.coordinates)}></Polygon>)

    const poly = locations.filter(l => l.limit != null).length === polies.length ? locations
      .map(location => location.data)
      .filter(data => data != null)
      .reduce((prev, cur) => prev == null ? cur : intersect(prev, cur), null) : null;

    return <div style={{ marginTop: "20px", width: "100%", height: "300px", display: "flex" }}>
      <Map style={{ flex: 1 }} center={this.state.map.center} zoom={this.state.map.zoom} bounds={this.state.map.bounds} >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
        />
        {this.getMarkers()}
        <Polygon color="#f50057" positions={convertCoords(poly == null ? [] : poly.geometry.coordinates)}></Polygon>
        {polies}
      </Map>
    </div>
  }

  private getMarkers() {
    return this.state.locations.map((location, index) => <Marker onMove={(e: any) => {
      if (e.latlng.lat !== this.state.locations[index].geo.lat || e.latlng.lng !== this.state.locations[index].geo.lng) {
        this.setState(produce(this.state, (draft) => {
          draft.locations[index].geo = e.latlng;
          draft.modified = true;
        }));
        this.refreshLocation$.next(index);
      }
    }} draggable icon={icons[location.transport]} position={[parseFloat(location.geo.lat.toString()), parseFloat(location.geo.lng.toString())]}>
      <Popup>{location.name}</Popup>
    </Marker>);
  }

  private renderLimits(property: "rent" | "rooms" | "squaremeters", limits: { min: number, max: number }) {
    return <div style={{ marginTop: "10px", display: "flex", justifyContent: "stretch" }}>
      <BigTextField onChange={(e) => this.setState(produce(this.state, (draft) => {
        draft.limits[property].min = Search.parseNumber(e.target.value);
        draft.modified = true;
      }))} inputProps={{ size: 20 }} InputLabelProps={{ shrink: limits.min != null }} value={limits.min || ""} label={`Minimum ${property}`} id={`min_${property}`} type="number" />
      &nbsp;
      <BigTextField onChange={(e) => this.setState(produce(this.state, (draft) => {
        draft.limits[property].max = Search.parseNumber(e.target.value);
        draft.modified = true;
      }))} inputProps={{ size: 50 }} InputLabelProps={{ shrink: limits.max != null }} value={limits.max || ""} label={`Maximum ${property}`} id={`max_${property}`} type="number" />
    </div>
  }

  private async loadSearch() {
    await this.setState(produce(this.state, (draft) => { draft.pending = true; }));
    const snapshot = await db.ref(`/searches/${this.props.id}`).once("value");
    const search = snapshot.val();
    await this.setState(produce(this.state, (draft) => {
      draft.modified = false;
      draft.limits = search.limits;
      draft.locations = (search.locations || []).map((location: any) => ({
        ...location,
        limit: location.limit || null,
        geo: {
          lat: parseFloat(location.geo.lat.toString()),
          lng: parseFloat(location.geo.lng.toString()),
        },
      }));
      draft.chats = search.chats;
      draft.user = search.user;
      draft.city = search.city;
      draft.pending = false;
    }));
    await this.adjustMap();
    this.state.locations
      .forEach(this.requestTravelArea.bind(this));
  }

  private async adjustMap() {
    return this.setState(produce(this.state, (draft) => {
      if (draft.locations.length >= 1) {
        const [minLng, minLat, maxLng, maxLat] = bbox(featureCollection<any>(draft.locations.map(l => point([l.geo.lng as number, l.geo.lat as number]))));
        if (minLat === maxLat || minLng === maxLng) {
          draft.map.center = [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
          draft.map.zoom = 12;
          draft.map.bounds = null;
        } else {
          draft.map.center = [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
          draft.map.zoom = 5;
          draft.map.bounds = [[minLat, minLng], [maxLat, maxLng]];
        }
      } else if (draft.locations.length > 1) {
        const [minLng, minLat, maxLng, maxLat] = bbox(featureCollection<any>(draft.locations.map(l => point([l.geo.lng as number, l.geo.lat as number]))));
        draft.map.bounds = [[minLat, minLng], [maxLat, maxLng]];
      }
    }));
  }

  private async saveSearch() {
    await this.setState(produce(this.state, (draft) => { draft.pending = true; }));

    const toSave = {
      locations: this.state.locations.map((location) => ({
        geo: {
          lat: location.geo.lat.toString(),
          lng: location.geo.lng.toString(),
        },
        limit: location.limit,
        name: location.name,
        transport: location.transport,
      })),
      city: this.state.city,
      limits: this.state.limits,
      chats: this.state.chats,
      user: this.state.user,
    };
    console.log("saving:", toSave);
    await db.ref(`/searches/${this.props.id}`).update(toSave);

    await this.loadSearch();

    await this.setState(produce(this.state, (draft) => {
      draft.pending = false;
      draft.modified = false;
    }));
  }

  private static parseNumber(numberString: string): number {
    if (numberString.length === 0) {
      return null;
    } else if (isNaN(parseInt(numberString))) {
      console.log("not a number!");
      return null;
    } else {
      console.log("number ...");
      return parseInt(numberString);
    }
  }
}
