import React, { useEffect, useState } from "react";
import cx from "classnames";
import { Select, Tree } from "antd";
import { getAllUsedComps, getAllUsedPages } from "@/api";
import styles from "./styles.module.scss";

const { Option } = Select;
const { DirectoryTree } = Tree;

export default function PageSelector({
  value,
  hasTest = false,
  isComp = false,
  onChange,
}) {
  const [all, setAll] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      let all;
      if (isComp) {
        all = await getAllUsedComps();
      } else {
        all = await getAllUsedPages();
      }
      setAll(all);
    })();
  }, [isComp]);

  return (
    <div className={styles.selector}>
      <Select
        className={cx(styles.select)}
        showSearch
        value={value}
        placeholder="选择页面"
        optionFilterProp="children"
        onChange={onChange}
        filterOption={(input, option: any) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        allowClear
        dropdownMatchSelectWidth={false}
      >
        {hasTest && <Option value={"test"}>test</Option>}
        {all.map((d: string) => {
          return (
            <Option key={d} value={d}>
              {d}
            </Option>
          );
        })}
      </Select>
    </div>
  );
}
