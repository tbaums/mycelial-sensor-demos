import * as Mycelial from "@mycelial/core";
import path from "path";
import fs from "fs";
import url from "url";
import * as Websocket from "./websocket.mjs";
import * as http from "http";
(async function () {
  const mycelial = await Mycelial.create(
    "red-green",
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

  mycelial.events.addEventListener("update", (evt) => {
    console.log("update", evt);
    // console.log(mycelial)

    const color = mycelial.log.to_vec()[1][2];
    // console.log(mycelial.log.to_vec());
    console.log(color);
  });

  mycelial.events.addEventListener("apply", (evt) => {
    console.log("apply", evt);
    // console.log(mycelial)
    const len = mycelial.log.to_vec().length;
    const color = mycelial.log.to_vec()[len - 1][2];
    // console.log(mycelial.log.to_vec());
    console.log("color is ", color);
    if (color === "green") {
      http.get(
        {
          hostname: "localhost",
          port: 1880,
          path: "/green",
          agent: false, // Create a new agent just for this one request
        },
        (res) => {
          console.log(res);
        }
      );
    }

    if (color === "red") {
      http.get(
        {
          hostname: "localhost",
          port: 1880,
          path: "/red",
          agent: false, // Create a new agent just for this one request
        },
        (res) => {
          console.log(res);
        }
      );
    }
  });

  console.log(mycelial.log.to_vec());

  setInterval(() => {
    console.log("The timer keeps the process running");
  }, 1000 * 60 * 60);
})();
