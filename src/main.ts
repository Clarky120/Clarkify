require("dotenv").config({ path: "../.env" });

import SteamUser from "steam-user";
import GlobalOffensive from "globaloffensive";
import http from "http";
import fs from "fs";
import { unzipDemo } from "./demo-parse/unzip-demo";
import { parseDemo } from "./demo-parse/parse-demo";

const client = new SteamUser();
const cs = new GlobalOffensive(client);

client.logOn({
  accountName: process.env.steam_username!,
  password: process.env.steam_password!,
});

client.on("loggedOn", (details) => {
  console.log("Logged into Steam as " + client.steamID!.getSteam3RenderedID());
  client.setPersona(SteamUser.EPersonaState.Online);
  client.gamesPlayed([730]);
});

//TEST CODE FOR DEMO
cs.on("connectedToGC", () => {
  console.log("CS");
  cs.requestGame("CSGO-zH7nA-O74ta-pV2HB-wU7wV-eZhzO");
});

cs.on("matchList", async (data) => {
  const lastRound = data[0].roundstatsall[data[0].roundstatsall.length - 1];
  const downloadURL = lastRound.map!;
  console.log(downloadURL);

  // Extract demo ID from URL
  const demoId = downloadURL.split("/").pop()?.replace(".dem.bz2", "");

  if (!demoId) {
    console.log("No demo ID found");
    return;
  }

  console.log("Demo ID:", demoId);

  const file = fs.createWriteStream(`demos/${demoId}.dem.bz2`);
  const request = http.get(downloadURL, function (response) {
    response.pipe(file);

    // after download completed close filestream
    file.on("finish", async () => {
      file.close();
      console.log("Download Completed");
      await unzipDemo(demoId);
      parseDemo();
    });
  });
});

client.on("error", () => {
  console.log("Steam error");
  process.exit(1);
});
