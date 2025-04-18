"use client"

import { useState, useEffect, useCallback } from "react"
import { createBoard, checkCollision, createPreviewBoard, randomTetromino } from "@/lib/game-helpers"
import { rotate } from "@/lib/tetrominos"

export const useTetris = () => {
  // Game state
  const [board, setBoard] = useState(createBoard)
  const [gameOver, setGameOver] = useState(true)
  const [paused, setPaused] = useState(false)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lines, setLines] = useState(0)

  // Tetromino state
  const [tetromino, setTetromino] = useState(randomTetromino())
  const [nextTetromino, setNextTetromino] = useState(randomTetromino())
  const [position, setPosition] = useState({ x: 3, y: 0 })

  // Next piece preview
  const [preview, setPreview] = useState(() => createPreviewBoard(nextTetromino.shape))

  // Game speed
  const [dropTime, setDropTime] = useState(null)

  // Update the preview when the next tetromino changes
  useEffect(() => {
    setPreview(createPreviewBoard(nextTetromino.shape))
  }, [nextTetromino])

  // Start the game
  const startGame = useCallback(() => {
    // Reset everything
    setBoard(createBoard())
    setGameOver(false)
    setPaused(false)
    setScore(0)
    setLevel(1)
    setLines(0)

    // Set up the first tetromino
    setTetromino(randomTetromino())
    setNextTetromino(randomTetromino())
    setPosition({ x: 3, y: 0 })

    // Start the drop interval
    setDropTime(1000 / level)
  }, [level])

  // Pause/resume the game
  const togglePause = useCallback(() => {
    if (gameOver) return

    if (paused) {
      setDropTime(1000 / level)
      setPaused(false)
    } else {
      setDropTime(null)
      setPaused(true)
    }
  }, [gameOver, paused, level])

  // Move the tetromino left
  const moveLeft = useCallback(() => {
    if (gameOver || paused) return

    const newPos = { ...position, x: position.x - 1 }
    if (!checkCollision(board, tetromino.shape, newPos)) {
      setPosition(newPos)
    }
  }, [board, tetromino, position, gameOver, paused])

  // Move the tetromino right
  const moveRight = useCallback(() => {
    if (gameOver || paused) return

    const newPos = { ...position, x: position.x + 1 }
    if (!checkCollision(board, tetromino.shape, newPos)) {
      setPosition(newPos)
    }
  }, [board, tetromino, position, gameOver, paused])

  // Rotate the tetromino
  const rotateTetromino = useCallback(() => {
    if (gameOver || paused) return

    const rotated = rotate(tetromino.shape)

    // Try normal rotation
    if (!checkCollision(board, rotated, position)) {
      setTetromino({ ...tetromino, shape: rotated })
      return
    }

    // Try wall kicks
    const kicks = [-1, 1, -2, 2]
    for (const kick of kicks) {
      const newPos = { ...position, x: position.x + kick }
      if (!checkCollision(board, rotated, newPos)) {
        setTetromino({ ...tetromino, shape: rotated })
        setPosition(newPos)
        return
      }
    }
  }, [board, tetromino, position, gameOver, paused])

  // Move the tetromino down
  const moveDown = useCallback(() => {
    if (gameOver || paused) return

    const newPos = { ...position, y: position.y + 1 }

    if (!checkCollision(board, tetromino.shape, newPos)) {
      setPosition(newPos)
    } else {
      // We've hit something, lock the tetromino

      // Check if game over (collision at the top)
      if (position.y < 1) {
        setGameOver(true)
        setDropTime(null)
        return
      }

      // Lock the tetromino on the board
      const newBoard = [...board]
      tetromino.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const boardY = y + position.y
            const boardX = x + position.x
            if (boardY >= 0 && boardY < newBoard.length && boardX >= 0 && boardX < newBoard[0].length) {
              newBoard[boardY][boardX] = value
            }
          }
        })
      })

      // Check for completed lines
      let linesCleared = 0
      for (let y = 0; y < newBoard.length; y++) {
        if (newBoard[y].every((cell) => cell > 0)) {
          // Remove the line and add an empty one at the top
          newBoard.splice(y, 1)
          newBoard.unshift(Array(10).fill(0))
          linesCleared++
          y-- // Check the same row again
        }
      }

      // Update score and level
      if (linesCleared > 0) {
        const linePoints = [0, 40, 100, 300, 1200]
        const newScore = score + linePoints[Math.min(linesCleared, 4)] * level
        const newLines = lines + linesCleared
        const newLevel = Math.floor(newLines / 10) + 1

        setScore(newScore)
        setLines(newLines)

        if (newLevel > level) {
          setLevel(newLevel)
          setDropTime(1000 / newLevel)
        }
      }

      setBoard(newBoard)

      // Get the next tetromino
      setTetromino(nextTetromino)
      setNextTetromino(randomTetromino())
      setPosition({ x: 3, y: 0 })
    }
  }, [board, tetromino, nextTetromino, position, score, level, lines, gameOver, paused])

  // Hard drop the tetromino
  const hardDrop = useCallback(() => {
    if (gameOver || paused) return

    // Find the lowest valid position
    let newY = position.y
    while (!checkCollision(board, tetromino.shape, { ...position, y: newY + 1 })) {
      newY++
    }

    // Create a new board with the piece locked at the bottom position
    const newBoard = [...board]
    tetromino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const boardY = y + newY
          const boardX = x + position.x
          if (boardY >= 0 && boardY < newBoard.length && boardX >= 0 && boardX < newBoard[0].length) {
            newBoard[boardY][boardX] = value
          }
        }
      })
    })

    // Check for completed lines
    let linesCleared = 0
    for (let y = 0; y < newBoard.length; y++) {
      if (newBoard[y].every((cell) => cell > 0)) {
        // Remove the line and add an empty one at the top
        newBoard.splice(y, 1)
        newBoard.unshift(Array(10).fill(0))
        linesCleared++
        y-- // Check the same row again
      }
    }

    // Update score and level
    if (linesCleared > 0) {
      const linePoints = [0, 40, 100, 300, 1200]
      const newScore = score + linePoints[Math.min(linesCleared, 4)] * level
      const newLines = lines + linesCleared
      const newLevel = Math.floor(newLines / 10) + 1

      setScore(newScore)
      setLines(newLines)

      if (newLevel > level) {
        setLevel(newLevel)
        setDropTime(1000 / newLevel)
      }
    }

    // Update the board
    setBoard(newBoard)

    // Get the next tetromino
    setTetromino(nextTetromino)
    setNextTetromino(randomTetromino())
    setPosition({ x: 3, y: 0 })

    // Check for game over with the new piece
    if (checkCollision(newBoard, nextTetromino.shape, { x: 3, y: 0 })) {
      setGameOver(true)
      setDropTime(null)
    }
  }, [board, tetromino, nextTetromino, position, score, level, lines, gameOver, paused])

  // Handle the drop interval
  useEffect(() => {
    let timer

    if (dropTime && !gameOver && !paused) {
      timer = setInterval(() => {
        moveDown()
      }, dropTime)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [dropTime, moveDown, gameOver, paused])

  // Render the current game state
  const renderBoard = useCallback(() => {
    // Create a copy of the board
    const display = board.map((row) => [...row])

    // Add the current tetromino to the display
    if (!gameOver && tetromino) {
      tetromino.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const boardY = y + position.y
            const boardX = x + position.x

            if (boardY >= 0 && boardY < display.length && boardX >= 0 && boardX < display[0].length) {
              display[boardY][boardX] = value
            }
          }
        })
      })
    }

    return display
  }, [board, tetromino, position, gameOver])

  return {
    board: renderBoard(),
    preview,
    score,
    level,
    lines,
    gameOver,
    paused,
    moveLeft,
    moveRight,
    rotateTetromino,
    moveDown,
    hardDrop,
    startGame,
    togglePause,
  }
}
