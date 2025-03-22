import bzip2 from "bzip2";
import fs from "fs";
import { exec } from "child_process";
import { getPlatform } from "../helpers";

const unzipDemo = async (demoId: string) => {
  console.log("Demo unzip started");
  console.time("Demo unzip took:");

  switch (getPlatform()) {
    case "windows": {
      await unzipDemoWindows(demoId);
      break;
    }

    default: {
      await unzipDemoUnix(demoId);
      break;
    }
  }

  console.timeEnd("Demo unzip took:");
};

const unzipDemoWindows = async (demoId: string) => {
  const input = `./demos/${demoId}.dem.bz2`;
  const output = `./output/${demoId}.dem`;

  if (!fs.existsSync("./output")) {
    fs.mkdirSync("./output");
  }

  const demo = fs.readFileSync(input);

  if (demo) {
    const unzipped = bzip2.simple(bzip2.array(demo));
    fs.writeFileSync(output, unzipped);
  }
};

const unzipDemoUnix = async (demoId: string) => {
  const input = `./demos/${demoId}.dem.bz2`;
  const output = `./output/${demoId}.dem`;

  return new Promise((res, rej) => {
    exec(`bzip2 -d ${input} -c > ${output}`, (error, stdout, stderr) => {
      if (error) {
        rej(`Error: ${stderr}`);
      } else {
        res(true);
      }
    });
  });
};

export { unzipDemo, unzipDemoUnix };
