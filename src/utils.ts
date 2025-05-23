import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";
import * as JSON5 from "json5";
import logger from "./logger";
import type { IProjTree } from "./store";

export function isWindows() {
  return /^win/.test(process.platform);
}

async function _addSuffix(pathName: string) {
  const suffix = ["", ".ts", ".tsx"];
  const len = suffix.length;
  const promises = suffix.map((suf) => fs.promises.access(pathName + suf));
  const resList = await Promise.allSettled(promises);
  for (let i = 0; i < len; i++) {
    if (resList[i].status === "fulfilled") {
      const fullPath = pathName + suffix[i];
      const stat = await fs.promises.stat(fullPath);
      if (stat.isFile()) {
        return fullPath;
      }
    }
  }

  return false;
}

export async function addSuffix(fileName: string) {
  if (!fileName) {
    return false;
  }
  let filePath: string = fileName;

  // 先直接加后缀
  let res = await _addSuffix(filePath);
  // false的话可能需要加个index再加后缀
  if (!res) {
    filePath = path.resolve(filePath, "index");
    res = await _addSuffix(filePath);
  }
  // 还是false说明文件有问题
  if (!res) {
    logger.error("file can't read", fileName);
    return false;
  }
  return res;
}

export async function read(fileName: string) {
  let filePath: string = fileName;
  if (!filePath.startsWith(path.sep)) {
    filePath = path.resolve(__dirname, fileName);
  }
  const res = await addSuffix(filePath);
  if (!res) {
    return false;
  }
  filePath = res;
  const buffer = await fs.promises.readFile(filePath);
  let code = buffer.toString();
  return code;
}

export async function write(fileName: string, content: string) {
  return fs.promises.writeFile(fileName, content);
}

export async function getAst(fileName: string) {
  const code = await read(fileName);
  if (!code) {
    return false;
  }
  const sourceFile: ts.SourceFile = ts.createSourceFile(
    "",
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  return sourceFile;
}

export async function getPageList(dir: string) {
  const pages: string[] = [];
  const stats = await fs.promises.stat(dir);
  if (stats.isDirectory()) {
    const paths = await fs.promises.readdir(dir);
    for (const pathItem of paths) {
      const fullPath = path.join(dir, pathItem);
      const lists = await getPageList(fullPath);
      pages.push(...lists);
    }
  } else {
    pages.push(dir);
  }
  return pages;
}

export async function getProjAlias(rootPath: string) {
  const tsConfigPath = path.join(rootPath, "tsconfig.json");
  const tsConfigBF = await fs.promises.readFile(tsConfigPath);
  const tsConfig = JSON5.parse(tsConfigBF.toString());
  let alias = tsConfig.compilerOptions.paths || {};
  alias = Object.fromEntries(
    Object.entries(alias)
      .filter(([k, v]) => k !== "*")
      .map(([k, v]) => [k, v[0]]),
  );
  alias["client/*"] = "client/*";
  const dirInClient = await fs.promises.readdir(path.join(rootPath, "client"));
  const canAlias = dirInClient.filter(
    (d) => ![".next", "_static", "@types", "i18n.js"].includes(d),
  );
  canAlias.forEach((k) => {
    alias[k] = `${k}/index.ts`;
    alias[`${k}/*`] = `client/${k}/*`;
  });
  return alias;
}

export async function getProjTree(parent, name = "client") {
  const curPath = path.join(parent, name);
  const children = await fs.promises.readdir(curPath);
  const pathObj = { name, isFile: false, children: [] };
  for (const child of children) {
    if (["_static", ".next", "@types"].includes(child)) {
      continue;
    }
    const childPath = path.join(curPath, child);
    const stat = await fs.promises.stat(childPath);
    if (stat.isFile()) {
      const childObj = { name: child, isFile: true };
      pathObj.children.push(childObj);
    } else {
      const childObj = await getProjTree(curPath, child);
      pathObj.children.push(childObj);
    }
  }
  return pathObj;
}

export function getProjAllPath(projTree: IProjTree, devProjPath: string) {
  // 递归遍历目录树，获取所有文件路径，并打平成list
  const allPath: string[] = [];
  function traverseTree(node: IProjTree, parentPath: string) {
    const curPath = path.join(parentPath, node.name);
    if (node.isFile) {
      allPath.push(path.join(devProjPath, curPath));
    } else {
      node.children.forEach((child) => {
        traverseTree(child, curPath);
      });
    }
  }
  traverseTree(projTree, "");
  return allPath;
}
