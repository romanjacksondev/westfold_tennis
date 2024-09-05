import AddTournament from "./components/AddTournament";

const DashboardView = () => {

  return (


    <AddTournament></AddTournament>

    // <div className="grid grid-cols-2 gap-4 w-full">
    //   <TextInput
    //     name="name"
    //     register={register}
    //     placeholder={"Ej. Solanas VIII"}
    //     label={"Nombre del torneo"}
    //     rules={{ required: "Requerido" }}
    //   >
    //   </TextInput>
    //   <Select
    //     name="winner"
    //     placeholder="Ej. Ale"
    //     control={control}
    //     isSearchable={false}
    //     options={
    //       players
    //     }
    //     rules={{ required: "Requerido" }}
    //     errors={errors}
    //   >
    //     Ganador
    //   </Select>
    //   <Select
    //     name="venue"
    //     placeholder="Ej. Solanas"
    //     control={control}
    //     isSearchable={false}
    //     options={
    //       venues
    //     }
    //     rules={{ required: "Requerido" }}
    //     errors={errors}
    //   >
    //     Sede
    //   </Select>
    //   <Select
    //     name="tournamentType"
    //     placeholder="Ej. Master 1000"
    //     control={control}
    //     isSearchable={false}
    //     options={
    //       tournamentTypes
    //     }
    //     rules={{ required: "Requerido" }}
    //     errors={errors}
    //   >
    //     Categoria del Torneo
    //   </Select>
    //   <Button onClick={handleSubmit(onSubmit)} className="w-40">
    //                 AVERGA
    //             </Button>
    // </div>

  )
};

export default DashboardView;
