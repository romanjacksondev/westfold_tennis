import ModalNewData from "components/ModalNewData";
import { Select } from "components/Select";
import { TextInput } from "components/TextInput";
import { useForm, useWatch } from 'react-hook-form'
import { useActions } from "store/actions";
import { useSelectors } from "store/selectors";
import { useRouter } from 'next/router'
import PropTypes from 'prop-types';
import { useState } from "react";

export default function AddMatchForm({ openModal, setOpenModal }) {

    const { getValues, handleSubmit, register, control, formState: { errors } } = useForm({ mode: 'onSubmit' })
    const { addMatch } = useActions();
    const { players, tournaments } = useSelectors()
    const router = useRouter()
    // Estado local para manejar la cantidad de sets
    const [setQuantity, setSetQuantity] = useState(1);

    // Verificar cambios en setQuantity con useWatch
    const watchSetQuantity = useWatch({
        control,
        name: 'setQuantity'
    });


    const onSubmit = async () => {
        const values = getValues()

        const sets = Array.from({ length: setQuantity }, (_, index) => ({
            gamesPlayer1: values[`gamesPlayer1_set${index + 1}`],
            gamesPlayer2: values[`gamesPlayer2_set${index + 1}`],
            winner: values[`gamesPlayer1_set${index + 1}`] > values[`gamesPlayer2_set${index + 1}`] ? values.player1.id : values.player2.id
        }));

        console.log("sets: " , sets)

        let player1Wins = 0;
        let player2Wins = 0;
    
        sets.forEach(set => {
            if (set.gamesPlayer1 > set.gamesPlayer2) {
                player1Wins += 1;  // Jugador 1 gana este set
            } else if (set.gamesPlayer2 > set.gamesPlayer1) {
                player2Wins += 1;  // Jugador 2 gana este set
            }
        });

        console.log("winner: " , player1Wins > player2Wins ? values.player1.id : values.player2.id)
        

        const payload = {
            idPlayer1: values.player1.id,
            idPlayer2: values.player2.id,
            setQuantity: setQuantity,
            tournamentId: router.query.id,
            sets: sets,
            winner: player1Wins > player2Wins ? values.player1.id : values.player2.id
        }

        addMatch(payload)
        setOpenModal(false)
    }

    const handleSetQuantityChange = (e) => {
        console.log("e: ", e)
        const value = parseInt(e.value, 10);
        setSetQuantity(value > 0 ? value : 1); // Asegurarse de que siempre sea al menos 1
    };

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
                    name="tournament"
                    placeholder="Ej. Hidden Court I"
                    control={control}
                    isSearchable={false}
                    options={
                        tournaments
                    }
                    rules={{ required: "Requerido" }}
                    errors={errors}
                >
                    Torneo
                </Select>
                <Select
                    name="asdasdas"
                    placeholder="Ej. Ale"
                    defaultValue={{
                                label:"1",
                                value:1
                            }}
                    control={control}
                    isSearchable={false}
                    optionLabel="label"
                    optionValue="value"
                    handleChange={handleSetQuantityChange}
                    options={
                        [
                            {
                                label:"1",
                                value:1
                            },
                            {
                                label:"3",
                                value:3
                            },
                            {
                                label:"5",
                                value:5
                            }
                        ]
                    }
                    // rules={{ required: "Requerido" }}
                    errors={errors}
                >
                    Cantidad de sets
                </Select>

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
                {/* <TextInput
                    name="gamesPlayer1"
                    register={register}
                    placeholder={"4"}
                    label={"Games ganados Jugador 1"}
                    rules={{ required: "Requerido" }}
                />

                <TextInput
                    name="gamesPlayer2"
                    register={register}
                    placeholder={"2"}
                    label={"Games ganados Jugador 2"}
                    rules={{ required: "Requerido" }}
                /> */}
                {Array.from({ length: setQuantity }).map((_, index) => (
                    <div key={index} className="col-span-2">
                        <h3 className="text-sm font-medium mb-2">Set {index + 1}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <TextInput
                                name={`gamesPlayer1_set${index + 1}`}
                                register={register}
                                placeholder={"Games Jugador 1"}
                                label={`Games Jugador 1 - Set ${index + 1}`}
                                rules={{ required: "Requerido" }}
                            />
                            <TextInput
                                name={`gamesPlayer2_set${index + 1}`}
                                register={register}
                                placeholder={"Games Jugador 2"}
                                label={`Games Jugador 2 - Set ${index + 1}`}
                                rules={{ required: "Requerido" }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </ModalNewData>
    )

}

AddMatchForm.propTypes = {
    openModal: PropTypes.bool.isRequired,
    setOpenModal: PropTypes.func.isRequired,
};