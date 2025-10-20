import React, { useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true;
const API_URL = 'http://localhost:3000/admin/room-types';

// Definisikan state awal yang kosong untuk form
const initialFormData = {
    name: '',
    capacity: 1,
    price_per_night: 0,
    description: '',
    room_bed: 'King Bed • 40m²', // Default value
    max_stay_duration: 30, // Default value
    image_url: ''
};

export default function RoomType() {
    // State untuk menampung daftar Tipe Kamar
    const [roomTypes, setRoomTypes] = useState([]); 
    
    // State untuk data form
    const [formData, setFormData] = useState(initialFormData);
    
    // State untuk menandai ID yang sedang diedit (null jika 'Create', angka jika 'Update')
    const [editId, setEditId] = useState(null); 
    const [error, setError] = useState('');

    // (READ) Fungsi untuk mengambil data Tipe Kamar
    const fetchData = async () => {
        try {
            const res = await axios.get(API_URL);
            setRoomTypes(res.data); // Simpan daftar Tipe Kamar ke state
            setError(''); // Hapus error jika sukses
        } catch (err) {
            const errorMsg = 'Gagal mengambil data Tipe Kamar. Apakah Anda login sebagai admin?';
            console.error(errorMsg, err);
            setError(errorMsg);
        }
    };

    // Panggil fetchData() saat komponen pertama kali dimuat
    useEffect(() => {
        fetchData();
    }, []);
    
    // Fungsi generik untuk menangani perubahan input form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ 
            ...prev, 
            // Ubah tipe data jika input adalah 'number'
            [name]: e.target.type === 'number' ? parseFloat(value) : value 
        }));
    };

    // (CREATE / UPDATE) Fungsi untuk submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validasi sederhana
        if (!formData.name || formData.capacity <= 0 || formData.price_per_night <= 0) {
            setError('Nama, Kapasitas (>0), dan Harga (>0) wajib diisi.');
            return;
        }

        try {
            if (editId) {
                // (UPDATE) Kirim PUT request ke /admin/room-types/:id
                await axios.put(`${API_URL}/${editId}`, formData);
            } else {
                // (CREATE) Kirim POST request ke /admin/room-types
                await axios.post(API_URL, formData);
            }
            resetForm();    // Kosongkan form
            fetchData();    // Muat ulang data
        } catch (err) {
            setError('Gagal menyimpan Tipe Kamar. Pastikan data unik jika diperlukan.');
            console.error(err);
        }
    };

    // (DELETE) Fungsi untuk menghapus Tipe Kamar
    const handleDelete = async (id_room_type) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus Tipe Kamar ini? (Kamar yang menggunakan tipe ini mungkin akan error)')) {
            try {
                await axios.delete(`${API_URL}/${id_room_type}`);
                fetchData(); // Muat ulang data
            } catch (err) {
                setError('Gagal menghapus Tipe Kamar.');
                console.error(err);
            }
        }
    };

    // Fungsi untuk mengisi form saat tombol "Edit" diklik
    const handleEdit = (roomType) => {
        setEditId(roomType.id_room_type); // Set ID yang sedang diedit
        setFormData({ // Isi form dengan data yang ada
            name: roomType.name,
            capacity: roomType.capacity,
            price_per_night: roomType.price_per_night,
            description: roomType.description,
            room_bed: roomType.room_bed,
            max_stay_duration: roomType.max_stay_duration,
            image_url: roomType.image_url || '' // Handle jika null
        });
    };

    // Fungsi untuk mengosongkan form dan reset editId
    const resetForm = () => {
        setEditId(null);
        setFormData(initialFormData);
        setError('');
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Manajemen Tipe Kamar (Room Types)</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Form untuk Create dan Update */}
            <form onSubmit={handleSubmit} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px' }}>
                <h3>{editId ? 'Edit Tipe Kamar' : 'Tambah Tipe Kamar Baru'}</h3>
                
                <div style={formRowStyle}>
                    <div style={formGroupStyle}>
                        <label>Nama Tipe Kamar:</label>
                        <input type='text' name='name' value={formData.name} onChange={handleInputChange} style={inputStyle} />
                    </div>
                    <div style={formGroupStyle}>
                        <label>Info Ranjang (Cth: King Bed • 40m²):</label>
                        <input type='text' name='room_bed' value={formData.room_bed} onChange={handleInputChange} style={inputStyle} />
                    </div>
                </div>

                <div style={formRowStyle}>
                    <div style={formGroupStyle}>
                        <label>Kapasitas (Orang):</label>
                        <input type='number' name='capacity' value={formData.capacity} onChange={handleInputChange} style={inputStyle} />
                    </div>
                    <div style={formGroupStyle}>
                        <label>Harga per Malam (Rp):</label>
                        <input type='number' name='price_per_night' value={formData.price_per_night} onChange={handleInputChange} style={inputStyle} />
                    </div>
                    <div style={formGroupStyle}>
                        <label>Durasi Max (Hari):</label>
                        <input type='number' name='max_stay_duration' value={formData.max_stay_duration} onChange={handleInputChange} style={inputStyle} />
                    </div>
                </div>

                <div style={formGroupStyle}>
                    <label>Deskripsi:</label>
                    <textarea name='description' value={formData.description} onChange={handleInputChange} style={{...inputStyle, height: '60px'}} />
                </div>
                
                <div style={formGroupStyle}>
                    <label>URL Gambar (Opsional):</label>
                    <input type='text' name='image_url' placeholder='http://.../gambar.jpg' value={formData.image_url} onChange={handleInputChange} style={inputStyle} />
                </div>
                
                <button type='submit' style={{ marginTop: '10px' }}>
                    {editId ? 'Simpan Perubahan' : 'Tambah Tipe Kamar'}
                </button>
                {editId && (
                    <button type='button' onClick={resetForm} style={{ marginLeft: '10px' }}>
                        Batal Edit
                    </button>
                )}
            </form>

            {/* Tabel untuk Read */}
            <h3>Daftar Tipe Kamar</h3>
            <table border='1' cellPadding='5' cellSpacing='0' style={{ width: '100%' }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nama</th>
                        <th>Kapasitas</th>
                        <th>Harga/Malam</th>
                        <th>Info Ranjang</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {roomTypes.map((type) => (
                        <tr key={type.id_room_type}>
                            <td>{type.id_room_type}</td>
                            <td>{type.name}</td>
                            <td>{type.capacity} org</td>
                            <td>Rp {type.price_per_night}</td>
                            <td>{type.room_bed}</td>
                            <td>
                                <button onClick={() => handleEdit(type)}>Edit</button>
                                <button onClick={() => handleDelete(type.id_room_type)} style={{ marginLeft: '5px' }}>
                                    Hapus
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Styling sederhana untuk form
const formRowStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '15px',
    marginBottom: '10px'
};

const formGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: '200px'
};

const inputStyle = {
    padding: '8px',
    fontSize: '14px',
    marginTop: '4px'
};