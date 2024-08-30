import ModalNewData from "components/ModalNewData";
import { Select } from "components/Select";
import { TextInput } from "components/TextInput";
import { useForm } from 'react-hook-form'
import { useActions } from "store/actions";
import { useSelectors } from "store/selectors";
import { useRouter } from 'next/router'

export default function AddMatchForm({ openModal, setOpenModal }) {

    const { getValues, handleSubmit, register, control, formState: { errors } } = useForm({ mode: 'onSubmit' })
    const { addMatch } = useActions();
    const { players } = useSelectors()
    const router = useRouter()

    const onSubmit = async () => {
        const values = getValues()
        const payload = {
            idPlayer1: values.player1.id,
            idPlayer2: values.player2.id,
            gamesPlayer1: values.gamesPlayer1,
            gamesPlayer2: values.gamesPlayer2,
            winner: values.gamesPlayer1 > values.gamesPlayer2 ? values.player1.id : values.player2.id,
            tournamentId: router.query.id
        }
        console.log(router.query.id)
        addMatch(payload)
        setOpenModal(false)
    }

    return (
        <ModalNewData
            buttonText={'Agregar Partido'}
            isOpen={openModal}
            onClickButton={handleSubmit(onSubmit)}
            setIsOpen={() => setOpenModal(false)}
            size={'lg'}
            title={"Agregar Partido"}
        >
            <div className="grid grid-cols-2 gap-4 w-full">
                <Select
                    name="player1"
                    placeholder="Ej. Ale"
                    control={control}
                    isSearchable={false}
                    options={
                        players
                    }
                    rules={{ required: "Requerido" }}
                    errors={errors}
                >
                    Jugador 1
                </Select>
                <TextInput
                    name="gamesPlayer1"
                    register={register}
                    placeholder={"4"}
                    label={"Games ganados Jugador 1"}
                    rules={{ required: "Requerido" }}
                />                
                <Select
                    name="player2"
                    placeholder="Ej. Rofer"
                    control={control}
                    isSearchable={false}
                    options={
                        players
                    }
                    rules={{ required: "Requerido" }}
                    errors={errors}
                >
                    Jugador 2
                </Select>
                <TextInput
                    name="gamesPlayer2"
                    register={register}
                    placeholder={"2"}
                    label={"Games ganados Jugador 2"}
                    rules={{ required: "Requerido" }}
                />       
            </div>
        </ModalNewData>
    )

}    