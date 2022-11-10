import React, { useState } from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Fade from "@material-ui/core/Fade";
import {
  useUserDispatch,
  loginUser,
  loginDablUser,
  useUserState,
} from "../../context/UserContext";
import { isLocalDev } from "../../config";
import useStyles from "./styles";
import logo from "./logo.svg";
import { isAuthenticated } from "../../context/utils";

const Login = (props: RouteComponentProps) => {
  var classes = useStyles();
  var userDispatch = useUserDispatch();
  const userState = useUserState();
  var [isLoading, setIsLoading] = useState(false);
  var [error, setError] = useState(false);
  var [loginValue, setLoginValue] = useState("");

  return (
    <Grid container className={classes.container}>
      <div className={classes.logotypeContainer}>
        <img src={logo} alt="logo" className={classes.logotypeImage} />
        <Typography className={classes.logotypeText}>Private Nfts</Typography>
      </div>
      <div className={classes.formContainer}>
        <div className={classes.form}>
          <React.Fragment>
            <Fade in={error}>
              <Typography color="secondary" className={classes.errorMessage}>
                Something is wrong with your login or password :(
              </Typography>
            </Fade>
            {!isLocalDev ? (
              <>
                <Button
                  className={classes.dablLoginButton}
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={loginDablUser}
                >
                  Log in with Daml Hub
                </Button>
                <Typography>OR</Typography>
              </>
            ) : (
              <>
                <TextField
                  id="email"
                  InputProps={{
                    classes: {
                      underline: classes.textFieldUnderline,
                      input: classes.textField,
                    },
                  }}
                  value={loginValue}
                  onChange={(e) => setLoginValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      loginUser(
                        userDispatch,
                        loginValue,
                        props.history,
                        setIsLoading,
                        setError
                      );
                    }
                  }}
                  margin="normal"
                  placeholder="Username"
                  type="email"
                  fullWidth
                />
                {!isAuthenticated(userState) && userState.error ? (
                  <Typography variant="caption" color="error">
                    {userState.error}
                  </Typography>
                ) : null}
                <div className={classes.formButtons}>
                  {isLoading ? (
                    <CircularProgress
                      size={26}
                      className={classes.loginLoader}
                    />
                  ) : (
                    <Button
                      disabled={loginValue.length === 0}
                      onClick={() =>
                        loginUser(
                          userDispatch,
                          loginValue,
                          props.history,
                          setIsLoading,
                          setError
                        )
                      }
                      variant="contained"
                      color="primary"
                      size="large"
                    >
                      Login
                    </Button>
                  )}
                </div>
              </>
            )}
          </React.Fragment>
        </div>
      </div>
    </Grid>
  );
};

export default withRouter(Login);
