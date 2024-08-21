import ModalNewData from "components/ModalNewData";
import { Select } from "components/Select";
import { TextInput } from "components/TextInput";
import { useForm } from 'react-hook-form'
import { useActions } from "store/actions";
import { useSelectors } from "store/selectors";

export default function AddTournamentForm({ openModal, setOpenModal }) {

    const { getValues, handleSubmit, register, control, formState: { errors } } = useForm({ mode: 'onSubmit' })
    const { addTournament } = useActions();
    const { players, venues } = useSelectors()
    
console.log(players)
console.log(venues)
    const onSubmit = async () => {
        const values = getValues()
        console.log(values)
        setOpenModal(false)

        // {
        //     "nombre": "ASDASD",
        //     "player1": {
        //       "id": "clocdejyx0005im7xax71x3yd",
        //       "name": "Ale"
        //     }
        //   }
        const payload = {

            name: values.nombre,
            venue: {points: 333,
                id: "clocddyjd0003im7xky85h3v6"},
            winner: {name:"VDVSVDVS"},
            date: "12/04/1984"
        }
        // addTournament(payload)


    }

    const data = []
    // console.log(data)

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
                    name="name"
                    register={register}
                    placeholder={"Solanas VIII"}
                    label={"Nombre del torneo"}
                    rules={{ required: "Requerido" }}
                >
                </TextInput>
                <Select
                    name="winner"
                    placeholder="Ej. Ale"
                    control={control}
                    isSearchable={false}
                    options={
                        players
                    }
                    rules={{ required: "Requerido" }}
                    errors={errors}
                >
                    Ganador
                </Select>
                <Select
                    name="venue"
                    placeholder="Ej. SOlanas"
                    control={control}
                    isSearchable={false}
                    options={
                        venues
                    }
                    rules={{ required: "Requerido" }}
                    errors={errors}
                >
                    Ganador
                </Select>
            </div>
        </ModalNewData>
    )

}    