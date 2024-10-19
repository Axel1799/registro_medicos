import React from 'react';
import DoctorForm from './DoctorForm';  // Asegúrate de ajustar la ruta de acuerdo a tu estructura
import Modal from 'react-modal';  // Asegúrate de que este import está presente
Modal.setAppElement('#root');  // Inicializa el elemento principal

function App() {
  return (
    <div className="App">
      <h1>Registro del Doctor</h1>
      <DoctorForm />
    </div>
  );
}

export default App;
