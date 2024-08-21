import React from "react";
import { Control, FieldValues, RegisterOptions } from 'react-hook-form'

export type DatePickerProps = {
    children?: React.ReactNode
    placeholder: string
    date?: string
    handleChange: (value: string) => void
    selectedDate?: string
    className?: string
    parentId?: string
    control?: Control<FieldValues>
    name?: string
    rules: RegisterOptions
    includeDateIntervales?: Array<any>
}