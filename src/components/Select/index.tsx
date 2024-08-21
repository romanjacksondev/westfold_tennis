import {SelectTemplate } from "./Select.template"
import { SelectProps} from "./Select.types"

export const Select = ({ ...props}: SelectProps) => {
    return <SelectTemplate {...props} />
}