import { auth } from ".";
import { headers } from "next/headers";
import { cache } from "react";

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

export const getUser = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user || !session?.user.id) {
    throw new Error("Unauthorized: You must be logged in");
  }

  return session.user;
};
