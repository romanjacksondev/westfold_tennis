import { useState } from "react";
import { Button } from "components/Button";
import AddMatchForm from "./AddMatchForm";

export default function AddMatch() {

    const [openModal, setOpenModal] = useState(false)

    const handleOnClick = () => {
        setOpenModal(true)
    }

    return <>
        {openModal && (<AddMatchForm openModal={openModal} setOpenModal={setOpenModal}></AddMatchForm>)}
        <Button onClick={handleOnClick} className="w-40" width="fixed" variant="text">
            Agregar Partidos
        </Button>
    </>
}