import * as React from 'react';
import App from './components/App';
import { render } from 'react-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CssBaseline from '@material-ui/core/CssBaseline';
import "leaflet";

const url_string = window.location.href;
const url = new URL(url_string);
const id = parseInt(url.searchParams.get("id"));

render(<div>
  <CssBaseline />
  <AppBar position="static" color="primary" style={{ position: "relative" }}>
    <Toolbar>
      <Typography variant="title" color="inherit" noWrap>
        FlatCrawl
    </Typography>
    </Toolbar>
  </AppBar>
  <div style={{ height: "20px" }}></div>
  <App userId={id} /></div>, document.body);
