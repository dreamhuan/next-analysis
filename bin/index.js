#!/usr/bin/env node
"use strict";

const commander = require("commander");
const fs = require("fs");
const path = require("path");
const child_process = require("child_process");
const logger = require("./logger");
const packageJson = require("../package.json");

const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split(".");
const major = semver[0];

if (major < 10) {
  console.error(
    "You are runing Node " +
      currentNodeVersion +
      ".\n" +
      "next-analysis requires Node 10 or higher. \n" +
      "Please update your versions of Node."
  );
  process.exit(1);
}

const handleChildData = (data) => {
  console.log(`child stdout: ${data}`);
};

async function run() {
  const program = new commander.Command(packageJson.name);

  program.version(packageJson.version);

  program
    .command("run")
    .option("-a, --analysis 执行静态分析，不传参数默认执行这个命令")
    .option("-s, --server 启动node服务，确保先执行-r后再执行这个命令")
    .option("-p, --port [port]设置node服务端口，传了这个参数默认会启动服务")
    .action(async (opts, cmd) => {
      const { server, port } = opts || {};
      const rootDir = process.cwd();
      const binDir = path.resolve(__dirname, "..");
      const distDir = path.resolve(__dirname, "../dist");
      let child;
      if (port || server) {
        try {
          const analysisFile = await fs.promises.access(
            path.resolve(rootDir, "next-analysis.json")
          );
          if (port) {
            child = child_process.exec(
              `cd ${distDir} && PROJ_PATH=${rootDir} PORT=${port} node server/main.js`
            );
          }
          if (server) {
            child = child_process.exec(
              `cd ${distDir} && PROJ_PATH=${rootDir} node server/main.js`
            );
          }
        } catch (e) {
          logger.error("next-analysis.json 不存在， 请先不带参数执行命令");
        }
      } else {
        child = child_process.exec(
          `cd ${distDir} && PROJ_PATH=${rootDir} node index.js`
        );
      }
      if (child) {
        child.stdout.on("data", handleChildData);
        child.stderr.on("data", handleChildData);
      }
    });

  program.parseAsync(process.argv);
}

run();
