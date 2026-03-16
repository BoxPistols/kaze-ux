/**
 * キャンバス状態管理
 * useReducer でノードツリーの CRUD + Undo/Redo
 */

import { useReducer, useCallback, useRef } from 'react'

import type { CanvasNode, CanvasAction, PageState } from '../types'

// ノードツリーを再帰的に操作するヘルパー
const addNodeToTree = (
  nodes: CanvasNode[],
  parentId: string | null,
  newNode: CanvasNode
): CanvasNode[] => {
  if (parentId === null) return [...nodes, newNode]
  return nodes.map((node) => {
    if (node.id === parentId) {
      return { ...node, children: [...node.children, newNode] }
    }
    return {
      ...node,
      children: addNodeToTree(node.children, parentId, newNode),
    }
  })
}

const removeNodeFromTree = (
  nodes: CanvasNode[],
  nodeId: string
): CanvasNode[] =>
  nodes
    .filter((node) => node.id !== nodeId)
    .map((node) => ({
      ...node,
      children: removeNodeFromTree(node.children, nodeId),
    }))

const updateNodeInTree = (
  nodes: CanvasNode[],
  nodeId: string,
  updater: (node: CanvasNode) => CanvasNode
): CanvasNode[] =>
  nodes.map((node) => {
    if (node.id === nodeId) return updater(node)
    return {
      ...node,
      children: updateNodeInTree(node.children, nodeId, updater),
    }
  })

const findNodeInTree = (
  nodes: CanvasNode[],
  nodeId: string
): CanvasNode | null => {
  for (const node of nodes) {
    if (node.id === nodeId) return node
    const found = findNodeInTree(node.children, nodeId)
    if (found) return found
  }
  return null
}

// Reducer
const canvasReducer = (state: PageState, action: CanvasAction): PageState => {
  const now = new Date().toISOString()
  switch (action.type) {
    case 'ADD_NODE':
      return {
        ...state,
        rootNodes: addNodeToTree(state.rootNodes, action.parentId, action.node),
        updatedAt: now,
      }
    case 'REMOVE_NODE':
      return {
        ...state,
        rootNodes: removeNodeFromTree(state.rootNodes, action.nodeId),
        updatedAt: now,
      }
    case 'UPDATE_PROPS':
      return {
        ...state,
        rootNodes: updateNodeInTree(state.rootNodes, action.nodeId, (node) => ({
          ...node,
          props: { ...node.props, ...action.props },
        })),
        updatedAt: now,
      }
    case 'UPDATE_LAYOUT':
      return {
        ...state,
        rootNodes: updateNodeInTree(state.rootNodes, action.nodeId, (node) => ({
          ...node,
          layout: { ...node.layout, ...action.layout },
        })),
        updatedAt: now,
      }
    case 'MOVE_NODE': {
      const targetNode = findNodeInTree(state.rootNodes, action.nodeId)
      if (!targetNode) return state
      const withoutNode = removeNodeFromTree(state.rootNodes, action.nodeId)
      return {
        ...state,
        rootNodes: addNodeToTree(withoutNode, action.newParentId, targetNode),
        updatedAt: now,
      }
    }
    case 'SET_STATE':
      return action.state
    case 'CLEAR':
      return { ...state, rootNodes: [], updatedAt: now }
    default:
      return state
  }
}

const createInitialState = (): PageState => ({
  id: crypto.randomUUID(),
  name: 'New Page',
  rootNodes: [],
  updatedAt: new Date().toISOString(),
})

export const useCanvasState = () => {
  const [state, dispatch] = useReducer(
    canvasReducer,
    undefined,
    createInitialState
  )

  // Undo/Redo 用の履歴
  const historyRef = useRef<PageState[]>([])
  const futureRef = useRef<PageState[]>([])

  const dispatchWithHistory = useCallback(
    (action: CanvasAction) => {
      historyRef.current = [...historyRef.current, state].slice(-50)
      futureRef.current = []
      dispatch(action)
    },
    [state]
  )

  const undo = useCallback(() => {
    const prev = historyRef.current.pop()
    if (prev) {
      futureRef.current.push(state)
      dispatch({ type: 'SET_STATE', state: prev })
    }
  }, [state])

  const redo = useCallback(() => {
    const next = futureRef.current.pop()
    if (next) {
      historyRef.current.push(state)
      dispatch({ type: 'SET_STATE', state: next })
    }
  }, [state])

  const findNode = useCallback(
    (nodeId: string) => findNodeInTree(state.rootNodes, nodeId),
    [state.rootNodes]
  )

  return {
    state,
    dispatch: dispatchWithHistory,
    undo,
    redo,
    canUndo: historyRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
    findNode,
  }
}
