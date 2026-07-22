'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import {
  fadeInUp,
  reducedMotionFade,
  staggerChildren,
} from '@/animations/variants';

export interface RevealProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly as?: 'div' | 'section' | 'header' | 'article';
  readonly delay?: number;
}

export function Reveal({
  children,
  className,
  as = 'div',
  delay = 0,
}: RevealProps) {
  const reduce = useReducedMotion();
  const Component = motion[as];
  const variants = reduce ? reducedMotionFade : fadeInUp;

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={variants}
      transition={reduce ? { duration: 0 } : { delay }}
    >
      {children}
    </Component>
  );
}

export function RevealStagger({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={reduce ? reducedMotionFade : staggerChildren}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={reduce ? reducedMotionFade : fadeInUp}
    >
      {children}
    </motion.div>
  );
}
