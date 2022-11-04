import {
  Decoder,
  array,
  object,
  string,
  boolean,
} from "@mojotech/json-type-validation";
import { isLocalDev } from "../../config";

/**
 * @param userAdminParty ID of the UserAdmin party on a ledger.
 * @param publicParty ID of the Public party on a ledger.
 */
export type Party = {
  displayName: string;
  identifier: string;
  isLocal: boolean;
};

/**
 * @param parties The party IDs returned by a successful response.
 * @param loading The current status of the response.
 * @param error The error returned by a failed response.
 */
export type WellKnownParties = {
  parties: Party[] | null;
  loading: boolean;
  error: unknown;
};

const localWellKnownParties = {
  parties: [
    {
      displayName: "UserAdmin",
      identifier: "userAdmin",
      isLocal: true,
    },
    {
      displayName: "Public",
      identifier: "public",
      isLocal: true,
    },
  ],
  loading: false,
  error: null,
};

function wellKnownEndPoint() {
  const url = window.location.host;
  return url + "/.hub/v1/default-parties";
}

const wellKnownPartiesDecoder: Decoder<Array<Party>> = array(
  object({
    displayName: string(),
    identifier: string(),
    isLocal: boolean(),
  })
);

export async function fetchWellKnownParties(): Promise<WellKnownParties> {
  if (isLocalDev) return localWellKnownParties;
  try {
    const response = await fetch("//" + wellKnownEndPoint());
    const dablJson = await response.json();
    const parties = wellKnownPartiesDecoder.runWithException(dablJson.result);
    return { parties, loading: false, error: null };
  } catch (error) {
    console.error(
      `Error determining well known parties ${JSON.stringify(error)}`
    );
    return { parties: null, loading: false, error };
  }
}
