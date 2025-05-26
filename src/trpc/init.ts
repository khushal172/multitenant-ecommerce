import {initTRPC} from '@trpc/server';
import config from '@payload-config'
import { getPayload } from 'payload';
import {cache} from 'react';

export const createTRPCContext = cache(async () => {
    return {userID : 'user_123'};
});


const t = initTRPC.create({
    // @see https://trpc.io//docs/server/data-transformers
})

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure.use(async ({next}) => {
    const payload = await getPayload({config});

    return next({ ctx : {db : payload}});
});
