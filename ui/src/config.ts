import * as jwt from "jsonwebtoken";

export const isLocalDev = process.env.NODE_ENV === "development";

let hostParts = window.location.host.split(".");

const applicationId = "sandbox";
export const ledgerId = isLocalDev ? applicationId : hostParts[0];

let apiUrl = hostParts.slice(1);
apiUrl.unshift("api");

export const httpBaseUrl = isLocalDev
  ? undefined
  : "https://" +
    apiUrl.join(".") +
    (window.location.port ? ":" + window.location.port : "") +
    "/data/" +
    ledgerId +
    "/";

// Unfortunately, the development server of `create-react-app` does not proxy
// websockets properly. Thus, we need to bypass it and talk to the JSON API
// directly in development mode.
export const wsBaseUrl = isLocalDev ? "ws://localhost:7575/" : undefined;

export const createToken = (party: string) =>
  jwt.sign(
    {
      "https://daml.com/ledger-api": {
        ledgerId,
        applicationId,
        admin: true,
        actAs: [party],
        readAs: [party],
      },
    },
    "secret"
  );

export const dablLoginUrl =
  hostParts.join(".") +
  (window.location.port ? ":" + window.location.port : "") +
  "/.hub/v1/auth/login";

export const damlPartyKey = applicationId + ".daml.party";
export const damlTokenKey = applicationId + ".daml.token";

export const tokenCookieName = "DAMLHUB_LEDGER_ACCESS_TOKEN";
