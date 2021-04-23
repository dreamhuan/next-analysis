import React, { useEffect, useRef, useState } from "react";
import { getGraphData } from "@/api";
import chart from "./chat";
import styles from "./styles.module.scss";

export default function Home() {
  const ref = useRef<HTMLDivElement>(null);
  const width = 2000;
  const height = 2000;

  useEffect(() => {
    const run = async () => {
      const data = await getGraphData({ page: "" });
      chart(ref.current, data, width, height);
    };
    run();
  }, []);

  return (
    <div
      ref={ref}
      className={styles.home}
      style={{
        width,
        height,
      }}
    ></div>
  );
}
