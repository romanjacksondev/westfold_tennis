import React from 'react'
import { clsx } from 'clsx'
import { TextProps } from './Text.types'

const defaultElementContainer = 'p'
const allowedElements = ['span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
const fontFamilies = {
  'dm-sans': 'font-dm-sans',
  lato: 'font-lato',
  santander: 'font-santander',
}

const TextTemplate = ({
  children,
  className,
  color = 'black',
  size = 'text-base',
  fontFamily = 'santander',
  as = defaultElementContainer,
}: TextProps) => {
  return React.createElement(
    allowedElements.includes(as) ? as : defaultElementContainer,
    {
      className: clsx(className, color, size, fontFamilies[fontFamily]),
    },
    children
  )
}

export default TextTemplate
