import { Injectable } from '@nestjs/common';
import data from './data';
import { IProjTree, IRefItem, IRefTree, TPathMapping } from './types';
import graphMock from './mockGraph';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getDataSource() {
    return data.analysis;
  }

  getAnalysisByPage(page) {
    const {
      analysis: { pathMapping },
    } = data;
    const refTree: IRefTree = { page, refs: [] };
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

  getAllFiles() {
    const projTree = data.analysis.projTree;
    const files = getProdFiles(projTree, data.analysis.projPath);
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

  getI18N() {
    const i18nMapping = data.analysis.i18nMapping;
    let list = Object.entries(i18nMapping)
      .map(([k, v]) => v)
      .flat(1);
    list = [...new Set(list)];
    return list;
  }

  getGraphData(page = '') {
    if (page === 'test') {
      console.log('graphMock', graphMock);
      return graphMock;
    }

    let group = 1;
    const all = data.analysis.allPath.filter((file: string) =>
      judgeEnds(file, ['.tsx', '.ts', '.jsx', '.js']),
    );
    const entry = data.analysis.entry.filter((file: string) =>
      judgeEnds(file, ['.tsx', '.ts', '.jsx', '.js']),
    );
    const pathMapping = data.analysis.pathMapping;
    const nodeMap = all.reduce((acc, cur) => {
      acc[cur] = {};
      return acc;
    }, {});

    let nodes = [];
    let links = [];
    const allEntry = 'client';
    nodeMap[allEntry] = { group: 0 };
    entry.forEach((p) => {
      nodeMap[p].group = group;
      links.push({ source: allEntry, target: p, value: 1 });
    });

    Object.entries(pathMapping).forEach(([k, v]) => {
      group += 1;
      Object.entries(v).forEach(([innerK, innerV]) => {
        if (innerK.startsWith('/')) {
          nodeMap[k].group = nodeMap[k].group || group;
          links.push({ source: k, target: innerK, value: 1 });
        }
      });
    });

    nodes = Object.keys(nodeMap).map((k) => {
      const v = nodeMap[k];
      return {
        id: k,
        group: v.group,
      };
    });

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
    if (!ref.page.startsWith('/')) {
      continue;
    }
    if (circleRefFlag[ref.page]) {
      console.log('circle: ', ref.page);
      continue;
    }
    const refComps = mapping[ref.page];
    if (!refComps) {
      console.log('end: ', ref.page);
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

function getProdFiles(projTree: IProjTree, parent = '') {
  const name = parent + '/' + projTree.name;
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
