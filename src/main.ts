require("dotenv").config({ path: "../.env" });

import SteamUser from "steam-user";
import GlobalOffensive from "globaloffensive";
import http from 'http'; // or 'https' for https:// URLs
import fs from 'fs';

export const client = new SteamUser();
export const cs = new GlobalOffensive(client);

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
  cs.requestGame("CSGO-zH7nA-O74ta-pV2HB-wU7wV-eZhzO");
});

cs.on("matchList", async (data) => {
  const lastRound = data[0].roundstatsall[data[0].roundstatsall.length - 1];
  const downloadURL = lastRound.map!;
  console.log(downloadURL)
  const file = fs.createWriteStream("file.dem.bz2");
  const request = http.get(downloadURL, function(response) {
     response.pipe(file);
  
     // after download completed close filestream
     file.on("finish", () => {
         file.close();
         console.log("Download Completed");
     });
  });
});

client.on("error", () => {
  console.log("Steam error");
  process.exit(1);
});