import React from "react";
import { Control, RegisterOptions } from 'react-hook-form'

export type OptionsProps = {
    label: string
    value: string | number
}

export type SelectProps = {
    rules?: RegisterOptions
    control: Control
    errors?: any
    name: string
    children?: string | React.ReactNode
    placeholder?: string
    options: OptionsProps[]
    isSearchable?: boolean
    isDisabled?: boolean
    isLoading?: boolean
    handleChange?: any
    optionLabel?: string
    defaultValue?: OptionsProps
    optionValue?: string
    menuPlacement?: string
    isFlat?: boolean
    className?: string
}

