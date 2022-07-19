import * as Mycelial from "@mycelial/core";
import path from "path";
import fs from "fs";
import url from "url";
import * as Websocket from "./websocket.mjs";
// import * as http from "http";
(async function () {
  const mycelial = await Mycelial.create(
    "tbaums-rpi-4",
    Math.floor(Math.random() * 100000000),
    {
      resolver: () => {
        const module = path.join(
          path.dirname(url.fileURLToPath(import.meta.url)),
          "node_modules/@mycelial/wasm/dist/index_bg.wasm"
        );

        return fs.readFileSync(module);
      },
    }
  );

  const ws = Websocket.create(mycelial, {
    endpoint: "wss://v0alpha-relay.fly.dev/v0alpha",
  });

  mycelial.commit([
    {
      $id: "id",
      color: "red",
    },
  ]);
});
