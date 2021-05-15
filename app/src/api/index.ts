import fetch from "@/utils/fetch";

export const getAnalysisJSON = async () => {
  const result = await fetch<any>({
    url: "/api/json",
    method: "GET",
  });
  return result;
};

export const getGraphData = async (body: { page: string }) => {
  const result = await fetch<any>({
    url: "/api/graph",
    method: "GET",
    body,
  });
  return result;
};

export const getPageCmp = async (body: { page: string }) => {
  const result = await fetch<Record<string, string[]>>({
    url: "/api/cmp",
    method: "GET",
    body,
  });
  return result;
};

export const getAnalysisByPage = async (body: { page: string }) => {
  const result = await fetch<any>({
    url: "/api/analysis",
    method: "GET",
    body,
  });
  return result;
};

export const getAnalysisByCmp = async (body: { page: string }) => {
  const result = await fetch<any>({
    url: "/api/analysisCmp",
    method: "GET",
    body,
  });
  return result;
};

export const getAllUsedPages = async () => {
  const result = await fetch<any>({
    url: "/api/allUsed",
    method: "GET",
  });
  return result;
};

export const getAllUsedComps = async () => {
  const result = await fetch<any>({
    url: "/api/allUsedComp",
    method: "GET",
  });
  return result;
};

export const getAllPages = async () => {
  const result = await fetch<any>({
    url: "/api/all",
    method: "GET",
  });
  return result;
};

export const getI18n = async () => {
  const result = await fetch<any>({
    url: "/api/i18n",
    method: "GET",
  });
  return result;
};

export const testApi = async (url: string) => {
  const result = await fetch<any>({
    url,
    method: "GET",
  });
  return result;
};
