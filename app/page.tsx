import TetrisGame from "@/components/tetris-game"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900">
      <TetrisGame />
    </main>
  )
}
