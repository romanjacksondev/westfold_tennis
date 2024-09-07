import React from 'react'

export type ButtonProps = {
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  children: React.ReactNode
  disabled?: boolean
  type?: 'button' | 'submit'
  loading?: boolean
  className?: string
  variant?: 'filled' | 'outline' | 'text' | 'text-black' | 'blue' | 'gray'
  width?: 'fullWidth' | 'auto' | 'fixed'
}
