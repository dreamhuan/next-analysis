import * as log4js from "log4js";
import * as path from "path";

const PROJ_PATH = process.env.PROJ_PATH;

log4js.configure({
  appenders: {
    production: {
      type: "dateFile",
      filename: PROJ_PATH
        ? path.resolve(PROJ_PATH, "next-analysis.log")
        : "next-analysis.log",
    },
  },
  categories: {
    default: { appenders: ["production"], level: "debug" },
  },
});

const logger = log4js.getLogger();
logger.level = "debug";
// logger.level = "error";

export default logger;
