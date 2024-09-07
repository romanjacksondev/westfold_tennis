import { ButtonTemplate } from './Button.template'
import { ButtonProps } from './Button.types'

export const Button = ({ children, ...props }: ButtonProps) => {
  return <ButtonTemplate {...props}>{children}</ButtonTemplate>
}
