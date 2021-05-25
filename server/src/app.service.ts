import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import data from './data';
import { IProjTree, IRefItem, TCompMapping, TPathMapping } from './types';
import graphMock from './mockGraph';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getDataSource() {
    return data.analysis;
  }

  getPageCmp(page) {
    let pathMapping = { ...data.analysis.pathMapping };
    if (page === 'client') {
      const entry = data.analysis.entry.filter((file: string) =>
        judgeEnds(file, ['.tsx', '.ts', '.jsx', '.js']),
      );
      pathMapping['client'] = entry.reduce((acc, cur) => {
        acc[cur] = [];
        return acc;
      }, {});
    }
    return pathMapping[page];
  }

  getAnalysisByPage(page) {
    const {
      analysis: { pathMapping },
    } = data;
    const refTree: IRefItem = { page, refs: [] };
    const refComps = pathMapping[page];
    if (!refComps) {
      throw 'page not fond';
    }
    Object.keys(refComps).forEach((compPath) => {
      refTree.refs.push({
        page: compPath,
        comps: refComps[compPath],
        refs: [],
      });
    });
    generatorRefTree(refTree.refs, pathMapping);
    return refTree;
  }

  getAnalysisByCmp(page) {
    let {
      analysis: { pathMapping, compMapping },
      cmpUsedMapping,
    } = data;
    if (!cmpUsedMapping) {
      cmpUsedMapping = data.cmpUsedMapping = initCmpMapping(pathMapping);
    }

    const cmpTree: IRefItem = { page, refs: [] };
    const refedComps = compMapping[page];
    if (!refedComps) {
      throw 'page not fond';
    }
    refedComps.forEach((compPath) => {
      cmpTree.refs.push({
        page: compPath,
        refs: [],
      });
    });
    generatorCmpTree(cmpTree.refs, cmpUsedMapping);
    return cmpTree;
  }

  getAllUsedCmpFiles() {
    const all = data.analysis.allPath;
    const files = all.filter((file: string) => judgeEnds(file, ['.tsx']));
    return files;
  }

  getAllUsedCmp() {
    return Object.keys(data.analysis.compMapping);
  }

  getAllFiles() {
    const projTree = data.analysis.projTree;
    const files = getProdFiles(projTree, '');
    return files;
  }

  getNotUsedFiles() {
    const all = this.getAllFiles();
    const used = data.analysis.allPath;
    const usedMap = used.reduce((acc, cur) => {
      acc[cur] = 1;
      return acc;
    }, {});
    const notUsed = all
      .filter((file) => !usedMap[file])
      // .filter((file: string) => !file.endsWith('.scss'))
      // .filter((file: string) => !file.endsWith('scss.d.ts'))
      .filter((file: string) =>
        judgeEnds(file, ['.tsx', '.ts', '.jsx', '.js']),
      );
    return notUsed;
  }

  async getI18N() {
    const projPath = data.analysis.projPath;
    const i18nMapping = data.analysis.i18nMapping || {};
    // i18nMapping取出所有的key并去重
    let list = Object.entries(i18nMapping)
      .map(([k, v]) => v)
      .flat(1);
    list = [...new Set(list)];
    // 拿本地i18n文件
    const readLanPromise = ['zh', 'en']
      .map((lan) => `${projPath}/client/static/locales/${lan}/translation.json`)
      .map((f) => getFileContent(f))
      .map((p) => p.then((str) => JSON.parse(str)));
    const [zhLang, enLang] = await Promise.all(readLanPromise);
    // 合成本地文件的i18n对象
    let fileLangObj = mergeLang({
      zh: zhLang,
      en: enLang,
    });
    const fileLangKeys = Object.keys(fileLangObj);
    // 根据用到的key去i18n对象里拿数据
    let usedLang = {};
    let specialKeys = [];
    let specialMap = { number: 0 };
    list.forEach((i18nKey) => {
      // 特殊的key的处理
      if (i18nKey.includes('+') || i18nKey.includes('`')) {
        console.log(i18nKey);
        specialKeys.push(i18nKey);
        if (i18nKey.includes('`')) {
          const keyRegStr = i18nKey
            .replace(/`/g, '')
            .replace(/\$\{.*\}/, '(.*)');
          const keyReg = new RegExp(keyRegStr, 'g');
          specialMap.number++;
          specialMap[i18nKey] = {
            reg: keyRegStr,
            value: [],
          };
          fileLangKeys.forEach((k) => {
            if (keyReg.test(k)) {
              specialMap[i18nKey].value.push(k);
              usedLang[k] = fileLangObj[k];
            }
          });
        }
      } else {
        const realKey = i18nKey.replace(/'/g, '');
        usedLang[realKey] = fileLangObj[realKey];
      }
    });

    return {
      i18nMapping,
      list,
      fileLangObj,
      usedLang,
      specialKeys,
      specialMap,
    };
  }

  getGraphData(page = '') {
    if (page === 'test') {
      console.log('graphMock', graphMock);
      return graphMock;
    }

    let pathMapping = { ...data.analysis.pathMapping };
    let nodes = [];
    let nodeVisited = {};
    let links = [];

    if (!page) {
      const entry = data.analysis.entry.filter((file: string) =>
        judgeEnds(file, ['.tsx', '.ts', '.jsx', '.js']),
      );
      pathMapping['client'] = entry.reduce((acc, cur) => {
        acc[cur] = [];
        return acc;
      }, {});

      nodes.push({ id: 'client', group: 0 });
    } else {
      nodes.push({ id: page, group: 0 });
    }
    nodeVisited[nodes[0].id] = true;

    let iter = 0;
    let node = nodes[iter];
    while (node) {
      const item = pathMapping[node.id];
      Object.keys(item || {}).forEach((k) => {
        if (k.startsWith('client')) {
          if (!nodeVisited[k]) {
            nodeVisited[k] = true;
            nodes.push({
              id: k,
              group: iter + 1,
            });
          }

          links.push({
            source: node.id,
            target: k,
            value: 1,
          });
        }
      });
      iter += 1;
      node = nodes[iter];
    }

    return {
      nodes,
      links,
    };
  }
}

function generatorRefTree(
  refs: IRefItem[],
  mapping: TPathMapping,
  circleRefFlag = {},
) {
  for (const ref of refs) {
    // console.log('current: ', ref.page);
    if (!ref.page.startsWith('client')) {
      // console.log('third: ', ref.page);
      continue;
    }
    if (circleRefFlag[ref.page]) {
      console.log('circle: ', ref.page);
      continue;
    }
    const refComps = mapping[ref.page];
    if (!refComps) {
      // console.log('end: ', ref.page);
      continue;
    }
    circleRefFlag[ref.page] = 1;
    Object.keys(refComps).forEach((compPath) => {
      ref.refs.push({
        page: compPath,
        comps: refComps[compPath],
        refs: [],
      });
    });
    generatorRefTree(ref.refs, mapping, circleRefFlag);
    circleRefFlag[ref.page] = 0;
  }
}
function initCmpMapping(pathMapping) {
  const mapping = {};
  Object.entries(pathMapping || {}).forEach(([k, v]) => {
    Object.keys(v).forEach((innerK) => {
      if (innerK.startsWith('client')) {
        if (mapping[innerK]) {
          mapping[innerK].push(k);
        } else {
          mapping[innerK] = [k];
        }
      }
    });
  });
  return mapping;
}

function generatorCmpTree(
  refed: IRefItem[],
  mapping: TCompMapping,
  circleRefFlag = {},
) {
  for (const ref of refed) {
    // console.log('current: ', ref.page);
    if (circleRefFlag[ref.page]) {
      console.log('circle: ', ref.page);
      continue;
    }
    const refComps = mapping[ref.page];
    if (!refComps) {
      // console.log('end: ', ref.page);
      continue;
    }
    circleRefFlag[ref.page] = 1;
    refComps.forEach((compPath) => {
      ref.refs.push({
        page: compPath,
        refs: [],
      });
    });
    generatorCmpTree(ref.refs, mapping, circleRefFlag);
    circleRefFlag[ref.page] = 0;
  }
}

function getProdFiles(projTree: IProjTree, parent = '') {
  let name = projTree.name;
  if (parent) {
    name = parent + '/' + name;
  }
  let files = [];
  if (projTree.isFile) {
    files = [name];
  } else {
    for (const item of projTree.children) {
      const f = getProdFiles(item, name);
      files = [...files, ...f];
    }
  }
  return files;
}

function judgeEnds(str: string, endsArr: string[]) {
  const len = endsArr.length;
  for (let i = 0; i < len; i++) {
    if (str.endsWith(endsArr[i])) {
      return true;
    }
  }
  return false;
}

async function getFileContent(file) {
  const buff = await fs.promises.readFile(file);
  return buff.toString();
}

function mergeLang(langMap) {
  let obj = {};
  Object.keys(langMap).forEach((lang) => {
    const LangValue = langMap[lang];
    Object.keys(LangValue).reduce((acc, cur) => {
      acc[cur] = {
        ...acc[cur],
        [lang]: LangValue[cur],
      };
      return acc;
    }, obj);
  });
  return obj;
}
