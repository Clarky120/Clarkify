import { loadFirebase, logger } from "@clarkify/core";

logger.defaultMeta = {
  service: "cloud-functions",
};

loadFirebase();

export * from "./parse-task";
