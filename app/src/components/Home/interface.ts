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

export type IClickEvt = {
  type: "click";
  data: {
    id: string;
  };
};

export type IMoveEvt = {
  type: "move";
  data: {
    aaa: number;
  };
};

export type IEvt = IClickEvt | IMoveEvt;

export type TEvtType = IEvt["type"];
export type TEvtData = IEvt["data"];
