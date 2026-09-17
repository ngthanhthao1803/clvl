import http from "http";
import { createApp } from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { initSocket } from "./sockets/index.js";

async function bootstrap() {
  const dbState = await connectDb();

  const app = createApp();
  const server = http.createServer(app);
  const io = initSocket(server);

  app.set("io", io);
  app.set("dbState", dbState);

  server.listen(env.port, () => {
    console.log(`API listening on port ${env.port}`);
    if (!dbState.connected) {
      console.log("API is running without a live MongoDB connection");
    }
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
