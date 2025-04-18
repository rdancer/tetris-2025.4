"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { TETROMINO_SHAPES } from "@/lib/tetrominos"
import {
  createEmptyBoard,
  createPiecePreview,
  checkCollision,
  addPieceToBoard,
  clearLines,
  calculateScore,
} from "@/lib/game-helpers"

export function useGameLogic() {
  // Game state
  const [board, setBoard] = useState(createEmptyBoard)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [isGameOver, setIsGameOver] = useState(true)
  const [isPaused, setIsPaused] = useState(false)

  // Active piece state
  const [activePiece, setActivePiece] = useState({
    type: 0,
    rotation: 0,
    position: { x: 0, y: 0 },
  })

  // Next piece preview
  const [nextPiece, setNextPiece] = useState(() => {
    const type = Math.floor(Math.random() * 7) + 1
    return {
      type,
      preview: createPiecePreview(type, TETROMINO_SHAPES),
    }
  })

  // Game loop interval
  const gameInterval = useRef<NodeJS.Timeout | null>(null)

  // Get the current shape of the active piece
  const getActiveShape = useCallback(() => {
    return TETROMINO_SHAPES[activePiece.type][activePiece.rotation]
  }, [activePiece.type, activePiece.rotation])

  // Generate a new random piece
  const generateRandomPiece = useCallback(() => {
    return Math.floor(Math.random() * 7) + 1
  }, [])

  // Spawn a new piece at the top of the board
  const spawnPiece = useCallback(() => {
    const type = nextPiece.type
    const rotation = 0
    const position = {
      x: Math.floor(board[0].length / 2) - Math.floor(TETROMINO_SHAPES[type][rotation][0].length / 2),
      y: 0,
    }

    setActivePiece({ type, rotation, position })

    // Generate the next piece
    const nextType = generateRandomPiece()
    setNextPiece({
      type: nextType,
      preview: createPiecePreview(nextType, TETROMINO_SHAPES),
    })

    // Check if the new piece collides immediately (game over)
    if (checkCollision(board, TETROMINO_SHAPES[type][rotation], position)) {
      setIsGameOver(true)
      if (gameInterval.current) {
        clearInterval(gameInterval.current)
        gameInterval.current = null
      }
    }
  }, [board, nextPiece.type, generateRandomPiece])

  // Lock the current piece in place and spawn a new one
  const lockPieceAndContinue = useCallback(() => {
    const shape = getActiveShape()

    // Add the piece to the board
    const newBoard = addPieceToBoard(board, activePiece.type, shape, activePiece.position)

    // Clear completed lines
    const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard)

    // Update the board
    setBoard(clearedBoard)

    // Update score and level if lines were cleared
    if (linesCleared > 0) {
      const newScore = score + calculateScore(linesCleared, level)
      const newLines = lines + linesCleared
      const newLevel = Math.floor(newLines / 10) + 1

      setScore(newScore)
      setLines(newLines)
      setLevel(newLevel)
    }

    // Spawn a new piece
    setTimeout(spawnPiece, 0)
  }, [board, activePiece, getActiveShape, score, level, lines, spawnPiece])

  // Move the piece down
  const moveDown = useCallback(() => {
    if (isGameOver || isPaused) return

    const newPosition = {
      ...activePiece.position,
      y: activePiece.position.y + 1,
    }

    if (!checkCollision(board, getActiveShape(), newPosition)) {
      // Move down if no collision
      setActivePiece((prev) => ({
        ...prev,
        position: newPosition,
      }))
    } else {
      // Lock the piece and continue if collision
      lockPieceAndContinue()
    }
  }, [board, activePiece, getActiveShape, isGameOver, isPaused, lockPieceAndContinue])

  // Move the piece left
  const moveLeft = useCallback(() => {
    if (isGameOver || isPaused) return

    const newPosition = {
      ...activePiece.position,
      x: activePiece.position.x - 1,
    }

    if (!checkCollision(board, getActiveShape(), newPosition)) {
      setActivePiece((prev) => ({
        ...prev,
        position: newPosition,
      }))
    }
  }, [board, activePiece, getActiveShape, isGameOver, isPaused])

  // Move the piece right
  const moveRight = useCallback(() => {
    if (isGameOver || isPaused) return

    const newPosition = {
      ...activePiece.position,
      x: activePiece.position.x + 1,
    }

    if (!checkCollision(board, getActiveShape(), newPosition)) {
      setActivePiece((prev) => ({
        ...prev,
        position: newPosition,
      }))
    }
  }, [board, activePiece, getActiveShape, isGameOver, isPaused])

  // Rotate the piece
  const rotate = useCallback(() => {
    if (isGameOver || isPaused) return

    const newRotation = (activePiece.rotation + 1) % TETROMINO_SHAPES[activePiece.type].length
    const newShape = TETROMINO_SHAPES[activePiece.type][newRotation]

    // Try normal rotation
    if (!checkCollision(board, newShape, activePiece.position)) {
      setActivePiece((prev) => ({
        ...prev,
        rotation: newRotation,
      }))
      return
    }

    // Try wall kicks (left and right)
    const kicks = [-1, 1, -2, 2]
    for (const kick of kicks) {
      const newPosition = {
        ...activePiece.position,
        x: activePiece.position.x + kick,
      }

      if (!checkCollision(board, newShape, newPosition)) {
        setActivePiece((prev) => ({
          ...prev,
          rotation: newRotation,
          position: newPosition,
        }))
        return
      }
    }
  }, [board, activePiece, isGameOver, isPaused])

  // Hard drop the piece
  const hardDrop = useCallback(() => {
    if (isGameOver || isPaused) return

    const newPosition = { ...activePiece.position }
    const shape = getActiveShape()

    // Move down until collision
    while (!checkCollision(board, shape, { ...newPosition, y: newPosition.y + 1 })) {
      newPosition.y += 1
    }

    setActivePiece((prev) => ({
      ...prev,
      position: newPosition,
    }))

    // Lock the piece on the next tick
    setTimeout(lockPieceAndContinue, 0)
  }, [board, activePiece, getActiveShape, isGameOver, isPaused, lockPieceAndContinue])

  // Start the game
  const startGame = useCallback(() => {
    // Reset game state
    setBoard(createEmptyBoard())
    setScore(0)
    setLines(0)
    setLevel(1)
    setIsGameOver(false)
    setIsPaused(false)

    // Generate the first piece
    const firstType = generateRandomPiece()
    const initialPosition = {
      x: Math.floor(10 / 2) - Math.floor(TETROMINO_SHAPES[firstType][0][0].length / 2),
      y: 0,
    }

    setActivePiece({
      type: firstType,
      rotation: 0,
      position: initialPosition,
    })

    // Generate the next piece
    const nextType = generateRandomPiece()
    setNextPiece({
      type: nextType,
      preview: createPiecePreview(nextType, TETROMINO_SHAPES),
    })

    // Clear any existing interval
    if (gameInterval.current) {
      clearInterval(gameInterval.current)
    }

    // Start the game loop
    gameInterval.current = setInterval(() => {
      moveDown()
    }, 1000 / level)
  }, [level, moveDown, generateRandomPiece])

  // Pause the game
  const pauseGame = useCallback(() => {
    if (isGameOver) return

    setIsPaused(true)
    if (gameInterval.current) {
      clearInterval(gameInterval.current)
      gameInterval.current = null
    }
  }, [isGameOver])

  // Resume the game
  const resumeGame = useCallback(() => {
    if (isGameOver) return

    setIsPaused(false)
    gameInterval.current = setInterval(() => {
      moveDown()
    }, 1000 / level)
  }, [isGameOver, level, moveDown])

  // Reset the game
  const resetGame = useCallback(() => {
    if (gameInterval.current) {
      clearInterval(gameInterval.current)
      gameInterval.current = null
    }
    startGame()
  }, [startGame])

  // Render the board with the active piece
  const renderBoard = useCallback(() => {
    if (activePiece.type === 0) return board

    // Create a copy of the board
    const displayBoard = board.map((row) => [...row])
    const shape = getActiveShape()

    // Add the active piece to the display board
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardY = y + activePiece.position.y
          const boardX = x + activePiece.position.x

          if (boardY >= 0 && boardY < displayBoard.length && boardX >= 0 && boardX < displayBoard[0].length) {
            displayBoard[boardY][boardX] = activePiece.type
          }
        }
      }
    }

    return displayBoard
  }, [board, activePiece, getActiveShape])

  // Update the game speed when level changes
  useEffect(() => {
    if (!isGameOver && !isPaused && gameInterval.current) {
      clearInterval(gameInterval.current)
      gameInterval.current = setInterval(() => {
        moveDown()
      }, 1000 / level)
    }

    return () => {
      if (gameInterval.current) {
        clearInterval(gameInterval.current)
      }
    }
  }, [isGameOver, isPaused, level, moveDown])

  return {
    board: renderBoard(),
    score,
    level,
    lines,
    nextPiece: nextPiece.preview,
    isGameOver,
    isPaused,
    moveLeft,
    moveRight,
    rotate,
    moveDown,
    hardDrop,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
  }
}
