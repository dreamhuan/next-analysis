class Store {
  projPath: string = "";
  projTree: IProjTree = { name: "client", isFile: false, children: [] };
  alias: Record<string, string> = {};
  entry: string[] = [];
  pathIdx: number = 0;
  allPath: string[] = [];
  pathMapping: Record<string, Record<string, string[]>> = {};
  compMapping: Record<string, string[]> = {};
  i18nMapping: Record<string, string[]> = {};

  taskList = [];

  addTask(p) {
    this.taskList.push(p);
  }

  waitingForFinish() {
    return Promise.all(this.taskList);
  }

  clearTask() {
    this.taskList = [];
  }

  addPath(path: string) {
    if (this.allPath.includes(path)) {
      return;
    } else {
      this.allPath.push(path);
    }
  }

  addPathMapping(path: string, impPath: string, impComps: string[]) {
    const pathMap = this.pathMapping[path];
    if (pathMap) {
      const originComps = pathMap[impPath] || [];
      pathMap[impPath] = Array.from(new Set([...originComps, ...impComps]));
    } else {
      this.pathMapping[path] = {
        [impPath]: impComps,
      };
    }
  }

  addCompMapping(impPath: string, comps: string[], refPath: string) {
    for (const comp of comps) {
      const key = `${impPath}__${comp}`;
      const refs = this.compMapping[key];
      if (refs) {
        this.compMapping[key] = Array.from(new Set([...refs, refPath]));
      } else {
        this.compMapping[key] = [refPath];
      }
    }
  }

  addI18nMapping(curPath: string, i18nKey: string) {
    const refs = this.i18nMapping[curPath];
    if (refs) {
      this.i18nMapping[curPath] = Array.from(new Set([...refs, i18nKey]));
    } else {
      this.i18nMapping[curPath] = [i18nKey];
    }
  }

  toJSON() {
    return JSON.stringify({
      projPath: this.projPath,
      alias: this.alias,
      projTree: this.projTree,
      entry: this.entry,
      allPath: this.allPath,
      pathMapping: this.pathMapping,
      compMapping: this.compMapping,
      i18nMapping: this.i18nMapping,
    });
  }
}

export default new Store();

interface IProjTree {
  name: string;
  isFile: boolean;
  children?: IProjTree[];
}
/**
 * 1. 哪些文件没被引用
 * 2. 某个文件的组件被哪些页面引用
 * 3. 某个页面用了哪些组件
 */

const demo = {
  entry: ["path1", "path2"],
  allPath: ["path1", "path2", "path11", "path12", "path111"],
  pathMapping: {
    path1: {
      path11: ["comp1", "comp2"],
      path12: ["comp3"],
    },
    path2: {
      path11: ["comp1"],
      path111: ["comp1", "comp4"],
    },
    path11: null,
    path12: null,
    path111: null,
  },
  compMapping: {
    path11__comp1: ["path1", "path2"],
    path111__comp1: ["path2"],
    path11__comp2: ["path1"],
    path12__comp3: ["path1"],
    path111__comp4: ["path2"],
  },
};
