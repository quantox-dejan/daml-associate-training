import React, { PropsWithChildren } from "react";
import { History } from "history";
import { createToken, dablLoginUrl, tokenCookieName } from "../config";
import { getInitState, UserState } from "./utils";
import Cookies from "js-cookie";
import { getParty } from "../pages/report/wellKnownParties";

type LoginSuccess = {
  type: "LOGIN_SUCCESS";
  token: string;
  party: string;
  partyName: string;
};

type LoginFailure = {
  type: "LOGIN_FAILURE";
  error: string;
};

type SignoutSuccess = {
  type: "SIGN_OUT_SUCCESS";
};

type LoginAction = LoginSuccess | LoginFailure | SignoutSuccess;

const UserStateContext = React.createContext<UserState>({
  isAuthenticated: false,
});
const UserDispatchContext = React.createContext<React.Dispatch<LoginAction>>(
  {} as React.Dispatch<LoginAction>
);

function userReducer(state: UserState, action: LoginAction): UserState {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        isAuthenticated: true,
        token: action.token,
        party: action.party,
        partyName: action.partyName,
      };
    case "LOGIN_FAILURE":
      return { isAuthenticated: false, error: action.error };
    case "SIGN_OUT_SUCCESS":
      return { isAuthenticated: false, error: undefined };
  }
}

const UserProvider = ({ children }: PropsWithChildren) => {
  let initState: UserState = getInitState();
  const [state, dispatch] = React.useReducer<
    React.Reducer<UserState, LoginAction>
  >(userReducer, initState);

  return (
    <UserStateContext.Provider value={state}>
      <UserDispatchContext.Provider value={dispatch}>
        {children}
      </UserDispatchContext.Provider>
    </UserStateContext.Provider>
  );
};

function useUserState() {
  const context = React.useContext<UserState>(UserStateContext);
  if (context === undefined) {
    throw new Error("useUserState must be used within a UserProvider");
  }
  return context;
}

function useUserDispatch() {
  const context =
    React.useContext<React.Dispatch<LoginAction>>(UserDispatchContext);
  if (context === undefined) {
    throw new Error("useUserDispatch must be used within a UserProvider");
  }
  return context;
}

// ###########################################################

function loginUser(
  dispatch: React.Dispatch<LoginAction>,
  partyName: string,
  history: History,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<boolean>>
) {
  setError(false);
  setIsLoading(true);

  getParty(partyName)
    .then((party) => {
      if (!party) {
        dispatch({ type: "LOGIN_FAILURE", error: "Unknown user" });
        setError(true);
        return;
      }

      const token = createToken(party.identifier);
      console.debug("TOKEN: ", token);
      Cookies.set(tokenCookieName, token);
      console.debug("COOKIE: ", Cookies.get(tokenCookieName));
      dispatch({
        type: "LOGIN_SUCCESS",
        token,
        party: party.identifier,
        partyName: party.displayName ?? party.identifier,
      });
      setError(false);
      setIsLoading(false);
      history.push("/app");
    })
    .catch((e) => {
      dispatch({
        type: "LOGIN_FAILURE",
        error: e.message ? e.message : JSON.stringify(e),
      });
      setError(true);
      console.error(e);
    })
    .finally(() => {
      setIsLoading(false);
    });
}

const loginDablUser = () => {
  window.location.assign(`https://${dablLoginUrl}`);
};

function signOut(dispatch: React.Dispatch<LoginAction>, history: History) {
  Cookies.remove(tokenCookieName);
  dispatch({ type: "SIGN_OUT_SUCCESS" });
  history.push("/login");
}

export {
  UserProvider,
  useUserState,
  useUserDispatch,
  loginUser,
  loginDablUser,
  signOut,
};
