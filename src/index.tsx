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

render(<div style={{ fontFamily: 'Roboto' }}>
  <CssBaseline />
  <AppBar position="static" color="primary" style={{ background: "#1A82B6", position: "relative" }}>
    <Toolbar>
      <img src="./img/logo.png" width="64"></img>
      <Typography variant="title" color="inherit" noWrap>
        flatcrawl
    </Typography>
    </Toolbar>
  </AppBar>
  <div style={{ height: "20px" }}></div>
  <App userId={id} /></div>, document.body);
