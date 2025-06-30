import superjson from "superjson";
import { initTRPC, TRPCError } from "@trpc/server";
import config from "@payload-config";
import { getPayload } from "payload";
import { cache } from "react";
import { headers as getHeaders } from "next/headers";

export const createTRPCContext = cache(async () => {
  return { userID: "user_123" };
});

const t = initTRPC.create({
  // @see https://trpc.io//docs/server/data-transformers

  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure.use(async ({ next }) => {
  const payload = await getPayload({ config });

  return next({ ctx: { db: payload } });
});

export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const headers = await getHeaders();
  const session = await ctx.db.auth({ headers });
  if (!session.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: {
        ...session,
        user: session.user,
      },
    },
  });
});
