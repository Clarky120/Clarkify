import bzip2 from "bzip2";
import fs from 'fs';

const unzipDemo = async (demoName: string) => {
  const demo = fs.readFileSync("./demos/" + demoName);

  if (demo) {
    console.log("Demo unzip started");
    const unzipped = bzip2.simple(bzip2.array(demo));
    fs.writeFileSync("demos/demo.dem", unzipped);
    console.log("Demo unzip finished");
  }
};

export { unzipDemo };
