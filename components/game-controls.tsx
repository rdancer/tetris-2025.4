"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, ArrowDown, RotateCw, ArrowDownToLine } from "lucide-react"

interface GameControlsProps {
  moveLeft: () => void
  moveRight: () => void
  rotate: () => void
  moveDown: () => void
  hardDrop: () => void
  isDisabled: boolean
}

export default function GameControls({
  moveLeft,
  moveRight,
  rotate,
  moveDown,
  hardDrop,
  isDisabled,
}: GameControlsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
      <Button variant="secondary" size="icon" onClick={moveLeft} disabled={isDisabled} className="h-14">
        <ArrowLeft className="h-6 w-6" />
      </Button>
      <Button variant="secondary" size="icon" onClick={moveDown} disabled={isDisabled} className="h-14">
        <ArrowDown className="h-6 w-6" />
      </Button>
      <Button variant="secondary" size="icon" onClick={moveRight} disabled={isDisabled} className="h-14">
        <ArrowRight className="h-6 w-6" />
      </Button>
      <Button variant="secondary" size="icon" onClick={rotate} disabled={isDisabled} className="h-14">
        <RotateCw className="h-6 w-6" />
      </Button>
      <Button variant="secondary" size="icon" onClick={hardDrop} disabled={isDisabled} className="h-14 col-span-2">
        <ArrowDownToLine className="h-6 w-6" />
      </Button>
    </div>
  )
}
