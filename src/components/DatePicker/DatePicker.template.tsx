import clsx from 'clsx'
import { registerLocale } from 'react-datepicker'
import { DatePickerProps } from './DatePicker.types'
import es from 'date-fns/locale/es'
import { useState } from 'react'
import { useController } from 'react-hook-form'
import DatePicker from 'react-datepicker'

registerLocale('es', es)


export const DatePickerTemplate = ({
    children,
    placeholder,
    date,
    handleChange,
    className,
    control,
    name,
    rules,
    includeDateIntervales
}: DatePickerProps) => {

    const [startDate, setStartDate] = useState((date && new Date(date)) || null)
    const [opened, setOpened] = useState(false)

    const { field } = useController({ name, control, rules })

    if (handleChange) {
        field.onChange = (date) => {
            setStartDate(date)
            handleChange(date)
            setOpened(false)
        }
    }

    return (
        <div className='flex'>
            <div className=''>
                <label className='bg-white text-xs'>{children}</label>
                <div className='relative'>
                    <DatePicker
                        selected={startDate}
                        placeholderText={placeholder}
                        locale="es"
                        open={opened}
                        includeDateIntervales={includeDateIntervales}
                        className={clsx("h-12 block cursor-default placeholder:text-[#808080] border border-input-border rounded-md py-3 px-3 text-sm leading-3 w-full focus:outline-focus placeholder-placeholder", className)}
                        onCalendarClose={() => setOpened(false)}
                        onCalendarOpen={() => setOpened(true)}
                        onChange={field.onChange}
                        dateFormat="dd/MM/yyyy"
                        {...field}
                    />
                    <div 
                        onClick={() => setOpened((prevOpened) => !prevOpened)}
                        className={clsx('absolute top-[3px] tight-2 flex h-5 w-5 transition duration-500 ease-in-out', opened ? "rotate-180" : "rotate-0")}
                    >
                    </div>
                </div>
            </div>
        </div>
    )
}