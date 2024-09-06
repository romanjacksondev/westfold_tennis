import ModalNewData from "components/ModalNewData";
import { TextInput } from "components/TextInput";
import { useForm } from 'react-hook-form'
import { useActions } from "store/actions";
import PropTypes from 'prop-types';

export default function AddPlayerForm({ openModal, setOpenModal }) {

    const { getValues, handleSubmit, register } = useForm({ mode: 'onSubmit' })
    const { addPlayer } = useActions();

    const onSubmit = async () => {
        const values = getValues()
        const payload = {
            name: values.name,
            nickname: values.nickname,
            lastname: values.lastname,
            phone: values.phone,
            mail: values.mail
        }
        addPlayer(payload)
        setOpenModal(false)
    }

    return (
        <ModalNewData
            buttonText={'Agregar Jugador'}
            isOpen={openModal}
            onClickButton={handleSubmit(onSubmit)}
            setIsOpen={() => setOpenModal(false)}
            size={'lg'}
            title={"Agregar Jugador"}
        >
            <div className="grid grid-cols-2 gap-4 w-full">
                <TextInput
                    name="name"
                    register={register}
                    placeholder={"Ej. Ale"}
                    label={"Nombre"}
                    rules={{ required: "Requerido" }}
                />
                <TextInput
                    name="nickname"
                    register={register}
                    placeholder={"Ej. Fettel"}
                    label={"Apodo"}
                    // rules={{ required: "Requerido" }}
                />
                <TextInput
                    name="lastname"
                    register={register}
                    placeholder={"Ej. Miguel"}
                    label={"Apellido"}
                    // rules={{ required: "Requerido" }}
                />
                <TextInput
                    name="phone"
                    register={register}
                    placeholder={"Ej. 11 4561-6547"}
                    label={"Telefono"}
                // rules={{ required: "Requerido" }}
                />
                <TextInput
                    name="mail"
                    register={register}
                    placeholder={"Ej. mail@mailto"}
                    label={"Mail"}
                // rules={{ required: "Requerido" }}
                />
            </div>
        </ModalNewData>
    )
}    

AddPlayerForm.propTypes = {
    openModal: PropTypes.bool.isRequired,
    setOpenModal: PropTypes.func.isRequired,
};