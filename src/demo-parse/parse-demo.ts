import { parseEvent, parseTicks } from "@laihoe/demoparser2";

const parseDemo = () => {
  let gameEndTick = Math.max(
    ...parseEvent("demos/demo.dem", "round_end").map((x) => x.tick)
  );
  let fields = [
    "kills_total",
    "deaths_total",
    "mvps",
    "headshot_kills_total",
    "ace_rounds_total",
    "score",
  ];
  let scoreboard = parseTicks("demos/demo.dem", fields, [gameEndTick]);
  console.log(scoreboard);
};

export { parseDemo };
