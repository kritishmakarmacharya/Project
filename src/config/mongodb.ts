import mongoose from "mongoose";
import { dbConfig } from "./appConfig";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

(async () => {
  try {
    await mongoose.connect(dbConfig.mongodb.url as string, {
      dbName: dbConfig.mongodb.dbName,
      autoCreate: true,
      autoIndex: true,
    });
    console.log("******* MONGODB connected successfully *******");
  } catch (exception) {
    console.error("******* Connection problem with MONGODB *******");
    console.error(exception);
    process.exit(1);
  }
})();
