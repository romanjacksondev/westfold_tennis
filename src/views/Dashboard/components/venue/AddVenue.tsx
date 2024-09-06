import { useState } from "react";
import { Button } from "components/Button";
import AddVenueForm from "./AddVenueForm";

export default function AddVenue() {

    const [openModal, setOpenModal] = useState(false)
    const handleOnClick = () => {
        setOpenModal(true)
    }

    return <>
        {openModal && (<AddVenueForm openModal={openModal} setOpenModal={setOpenModal}></AddVenueForm>)}
        <Button onClick={handleOnClick} className="w-40" width="fixed" variant="text">
            Crear Sede
        </Button>
    </>
}