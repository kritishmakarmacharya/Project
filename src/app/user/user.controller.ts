import { type NextFunction, type Request, type Response } from "express";

class UserController {
  create(_: Request, res: Response, next: NextFunction) {
    try {
    } catch (exception) {
      //handling exception
      next(exception);
    }
  }

  listAllUsers(_: Request, res: Response, next: NextFunction) {
    try {
      //
    } catch (exception) {
      //handling exception
      next(exception);
    }
  }

  getUserDetailsById(_: Request, res: Response, next: NextFunction) {
    try {
      //
    } catch (exception) {
      //handling exception
      next(exception);
    }
  }

  updateUserById(_: Request, res: Response, next: NextFunction) {
    try {
      //
    } catch (exception) {
      //handling exception
      next(exception);
    }
  }

  deleteUserById(_: Request, res: Response, next: NextFunction) {
    try {
      //
    } catch (exception) {
      //handling exception
      next(exception);
    }
  }
}

export default UserController;
