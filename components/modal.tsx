import React, { useState } from 'react'
import Modal from 'react-modal'
import NewTournament from './newTournament'

const AddEntityModal = ({children}) => {
   const [isOpen, setIsOpen] = useState(false)
   const customStyles = {
      overlay: {
         backgroundColor: 'rgba(0, 0, 0, 0.6)'
      },
      content: {
         top: '50%',
         left: '50%',
         right: 'auto',
         bottom: 'auto',
         marginRight: '-50%',
         transform: 'translate(-50%, -50%)'
      }
   }
   return (
      <div>
         <button onClick={() => setIsOpen(true)}>Crear Torneo</button>
         <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} style={customStyles}>
            <h1>Agregar</h1>
            {children}
            <button onClick={() => setIsOpen(false)}>Cerrar</button>
         </Modal>
      </div>
   )
}
export default AddEntityModal