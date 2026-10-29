import { UnderlyingDefaultSource } from "node:stream/web";
import { IUserDetail } from "../app/user/user.type";

declare global {
  namespace Express {
    interface Request {
      loggedInUser?: IUserDetail | null | Undefined;
    }
  }
}

export {};
