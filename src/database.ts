import firebase from 'firebase/app';
import "firebase/database";
import config from "./config.json";

var app = firebase.initializeApp(config);

export default app.database();
