import { parseEvent } from "@laihoe/demoparser2";

const parseDemo = () => {
  const event_json = parseEvent(
    "demos/demo.dem",
    "player_death",
    ["X", "Y"],
    ["total_rounds_played"]
  );
  console.log(event_json);
};

export { parseDemo };
