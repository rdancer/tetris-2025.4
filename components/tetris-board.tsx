import { memo } from "react"

interface TetrisBoardProps {
  board: number[][]
  isPreview?: boolean
}

const COLORS = [
  "bg-transparent", // empty
  "bg-cyan-500", // I
  "bg-blue-500", // J
  "bg-orange-500", // L
  "bg-yellow-500", // O
  "bg-green-500", // S
  "bg-purple-500", // T
  "bg-red-500", // Z
]

const TetrisBoard = memo(function TetrisBoard({ board, isPreview = false }: TetrisBoardProps) {
  const cellSize = isPreview ? "w-5 h-5" : "w-6 h-6 sm:w-8 sm:h-8"
  const gridGap = "gap-[1px]"
  const cols = board[0].length

  return (
    <div
      className={`grid ${gridGap} bg-gray-900`}
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      }}
    >
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`${cellSize} ${COLORS[cell]} ${cell > 0 ? "border border-opacity-30 border-white" : ""}`}
          />
        )),
      )}
    </div>
  )
})

export default TetrisBoard
