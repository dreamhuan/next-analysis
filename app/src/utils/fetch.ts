import { message } from "antd";
import isofetch from "isomorphic-fetch";
import qs from "querystring";

const removeFalsy = (obj: any) => {
  const newObj = {} as any;
  Object.keys(obj).forEach((prop) => {
    if (obj[prop]) {
      newObj[prop] = obj[prop];
    }
  });
  return newObj;
};

const checkStatus = (res: any) => {
  const { status } = res;
  if (status >= 200 && status < 300) {
    return res;
  }
  return Promise.reject(res);
};

const parseJSON = (res: any) => res.json();

interface Config {
  url: string;
  body?: any;
  method?: string;
  opts?: any;
}

export interface IResult<T> {
  result?: T;
  status: "ok" | "error";
  success: boolean;
  t: number;
  errorCode?: string;
  errorMsg?: string;
}

function fetch<T = void>({
  url,
  body,
  method = "POST",
  opts = {},
}: Config): Promise<T> {
  method = method.toUpperCase();
  const { headers: h } = opts;
  const sameOrigin: RequestCredentials = "same-origin";
  let options = { method, credentials: sameOrigin, ...opts };
  const headers = removeFalsy({
    "content-type": "application/json; charset=utf-8",
    "X-Requested-With": "XMLHttpRequest",
    ...h,
  });
  options = { ...options, headers };
  if (
    method === "GET" ||
    method === "HEAD" ||
    method === "OPTIONS" ||
    method === "DELETE"
  ) {
    if (body) {
      url = `${url}?${qs.stringify(body)}`;
      options.body = undefined;
    }
  } else {
    if (body) {
      options.body = JSON.stringify(body);
    }
  }

  return isofetch(url, options)
    .then(parseJSON)
    .then(checkStatus)
    .then((r) => {
      return r.result;
    })
    .catch((e) => {
      message.error(e.errorMsg)
      return Promise.reject(e);
    });
}

export default fetch;
