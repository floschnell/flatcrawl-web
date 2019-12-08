import * as React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import flatcrawl from '../content/flatcrawl.md';
import disclaimer from '../content/disclaimer.md';

declare type AppProps = {};

export default class App extends React.Component<AppProps> {
  public state: {
    services: Array<{
      name: string,
      status: boolean,
      endpoint: string,
    }>,
  };

  constructor(props: AppProps) {
    super(props);
    this.state = {
      services: [{
        name: 'isochrones',
        status: null,
        endpoint: 'http://www.floschnell.de:5010/?mode=driving&latitude=48.1550474500845&longitude=11.587284430861475&time=1860',
      },
      {
        name: 'routing',
        status: null,
        endpoint: 'http://floschnell.de:5002/route/v1/walking/11.4583845,48.198914;11.5284255,48.1711413'
      }],
    };
  }

  componentDidMount() {
    const results = this.state.services.map(async service => {
      const response = await fetch(service.endpoint);
      console.log(`state for service ${service.name} is ${response.status}.`)
      return {
        ...service,
        status: response.status >= 200 && response.status < 300,
      };
    });
    Promise.all(results).then(services => {
      console.log("setting new state: ", services);
      this.setState({ services });
    });
  }

  render() {
    const renderServiceStateCard = () =>
      <Card style={{ flex: 1, marginLeft: '20px', marginBottom: '20px' }}>
        <CardContent>
          <h1>
            System Status
          </h1>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Service</TableCell>
                <TableCell align="right">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.services.map(service => (
                <TableRow key={service.name}>
                  <TableCell component="th" scope="row">
                    {service.name}
                  </TableCell>
                  <TableCell align="right">{renderServiceState(service.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>;

    const renderServiceState = (state: boolean) => {
      if (state === null) {
        return 'Evaluating';
      } else if (state === true) {
        return <span style={{ color: 'darkgreen' }}>Available</span>;
      } else {
        return <span style={{ color: 'darkred' }}>Unvailable</span>;
      }
    };

    return <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
      <Card style={{ width: '800px', marginBottom: '20px' }}>
        <CardContent>
          <div dangerouslySetInnerHTML={{ __html: flatcrawl }}></div>
        </CardContent>
      </Card>

      <div style={{ width: '800px', display: 'flex', flexDirection: 'row' }}>
        <Card style={{ flex: 1, marginBottom: '20px' }}>
          <CardContent>
            <div dangerouslySetInnerHTML={{ __html: disclaimer }}></div>
          </CardContent>
        </Card>
        {renderServiceStateCard()}
      </div>
    </div >;
  }
}