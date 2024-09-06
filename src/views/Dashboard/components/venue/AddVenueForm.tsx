import ModalNewData from "components/ModalNewData";
import { TextInput } from "components/TextInput";
import { useForm } from 'react-hook-form'
import { useActions } from "store/actions";
import { useSelectors } from "store/selectors";
import PropTypes from 'prop-types';
import { Select } from "components/Select";

export default function AddVenueForm({ openModal, setOpenModal }) {

    const { getValues, handleSubmit, control, register, formState: { errors } } = useForm({ mode: 'onSubmit' })
    const { addVenue } = useActions();
    const { tournamentTypes } = useSelectors()
    
    const onSubmit = async () => {
        const values = getValues()
        const payload = {
            name: values.name,
            phone: values.phone,
            address: values.address,
            points: values.points
        }
        addVenue(payload)
        setOpenModal(false)
    }
console.log(tournamentTypes)
    return (
        <ModalNewData
            buttonText={'Crear Sede'}
            isOpen={openModal}
            onClickButton={handleSubmit(onSubmit)}
            setIsOpen={() => setOpenModal(false)}
            size={'lg'}
            title={"Crear Sede"}
        >
            <div className="grid grid-cols-2 gap-4 w-full">
                <TextInput
                    name="name"
                    register={register}
                    placeholder={"Solanas"}
                    label={"Nombre"}
                    rules={{ required: "Requerido" }}
                >
                </TextInput>
                <Select
                    name="tournamentType"
                    placeholder="Ej. Master 1000"
                    control={control}
                    isSearchable={false}
                    options={
                        tournamentTypes
                    }
                    rules={{ required: "Requerido" }}
                    errors={errors}
                >
                    Categoria
                </Select>
                <TextInput
                    name="phone"
                    register={register}
                    placeholder={"11 1234 9876"}
                    label={"Telefono"}
                    rules={{ required: "Requerido" }}
                >
                </TextInput>
                <TextInput
                    name="address"
                    register={register}
                    placeholder={"Curuchet"}
                    label={"Dirección"}
                    rules={{ required: "Requerido" }}
                >
                </TextInput>
            </div>
        </ModalNewData>
    )
}    

AddVenueForm.propTypes = {
    openModal: PropTypes.bool.isRequired, 
    setOpenModal: PropTypes.func.isRequired, 
};