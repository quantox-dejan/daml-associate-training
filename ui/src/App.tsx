import React, { useEffect } from "react";
import { HashRouter, Redirect, Route, Switch } from "react-router-dom";
import { useUserDispatch, useUserState } from "./context/UserContext";
import Layout from "./components/Layout/Layout";
import ErrorComponent from "./pages/error/Error";
import Login from "./pages/login/Login";

import "./App.css";
import { getInitState } from "./context/utils";

function App() {
  const userState = useUserState();

  return (
    <HashRouter>
      <Switch>
        <Route exact path="/" component={RootRoute} />
        <Route
          exact
          path="/app"
          render={() => <Redirect to="/app/mytokens" />}
        />
        <PrivateRoute path="/app" component={Layout} />
        <PublicRoute path="/login" component={Login} />
        <Route component={ErrorComponent} />
      </Switch>
    </HashRouter>
  );

  // #######################################################################

  function RootRoute() {
    const userDispatch = useUserDispatch();

    useEffect(() => {
      const initState = getInitState();

      if (initState === null) {
        return;
      }

      if (initState.isAuthenticated) {
        userDispatch({ type: "LOGIN_SUCCESS", ...initState });
      }

      return;
    });

    return <Redirect to="/app/report" />;
  }

  function PrivateRoute({ component, ...rest }: any) {
    return (
      <Route
        {...rest}
        render={(props) =>
          userState.isAuthenticated ? (
            React.createElement(component, props)
          ) : (
            <Redirect
              to={{
                pathname: "/login",
                state: {
                  from: props.location,
                },
              }}
            />
          )
        }
      />
    );
  }

  function PublicRoute({ component, ...rest }: any) {
    return (
      <Route
        {...rest}
        render={(props) =>
          userState.isAuthenticated ? (
            <Redirect
              to={{
                pathname: "/",
              }}
            />
          ) : (
            React.createElement(component, props)
          )
        }
      />
    );
  }
}

export default App;
