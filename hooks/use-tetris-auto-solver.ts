"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { TETROMINO_SHAPES } from "@/lib/tetrominos"
import { checkCollision } from "@/lib/game-helpers"

interface AutoSolverProps {
  board: number[][]
  moveLeft: () => void
  moveRight: () => void
  rotate: () => void
  hardDrop: () => void
  isGameOver: boolean
  isPaused: boolean
  startGame: () => void
}

export function useTetrisAutoSolver({
  board,
  moveLeft,
  moveRight,
  rotate,
  hardDrop,
  isGameOver,
  isPaused,
  startGame,
}: AutoSolverProps) {
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const autoPlayInterval = useRef<NodeJS.Timeout | null>(null)
  const moveQueue = useRef<string[]>([])
  const lastBoardState = useRef<string>("")

  // Simple heuristic to evaluate a board state
  const evaluateBoard = useCallback((testBoard: number[][]) => {
    let score = 0
    const height = testBoard.length
    const width = testBoard[0].length

    // Count holes (empty cells with filled cells above them)
    let holes = 0
    for (let x = 0; x < width; x++) {
      let blockFound = false
      for (let y = 0; y < height; y++) {
        if (testBoard[y][x] > 0) {
          blockFound = true
        } else if (blockFound) {
          holes++
        }
      }
    }

    // Calculate aggregate height
    let aggregateHeight = 0
    const heights = []

    for (let x = 0; x < width; x++) {
      let columnHeight = 0
      for (let y = 0; y < height; y++) {
        if (testBoard[y][x] > 0) {
          columnHeight = height - y
          break
        }
      }
      heights.push(columnHeight)
      aggregateHeight += columnHeight
    }

    // Count complete lines
    let completeLines = 0
    for (let y = 0; y < height; y++) {
      if (testBoard[y].every((cell) => cell > 0)) {
        completeLines++
      }
    }

    // Calculate bumpiness (difference between adjacent column heights)
    let bumpiness = 0
    for (let i = 0; i < heights.length - 1; i++) {
      bumpiness += Math.abs(heights[i] - heights[i + 1])
    }

    // Calculate final score with weights
    score = completeLines * 100 - holes * 30 - aggregateHeight * 2 - bumpiness * 2

    return score
  }, [])

  // Find the current piece and its position
  const findCurrentPiece = useCallback(() => {
    // Compare with the last board state to find the current piece
    const currentBoardState = JSON.stringify(board)

    if (currentBoardState === lastBoardState.current) {
      return null
    }

    lastBoardState.current = currentBoardState

    // Find the highest non-empty cell which is likely part of the current piece
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        if (board[y][x] > 0) {
          // This is likely the current piece
          return {
            pieceType: board[y][x],
            position: { x, y },
          }
        }
      }
    }

    return null
  }, [board])

  // Find the best move for the current piece
  const findBestMove = useCallback(() => {
    const currentPieceInfo = findCurrentPiece()
    if (!currentPieceInfo) return

    const { pieceType } = currentPieceInfo
    const shapes = TETROMINO_SHAPES[pieceType]

    let bestScore = Number.NEGATIVE_INFINITY
    let bestMoves: string[] = []

    // Try all possible rotations and positions
    for (let rotation = 0; rotation < shapes.length; rotation++) {
      const shape = shapes[rotation]

      // Try all possible x positions
      for (let x = -2; x < board[0].length; x++) {
        const pos = { x, y: 0 }

        // Skip invalid positions
        if (checkCollision(board, shape, pos)) continue

        // Find the lowest valid position (simulate hard drop)
        let dropY = 0
        while (!checkCollision(board, shape, { ...pos, y: dropY + 1 })) {
          dropY++
        }

        // Create a test board with this move
        const testBoard = JSON.parse(JSON.stringify(board))
        for (let shapeY = 0; shapeY < shape.length; shapeY++) {
          for (let shapeX = 0; shapeX < shape[shapeY].length; shapeX++) {
            if (shape[shapeY][shapeX]) {
              const boardY = shapeY + dropY
              const boardX = shapeX + x

              if (boardY >= 0 && boardY < testBoard.length && boardX >= 0 && boardX < testBoard[0].length) {
                testBoard[boardY][boardX] = pieceType
              }
            }
          }
        }

        // Evaluate this move
        const score = evaluateBoard(testBoard)

        if (score > bestScore) {
          bestScore = score

          // Generate move sequence
          const rotationMoves = Array(rotation).fill("rotate")
          const horizontalMoves = []

          // Determine horizontal moves needed
          const currentX = currentPieceInfo.position.x
          const targetX = x

          if (targetX < currentX) {
            horizontalMoves.push(...Array(currentX - targetX).fill("left"))
          } else if (targetX > currentX) {
            horizontalMoves.push(...Array(targetX - currentX).fill("right"))
          }

          bestMoves = [...rotationMoves, ...horizontalMoves, "drop"]
        }
      }
    }

    return bestMoves
  }, [board, findCurrentPiece, evaluateBoard])

  // Execute the next move in the queue
  const executeNextMove = useCallback(() => {
    if (moveQueue.current.length === 0) {
      // Find the best move and add to queue
      const bestMoves = findBestMove()
      if (bestMoves && bestMoves.length > 0) {
        moveQueue.current = bestMoves
      }
    }

    if (moveQueue.current.length > 0) {
      const nextMove = moveQueue.current.shift()

      // Add a small delay between moves to prevent rapid state updates
      setTimeout(() => {
        switch (nextMove) {
          case "left":
            moveLeft()
            break
          case "right":
            moveRight()
            break
          case "rotate":
            rotate()
            break
          case "drop":
            hardDrop()
            break
        }
      }, 50)
    }
  }, [findBestMove, moveLeft, moveRight, rotate, hardDrop])

  // Toggle autoplay
  const toggleAutoPlay = useCallback(() => {
    if (isAutoPlaying) {
      // Stop autoplay
      setIsAutoPlaying(false)
      if (autoPlayInterval.current) {
        clearInterval(autoPlayInterval.current)
        autoPlayInterval.current = null
      }
      moveQueue.current = []
    } else {
      // Start autoplay
      setIsAutoPlaying(true)
      if (isGameOver) {
        startGame()
      }

      autoPlayInterval.current = setInterval(() => {
        if (!isPaused && !isGameOver) {
          executeNextMove()
        }
      }, 200)
    }
  }, [isAutoPlaying, isGameOver, isPaused, startGame, executeNextMove])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (autoPlayInterval.current) {
        clearInterval(autoPlayInterval.current)
      }
    }
  }, [])

  return {
    isAutoPlaying,
    toggleAutoPlay,
  }
}
