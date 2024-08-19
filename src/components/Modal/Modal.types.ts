import React, { MouseEventHandler } from 'react'

export type ModalProps = {
  children: React.ReactNode
  isOpen: boolean
  size?: 'sm' | 'md' | 'lg'
}
export type ModalComponentsProps = {
  children: React.ReactNode | string
  className?: string
}

export interface ModalHeaderProps extends ModalComponentsProps {
  onClose?: MouseEventHandler
  setIsOpen?: any
}
