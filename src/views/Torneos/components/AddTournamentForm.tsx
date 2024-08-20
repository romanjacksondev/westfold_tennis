import ModalNewTournament from "components/ModalNewTournament";
import { TextInput } from "components/TextInput";
import { useForm } from 'react-hook-form'

export default function AddTournamentForm({openModal, setOpenModal}) {

const { register } = useForm({ mode: 'onSubmit'})

return (
    <ModalNewTournament
    isOpen={openModal}
    onClickButton={() => setOpenModal(false)}
    setIsOpen={() => setOpenModal(false)}
    title={"MODALAZo"}
    size={'lg'}
    >
        <div className="grid grid-cols-2 gap-4 w-full">
            <TextInput name="QUE INPUT" register={register} placeholder={"tralala"} label={"LOLOLO"}></TextInput>
        </div>
    </ModalNewTournament>
)

}    