import { TETROMINOS } from "./tetrominos"

// Create an empty board (20 rows x 10 columns)
export const createBoard = () => Array.from(Array(20), () => Array(10).fill(0))

// Check if the current tetromino collides with the board
export const checkCollision = (board: number[][], tetromino: number[][], position: { x: number; y: number }) => {
  for (let y = 0; y < tetromino.length; y++) {
    for (let x = 0; x < tetromino[y].length; x++) {
      // Skip empty cells
      if (tetromino[y][x] === 0) continue

      // Calculate the board position
      const boardY = y + position.y
      const boardX = x + position.x

      // Check if outside the board or collides with a non-zero cell
      if (
        boardX < 0 ||
        boardX >= board[0].length ||
        boardY >= board.length ||
        (boardY >= 0 && board[boardY][boardX] > 0)
      ) {
        return true
      }
    }
  }
  return false
}

// Create a small preview board for the next piece
export const createPreviewBoard = (tetromino: number[][]) => {
  const preview = Array.from(Array(4), () => Array(4).fill(0))

  // Center the tetromino in the preview
  const offsetY = Math.floor((4 - tetromino.length) / 2)
  const offsetX = Math.floor((4 - tetromino[0].length) / 2)

  for (let y = 0; y < tetromino.length; y++) {
    for (let x = 0; x < tetromino[y].length; x++) {
      if (tetromino[y][x] !== 0) {
        preview[y + offsetY][x + offsetX] = tetromino[y][x]
      }
    }
  }

  return preview
}

// Get a random tetromino
export const randomTetromino = () => {
  const index = Math.floor(Math.random() * 7) + 1
  return TETROMINOS[index]
}
