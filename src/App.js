import { useState, useEffect } from "react";
import { GeistProvider, CssBaseline, Grid, Card } from "@geist-ui/core";
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

const renderStreams = (streams, loading) => {
  if (!streams && !loading) {
    return (
      <Grid xs={24} md={12}>
        <Card width="100%" height="auto">
          <p>No stream currently available. Try refreshing in a bit</p>
        </Card>
      </Grid>
    );
  }
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
};

Amplify.configure(awsconfig);

const App = () => {
  const [streams, setStreams] = useState();
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState();
  const [user, setUser] = useState();

  useEffect(() => {
    onAuthUIStateChange((nextAuthState, authData) => {
      setAuthState(nextAuthState);
      setUser(authData);
      setLoading(false);
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

  return authState === AuthState.SignedIn && user ? (
    <GeistProvider>
      <CssBaseline />
      <Grid.Container gap={2} justify="center">
        {!loading && renderStreams(streams, loading)}
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
