import React, { useState, useEffect, useRef } from 'react';
import { FaEdit, FaTrashAlt, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './DoctorForm.css';
import Modal from 'react-modal';

// Función para manejar el marcador en el mapa
const LocationMarker = ({ setPosition, initialPosition }) => {
    const [position, setMarkerPosition] = useState(initialPosition || null);

    useMapEvents({
        click(e) {
            setMarkerPosition(e.latlng);
            setPosition(e.latlng);
        },
        locationfound(e) {
            if (!initialPosition) {
                setMarkerPosition(e.latlng);
                setPosition(e.latlng);
            }
        },
    });

    useEffect(() => {
        if (initialPosition) {
            setMarkerPosition(initialPosition);
        }
    }, [initialPosition]);

    return position === null ? null : <Marker position={position}></Marker>;
};

const DoctorForm = () => {
    const [doctor, setDoctor] = useState({
        firstName: '',
        lastName: '',
        birthDate: '',
        specialty: '',
        area: '',
        institution: '',
        email: '',
        phoneNumber: '',
        latitude: null,
        longitude: null,
    });
    const [doctors, setDoctors] = useState([]);
    const [editingDoctorId, setEditingDoctorId] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
    const [doctorToDelete, setDoctorToDelete] = useState(null);
    const [mapPosition, setMapPosition] = useState(null);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [viewingLocation, setViewingLocation] = useState(false);
    const [filterText, setFilterText] = useState('');
    const dateInputRef = useRef(null); // Referencia para el input de la fecha

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/doctors');
            const result = await response.json();
            setDoctors(result);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        }
    };

    const handleChange = (e) => {
        setDoctor({ ...doctor, [e.target.name]: e.target.value });
    };

    const handleEdit = (doctor) => {
        const formattedDate = new Date(doctor.birth_date).toISOString().split('T')[0];
        setDoctor({
            firstName: doctor.first_name,
            lastName: doctor.last_name,
            birthDate: formattedDate,
            specialty: doctor.specialty,
            area: doctor.area,
            institution: doctor.institution,
            email: doctor.email,
            phoneNumber: doctor.phone_number,
            latitude: doctor.latitude || null,
            longitude: doctor.longitude || null,
        });
        setEditingDoctorId(doctor.id);
        setMapPosition([doctor.latitude, doctor.longitude]);
        setSelectedPosition({ lat: doctor.latitude, lng: doctor.longitude });
    };

    const handleDelete = async () => {
        try {
            await fetch(`http://localhost:5000/api/doctors/${doctorToDelete}`, {
                method: 'DELETE',
            });
            fetchDoctors();
            closeDeleteModal();
        } catch (error) {
            console.error('Error deleting doctor:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDoctorId) {
                await fetch(`http://localhost:5000/api/doctors/${editingDoctorId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(doctor),
                });
                setEditingDoctorId(null);
            } else {
                await fetch('http://localhost:5000/api/doctors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(doctor),
                });
            }
            setDoctor({
                firstName: '',
                lastName: '',
                birthDate: '',
                specialty: '',
                area: '',
                institution: '',
                email: '',
                phoneNumber: '',
                latitude: null,
                longitude: null,
            });
            setMapPosition(null);
            setSelectedPosition(null);
            fetchDoctors();
        } catch (error) {
            console.error('Error saving doctor:', error);
        }
    };

    const openMapModal = () => {
        setModalIsOpen(true);
        setViewingLocation(false);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setMapPosition([latitude, longitude]);
            },
            () => {
                setMapPosition([0, 0]);
            }
        );
    };

    const openViewMapModal = (latitude, longitude) => {
        setMapPosition([latitude, longitude]);
        setModalIsOpen(true);
        setViewingLocation(true);
    };

    const closeMapModal = () => {
        setModalIsOpen(false);
    };

    const openDeleteModal = (id) => {
        setDoctorToDelete(id);
        setDeleteModalIsOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalIsOpen(false);
        setDoctorToDelete(null);
    };

    const handleMapSelect = () => {
        if (selectedPosition) {
            setDoctor({ ...doctor, latitude: selectedPosition.lat, longitude: selectedPosition.lng });
        }
        closeMapModal();
    };

    const filteredDoctors = doctors.filter((doc) =>
        doc.first_name.toLowerCase().includes(filterText.toLowerCase()) ||
        doc.last_name.toLowerCase().includes(filterText.toLowerCase()) ||
        doc.email.toLowerCase().includes(filterText.toLowerCase())
    );

    // Función para abrir el calendario al hacer clic en el icono
    const openDatePicker = () => {
        if (dateInputRef.current) {
            dateInputRef.current.showPicker(); // Abre el picker del navegador
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="doctor-form">
                <div className="form-row">
                    <input
                        type="text"
                        name="firstName"
                        placeholder="Nombre"
                        onChange={handleChange}
                        value={doctor.firstName}
                        className="form-input"
                    />
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Apellido"
                        onChange={handleChange}
                        value={doctor.lastName}
                        className="form-input"
                    />
                </div>
                <div className="form-row">
                    <div className="date-input-container">
                        <input
                            type="date"
                            name="birthDate"
                            placeholder="Fecha de Nacimiento"
                            onChange={handleChange}
                            value={doctor.birthDate}
                            className="form-input"
                            ref={dateInputRef} // Referencia para el input de fecha
                        />
                        <FaCalendarAlt className="calendar-icon" onClick={openDatePicker} /> {/* Icono clickeable */}
                    </div>
                    <input
                        type="text"
                        name="specialty"
                        placeholder="Especialidad"
                        onChange={handleChange}
                        value={doctor.specialty}
                        className="form-input"
                    />
                </div>

                <div className="form-row">
                    <input
                        type="text"
                        name="area"
                        placeholder="Área"
                        onChange={handleChange}
                        value={doctor.area}
                        className="form-input"
                    />
                    <input
                        type="text"
                        name="institution"
                        placeholder="Institución"
                        onChange={handleChange}
                        value={doctor.institution}
                        className="form-input"
                    />
                </div>
                <div className="form-row">
                    <input
                        type="email"
                        name="email"
                        placeholder="Correo Electrónico"
                        onChange={handleChange}
                        value={doctor.email}
                        className="form-input"
                    />
                    <input
                        type="text"
                        name="phoneNumber"
                        placeholder="Teléfono"
                        onChange={handleChange}
                        value={doctor.phoneNumber}
                        className="form-input"
                    />
                </div>
                <div className="form-row">
                    <button type="button" onClick={openMapModal} className="submit-button">
                        {editingDoctorId ? 'Editar Ubicación' : 'Seleccionar Ubicación'}
                    </button>
                </div>
                <button type="submit" className="submit-button">
                    {editingDoctorId ? 'Actualizar' : 'Agregar'}
                </button>
            </form>

            <h2>Lista de Médicos</h2>
            <input
                type="text"
                placeholder="Buscar..."
                className="general-search"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
            />
            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Fecha de Nacimiento</th>
                        <th>Especialidad</th>
                        <th>Área</th>
                        <th>Institución</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Localización</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDoctors.map((doc) => (
                        <tr key={doc.id}>
                            <td>{doc.first_name}</td>
                            <td>{doc.last_name}</td>
                            <td>{new Date(doc.birth_date).toLocaleDateString()}</td>
                            <td>{doc.specialty}</td>
                            <td>{doc.area}</td>
                            <td>{doc.institution}</td>
                            <td>{doc.email}</td>
                            <td>{doc.phone_number}</td>
                            <td>
                                {doc.latitude && doc.longitude ? (
                                    <button
                                        className="icon-button"
                                        onClick={() => openViewMapModal(doc.latitude, doc.longitude)}
                                    >
                                        <FaMapMarkerAlt /> Ver localización
                                    </button>
                                ) : (
                                    'No disponible'
                                )}
                            </td>
                            <td>
                                <button onClick={() => handleEdit(doc)} className="icon-button">
                                    <FaEdit />
                                </button>
                                <button onClick={() => openDeleteModal(doc.id)} className="icon-button">
                                    <FaTrashAlt />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal para la eliminación */}
            <Modal isOpen={deleteModalIsOpen} onRequestClose={closeDeleteModal} className="modal-content">
                <h3>¿Está seguro de eliminar los datos de este médico?</h3>
                <div className="modal-actions">
                    <button onClick={handleDelete} className="modal-delete-button">Sí, eliminar</button>
                    <button onClick={closeDeleteModal} className="modal-cancel-button">Cancelar</button>
                </div>
            </Modal>

            {/* Modal para la selección de ubicación */}
            <Modal isOpen={modalIsOpen} onRequestClose={closeMapModal} className="modal-content">
                {viewingLocation ? (
                    <>
                        <h3>Localización Guardada</h3>
                        <div style={{ height: '400px' }}>
                            <MapContainer center={mapPosition || [0, 0]} zoom={13} className="leaflet-container">
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={mapPosition}></Marker>
                            </MapContainer>
                        </div>
                        <a
                            href={`https://www.openstreetmap.org/?mlat=${mapPosition[0]}&mlon=${mapPosition[1]}#map=18/${mapPosition[0]}/${mapPosition[1]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Abrir en OpenStreetMap
                        </a>
                    </>
                ) : (
                    <>
                        <h3>Selecciona la ubicación</h3>
                        <div style={{ height: '400px' }}>
                            <MapContainer center={mapPosition || [0, 0]} zoom={13} className="leaflet-container">
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <LocationMarker setPosition={setSelectedPosition} initialPosition={selectedPosition} />
                            </MapContainer>
                        </div>
                        <button onClick={handleMapSelect} className="submit-button">
                            Guardar Ubicación
                        </button>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default DoctorForm;
