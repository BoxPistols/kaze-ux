/**
 * CanvasNode → JSX コード生成
 */

import { getComponentMeta } from './registry'

import type { CanvasNode } from './types'

// プロパティ文字列を生成（デフォルト値と同じなら省略）
const generatePropsString = (
  props: Record<string, unknown>,
  defaults: Record<string, unknown>
): string => {
  const entries = Object.entries(props).filter(([key, value]) => {
    if (key === 'children') return false
    if (key === 'sx') return false
    return value !== defaults[key]
  })

  if (entries.length === 0) return ''

  return entries
    .map(([key, value]) => {
      if (typeof value === 'string') return ` ${key}='${value}'`
      if (typeof value === 'boolean') return value ? ` ${key}` : ''
      if (typeof value === 'number') return ` ${key}={${value}}`
      return ''
    })
    .join('')
}

// CanvasNode → JSX
export const generateJSX = (nodes: CanvasNode[], indent = 0): string => {
  return nodes
    .map((node) => {
      const meta = getComponentMeta(node.componentId)
      if (!meta) return ''

      const propsStr = generatePropsString(node.props, meta.defaultProps)
      const ind = '  '.repeat(indent)
      const childrenText =
        typeof node.props.children === 'string' ? node.props.children : ''

      if (node.children.length === 0 && !childrenText) {
        return `${ind}<${meta.importName}${propsStr} />`
      }

      const innerContent = childrenText
        ? `${ind}  ${childrenText}`
        : generateJSX(node.children, indent + 1)

      return [
        `${ind}<${meta.importName}${propsStr}>`,
        innerContent,
        `${ind}</${meta.importName}>`,
      ].join('\n')
    })
    .join('\n')
}

// import 文を収集
const collectImports = (nodes: CanvasNode[]): Map<string, Set<string>> => {
  const imports = new Map<string, Set<string>>()

  const walk = (nodeList: CanvasNode[]) => {
    for (const node of nodeList) {
      const meta = getComponentMeta(node.componentId)
      if (meta) {
        const existing = imports.get(meta.importPath) ?? new Set()
        existing.add(meta.importName)
        imports.set(meta.importPath, existing)
      }
      walk(node.children)
    }
  }

  walk(nodes)
  return imports
}

export const generateImports = (nodes: CanvasNode[]): string => {
  const imports = collectImports(nodes)
  return [...imports.entries()]
    .map(
      ([path, names]) => `import { ${[...names].join(', ')} } from '${path}'`
    )
    .join('\n')
}

// 完全なコンポーネントファイル
export const generateComponentFile = (
  name: string,
  nodes: CanvasNode[]
): string => {
  const imports = generateImports(nodes)
  const jsx = generateJSX(nodes, 2)
  const componentName = name.replace(/\s+/g, '')

  return `${imports}

export const ${componentName} = () => {
  return (
${jsx}
  )
}
`
}
