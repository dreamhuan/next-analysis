import React, { useEffect, useRef, useState } from "react";
import { Button, Card, Tree, message, Tooltip } from "antd";
import {
  AreaChartOutlined,
  ClearOutlined,
  CopyOutlined,
  DownOutlined,
  AimOutlined,
} from "@ant-design/icons";
import { getGraphData, getPageCmp } from "@/api";
import chart from "./chart";
import styles from "./styles.module.scss";
import { IEvt, TData } from "./interface";
import copy from "@/utils/copy";
import cx from "classnames";
import PageSelector from "@/components/common/PageSelector";

export default function Home() {
  const [value, setValue] = useState<string>();
  const [data, setData] = useState({} as TData);
  const [curClick, setCurClick] = useState<{
    id?: string;
    cmp?: any;
  }>();
  const ref = useRef<HTMLDivElement>();
  const width = 2000;
  const height = 2000;

  useEffect(() => {
    (async () => {
      const [data] = await Promise.all([getGraphData({ page: "" })]);
      setData(data);
    })();
  }, []);

  useEffect(() => {
    chart(ref.current, data, width, height, eventBus);
  }, [data]);

  const repaint = () => {
    setData({ ...data });
    setCurClick({});
  };

  const handleChange = async (v) => {
    setValue(v);
    const data = await getGraphData({ page: v });
    setData(data);
    handleNodeClick(v);
  };

  const handleCopy = (v) => {
    copy(v, () => {
      message.success("ε€εΆζε");
    });
  };

  const handleNodeClick = async (id) => {
    const refCmp = (await getPageCmp({ page: id })) || {};
    console.log("refCmp", refCmp);
    const cmp = Object.entries(refCmp).map(([k, v]) => {
      return {
        title: k,
        key: k,
        children: v.map((d) => {
          return { title: d, key: d, isLeaf: true };
        }),
      };
    });
    setCurClick({ id, cmp });
  };

  const eventBus = async (e: IEvt) => {
    switch (e.type) {
      case "click": {
        const id = e.data.id;
        handleNodeClick(id);
        break;
      }
      default: {
        console.log("unknown event", e);
      }
    }
  };

  return (
    <div className={styles.home}>
      <div className={styles.operation}>
        <PageSelector value={value} hasTest onChange={handleChange} />
        <Button onClick={repaint}>ιη»</Button>
        <Card className={cx(styles.card)} title="εΊζ¬δΏ‘ζ―">
          <p>
            η»ηΉθ·―εΎοΌ
            {curClick?.id && (
              <>
                <Tooltip title="δ»₯ζ­€δΈΊθ΅·ηΉη»εΎ">
                  <AreaChartOutlined
                    className={styles.icon}
                    onClick={() => handleChange(curClick?.id)}
                  />
                </Tooltip>
                <Tooltip title="η»δ»ΆεΌη¨εζ">
                  <AimOutlined
                    className={styles.icon}
                    onClick={() => window.open(`/cmp?page=${curClick?.id}`)}
                  />
                </Tooltip>
                <Tooltip title="ε€εΆζδ»Άθ·―εΎ">
                  <CopyOutlined
                    className={styles.icon}
                    onClick={() => handleCopy(curClick?.id)}
                  />
                </Tooltip>
                <Tooltip title="ζΈι€ιζ©">
                  <ClearOutlined
                    className={styles.icon}
                    onClick={() => handleChange("")}
                  />
                </Tooltip>
              </>
            )}
          </p>
          <p>{curClick?.id}</p>
          <p>εΌη¨η»δ»ΆοΌ</p>
          <Tree
            key={curClick?.id}
            className={styles.tree}
            showLine
            switcherIcon={<DownOutlined />}
            defaultExpandAll
            treeData={curClick?.cmp}
          />
        </Card>
      </div>
      <div
        id="draw-container"
        ref={ref}
        style={{
          width,
          height,
        }}
      ></div>
    </div>
  );
}
