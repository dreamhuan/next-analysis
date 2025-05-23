import * as ts from "typescript";
import * as kind from "ts-is-kind";
import * as path from "path";
import store from "./store";
import logger from "./logger";
import { addSuffix } from "./utils";

const frequentlyLib = ["react", "lodash", "moment", "classnames"];

const i18nExps = ["i18n.t", "t"];

const SHOW_ZH = process.env.SHOW_ZH;

export default function visit(node: ts.Node, sf: ts.SourceFile) {
  const alias = store.alias;
  const projPath = store.projPath;
  const curPath = store.allPath[store.pathIdx];
  const curDir = curPath.substring(0, curPath.lastIndexOf(path.sep));
  const aliasKeys = Object.keys(alias);
  const nodeText = node.getText();

  if (kind.isCallExpression(node)) {
    const expName = node.expression.getText();
    const firstArg = node.arguments[0]?.getText();

    if (i18nExps.includes(expName)) {
      logger.info("======curPage======", expName, firstArg);
      store.addI18nMapping(curPath, firstArg);
    }
  }

  if (SHOW_ZH && !curPath.includes("/locales/")) {
    if (kind.isStringLiteral(node) || kind.isJsxText(node)) {
      if (/.*([\u4e00-\u9fa5])+.*/.test(nodeText)) {
        const { line } = sf.getLineAndCharacterOfPosition(node.getStart());
        console.log(`${curPath}:${line + 1}`);
        console.log(nodeText);
      }
    }
  }

  let impFlag = 0;
  let impExpFlag = 0;

  if (kind.isImportDeclaration(node)) {
    impFlag = 1;
  }

  // 处理 export { default as ContractTable } from './ContractTable' 的情况
  if (kind.isExportDeclaration(node) && /export.*from.*/.test(nodeText)) {
    logger.warn("特殊处理", nodeText);
    impExpFlag = 1;
  }

  if (impFlag || impExpFlag) {
    let includePath = (node as ts.ImportDeclaration).moduleSpecifier.getText();
    includePath = includePath.replace(/'|"/g, "");
    const firstPath = includePath.split(path.sep)[0];

    if (includePath.endsWith(".scss") || includePath.endsWith(".css")) {
      return;
    }

    let defaultImp, namedAsImp, namedImp, namedExp;

    if (kind.isImportDeclaration(node)) {
      // import React from 'react'
      defaultImp = node.importClause?.name?.escapedText;
      // import * as React from 'react'
      namedAsImp = (node.importClause?.namedBindings as ts.NamespaceImport)
        ?.name?.escapedText;
      // import {default as React} from 'react'
      namedImp = (
        node.importClause?.namedBindings as ts.NamedImports
      )?.elements?.map(
        (ele) => ele.propertyName?.escapedText || ele.name?.escapedText
      );
    } else if (kind.isExportDeclaration(node)) {
      // export { default as ContractTable } from './ContractTable'
      const expElements: any =
        (impExpFlag && (node.exportClause as ts.NamedExports)?.elements) || [];
      namedExp = expElements.map(
        (ele) => ele.propertyName?.escapedText || ele.name?.escapedText
      );
    }

    let absolutePath;
    // 通过alias计算绝对路径，常用库直接跳过
    if (frequentlyLib.includes(firstPath)) {
      // todo
    } else {
      if (includePath.startsWith(".")) {
        absolutePath = path.resolve(curDir, includePath);
      } else if (aliasKeys.includes(includePath)) {
        const value = alias[includePath];
        absolutePath = path.resolve(projPath, value);
      } else {
        for (const k of aliasKeys) {
          if (!k.includes("*")) {
            continue;
          }
          const reg = new RegExp(k.replace("*", ".*"));
          if (reg.test(includePath)) {
            const value = alias[k].replace("*", "");
            absolutePath = path.resolve(
              projPath,
              includePath.replace(firstPath, value)
            );
            break;
          }
        }
      }
    }

    // ts的ast遍历不能返回东西，不然直接结束了，所以只能直接用promise.then
    // 担心同步任务结束的时候异步任务还在进行，所以放到promise队列
    store.addTask(
      addSuffix(absolutePath).then((absPath) => {
        logger.info("refObj", {
          curPath,
          nodeText,
          includePath,
          absolutePath: absPath,
          defaultImp,
          namedImp,
          namedExp,
        });
        let comps = (namedImp as string[]) || [];
        if (defaultImp) {
          comps.unshift(`${defaultImp}(default)`);
        } else if (namedAsImp) {
          comps.unshift(`${namedAsImp}(*)`);
        } else if (impExpFlag) {
          comps = namedExp ?? ["*"];
        }
        if (absPath) {
          store.addPath(absPath);
        }
        store.addPathMapping(curPath, absPath || includePath, comps);
        store.addCompMapping(absPath || includePath, comps, curPath);
      })
    );
  } else {
    return node.forEachChild((node) => visit(node, sf));
  }
}
