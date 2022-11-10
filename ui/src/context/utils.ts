import Cookies from "js-cookie";
import { tokenCookieName } from "../config";

export type AuthenticatedUser = {
  isAuthenticated: true;
  token: string;
  party: string;
  partyName: string;
};

export type UnAthenticated = {
  isAuthenticated: false;
  error?: string;
};

export const isAuthenticated = (
  state: UnAthenticated | AuthenticatedUser
): state is AuthenticatedUser => {
  return state.isAuthenticated;
};

export type UserState = UnAthenticated | AuthenticatedUser;

export const parseJwt = (token: string | null | undefined) => {
  if (!token) {
    return undefined;
  }

  if (!token.length) {
    return undefined;
  }

  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
};

export const getInitState = (): UserState => {
  const token = Cookies.get(tokenCookieName);
  const jwt = parseJwt(token);
  if (!jwt) {
    return { isAuthenticated: false };
  }

  const exp = new Date(Number(jwt.exp) * 1000);
  if (exp < new Date()) {
    return { isAuthenticated: false };
  }

  const party = jwt.party;
  const partyName = jwt.partyName;
  if (!party || !partyName) {
    return { isAuthenticated: false };
  }

  return { isAuthenticated: true, token: token!, party, partyName };
};
