// Libraries
import React, { useEffect } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { usePortal } from 'hooks/usePortal'

// Assets
import image from 'assets/images/close-button.svg'

// Models
import {
  ModalComponentsProps,
  ModalHeaderProps,
  ModalProps,
} from './Modal.types'

const DESKTOP_SIZES = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-2xl',
  lg: 'sm:max-w-4xl',
}

const Modal = ({ children, isOpen, size = 'lg' }: ModalProps) => {
  const portal = usePortal()

  useEffect(() => {
    const next = document.getElementById('__next')
    next?.setAttribute('aria-hidden', isOpen.toString())
    next?.setAttribute('inert', isOpen.toString())
    portal.current?.setAttribute('aria-hidden', (!isOpen).toString())

    return () => {
      next?.removeAttribute('aria-hidden')
      next?.removeAttribute('inert')
    }
  }, [isOpen, portal])

  return createPortal(
    <div
      className="z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 z-30 bg-gray-500 bg-opacity-20 transition-opacity backdrop-blur-[2px]"></div>
      <div className="fixed inset-0 z-40 overflow-y-auto">
        <div className="flex h-full items-center justify-center text-center sm:p-0">
          <div
            className={clsx(
              size && DESKTOP_SIZES[size],
              'relative transform text-left  transition-all m-4 sm:m-8 sm:w-full'
            )}
          >
            <div className="bg-white rounded-2xl shadow-xl">{children}</div>
          </div>
        </div>
      </div>
    </div>,
    portal.current
  )
}

const ModalHeader = ({
  children,
  className,
  onClose,
  setIsOpen,
}: ModalHeaderProps) => {
  return (
    <div
      className={clsx(
        'flex justify-between items-center border border-b-[#E1E6EB] p-8',
        className
      )}
    >
      {children}
      <div
        className="cursor-pointer flex justify-center items-center"
        onClick={(e) => {
          if (onClose) onClose(e)
          setIsOpen && setIsOpen(false)
        }}
      >
        <Image src={image} width={15} height={15} alt="close" />
      </div>
    </div>
  )
}

const ModalContent = ({ children, className }: ModalComponentsProps) => {
  return <div className={clsx('px-8 py-6', className)}>{children}</div>
}

const ModalActions = ({ children, className }: ModalComponentsProps) => {
  return <div className={clsx('px-8 pb-8 pt-4', className)}>{children}</div>
}

Modal.Header = ModalHeader
Modal.Content = ModalContent
Modal.Actions = ModalActions

export default Modal
