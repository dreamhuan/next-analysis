import React, { useEffect, useState } from "react";
import { getAnalysisJSON, testApi } from "@/api/index";
import styles from "./styles.module.scss";

export default function About() {
  const [name, setName] = useState("hello world");

  useEffect(() => {
    const run = async () => {
      const json = await getAnalysisJSON();
      setName(json.projPath);
    };
    run();
  }, []);

  const send = async (url: string) => {
    testApi(url);
  };

  return (
    <div className={styles.about}>
      <h1>Hello World!</h1>
      <p>{name}</p>
      <p>
        功能测试：(点击后会发请求，自行去network查看返回值)
        {["/api", "/api/json", "/api/all", "/api/not", "/api/i18n"].map(
          (url) => (
            <button
              key={url}
              onClick={() => {
                send(url);
              }}
            >
              {url}
            </button>
          )
        )}
      </p>
    </div>
  );
}
