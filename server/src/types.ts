export interface IData {
  projPath: string;
  projTree: IProjTree;
  alias: Record<string, string>;
  entry: string[];
  allPath: string[];
  pathMapping: TPathMapping;
  compMapping: TCompMapping;
  i18nMapping: TCompMapping;
}

export interface IProjTree {
  name: string;
  isFile: boolean;
  children?: IProjTree[];
}

export interface IRefTree {
  page: string;
  refs: IRefItem[];
}

export interface IRefItem {
  page: string;
  comps: string[];
  refs: IRefItem[];
}

export type TPathMapping = Record<string, Record<string, string[]>>;
export type TCompMapping = Record<string, string[]>;
