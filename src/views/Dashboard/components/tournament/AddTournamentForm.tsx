import ModalNewData from "components/ModalNewData";
import { Select } from "components/Select";
import { TextInput } from "components/TextInput";
import { TournamentCreateInput } from "interfaces";
import { useForm } from 'react-hook-form'
import { useActions } from "store/actions";
import { useSelectors } from "store/selectors";
import PropTypes from 'prop-types';
import MultiSelect from "components/MultiSelect/MultiSelect";

import { toast } from 'react-toastify'
export default function AddTournamentForm({ openModal, setOpenModal }) {

    const { getValues, handleSubmit, register, control, formState: { errors } } = useForm({ mode: 'onSubmit' })
    const { addTournament } = useActions();
    const { players, venues, tournamentCategories, surfaces } = useSelectors()
    const onSubmit = async () => {
        const values = getValues()
        const playerName = players.find(player => player.id == values.champion.id).name
        const venuePoints = venues.find(venue => venue.id == values.venue.id).points
        // console.log(values)
        const payload: TournamentCreateInput = {
            name: values.name,
            venueId: values.venue.id,
            championId: values.champion.id,
            date: new Date(values.date),
            tournamentCategoryId: values.tournamentCategory.id,
            surfaceId: values.surface.id,
            champion: {
                "name": playerName
            },
            venue: {
                "points": venuePoints
            },
            tournamentCategory: values.tournamentCategory,
            players: values.players
        }

        const response = await addTournament(payload)
        console.log("response: ", response)
        if(response.status == 201) {
            toast.success("Torneo creado!")
        } else {
            toast.error("Torneo NO creado!")
        }
            
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
                    placeholder={"Ej. Solanas VIII"}
                    label={"Nombre del torneo"}
                    rules={{ required: "Requerido" }}
                >
                </TextInput>
                <Select
                    name="champion"
                    placeholder="Ej. Ale"
                    control={control}
                    isSearchable={false}
                    options={
                        players
                    }
                    rules={{ required: "Requerido" }}
                    errors={errors}
                >
                    Campeon
                </Select>
                <Select
                    name="venue"
                    placeholder="Ej. Solanas"
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
                <Select
                    name="tournamentCategory"
                    placeholder="Ej. Master 1000"
                    control={control}
                    isSearchable={false}
                    options={
                        tournamentCategories
                    }
                    rules={{ required: "Requerido" }}
                    errors={errors}
                >
                    Categoria del Torneo
                </Select>
                <Select
                    name="surface"
                    placeholder="Ej. Polvo de Ladrillo"
                    control={control}
                    isSearchable={false}
                    options={
                        surfaces
                    }
                    rules={{ required: "Requerido" }}
                    errors={errors}
                >
                    Superficie
                </Select>
                <MultiSelect
                    label={"Participantes"}
                    options={
                        players
                    }
                    placeholder={"Participantes"}
                    name="players"
                    control={control}
                    rules={{ required: "Requerido" }}
                    isDisabled={false}
                    isLoading={false}
                    optionLabel={"name"}
                    optionValue={"id"}
                    defaultValue={[]}
                />
                <TextInput
                    name="date"
                    register={register}
                    placeholder={"Ej. 12/04/2024"}
                    label={"Fecha del torneo"}
                    rules={{ required: "Requerido" }}
                    type="date"
                >
                </TextInput>
            </div>
        </ModalNewData>
    )
}

AddTournamentForm.propTypes = {
    openModal: PropTypes.bool.isRequired,
    setOpenModal: PropTypes.func.isRequired,
};