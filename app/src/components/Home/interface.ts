export type TData = {
  nodes: TNode[];
  links: TLink[];
};

export type TNode = {
  id: string;
  group: number;
};

export type TLink = {
  source: string;
  target: string;
  value: number;
};
