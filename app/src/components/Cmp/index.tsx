import React, { useEffect, useState } from 'react'
import { getAnalysisByCmp, getAnalysisByPage, getI18n } from '@/api'
import PageSelector from '@/components/common/PageSelector'
import { Col, Input, Radio, Row, Tree } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import styles from './styles.module.scss'

export default function Cmp() {
  const [type, setType] = useState('page')
  const [value, setValue] = useState<string>()
  const [originTree, setOriginTree] = useState([])
  const [tree, setTree] = useState([])
  const [filterStr, setFilterStr] = useState('')

  const isComp = type === 'component'

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    console.log(params)
    const page = params.get('page')
    console.log(page)
    if (page) {
      setValue(page)
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      if (!value) {
        return
      }
      let data
      if (isComp) {
        data = await getAnalysisByCmp({ page: value })
      } else {
        data = await getAnalysisByPage({ page: value })
      }
      console.log(data)
      const tree = generatorTree(data)
      console.log(tree)
      setTree([tree])
      setOriginTree([tree])
    })()
  }, [value])

  const generatorTree = (node: { page; refs; comps? }) => {
    const { page, refs, comps } = node
    const tree = {
      title: `${page}__{${comps?.join(', ') || ''}}`,
      key: page + Math.random(),
      children: [],
      isLeaf: true,
    }
    if (refs.length) {
      tree.isLeaf = false
      tree.children = refs.map((node) => generatorTree(node))
    }
    return tree
  }

  const filterTree = () => {
    console.log('originTree', originTree)
    console.log('filterStr', filterStr)
    const filterReg = new RegExp(filterStr)
    console.log('filterReg', filterReg)
    const newTree = deepFilter(originTree, filterReg)
    console.log('newTree', newTree)
    setTree(newTree)
  }

  const deepFilter = (itemList, reg) => {
    return itemList
      .map((item) => {
        if (item.isLeaf && !reg.test(item.title)) {
          return false
        }
        const newItem = { ...item }
        const children = deepFilter(newItem.children, reg)
        if (children.length === 0 && !reg.test(newItem.title)) {
          return false
        }
        newItem.children = children
        return newItem
      })
      .filter(Boolean)
  }

  return (
    <div>
      <Radio.Group
        style={{ width: 200 }}
        options={[
          { label: 'page', value: 'page' },
          { label: 'component', value: 'component' },
        ]}
        onChange={(e) => {
          setType(e.target.value)
          setValue(undefined)
          setTree([])
        }}
        value={type}
      />
      <PageSelector value={value} onChange={setValue} isComp={isComp} />
      <Row>
        <Col style={{ width: 200 }}>过滤</Col>
        <Col>
          <Input
            style={{ width: 300 }}
            value={filterStr}
            onChange={(e) => setFilterStr(e.target.value)}
            onBlur={filterTree}
          />
        </Col>
      </Row>
      <Tree
        className={styles.tree}
        showLine
        switcherIcon={<DownOutlined />}
        treeData={tree}
      />
    </div>
  )
}
