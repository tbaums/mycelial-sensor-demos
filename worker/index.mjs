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

  mycelial.events.addEventListener("update", (evt) => {
    console.log("update", evt);
    // console.log(mycelial)

    const color = mycelial.log.to_vec()[1][2];
    // console.log(mycelial.log.to_vec());
    console.log(color);
    // if (color === "green") {
    //   http.get("http://localhost:1880/green");
    // }

    // if (color === "red") {
    //   http.get("http://localhost1880/red");
    // }
  });

  mycelial.events.addEventListener("apply", (evt) => {
    console.log("apply", evt);
    // console.log(mycelial)
    const color = mycelial.log.to_vec()[1][2];
    // console.log(mycelial.log.to_vec());
    console.log("color is ", color);

    console.log(mycelial.log.to_vec());
  });

  console.log(mycelial.log.to_vec());

  mycelial.commit([
    {
      $id: "id",
      color: "red",
    },
  ]);

  setInterval(() => {
    console.log("The timer keeps the process running");
  }, 1000 * 60 * 60);
})();
