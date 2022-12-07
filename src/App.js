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

import { getUrls, getTempData } from "./utils/requests";

import "./App.scss";

Amplify.configure(awsconfig);

const App = () => {
  const [streams, setStreams] = useState();
  const [temps, setTemps] = useState();
  const [authState, setAuthState] = useState();
  const [user, setUser] = useState();

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

  const renderStreams = () => {
    // Not laoding, and we recived an HLS stream from backend
    if (streams && streams.length > 0) {
      return streams.map((stream) => {
        return (
          <Grid xs={24} md={12} key={stream}>
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
        return (
          <Grid xs={12} md={4} key={temp.room}>
            <Card width="100%">
              <Text h4> {temp.room}</Text>
              <Text p>Temperature: {temp.temp}</Text>
              <Text p>Humidity: {temp.humidity}</Text>
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
