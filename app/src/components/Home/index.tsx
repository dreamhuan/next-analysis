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
      message.success("复制成功");
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
        <Button onClick={repaint}>重绘</Button>
        <Card className={cx(styles.card)} title="基本信息">
          <p>
            结点路径：
            {curClick?.id && (
              <>
                <Tooltip title="以此为起点绘图">
                  <AreaChartOutlined
                    className={styles.icon}
                    onClick={() => handleChange(curClick?.id)}
                  />
                </Tooltip>
                <Tooltip title="组件引用分析">
                  <AimOutlined
                    className={styles.icon}
                    onClick={() => window.open(`/cmp?page=${curClick?.id}`)}
                  />
                </Tooltip>
                <Tooltip title="复制文件路径">
                  <CopyOutlined
                    className={styles.icon}
                    onClick={() => handleCopy(curClick?.id)}
                  />
                </Tooltip>
                <Tooltip title="清除选择">
                  <ClearOutlined
                    className={styles.icon}
                    onClick={() => handleChange("")}
                  />
                </Tooltip>
              </>
            )}
          </p>
          <p>{curClick?.id}</p>
          <p>引用组件：</p>
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
