import { useState, useEffect } from "react";
import {
  GeistProvider,
  CssBaseline,
  Grid,
  Card,
  Loading,
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

import { getUrls } from "./utils/requests";

import "./App.scss";

Amplify.configure(awsconfig);

const App = () => {
  const [streams, setStreams] = useState();
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
      // Get stream URLs here
      let res = await getUrls();
      console.log(res.streams);
      setStreams(res.streams);
    };
    getStreams();
  }, []);

  const renderStreams = () => {
    // Not laoding, and we recived an HLS stream from backend
    if (streams && streams.length > 0) {
      return streams.map((stream) => {
        return (
          <Grid xs={24} md={12} key={stream}>
            <Card width="100%" height="auto">
              <ReactHlsPlayer
                src={stream}
                autoPlay={true}
                controls={true}
                width="100%"
                height="auto"
              />
            </Card>
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

  return authState === AuthState.SignedIn && user ? (
    <GeistProvider>
      <CssBaseline />
      <Grid.Container gap={2} justify="center">
        {renderStreams()}
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
