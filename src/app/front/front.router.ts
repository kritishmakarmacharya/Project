import { type Request, type Response, Router } from "express";

const frontRouter = Router();
frontRouter.get("/", (_: Request, res: Response) => {
  res.json({
    data: null,
    message: "Call Success",
    meta: null,
  });
});

export default frontRouter;
