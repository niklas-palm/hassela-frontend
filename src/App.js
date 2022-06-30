import { useState, useEffect } from "react";
import { GeistProvider, CssBaseline, Grid, Card } from "@geist-ui/core";
import { Amplify, Auth } from "aws-amplify";
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

const renderStreams = (streams) => {
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
  const [streams, setStreams] = useState([]);
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
      setStreams(res.streams);
    };
    getStreams();
  }, []);

  return authState === AuthState.SignedIn && user ? (
    <GeistProvider>
      <CssBaseline />
      <Grid.Container gap={2} justify="center">
        {streams && renderStreams(streams)}
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
