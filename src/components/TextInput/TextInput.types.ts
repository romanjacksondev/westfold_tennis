import React from "react";
import { UseFormRegister, FieldValues, RegisterOptions } from 'react-hook-form'

export type TextInputProps = {
    register: UseFormRegister<FieldValues>
    name: string
    label?: string | React.ReactNode
    rules?: RegisterOptions
    errors?: any
    value?: string
    icon?: any
    type?: string
    placeholder?: string
    readOnly?: boolean
    onChange?: any
    disabled?: boolean
    variant?: string
    maxLength?: number
    className?: string
    labelClassName?: string
    inputClassName?: string
    focus?: boolean
    description?: string
    onFocus?: any
    onKeyUp?: any 
    defaultValue?: any
}

