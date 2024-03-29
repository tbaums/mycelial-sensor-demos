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
    const log = mycelial.log.to_vec();
    console.log("color is ", color);
    const idxs = mycelial.log.to_vec().map((i) => i[0]);
    console.log("idxs", idxs);
    const sortedIdxs = idxs.sort();
    console.log("sortedIdxs", sortedIdxs);
    const colorCheck = log.filter(
      (i) => i[0] === sortedIdxs[sortedIdxs.length - 1]
    )[0][2];
    console.log("Color is: ", colorCheck);
  });

  mycelial.events.addEventListener("apply", (evt) => {
    console.log("apply", evt);

    console.log(mycelial.log.to_vec());

    const log = mycelial.log.to_vec();
    const idxs = mycelial.log.to_vec().map((i) => i[0]);
    const sortedIdxs = idxs.sort();
    let entry = log.filter((i) => i[0] === sortedIdxs[sortedIdxs.length - 1]);

    entry = entry.filter((e) => e[1] !== "$id");

    console.log("idxs", idxs);
    console.log("sortedIdxs", sortedIdxs);
    console.log("entry: ", entry);
    let color;
    if (entry.length > 0) {
      if (entry[0][1] !== "$id") {
        color = entry[0][2];
        console.log("color is ", color);
      }
    }

    switch (color) {
      case "green":
        http.get("http://localhost:1880/green/", (res) => {
          console.log(
            "Node-Red: hit green endpoint. response code: ",
            res.statusCode
          );
        });
        break;
      case "red":
        http.get("http://localhost:1880/red/", (res) => {
          console.log(
            "Node-red: hit red endpoint. response code: ",
            res.statusCode
          );
        });
        break;
      case "off":
        http.get("http://localhost:1880/off/", (res) => {
          console.log(
            "Node-red: hit off endpoint. response code: ",
            res.statusCode
          );
        });
        break;
    }
  });

  console.log(mycelial.log.to_vec());

  setInterval(() => {
    console.log("The timer keeps the process running");
  }, 1000 * 60 * 60);
})();
