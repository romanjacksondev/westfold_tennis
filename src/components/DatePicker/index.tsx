import { DatePickerTemplate } from './DatePicker.template'
import { DatePickerProps } from './DatePicker.types'

export const DatePicker = ({children, ...props}: DatePickerProps ) => {
    return <DatePickerTemplate {...props}>{children}</DatePickerTemplate>
}