'use client'

import { motion, useInView, Variants } from 'framer-motion'
import { useRef } from 'react'

type AnimateOnScrollProps = {
  children: React.ReactNode
  delay?: number
  direction?: 'left' | 'right' | 'up' | 'down'
  fadeIn?: boolean
}

export default function AnimateOnScroll({
  children,
  delay = 0,
  direction = 'up',
  fadeIn = true,
}: AnimateOnScrollProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const getVariants = (): Variants => {
    const distance = 50
    let x = 0
    let y = 0

    if (direction === 'left') x = -distance
    else if (direction === 'right') x = distance
    else if (direction === 'up') y = distance
    else if (direction === 'down') y = -distance

    return {
      hidden: { 
        opacity: fadeIn ? 0 : 1,
        x,
        y 
      },
      visible: { 
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          delay,
          duration: 0.5,
          ease: 'easeOut'
        }
      }
    }
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={getVariants()}
    >
      {children}
    </motion.div>
  )
}