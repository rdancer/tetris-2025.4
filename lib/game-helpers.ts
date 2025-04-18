import { TETROMINOS } from "./tetrominos"

// Create an empty board (20 rows x 10 columns)
export const createBoard = () => Array.from(Array(20), () => Array(10).fill(0))

// Create an empty board with custom dimensions
export const createEmptyBoard = (rows = 20, cols = 10) => Array.from(Array(rows), () => Array(cols).fill(0))

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
  // Determine the actual dimensions of the tetromino (ignoring empty rows/columns)
  let minX = tetromino[0].length
  let maxX = 0
  let minY = tetromino.length
  let maxY = 0

  for (let y = 0; y < tetromino.length; y++) {
    for (let x = 0; x < tetromino[y].length; x++) {
      if (tetromino[y][x] !== 0) {
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      }
    }
  }

  // Create a preview board that's just big enough for the tetromino
  const width = maxX - minX + 1
  const height = maxY - minY + 1
  const preview = createEmptyBoard(4, 4)

  // Center the tetromino in the preview
  const offsetY = Math.floor((4 - height) / 2)
  const offsetX = Math.floor((4 - width) / 2)

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (tetromino[y][x] !== 0) {
        const previewY = y - minY + offsetY
        const previewX = x - minX + offsetX
        if (previewY >= 0 && previewY < 4 && previewX >= 0 && previewX < 4) {
          preview[previewY][previewX] = tetromino[y][x]
        }
      }
    }
  }

  return preview
}

// Create a piece preview for the next tetromino
export const createPiecePreview = (pieceType: number, shapes: number[][][][]) => {
  const shape = shapes[pieceType][0] // Use the first rotation
  return createPreviewBoard(shape)
}

// Add a piece to the board
export const addPieceToBoard = (
  board: number[][],
  pieceType: number,
  shape: number[][],
  position: { x: number; y: number },
) => {
  // Create a copy of the board
  const newBoard = board.map((row) => [...row])

  // Add the piece to the board
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] !== 0) {
        const boardY = y + position.y
        const boardX = x + position.x
        if (boardY >= 0 && boardY < newBoard.length && boardX >= 0 && boardX < newBoard[0].length) {
          newBoard[boardY][boardX] = pieceType
        }
      }
    }
  }

  return newBoard
}

// Clear completed lines and return the new board and number of lines cleared
export const clearLines = (board: number[][]) => {
  let linesCleared = 0
  const newBoard = [...board]

  for (let y = 0; y < newBoard.length; y++) {
    if (newBoard[y].every((cell) => cell > 0)) {
      // Remove the line and add an empty one at the top
      newBoard.splice(y, 1)
      newBoard.unshift(Array(newBoard[0].length).fill(0))
      linesCleared++
      y-- // Check the same row again
    }
  }

  return { newBoard, linesCleared }
}

// Calculate score based on lines cleared and level
export const calculateScore = (linesCleared: number, level: number) => {
  const linePoints = [0, 40, 100, 300, 1200]
  return linePoints[Math.min(linesCleared, 4)] * level
}

// Get a random tetromino
export const randomTetromino = () => {
  const index = Math.floor(Math.random() * 7) + 1
  return TETROMINOS[index]
}
