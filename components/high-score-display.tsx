"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface HighScoreDisplayProps {
  currentScore: number
}

interface HighScore {
  score: number
  date: string
}

export default function HighScoreDisplay({ currentScore }: HighScoreDisplayProps) {
  const [highScores, setHighScores] = useState<HighScore[]>([])

  useEffect(() => {
    // Load high scores from localStorage
    const savedScores = localStorage.getItem("tetrisHighScores")
    if (savedScores) {
      setHighScores(JSON.parse(savedScores))
    }
  }, [])

  useEffect(() => {
    // Update high scores when game ends with a significant score
    if (currentScore > 0) {
      const newHighScores = [...highScores]
      const newScore: HighScore = {
        score: currentScore,
        date: new Date().toLocaleDateString(),
      }

      // Add new score and sort
      newHighScores.push(newScore)
      newHighScores.sort((a, b) => b.score - a.score)

      // Keep only top 5
      const updatedScores = newHighScores.slice(0, 5)

      // Save to localStorage and update state
      localStorage.setItem("tetrisHighScores", JSON.stringify(updatedScores))
      setHighScores(updatedScores)
    }
  }, [currentScore])

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg">High Scores</CardTitle>
      </CardHeader>
      <CardContent>
        {highScores.length > 0 ? (
          <ul className="space-y-1">
            {highScores.map((score, index) => (
              <li key={index} className="flex justify-between text-white">
                <span>
                  {index + 1}. {score.score}
                </span>
                <span className="text-gray-400 text-sm">{score.date}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No high scores yet</p>
        )}
      </CardContent>
    </Card>
  )
}
