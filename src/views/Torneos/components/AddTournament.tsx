import { useState } from "react";
import { Button } from "components/Button";
import AddTournamentForm from "./AddTournamentForm";

export default function AddTournament() {



    const [openModal, setOpenModal] = useState(false)

    const handleOnClick = () => {
        setOpenModal(true)
    }

    return <>
        {openModal && (<AddTournamentForm openModal={openModal} setOpenModal={setOpenModal}></AddTournamentForm>)}
        <Button onClick={handleOnClick} className="w-40" width="fixed" variant="text">
            Crear Torneo
        </Button>
    </>
}