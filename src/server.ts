import http from "http";
import app from "./app";
const httpServer = http.createServer(app);
const PORT: number = 9009;
const HOST: string = "localhost";

httpServer.listen(PORT, HOST, () => {
  console.log(`Server is running at ${"http://" + HOST + ":" + PORT}`);
});

httpServer.on("error", (err) => {
  console.error("*** Server Error ***");
  console.error(err);
  process.exit(1);
});
