import { clsx } from 'clsx'

import { ButtonProps } from './Button.types'
// import DotsLoader from '../DotsLoader'

const baseClass = 'px-5 py-2.5 rounded-3xl transition-colors cursor-pointer'

const classes = {
  filled: 'bg-cta text-white hover:bg-hover',
  outline:
    'bg-transparent border border-cta text-cta hover:bg-hover hover:text-white',
  text: 'w-fit sm:w-fit px-0 py-0 bg-transparent text-cta decoration-cta underline',
  'text-black':
    'w-fit sm:w-fit px-0 py-0 bg-transparent text-black decoration-black underline font-bold',
  gray: 'w-fit sm:w-fit px-0 py-0 bg-[#F5F6F7] text-black decoration-black hover:underline font-bold',
  blue: 'bg-[#F5F9FA] text-input font-bold hover:text-[#65A5BF] !w-auto',
}

const disabledClasses = {
  filled:
    'rounded-3xl bg-gray-200 !text-gray-400 hover:!bg-gray-200 hover:!cursor-auto',
  outline:
    'rounded-3xl bg-transparent border border-disabled-gray text-disabled-gray hover:bg-transparent',
}

const widths = {
  fullWidth: 'w-full',
  auto: 'w-auto',
  fixed: 'w-80',
}

export const ButtonTemplate = ({
  onClick,
  children,
  disabled,
  type = 'button',
  className,
  variant = 'filled',
  width,
  loading = false,
}: ButtonProps) => {
  const handleClick = (e) => {
    if (!loading && !disabled && onClick) onClick(e)
  }

  return (
    <button
      className={clsx(
        baseClass,
        widths[width],
        classes[variant],
        disabled && disabledClasses[variant],
        className
      )}
      onClick={handleClick}
      disabled={disabled}
      type={type}
    >
      {
        children
      }
    </button>
  )
}
