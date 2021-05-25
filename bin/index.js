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
    .option("-z, --zh 执行静态分析，输出项目中的中文")
    .action(async (opts, cmd) => {
      const { zh } = opts || {};
      const rootDir = process.cwd();
      const binDir = path.resolve(__dirname, "..");
      const distDir = path.resolve(__dirname, "../dist");
      const child = child_process.exec(
        `cd ${distDir} && PROJ_PATH=${rootDir} ${
          zh ? "SHOW_ZH=1" : ""
        } node index.js`
      );

      if (child) {
        child.stdout.on("data", handleChildData);
        child.stderr.on("data", handleChildData);
      }
    });

  program
    .command("server")
    .option("-p, --port [port] 设置node服务端口，默认8080")
    .action(async (opts, cmd) => {
      const { port } = opts || {};
      const rootDir = process.cwd();
      const binDir = path.resolve(__dirname, "..");
      const distDir = path.resolve(__dirname, "../dist");
      try {
        await fs.promises.access(path.resolve(rootDir, "next-analysis.json"));
        const child = child_process.exec(
          `cd ${distDir} && PROJ_PATH=${rootDir} ${
            port ? "PORT=" + port : ""
          } node server/main.js`
        );

        if (child) {
          child.stdout.on("data", handleChildData);
          child.stderr.on("data", handleChildData);
        }
      } catch (e) {
        logger.error("next-analysis.json 不存在， 请先执行 next-analysis run 命令");
      }
    });

  program.parseAsync(process.argv);
}

run();
