import { TextInputTemplate } from './TextInput.template'
import { TextInputProps } from './TextInput.types'

export const TextInput = ({ ...props }: TextInputProps) => {
    return <TextInputTemplate {...props} />
}