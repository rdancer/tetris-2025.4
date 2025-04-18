// Tetromino types
// 0: Empty
// 1: I (cyan)
// 2: J (blue)
// 3: L (orange)
// 4: O (yellow)
// 5: S (green)
// 6: T (purple)
// 7: Z (red)

export const TETROMINOS = [
  // Empty
  { shape: [[0]], color: "bg-transparent" },
  // I
  {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "bg-cyan-500",
  },
  // J
  {
    shape: [
      [2, 0, 0],
      [2, 2, 2],
      [0, 0, 0],
    ],
    color: "bg-blue-500",
  },
  // L
  {
    shape: [
      [0, 0, 3],
      [3, 3, 3],
      [0, 0, 0],
    ],
    color: "bg-orange-500",
  },
  // O
  {
    shape: [
      [4, 4],
      [4, 4],
    ],
    color: "bg-yellow-500",
  },
  // S
  {
    shape: [
      [0, 5, 5],
      [5, 5, 0],
      [0, 0, 0],
    ],
    color: "bg-green-500",
  },
  // T
  {
    shape: [
      [0, 6, 0],
      [6, 6, 6],
      [0, 0, 0],
    ],
    color: "bg-purple-500",
  },
  // Z
  {
    shape: [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0],
    ],
    color: "bg-red-500",
  },
]

// Rotate a tetromino matrix
export const rotate = (matrix: number[][]) => {
  // Make the rows to become cols (transpose)
  const result = matrix[0].map((_, index) => matrix.map((row) => row[index]))
  // Reverse each row to get a rotated matrix
  return result.map((row) => row.reverse())
}
