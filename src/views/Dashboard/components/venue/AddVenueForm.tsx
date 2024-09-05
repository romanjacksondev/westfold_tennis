import ModalNewData from "components/ModalNewData";
import { TextInput } from "components/TextInput";
import { useForm } from 'react-hook-form'
import { useActions } from "store/actions";

export default function AddVenueForm({ openModal, setOpenModal }) {

    const { getValues, handleSubmit, register, formState: { errors } } = useForm({ mode: 'onSubmit' })
    const { addVenue } = useActions();

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
                    label={"Nombre de la sede"}
                    rules={{ required: "Requerido" }}
                >
                </TextInput>
                <TextInput
                    name="points"
                    register={register}
                    placeholder={"500"}
                    label={"Puntos que otorga"}
                    rules={{ required: "Requerido" }}
                >
                </TextInput>
                <TextInput
                    name="phone"
                    register={register}
                    placeholder={"11 1234 9876"}
                    label={"Telefono de la sede"}
                    rules={{ required: "Requerido" }}
                >
                </TextInput>
                <TextInput
                    name="address"
                    register={register}
                    placeholder={"Curuchet"}
                    label={"Direccion de la sede"}
                    rules={{ required: "Requerido" }}
                >
                </TextInput>
            </div>
        </ModalNewData>
    )

}    