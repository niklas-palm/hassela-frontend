import { useState, useEffect } from "react";
import {
  GeistProvider,
  CssBaseline,
  Grid,
  Card,
  Loading,
  Text,
  Divider,
  Spacer,
} from "@geist-ui/core";
import { LineChart } from "@mui/x-charts/LineChart";
import { Amplify } from "aws-amplify";
import {
  AmplifyAuthenticator,
  // AmplifySignOut, // use as component to add signout capabilties.
  AmplifySignUp,
  AmplifySignIn,
} from "@aws-amplify/ui-react";

import { AuthState, onAuthUIStateChange } from "@aws-amplify/ui-components";
import awsconfig from "./aws-exports";

import ReactHlsPlayer from "react-hls-player";

import { getUrls, getTempData, getHistoryData } from "./utils/requests";

import "./App.scss";

Amplify.configure(awsconfig);

const getWindowDimensions = () => {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
};

const App = () => {
  const [streams, setStreams] = useState();
  const [temps, setTemps] = useState();
  const [authState, setAuthState] = useState();
  const [user, setUser] = useState();
  const [history, setHistory] = useState({});
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );
  const [chartWith, setChartWidth] = useState(350);

  useEffect(() => {
    onAuthUIStateChange((nextAuthState, authData) => {
      setAuthState(nextAuthState);
      setUser(authData);
    });
  }, []);

  useEffect(() => {
    const getStreams = async () => {
      let res = await getUrls();
      setStreams(res.streams);
    };
    getStreams();
  }, []);

  useEffect(() => {
    const getTemp = async () => {
      let res = await getTempData();
      setTemps(res);
    };
    getTemp();
  }, []);

  useEffect(() => {
    const getHistory = async () => {
      let res = await getHistoryData();
      setHistory(res);
    };
    getHistory();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions(getWindowDimensions());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (windowDimensions.width) {
      let newWidth = Math.max(320, windowDimensions.width * 0.4);
      setChartWidth(newWidth);
    }
  }, [windowDimensions]);

  const renderStreams = () => {
    // Not laoding, and we recived an HLS stream from backend
    if (streams && streams.length > 0) {
      return streams.map((stream) => {
        return (
          <Grid xs={22} md={12} key={stream}>
            <ReactHlsPlayer
              src={stream}
              autoPlay={true}
              controls={true}
              width="100%"
              height="auto"
            />
          </Grid>
        );
      });
    }

    // Not loading anymore, but received empty result from backend
    if (streams && streams.length === 0) {
      return (
        <Grid xs={24} md={12}>
          <Card width="100%" height="auto">
            <p>No stream currently available. Try refreshing in a bit</p>
          </Card>
        </Grid>
      );
    }

    // Still waiting
    return (
      <Grid xs={24} md={12}>
        <Loading type="success" height="100px" />
      </Grid>
    );
  };

  const renderTemp = () => {
    if (temps && temps.length > 0) {
      return temps.map((temp) => {
        let formattedDate;

        if (temp.timestamp) {
          const date = new Date(temp.timestamp);
          const offset = date.getTimezoneOffset();
          const localTime = new Date(date.getTime() - offset * 60000);
          formattedDate = localTime.toLocaleString("sv-SE", {
            day: "numeric",
            month: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
          });
        }
        return (
          <Grid key={temp.room}>
            <Card width="100%">
              <Text h4> {temp.room}</Text>
              <Text p>Temperature: {temp.temp}</Text>
              <Text p>Humidity: {temp.humidity}</Text>
              <Text p>Updated: {formattedDate ? formattedDate : null}</Text>
              {Object.keys(history).length > 0 ? (
                <>
                  <Text h5>Last 36 hours</Text>
                  <LineChart
                    width={chartWith}
                    height={300}
                    bottomAxis={null}
                    series={[
                      {
                        data: history[temp.room]["temp"].slice(
                          history[temp.room]["temp"].length - 36
                        ),
                        label: "temp",
                        yAxisKey: "leftAxisId",
                      },
                      {
                        data: history[temp.room]["humidity"].slice(
                          history[temp.room]["humidity"].length - 36
                        ),
                        label: "humidity",
                        yAxisKey: "rightAxisId",
                      },
                    ]}
                    xAxis={[
                      {
                        scaleType: "point",
                        data: history[temp.room]["timestamp"].slice(
                          history[temp.room]["timestamp"].length - 36
                        ),
                      },
                    ]}
                    yAxis={[{ id: "leftAxisId" }, { id: "rightAxisId" }]}
                    rightAxis="rightAxisId"
                  />
                </>
              ) : null}
            </Card>
          </Grid>
        );
      });
    }
  };

  const Header = () => {
    return (
      <>
        <Spacer h={1} />
        <Grid.Container gap={2} justify="center">
          <Text h2>Hassela</Text>
        </Grid.Container>
        <Spacer h={2} />
      </>
    );
  };

  return authState === AuthState.SignedIn && user ? (
    <GeistProvider>
      <CssBaseline />

      {Header()}

      <Divider h={1} type="secondary">
        Live streams
      </Divider>

      <Spacer h={1} />
      <Grid.Container gap={2} justify="center">
        {renderStreams()}
      </Grid.Container>
      <Spacer h={1} />

      <Divider h={1} type="secondary">
        Temperature
      </Divider>
      <Spacer h={1} />

      <Grid.Container gap={2} justify="center">
        {renderTemp()}
      </Grid.Container>
    </GeistProvider>
  ) : (
    <AmplifyAuthenticator>
      <AmplifySignUp
        slot="sign-up"
        usernameAlias="email"
        formFields={[{ type: "email" }, { type: "password" }]}
      />
      <AmplifySignIn slot="sign-in" usernameAlias="email" />
    </AmplifyAuthenticator>
  );
};

export default App;
