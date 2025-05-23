import {
  getAst,
  getPageList,
  getProjAlias,
  getProjTree,
  write,
  getProjAllPath,
} from "./utils";
import visit from "./visitor";
import * as path from "path";
import store from "./store";
import logger from "./logger";

const PROJ_PATH = process.env.PROJ_PATH;

async function main() {
  console.log("PROJ_PATH: ", PROJ_PATH);
  // test
  const devProjPath = "/home/fkq/workspace/next-analysis/next-demo";
  const projPath = PROJ_PATH || devProjPath;
  store.projPath = projPath;

  const alias = await getProjAlias(projPath);
  store.alias = alias;

  const projTree = await getProjTree(projPath);
  store.projTree = projTree;

  const projAllFiles = getProjAllPath(projTree, devProjPath);
  store.projAllFiles = projAllFiles;

  const pagesDir = path.join(projPath, "/client/pages");
  const pages = await getPageList(pagesDir);

  const extraEntry = [path.join(projPath, "/client/main.tsx")];
  pages.push(...extraEntry);
  // test
  // const pages = [
  //   "",
  // ];
  logger.info(pages);
  store.entry = [...pages];
  store.allPath = [...pages];

  let curPage;
  while ((curPage = store.allPath[store.pathIdx])) {
    logger.info("======curPage======", curPage);
    const sourceFile = await getAst(curPage);
    if (sourceFile) {
      // 第一个参数是node，第二个参数是sourceFile
      visit(sourceFile, sourceFile);
    }
    await store.waitingForFinish();
    store.clearTask();
    store.pathIdx += 1;
  }

  const ignoreFolders = [
    path.join(projPath, "/client/assets"),
    path.join(projPath, "/client/styles"),
  ];
  store.setAllUnusedFiles(ignoreFolders);

  const outPath = PROJ_PATH
    ? path.resolve(projPath, "next-analysis.json")
    : "next-analysis.json";
  write(outPath, store.toJSON());
  console.log(
    "next-analysis.json、next-analysis.log placed in the root directory",
  );
  logger.info("======end======");
}

main();
