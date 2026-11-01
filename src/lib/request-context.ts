import { AsyncLocalStorage } from 'node:async_hooks';

export type RequestContext = {
  requestId: string;
  method?: string;
  route?: string;
  ip?: string | null;
  userAgent?: string | null;
};

const storage = new AsyncLocalStorage<RequestContext>();

export const runWithRequestContext = <T>(context: RequestContext, fn: () => T) =>
  storage.run(context, fn);
export const getRequestContext = () => storage.getStore();
