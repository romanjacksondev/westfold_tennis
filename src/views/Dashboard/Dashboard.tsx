import { Button } from "components/Button";
import { DatePicker } from "components/DatePicker";
import { Select } from "components/Select";
import { TextInput } from "components/TextInput";
import { TournamentCreateInput } from "interfaces";
import { useForm } from "react-hook-form";
import { useActions } from "store/actions";
import { useSelectors } from "store/selectors";


const DashboardView = () => {
  const { getValues, handleSubmit, register, control, formState: { errors } } = useForm({ mode: 'onSubmit' })
  const { addTournament } = useActions();
  const { players, venues, tournamentTypes } = useSelectors()

  const onSubmit = async () => {
    const values = getValues()
    const payload: TournamentCreateInput = {
      name: values.name,
      venueId: values.venue.id,
      winnerId: values.winner.id,
      date: new Date(),
      tournamentTypeId: values.tournamentType.id
    }
    // console.log(payload)
    addTournament(payload)
  }

  return (

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
        Categoria del Torneo
      </Select>
      {/* TODO: No funciona el datepicket */}
      <DatePicker
        name={"date"}
        placeholder="Fecha del torneo"
        handleChange={(d) => console.log(d)}
        control={control}
        rules={{ required: "Requerido" }}>
      </DatePicker>
      <Button onClick={handleSubmit(onSubmit)} className="w-40">
                    AVERGA
                </Button>
    </div>

  )
};

export default DashboardView;
