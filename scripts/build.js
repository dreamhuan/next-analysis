const rm = require("rimraf");
const path = require("path");
const child_process = require("child_process");

const rootPath = process.cwd();

const CMD_LIST = [
  "yarn build",
  "cd server && yarn build",
  "cd app && yarn build",
];

const runCmd = (cmd) => {
  console.log("=====start cmd: ", cmd);
  return new Promise((resolve, reject) => {
    const handleChildData = (data) => {
      console.log(`child stdout: ${data}`);
    };
    const child = child_process.exec(cmd);
    child.stdout.on("data", handleChildData);
    child.stderr.on("data", handleChildData);
    child.on("exit", function (code, signal) {
      console.log(
        "child process exited with " + `code ${code} and signal ${signal}`
      );
      resolve();
      console.log("=====end cmd: ", cmd);
    });
  });
};

const rmDist = () => {
  console.log("=====start delete dist");
  return new Promise((resolve, reject) => {
    rm(path.resolve(rootPath, "dist"), (err) => {
      err ? reject(err) : resolve();
      console.log("=====end delete dist");
    });
  });
};

const main = async () => {
  await rmDist();
  for (const cmd of CMD_LIST) {
    await runCmd(cmd);
  }
};
main();
