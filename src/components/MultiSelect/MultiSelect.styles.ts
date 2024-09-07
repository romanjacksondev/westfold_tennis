export const multiSelectStyles: any = {
    option: (provided, state) => ({
        ...provided,
        color: state.isSelected ? '#131313' : '#929292',
        fontSize: '14px',
        backgroundColor: state.isSelected ? '#F0F6FA' : 'transparent',
        '&:last-child': {
            borderBottom: 'none'
        }
    }),
    menuList: (provided) => ({
        ...provided,
        padding: '0px'
    }),
    menu: (provided, state) => ({
        ...provided,
        zIndex: 20,
        borderRadius: '0.5rem',
        overflow: "hidden",
        border: state.isDisabled ? "1.2px solid #AAB4BD" : "1.2px solid #B2D2DF"
    }),
    multiValue: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#F0F6FA' : 'transparent',
    }),
    multiValueRemove: (provided) => ({
        ...provided,
        display: 'none'
    }),
    indicatorSeparator: (provided) => ({
        ...provided,
        backgroundColor: 'none'
    }),
    dropdownIndicator: (styles, state) => ({
        ...styles,
        color: '#1E1F21',
        transform: state.isFocused && 'rotate(180deg)',
        '&:hover': {
            color: state.isFocused && '#6395AA'
        }
    }),
    control: (provided, state) => ({
        ...provided,
        display: 'flex',
        alignItems: 'center',
        minHeight: '48px',
        height: "auto",
        justifyContent: 'space-between',
        backgroundColor: state.isDisabled ? '#F8F9FA' : 'white',
        border: state.isDisabled ? '1px solid #AAB4BD' : '1px solid #B2D2DF',
        borderRadius: '0.375rem',
        boxShadow: state.isFocused && '0 0 0 1px #6395AA',
        paddingTop: '4px',
        paddingBottom: '3px',
        '&:hover': {
            borderColor: state.isDisabled ? '#AAB4BD' : '#B2D2DF'
        }
    }),
    singleValue: (provided, state) => ({
        ...provided,
        transition: 'opacity 300ms',
        color: state.isDisabled ? '#AAB4BD' : '#1E1F21',
        fontSize: '14px'
    }),
    placeholder: (provided, state) => ({
        ...provided,
        fontSize: '14px',
        color: state.isDisabled ? '#AAB4BD' : '#808B95',
        textTransform: 'none',
        lineHeight: 1.3
    }),
}