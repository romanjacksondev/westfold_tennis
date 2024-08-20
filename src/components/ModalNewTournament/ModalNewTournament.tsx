import Modal from 'components/Modal'
import { Button } from "components/Button";

const ModalNewTournament = ({
    children,
    isOpen,
    onClickButton,
    setIsOpen,
    size,
    title
}) => {
    return (

        <Modal isOpen={isOpen} size={size}>
            <Modal.Header setIsOpen={setIsOpen}>
                {title}
            </Modal.Header>
            <Modal.Content className='flex justify-center'>{children}</Modal.Content>
        <Modal.Actions className='bg-gray-50 flex justify-end'>
            <Button onClick={onClickButton} className="w-40">
                BOTONAZOOOOOO
            </Button>
        </Modal.Actions>
        </Modal>
    )
}

export default ModalNewTournament