import * as React from 'react';
import db from "../database";
import Search from './Search';
import Grid from '@material-ui/core/Grid';

declare type AppProps = {
  userId: number,
};

export default class App extends React.Component<AppProps> {
  public state: {
    searches: {
      [id: string]: any,
    },
  };

  constructor(props: AppProps) {
    super(props);
    this.state = {
      searches: {},
    };
  }

  componentDidMount() {
    db.ref('searches')
      .orderByKey()
      .startAt(this.props.userId + "-1")
      .endAt(this.props.userId + "-\uffff")
      .on("value", (snapshot) => {
        if (snapshot.exists()) {
          this.setState({ searches: snapshot.val() });
        } else {
          this.setState({ searches: null });
        }
      })
  }

  render() {
    if (this.state.searches == null) {
      return <div style={{ textAlign: "center" }}><h2 style={{ fontFamily: "Roboto", fontWeight: 500 }}>The given user id does not exist!</h2></div>;
    } else if (Object.keys(this.state.searches).length === 0) {
      return <div style={{ textAlign: "center" }}><h2 style={{ fontFamily: "Roboto", fontWeight: 500 }}>Loading ...</h2></div>;
    }

    const searchPanels = [];
    for (const search of Object.keys(this.state.searches)) {
      searchPanels.push(<Grid item key={search} xs={12} lg={6}><Search id={search}></Search></Grid>);
    }
    return <div style={{ margin: "20px" }}><Grid container spacing={40} alignItems="flex-start">{searchPanels}</Grid></div>;
  }
}