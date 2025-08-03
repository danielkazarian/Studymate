"use client"

import type React from "react"
import { Button } from "./button"

interface MagneticButtonProps extends React.ComponentProps<typeof Button> {}

export function MagneticButton({ children, className = "", ...props }: MagneticButtonProps) {
  return (
    <Button className={className} {...props}>
      {children}
    </Button>
  )
}
