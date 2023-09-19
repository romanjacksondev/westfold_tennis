import Dropdown from "react-dropdown";
import "react-dropdown/style.css";

const CustomDropdown = ({ options, func, placeholder }) => {
  return (
    <Dropdown
      options={options}
      onChange={(option) => func(option.value)}
      placeholder={placeholder}
    />
  );
};


export default CustomDropdown;