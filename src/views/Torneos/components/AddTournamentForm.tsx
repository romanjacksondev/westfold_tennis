import ModalNewData from "components/ModalNewData";
import { Select } from "components/Select";
import { TextInput } from "components/TextInput";
import { useForm } from 'react-hook-form'
import useSWR from 'swr'

export default function AddTournamentForm({ openModal, setOpenModal }) {

    const { getValues, handleSubmit, register, control, formState: { errors } } = useForm({ mode: 'onSubmit' })

    const onSubmit = async () => {

        const values = getValues()
        console.log(values)
        setOpenModal(false)
    }

    const data = []
    console.log(data)

    return (
        <ModalNewData
            buttonText={'Crear Torneo'}
            isOpen={openModal}
            // onClickButton={() => setOpenModal(false)}
            onClickButton={handleSubmit(onSubmit)}
            setIsOpen={() => setOpenModal(false)}
            size={'lg'}
            title={"Crear Torneo"}
        >
            <div className="grid grid-cols-2 gap-4 w-full">
                <TextInput
                    name="nombre"
                    register={register}
                    placeholder={"Solanas VIII"}
                    label={"Nombre del torneo"}>
                </TextInput>
                <Select
                    name="player1"
                    placeholder="Ej. Valencia"
                    control={control}
                    isSearchable={false}
                    options={
                        data
                    }
                    rules={{ required: "Requerido" }}
                    errors={errors}
                >
                    Jugador 1
                </Select>
            </div>
        </ModalNewData>
    )

}    