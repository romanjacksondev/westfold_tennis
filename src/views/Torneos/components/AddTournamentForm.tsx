import { DatePicker } from "components/DatePicker";
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

    // console.log(players)
    // console.log(venues)
    const onSubmit = async () => {
        debugger
        const values = getValues()
        // console.log(values)
        const payload = {

            name: values.name,
            venue: values.venue,
            winner: values.winner,
            date: new Date()
        }
        // console.log(payload)
        addTournament(payload)
        setOpenModal(false)
    }

    return (
        <ModalNewData
            buttonText={'Crear Torneo'}
            isOpen={openModal}
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
                    Sede
                </Select>
                {/* TODO: No funciona el datepicket */}
                {/* <DatePicker 
                    name={"date"} 
                    placeholder="Fecha del torneo" 
                    handleChange={(d) => console.log(d)} 
                    control={control} 
                    rules={{ required: "Requerido" }}>
                </DatePicker> */}
            </div>
        </ModalNewData>
    )

}    