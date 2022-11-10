import {
  Decoder,
  array,
  object,
  string,
  boolean,
  optional,
} from "@mojotech/json-type-validation";
import { createToken, isLocalDev, userAdminDisplayName } from "../../config";

/**
 * @param userAdminParty ID of the UserAdmin party on a ledger.
 * @param publicParty ID of the Public party on a ledger.
 */
export type Party = {
  displayName?: string;
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

const wellKnownEndpoint = () => {
  if (!isLocalDev) {
    return `//${window.location.host}/.hub/v1/default-parties`;
  }

  return `/v1/parties`;
};

const wellKnownPartiesDecoder: Decoder<Array<Party>> = array(
  object({
    displayName: optional(string()),
    identifier: string(),
    isLocal: boolean(),
  })
);

async function fetchWellKnownParties(): Promise<WellKnownParties> {
  try {
    const endpoint = wellKnownEndpoint();
    const response = await fetch(
      endpoint,
      isLocalDev
        ? { headers: { Authorization: `Bearer ${createToken("public")}` } }
        : undefined
    );
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

export async function getUserAdmin(): Promise<Party | undefined> {
  return await getParty(userAdminDisplayName);
}

export async function getParty(name: string): Promise<Party | undefined> {
  const wkp = await fetchWellKnownParties();
  if (!wkp.parties) {
    return undefined;
  }

  return wkp.parties?.find(
    (x) => x.displayName?.toLowerCase() === name.toLowerCase()
  );
}
