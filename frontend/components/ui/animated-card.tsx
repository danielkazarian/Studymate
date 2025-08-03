"use client"

import type React from "react"
import { Card } from "./card"

interface AnimatedCardProps extends React.ComponentProps<typeof Card> {}

export function AnimatedCard({ children, className = "", ...props }: AnimatedCardProps) {
  return (
    <Card className={className} {...props}>
      {children}
    </Card>
  )
}
