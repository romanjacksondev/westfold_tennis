import ModalNewData from "components/ModalNewData";
import { TextInput } from "components/TextInput";
import { useForm } from 'react-hook-form'
import { useActions } from "store/actions";

export default function AddPlayerForm({ openModal, setOpenModal }) {

    const { getValues, handleSubmit, register, formState: { errors } } = useForm({ mode: 'onSubmit' })
    const { addPlayer } = useActions();

    const onSubmit = async () => {
        const values = getValues()
        const payload = {
            name: values.name
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
                    label={"Nombre del jugador"}
                    rules={{ required: "Requerido" }}
                >
                </TextInput>
            </div>
        </ModalNewData>
    )
}    
