import { getNestedProperty } from '../../lib/helpers'
import { TextInputProps } from './TextInput.types'
import clsx from 'clsx'

const classes = {
    underline: 'block py-3 px-3 w-full focus:outline-none',
    default: 'block border border-input-border rounded-md py-3 px-3 text-sm leading-3 w-full focus:outline-focus placeholder-placeholder'
}

export const TextInputTemplate = ({
    name,
    label,
    type = 'text',
    placeholder,
    register,
    rules,
    errors,
    icon,
    disabled,
    className,
    labelClassName,
    onChange,
    value,
    inputClassName,
    description,
    variant = 'default',
    readOnly,
    onFocus,
    maxLength,
    onKeyUp,
    defaultValue
}: TextInputProps) => {
    const errorMessage = errors && getNestedProperty(errors, name);
    const hasError = !!(errors && errorMessage)

    return (
        <div className={clsx(className, 'relative')}>
            {label && !icon && (
                <label
                    htmlFor={name}
                    className={clsx(
                        'absolute -top-2 left-3 bg-white px-1 text-xs',
                        disabled
                            ? 'border-disabled placeholder-disabled text-disabled'
                            : 'text-input',
                        labelClassName
                    )}
                >
                    {label}
                </ label>
            )}
            <label>
                {icon && !label && <>{icon}</>}
                <input
                    className={clsx(
                        disabled &&
                        '!border-disabled !text-disabled placeholder-[#AAB4BD]',
                        classes[variant],
                        inputClassName,
                        icon && 'pl-[52px]',
                        'h-12'
                    )}
                    type={type}
                    id={name}
                    onChange={onChange}
                    readOnly={readOnly}
                    maxLength={maxLength}
                    name={name}
                    value={value}
                    placeholder={placeholder}
                    disabled={disabled}
                    onFocus={onFocus}
                    onKeyUp={onKeyUp}
                    defaultValue={defaultValue}
                    {...register(name, rules)}
                />
            </label>
            {hasError && (
                <p
                    className='absolute mt-1 text-xs text-error' >
                    {errorMessage.message}
                </p>
            )}
            {description && (
                <p className={clsx(
                    hasError ? 'mt-5' : 'mt-2',
                    'text-xs italic text-subtitle'
                )}>
                    {description}
                </p >
            )}
        </div >
    )
}
