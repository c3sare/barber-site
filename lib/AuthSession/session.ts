import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "./Config";

// This is where we specify the typings of req.session.*
declare module "iron-session" {
  interface IronSessionData {
    user?: User;
  }
}

export type User = {
  isLoggedIn: boolean;
  id: string;
};

export function withSessionSSR(handler: any) {
  return withIronSessionSsr(handler, sessionOptions);
}

export function withSessionAPI(handler: any) {
  return withIronSessionApiRoute(handler, sessionOptions);
}
