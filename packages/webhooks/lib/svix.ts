import 'server-only';

import { Svix } from 'svix';

import { keys } from '../keys';

const svixToken = keys().SVIX_TOKEN;

export const send = async (
  orgId: string,
  eventType: string,
  payload: object
) => {
  if (!svixToken) {
    throw new Error('SVIX_TOKEN is not set');
  }

  const svix = new Svix(svixToken);

  return svix.message.create(orgId, {
    application: {
      name: orgId,
      uid: orgId,
    },
    eventType,
    payload: {
      eventType,
      ...payload,
    },
  });
};

export const getAppPortal = async (orgId: string) => {
  if (!svixToken) {
    throw new Error('SVIX_TOKEN is not set');
  }

  const svix = new Svix(svixToken);

  return svix.authentication.appPortalAccess(orgId, {
    application: {
      name: orgId,
      uid: orgId,
    },
  });
};
