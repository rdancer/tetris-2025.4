"use client"

import { useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import TetrisBoard from "./tetris-board"
import { useTetris } from "@/hooks/use-tetris"
import { useMobile } from "@/hooks/use-mobile"

export default function TetrisGame() {
  const isMobile = useMobile()
  const {
    board,
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
  } = useTetris()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameOver || paused) return

      switch (e.key) {
        case "ArrowLeft":
          moveLeft()
          break
        case "ArrowRight":
          moveRight()
          break
        case "ArrowUp":
          rotateTetromino()
          break
        case "ArrowDown":
          moveDown()
          break
        case " ": // Space key
          e.preventDefault() // Prevent page scrolling
          hardDrop()
          break
        case "p":
          togglePause()
          break
        default:
          break
      }
    },
    [gameOver, paused, moveLeft, moveRight, rotateTetromino, moveDown, hardDrop, togglePause],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-4xl">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold text-white mb-2">Tetris 2025.4</h1>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-2 sm:p-4">
            <TetrisBoard board={board} />
          </CardContent>
        </Card>

        {isMobile && (
          <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
            <Button variant="secondary" size="icon" onClick={moveLeft} disabled={gameOver || paused} className="h-14">
              ←
            </Button>
            <Button variant="secondary" size="icon" onClick={moveDown} disabled={gameOver || paused} className="h-14">
              ↓
            </Button>
            <Button variant="secondary" size="icon" onClick={moveRight} disabled={gameOver || paused} className="h-14">
              →
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={rotateTetromino}
              disabled={gameOver || paused}
              className="h-14"
            >
              ↻
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={hardDrop}
              disabled={gameOver || paused}
              className="h-14 col-span-2"
            >
              ⤓ Drop
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-white">Score:</div>
                <div className="text-white font-bold text-right">{score}</div>
                <div className="text-white">Level:</div>
                <div className="text-white font-bold text-right">{level}</div>
                <div className="text-white">Lines:</div>
                <div className="text-white font-bold text-right">{lines}</div>
              </div>

              <div className="mt-2">
                <h3 className="text-white mb-2">Next Piece:</h3>
                <div className="bg-gray-900 p-2 rounded-md">
                  <TetrisBoard board={preview} isPreview={true} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              {gameOver ? (
                <Button onClick={startGame} className="w-full">
                  New Game
                </Button>
              ) : !paused ? (
                <Button onClick={togglePause} className="w-full">
                  Pause
                </Button>
              ) : (
                <Button onClick={togglePause} className="w-full">
                  Resume
                </Button>
              )}

              {!gameOver && (
                <Button onClick={startGame} variant="outline" className="w-full">
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
