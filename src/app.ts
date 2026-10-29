import express, {
  NextFunction,
  type Application,
  type Request,
  type Response,
} from "express";
import mainRouter from "./router/main.router";
import errorHandlingMiddleware from "./middlewares/ErrorHandlingMiddleware";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

import "./config/mongodb";

const app: Application = express();

//cookie parser
app.use(cookieParser());
// body parser , content-type: "application/json"
//json type req.body attach
app.use(helmet());
app.use(cors(
  {
    origin:"http://localhost:",
    credentials:true,
  }
))
app.use(
  express.json({
    limit: "1mb",
  }),
);

// content-type: "application/x-www-form-urlencoded"
app.use(
  express.urlencoded({
    limit: "1mb",
  }),
);

//static middlewate
app.use("/assets", express.static(path.resolve("./public/uploads")));

app.use("/api", mainRouter);

//404 route
app.use((_: Request, __: Response, next: NextFunction) => {
  next({ code: 404, message: "Resource/route not found" });
});

// error handling middleware
app.use(errorHandlingMiddleware);

export default app;
