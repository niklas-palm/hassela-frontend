import axios from "axios";
import { Auth } from "aws-amplify";
import endpoint from "../endpoint";

const API_URL = endpoint.API_URL;

const getJwtToken = async () => {
  return (await Auth.currentSession()).getIdToken().getJwtToken();
};

export const getUrls = async () => {
  const jwtToken = await getJwtToken();

  const URL = API_URL;

  const headers = {
    Authorization: jwtToken,
  };

  const res = await axios.get(URL, { headers });

  return res.data;
};

export const getTempData = async () => {
  const jwtToken = await getJwtToken();

  const URL = "https://hgmaz90m6b.execute-api.eu-west-1.amazonaws.com/Prod";

  const headers = {
    Authorization: jwtToken,
  };

  const res = await axios.get(URL, { headers });

  return res.data;
};
