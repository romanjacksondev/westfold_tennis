import Select, { components } from 'react-select'
import Image from 'next/image'

//Assets
import BorserSelect from 'assets/images/border-select.svg'

//Styles
import { multiSelectStyles } from './MultiSelect.styles'
import styles from './MultiSelect.module.css'

import PropTypes from 'prop-types'
import clsx from 'clsx'
import { useController } from 'react-hook-form'

const InputOption = (props) => {
    const { isSelected, children } = props
    return (
        <components.Option {...props} isSelected={isSelected}>
            <div className={clsx(styles.selected, !isSelected && 'm-1 py-[1.5px]')}>
                {isSelected && (
                    <Image
                        src={BorserSelect.src}
                        height={BorserSelect.height}
                        width={BorserSelect.width}
                        alt=""
                    />
                )}
                <input
                    type="checkbox"
                    checked={isSelected}
                    className='mx-2.5 accent-[#3F8EAF] h-5 w-5'
                    onChange={() => { console.log('onchange multiselect') }}
                />
                {children}
            </div>
        </components.Option>
    )
}

InputOption.propTypes = {
    isSelected: PropTypes.bool.isRequired,  // isSelected es booleano y requerido
    children: PropTypes.node.isRequired,    // children es cualquier nodo y es requerido
}

const MultiValueCustom = (props) => {
    const { children } = props

    return (
        <>
            <span>{children}</span>
            <div className={clsx(styles['multi-value-custom'])}>
                <span className="mr-1">,</span>
            </div>
        </>
    )
}

MultiValueCustom.propTypes = {
    children: PropTypes.node.isRequired,  // children es cualquier nodo y es requerido
}

const CustomInput = (props) => {
    <components.Input {...props} style={{ opacity: 0 }} />
}


const MultiSelect = ({
    name,
    control,
    rules,
    options,
    label,
    placeholder,
    isDisabled = false,
    isLoading = false,
    optionLabel = 'label',
    optionValue = 'value',
    defaultValue = [],
    className = ""

}) => {
    const { field } = useController({
        name, control, rules
    })
    return (
        <div className={clsx('relativa', className)}>
            <label className='absolute -top-2 z-10 bg-white text-xs text-input left-3 px-1'>
                {label}
            </label>
            <Select
                id={field.name}
                instanceId={field.name}
                name={field.name}
                defaultValue={defaultValue}
                isMulti
                isClearable={false}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                onChange={field.onChange}
                options={options}
                components={{
                    Option: InputOption,
                    MultiValue: MultiValueCustom,
                    Input: CustomInput
                }}
                styles={multiSelectStyles}
                placeholder={placeholder}
                isDisabled={isDisabled}
                isLoading={isLoading}
                inputValue=""
                onInputChange={() => null}
                getOptionLabel={(option) => `${option[optionLabel]}`}
                getOptionValue={(option) => `${option[optionValue]}`}
            />
        </div>
    )
}

MultiSelect.propTypes = {
    options: PropTypes.array.isRequired,
    label: PropTypes.string.isRequired,

}

export default MultiSelect