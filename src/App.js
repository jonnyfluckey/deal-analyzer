import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Table,
  Paper,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  Container,
  Grid,
  LinearProgress
} from "@material-ui/core";
import axios from "axios";
import parser from "fast-xml-parser";
import Script from "react-load-script";
import Title from "./Components/Title";
import NumberFormat from "react-number-format";
import * as firebase from "firebase/app";
import "firebase/firestore";
// import { Link as RouterLink } from "react-router-dom";

function App() {
  const [val, setVal] = useState("");
  const [address, setAddress] = useState([]);
  const [property, setProperty] = useState("");
  const [checked, setChecked] = useState(false);
  const [arv, setArv] = useState("");
  const [purchasePrice, setPurchaseprice] = useState("");
  const [hrc, setHrc] = useState("");
  const [mhc, setMhc] = useState("");
  const [dts, setDts] = useState("");
  const [analysis, setAnalysis] = useState();
  const [deal, setDeal] = useState();
  const [loading, setLoading] = useState(false);

  const db = firebase.firestore();

  useEffect(() => {
    setLoading(false);
  }, [property]);

  useEffect(() => {
    setLoading(false);
  }, [deal]);

  async function handleSubmit(e) {
    setLoading(true);
    e.preventDefault();
    await axios
      .get(
        `https://cors-anywhere.herokuapp.com/http://www.zillow.com/webservice/GetSearchResults.htm?zws-id=${process.env.REACT_APP_ZILLOW_API_KEY}`,
        {
          params: {
            address: address[0].long_name + " " + address[1].long_name,
            citystatezip:
              address[2].long_name +
              " " +
              address[4].short_name +
              " " +
              address[6].long_name
          }
        }
      )
      .then(res => {
        const jsonObj = parser.parse(res.data);
        setProperty(
          jsonObj["SearchResults:searchresults"].response.results.result
        );
      })
      .catch(err => {
        console.log(err);
      });
  }

  function handleDealSubmit(e) {
    e.preventDefault();
    const cost = purchasePrice + hrc;
    const financingCost = mhc * (dts / 30);
    const profit = arv - cost - financingCost;

    setAnalysis({
      profit,
      profitMargin: (profit / arv) * 100
    });
  }

  function handleScriptLoad() {
    // Declare Options For Autocomplete
    const options = {
      types: ["address"]
    }; // To disable any eslint 'google not defined' errors

    // Initialize Google Autocomplete
    /*global google*/

    const autocomplete = new google.maps.places.Autocomplete(
      document.getElementById("autocomplete"),
      options
    );

    // Avoid paying for data that you don't need by restricting the set of
    // place fields that are returned to just the address components and formatted
    // address.
    autocomplete.setFields(["address_components", "formatted_address"]);

    // Fire Event when a suggested name is selected
    autocomplete.addListener("place_changed", () => {
      const addressObject = autocomplete.getPlace();
      const address = addressObject.formatted_address;

      setVal(address);
      setAddress(addressObject.address_components);
    });
  }

  function saveDeal() {
    db.collection("deals")
      .add({
        property: property.address,
        arv,
        purchasePrice,
        hrc,
        mhc,
        dts,
        profit: analysis.profit,
        profitMargin: analysis.profitMargin,
        date: new Date()
      })
      .then(res => {
        alert("Your deal was saved!");
        console.log(res);
      })
      .catch(err => {
        console.log(err);
      });
  }

  // const Link = React.forwardRef((props, ref) => (
  //   <RouterLink innerRef={ref} to="/deals" {...props} />
  // ));

  async function showLastDeal() {
    setLoading(true);
    await db
      .collection("deals")
      .orderBy("date", "desc")
      .limit(1)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          setDeal({ id: doc.id, deal: doc.data() });
        });
      });
  }

  const clearForm = () => {
    setChecked(false);
    setArv("");
    setPurchaseprice("");
    setHrc("");
    setMhc("");
    setDts("");
  };

  return (
    <>
      <Container style={{ marginTop: "25px", marginBottom: "100px" }}>
        <div>
          <Script
            url={`https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_PLACES_API_KEY}&libraries=places`}
            onLoad={handleScriptLoad}
          />
          <div>
            <Title>
              Deal Analyzer{" "}
              <img
                width="150"
                src="https://www.zillow.com/widgets/GetVersionedResource.htm?path=/static/logos/Zillowlogo_200x50.gif"
                alt="zillow"
              />
            </Title>
          </div>
          <br></br>
          <br></br>
          {/* <Button color="primary" component={Link} variant="contained">
          See Prior Deals
        </Button>
        <br></br>
        <br></br> */}
          <Typography>Search Property:</Typography>
          <br></br>
          <form onSubmit={handleSubmit}>
            <Input
              id="autocomplete"
              value={val}
              onChange={e => setVal(e.target.value)}
              style={{ width: "350px" }}
            />
            &nbsp; &nbsp;
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </form>
        </div>
        <br></br>
        <br></br>
        {property ? (
          <>
            <Paper>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell align="center">Zestimate®</TableCell>
                    <TableCell align="center">Zestimate® Range</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell align="center">
                      {property.address.street}
                    </TableCell>
                    <TableCell align="center">
                      <NumberFormat
                        value={property.zestimate.amount}
                        displayType={"text"}
                        thousandSeparator={true}
                        prefix={"$ "}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <NumberFormat
                        value={property.zestimate.valuationRange.low}
                        displayType={"text"}
                        thousandSeparator={true}
                        prefix={"$ "}
                      />
                      <span> - </span>
                      <NumberFormat
                        value={property.zestimate.valuationRange.high}
                        displayType={"text"}
                        thousandSeparator={true}
                        prefix={"$ "}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          </>
        ) : loading ? (
          <LinearProgress color="secondary" />
        ) : null}
        <br></br>
        <br></br>
        <Grid container style={{ display: "flex" }} spacing={4}>
          <Grid item xs={12} lg={6}>
            <Paper elevation={12}>
              <Container>
                <br></br>
                <br></br>
                <Typography>Is This a Good Deal? Lets Find Out!</Typography>
                <br></br>
                <br></br>
                <div style={{ display: "block" }}>
                  <form onSubmit={handleDealSubmit}>
                    <FormControlLabel
                      control={
                        <Switch
                          color="secondary"
                          onChange={e => {
                            setChecked(e.target.checked);
                            if (!checked) {
                              setArv(property.zestimate.amount);
                            } else {
                              setArv("");
                            }
                          }}
                          value={checked}
                        />
                      }
                      label="Use Zestimate for ARV"
                      labelPlacement="end"
                    />
                    <br></br>
                    <br></br>
                    <TextField
                      variant="outlined"
                      label="After Repair Value"
                      style={{ width: "200px" }}
                      value={
                        checked && property ? property.zestimate.amount : arv
                      }
                      onChange={e => {
                        setArv(parseInt(e.target.value) || "");
                      }}
                      required
                    />
                    <br></br>
                    <br></br>
                    <TextField
                      variant="outlined"
                      label="Purchase Price"
                      style={{ width: "200px" }}
                      required
                      value={purchasePrice}
                      onChange={e => {
                        setPurchaseprice(parseInt(e.target.value) || "");
                      }}
                    />
                    <br></br>
                    <br></br>
                    <TextField
                      variant="outlined"
                      label="Home Rehab Costs"
                      style={{ width: "200px" }}
                      required
                      value={hrc}
                      onChange={e => {
                        setHrc(parseInt(e.target.value) || "");
                      }}
                    />
                    <br></br>
                    <br></br>
                    <TextField
                      variant="outlined"
                      label="Monthly Holding Cost"
                      style={{ width: "200px" }}
                      required
                      value={mhc}
                      onChange={e => {
                        setMhc(parseInt(e.target.value) || "");
                      }}
                    />
                    <br></br>
                    <br></br>
                    <TextField
                      variant="outlined"
                      label="Number of Days to Sell"
                      style={{ width: "200px" }}
                      required
                      value={dts}
                      onChange={e => {
                        setDts(parseInt(e.target.value) || "");
                      }}
                    />
                    <br></br>
                    <br></br>
                    <Button type="submit" color="primary" variant="contained">
                      Analyze Deal
                    </Button>
                    &nbsp;
                    <Button
                      onClick={clearForm}
                      color="secondary"
                      variant="contained"
                    >
                      Reset
                    </Button>
                  </form>
                </div>
                <br></br>
                <br></br>
              </Container>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={6} style={analysis ? {} : { display: "none" }}>
            <Paper elevation={12}>
              <Container>
                {analysis ? (
                  <div style={{ paddingTop: "25px", paddingBottom: "25px" }}>
                    <Typography>
                      Your profit on this project is{" "}
                      <NumberFormat
                        value={analysis.profit}
                        displayType={"text"}
                        thousandSeparator={true}
                        prefix={"$"}
                      />
                    </Typography>
                    <br></br>
                    <Typography>
                      Your profit margin on this project is{" "}
                      <NumberFormat
                        value={analysis.profitMargin}
                        displayType={"text"}
                        decimalScale={2}
                        suffix={"%"}
                      />
                    </Typography>
                    <br></br>
                    <br></br>
                    <Button
                      onClick={saveDeal}
                      color="primary"
                      variant="contained"
                    >
                      Save this Deal
                    </Button>
                    <br />
                    <br />
                    <Button
                      onClick={showLastDeal}
                      color="primary"
                      variant="contained"
                    >
                      Show Last Deal
                    </Button>
                  </div>
                ) : null}
              </Container>
            </Paper>
          </Grid>
          <Grid item xs={12} style={deal ? {} : { display: "none" }}>
            <Paper elevation={12}>
              <Container>
                {deal ? (
                  <div style={{ paddingTop: "25px", paddingBottom: "25px" }}>
                    <Title>Last Saved Deal</Title>
                    <br />
                    <br />
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <strong>Address</strong>
                          </TableCell>
                          <TableCell align="center">
                            <strong>Total Profit</strong>
                          </TableCell>
                          <TableCell align="center">
                            <strong>Profit Margin</strong>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>{deal.deal.property.street}</TableCell>
                          <TableCell align="center">
                            <NumberFormat
                              value={deal.deal.profit}
                              displayType={"text"}
                              thousandSeparator={true}
                              prefix={"$ "}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <NumberFormat
                              value={deal.deal.profitMargin}
                              displayType={"text"}
                              decimalScale={2}
                              suffix={"%"}
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : loading ? (
                  <LinearProgress color="secondary" />
                ) : null}
              </Container>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default App;
