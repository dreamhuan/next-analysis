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

export const testApi = async (url: string) => {
  const result = await fetch<any>({
    url,
    method: "GET",
  });
  return result;
};
