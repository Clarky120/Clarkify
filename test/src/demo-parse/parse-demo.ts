import { parseEvent, parseTicks } from "@laihoe/demoparser2";

const parseDemo = (demoId: string) => {
  let gameEndTick = Math.max(
    ...parseEvent(`output/${demoId}.dem`, "round_end").map((x) => x.tick)
  );
  let fields = [
    "kills_total",
    "deaths_total",
    "mvps",
    "headshot_kills_total",
    "ace_rounds_total",
    "score",
  ];
  let scoreboard = parseTicks(`output/${demoId}.dem`, fields, [gameEndTick]);
  console.log(scoreboard);
  return scoreboard;
};

export { parseDemo };
