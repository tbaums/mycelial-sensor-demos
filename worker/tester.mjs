import * as Mycelial from "@mycelial/core";
import path from "path";
import fs from "fs";
import url from "url";
import * as Websocket from "./websocket.mjs";
import { time } from "console";
// import * as http from "http";

const color = process.argv[2];

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

mycelial.commit([
  {
    $id: Date.now(),
    color: `${color}`,
  },
]);

mycelial.events.addEventListener("update", (evt) => {
  const log = mycelial.log.to_vec();

  console.log("update", evt);
  // console.log(mycelial)
  //   console.log(mycelial.log.to_vec());
  //   const color = mycelial.log.to_vec()[1][2];
  console.log(mycelial.log.to_vec());
  //   console.log(color);
});

mycelial.events.addEventListener("apply", (evt) => {
  console.log("apply", evt);

  console.log(mycelial.log.to_vec());
  const log = mycelial.log.to_vec();
  //   console.log("color is ", color);
  const idxs = mycelial.log.to_vec().map((i) => i[0]);
  //   console.log("idxs", idxs);
  const sortedIdxs = idxs.sort();
  //   console.log("sortedIdxs", sortedIdxs);
  const colorCheck = log.filter(
    (i) => i[0] === sortedIdxs[sortedIdxs.length - 1]
  )[1][2];
  console.log("Color is: ", colorCheck);
});

//   setInterval(() => {
//     console.log("The timer keeps the process running");
//   }, 1000 * 60 * 60);

// get idxs
const idxs = mycelial.log.to_vec().map((i) => i[0]);
console.log(idxs);

// sort idxs

// find by idx
