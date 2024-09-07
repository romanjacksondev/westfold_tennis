import { useState } from "react"
import { useController } from "react-hook-form"
import { useEffectOnce } from "hooks/useEffectOnce"
import Select, { MenuPlacement } from "react-select"
import { SelectProps } from "./Select.types"
import clsx from "clsx"
import { getNestedProperty } from "lib/helpers"
import { customStyles, /*flatStyles*/ } from "./Select.styles"

export const SelectTemplate = ({
    name,
    control,
    children,
    placeholder,
    options,
    rules,
    errors,
    isFlat = false,
    isSearchable = true,
    isDisabled = false,
    isLoading = false,
    defaultValue,
    handleChange,
    optionLabel = 'name',
    optionValue = 'id',
    menuPlacement = 'bottom',
    className = 'h-12'
}: SelectProps) => {

    const [styles, setStyles] = useState(customStyles)
    const { field } = useController({ name, control, rules })

    const errorMessage = errors && getNestedProperty(errors, name)
    const hasError = !!(errors && errorMessage)

    if (handleChange) {
        field.onChange = (item, action) => {
            handleChange(item, action)
            setTimeout(() => {
                const input: HTMLElement = document.querySelector(`#${field.name} input`)
                input.blur()
            }, 10)
        }
    }

    useEffectOnce(() => {
        setStyles(customStyles)
    })

    return (
        <div className="relative">
            <label htmlFor={name}
                className={clsx(
                    'absolute -top-2 z-10 bg-white text-xs',
                    isDisabled ? 'text-disabled' : 'text-input',
                    isFlat ? 'px-0' : 'left-3 px-1'
                )}>
                {children}
            </label>
            <Select
                id={field.name}
                instanceId={field.name}
                placeholder={placeholder}
                options={options}
                className={className}
                onChange={field.onChange}
                name={field.name}
                styles={styles}
                defaultValue={defaultValue}
                menuPlacement={menuPlacement as MenuPlacement}
                isSearchable={isSearchable}
                isDisabled={isDisabled}
                isLoading={isLoading}
                getOptionLabel={(option) => `${option[optionLabel]}`}
                getOptionValue={(option) => `${option[optionValue]}`}
                noOptionsMessage={({ inputValue }) => !inputValue ? 'Cargando...' : inputValue}
                {...field}
            />
            {hasError && (
                <p className="absolute mt-1 text-xs text-error">
                    {errorMessage.message}
                </p>
            )}

        </div>
    )

}