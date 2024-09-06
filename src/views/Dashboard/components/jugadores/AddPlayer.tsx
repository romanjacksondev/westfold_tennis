import { useState } from "react";
import { Button } from "components/Button";
import AddPlayerForm from "./AddPlayerForm";

export default function AddPlayer() {

    const [openModal, setOpenModal] = useState(false)

    const handleOnClick = () => {
        setOpenModal(true)
    }

    return <>
        {openModal && (<AddPlayerForm openModal={openModal} setOpenModal={setOpenModal}></AddPlayerForm>)}
        <Button onClick={handleOnClick} className="w-40" width="fixed" variant="text">
            Agregar Jugador
        </Button>
    </>
}