require("dotenv").config({ path: "../.env" });

import SteamUser from "steam-user";
import GlobalOffensive from "globaloffensive";
import http from "http";
import fs from "fs";
import { unzipDemo } from "./demo-parse/unzip-demo";
import { parseDemo } from "./demo-parse/parse-demo";
import { Client, GatewayIntentBits, Events, Collection } from "discord.js";
import path from "path";

const discord = new Client({ intents: [GatewayIntentBits.Guilds] });
discord.commands = new Collection();

const foldersPath = path.join(__dirname, "./discord-commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
      discord.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

const client = new SteamUser();
const cs = new GlobalOffensive(client);

client.logOn({
  accountName: process.env.steam_username!,
  password: process.env.steam_password!,
});

discord.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

console.log(process.env.discord_bot_token);
// Log in to Discord with your client's token
discord.login(process.env.discord_bot_token);

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
      parseDemo(demoId);
    });
  });
});

client.on("error", () => {
  console.log("Steam error");
  process.exit(1);
});
