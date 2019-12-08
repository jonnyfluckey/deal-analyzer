import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import * as firebase from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAh5Iq51i8RWh9XHP7v6R6IwiNhpGoridU",
  authDomain: "deal-analyzer-deb8d.firebaseapp.com",
  databaseURL: "https://deal-analyzer-deb8d.firebaseio.com",
  projectId: "deal-analyzer-deb8d",
  storageBucket: "deal-analyzer-deb8d.appspot.com",
  messagingSenderId: "645134025022",
  appId: "1:645134025022:web:b298c7d2660e898fceec6f",
  measurementId: "G-LHSGKGXS69"
};

firebase.initializeApp(firebaseConfig);

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
