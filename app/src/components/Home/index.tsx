import React, { useEffect, useRef, useState } from "react";
import { Button, Select, Card, Tree, message, Tooltip } from "antd";
import {
  AreaChartOutlined,
  ClearOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { getAllUsedPages, getGraphData, getPageCmp } from "@/api";
import chart from "./chart";
import styles from "./styles.module.scss";
import { IEvt, TData, TEvtData, TEvtType } from "./interface";
import copy from "@/utils/copy";
import cx from "classnames";

const { Option } = Select;
const { DirectoryTree } = Tree;

export default function Home() {
  const [all, setAll] = useState<string[]>([]);
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
      const [data, all] = await Promise.all([
        getGraphData({ page: "" }),
        getAllUsedPages(),
      ]);
      setAll(all);
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
    const refCmp = await getPageCmp({ page: id });
    console.log("refCmp", refCmp);
    const cmp = Object.entries(refCmp || {}).map(([k, v]) => {
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
        <Select
          className={cx(styles.col, styles.select)}
          showSearch
          value={value}
          placeholder="选择页面"
          optionFilterProp="children"
          onChange={handleChange}
          filterOption={(input, option: any) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          allowClear
          dropdownMatchSelectWidth={false}
        >
          <Option value={"test"}>test</Option>
          {all.map((d: string) => {
            return (
              <Option key={d} value={d}>
                {d}
              </Option>
            );
          })}
        </Select>
        <Button className={styles.col} onClick={repaint}>
          重绘
        </Button>
        <Card className={cx(styles.col, styles.card)} title="基本信息">
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
          <DirectoryTree
            key={curClick?.id}
            className={styles.tree}
            multiple
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
