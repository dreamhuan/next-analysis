import React, { useEffect, useState } from "react";
import { getAnalysisByCmp, getAnalysisByPage, getI18n } from "@/api";
import PageSelector from "@/components/common/PageSelector";
import { Radio, Tree } from "antd";
import { DownOutlined } from "@ant-design/icons";
import styles from "./styles.module.scss";

export default function Cmp() {
  const [type, setType] = useState("page");
  const [value, setValue] = useState("");
  const [tree, setTree] = useState([]);

  const isComp = type === "component";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    console.log(params);
    const page = params.get("page");
    console.log(page);
    if (page) {
      setValue(page);
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (!value) {
        return;
      }
      let data;
      if (isComp) {
        data = await getAnalysisByCmp({ page: value });

      } else {
        data = await getAnalysisByPage({ page: value });
      }
      console.log(data);
      const tree = generatorTree(data);
      console.log(tree);
      setTree([tree]);
    })();
  }, [value]);

  const generatorTree = (node: { page; refs; comps? }) => {
    const { page, refs, comps } = node;
    const tree = {
      title: `${page}__{${comps?.join(", ") || ""}}`,
      key: page + Math.random(),
      children: [],
      isLeaf: true,
    };
    if (refs.length) {
      tree.isLeaf = false;
      tree.children = refs.map((node) => generatorTree(node));
    }
    return tree;
  };

  return (
    <div>
      <Radio.Group
        options={[
          { label: "page", value: "page" },
          { label: "component", value: "component" },
        ]}
        onChange={(e) => setType(e.target.value)}
        value={type}
      />
      <PageSelector value={value} onChange={setValue} isComp={isComp} />
      <Tree
        className={styles.tree}
        showLine
        switcherIcon={<DownOutlined />}
        treeData={tree}
      />
    </div>
  );
}
