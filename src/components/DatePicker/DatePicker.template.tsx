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
                        className={clsx(
                            "h-12 block cursor-default placeholder:text-[#808080] border border-input-border rounded-md py-3 px-3 text-sm leading-3 w-full focus:outline-focus placeholder-placeholder",
                            className
                        )}
                        onCalendarClose={() => setOpened(false)}
                        onCalendarOpen={() => setOpened(true)}
                        onChange={field.onChange}
                        dateFormat="dd/MM/yyyy"
                        {...field}
                    />
                    <div
                        onClick={() => setOpened((prevOpened) => !prevOpened)}
                        className={clsx(
                            'absolute top-[3px] tight-2 flex h-5 w-5 transition duration-500 ease-in-out',
                            opened ? "rotate-180" : "rotate-0"
                        )}
                    >
                        <svg
                            height="20"
                            width="20"
                            viewBox='0 0 20 20'
                            aria-hidden="true"
                            focusable="false"
                            className='inline-block leading-none'
                        >
                            <path fill="#1E1F21"
                                d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"
                            ></path>
                        </svg>

                    </div>
                </div>
            </div>
        </div>
    )
}