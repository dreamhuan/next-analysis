import { getAst, getPageList, getProjAlias, getProjTree, write } from "./utils";
import visit from "./visitor";
import * as path from "path";
import store from "./store";
import logger from "./logger";

const PROJ_PATH = process.env.PROJ_PATH;

async function main() {
  console.log("PROJ_PATH: ", PROJ_PATH);
  const devProjPath = "/Volumes/CaseSensitive/developer-purchase";
  // const devProjPath = "/Volumes/CaseSensitive/developer-product";
  const projPath = PROJ_PATH || devProjPath;
  store.projPath = projPath;

  const alias = await getProjAlias(projPath);
  store.alias = alias;

  const projTree = await getProjTree(projPath);
  store.projTree = projTree;

  const pagesDir = path.join(projPath, "/client/pages");
  const pages = await getPageList(pagesDir);
  // const pages = [
  //   "/Volumes/CaseSensitive/developer-purchase/client/components/pages/agreement/ContractTable.tsx",
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

  const outPath = PROJ_PATH
    ? path.resolve(projPath, "next-analysis.json")
    : "next-analysis.json";
  write(outPath, store.toJSON());
  console.log(
    "next-analysis.json、next-analysis.log placed in the root directory"
  );
  logger.info("======end======");
}

main();
