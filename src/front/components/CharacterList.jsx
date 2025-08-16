import React, { useState, useEffect } from 'react';
import { gsap } from "gsap";

const CharacterList = () => {
    const [characters, setCharacters] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        realName: '',
        universe: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [status, setStatus] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchCharacters = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/characters');
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setCharacters(data.characters || data);
        } catch (err) {
            setStatus('Error loading characters: ' + err.message);
        }
    };

    const searchCharacters = async () => {
        if (!searchQuery.trim()) {
            fetchCharacters();
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/characters/search?query=${encodeURIComponent(searchQuery)}`);
            if (!response.ok) throw new Error('Search failed');
            const data = await response.json();
            setCharacters(data);
        } catch (err) {
            setStatus('Error searching characters: ' + err.message);
        }
    };

    useEffect(() => {
        fetchCharacters();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            searchCharacters();
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.realName.trim()) {
            setStatus('Name and Real Name are required!');
            return;
        }

        try {
            setStatus('Saving...');
            const url = editingId
                ? `http://localhost:5000/api/characters/${editingId}`
                : 'http://localhost:5000/api/characters';

            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error(editingId ? 'Update failed' : 'Creation failed');

            await fetchCharacters();
            setFormData({ name: '', realName: '', universe: 'Earth-616' });
            setEditingId(null);
            setShowAddForm(false);
            setStatus(editingId ? 'Character updated!' : 'Character added!');
            setSearchQuery('');
        } catch (err) {
            setStatus('Error: ' + err.message);
        }
    };

    const handleEdit = (character) => {
        setFormData({
            name: character.name,
            realName: character.realName,
            universe: character.universe
        });
        setEditingId(character.id);
        setShowAddForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this character?')) return;

        try {
            setStatus('Deleting...');
            const response = await fetch(`http://localhost:5000/api/characters/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Delete failed');

            await fetchCharacters();
            setStatus('Character deleted!');
        } catch (err) {
            setStatus('Error: ' + err.message);
        }
    };

    const toggleAddForm = () => {
        setShowAddForm(!showAddForm);
        setEditingId(null);
        setFormData({ name: '', realName: '', universe: 'Earth-616' });
    };

    return (
        <div className="w-full h-screen flex flex-col justify-center p-4 animate bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <h1 className="avengers-title font-avengers text-7xl font-bold text-center my-8 text-red-600">The Avengers</h1>

                {/* Search Bar and add character part*/}
            <div className='flex items-center justify-center gap-10 mb-5'>
                <div className=" flex justify-center">
                    <div className="relative w-full max-w-md">
                        <input
                            type="text"
                            placeholder="Search heroes"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    fetchCharacters();
                                }}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
                <div className="text-center">
                    <button
                        onClick={toggleAddForm}
                        className="px-6 py-3 bg-red-950 text-white rounded-lg shadow hover:bg-red-700 transition"
                    >
                        {showAddForm ? 'Cancel' : 'Add a New Character'}
                    </button>
                </div>
            </div>
                {showAddForm && (
                    <div className=" w-fit p-5 m-10 rounded-lg shadow-md flex-col justify-center items-center animate-fadeIn">
                        <h2 className="text-xl font-semibold mb-4">
                            {editingId ? 'Edit Character' : 'Add New Character'}
                        </h2>
                        <form onSubmit={handleSubmit}
                              className="space-y-4 p-5 flex-col justify-center items-center">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Hero Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-[100%] py-2 border rounded-md shadow-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Identity</label>
                                <input
                                    type="text"
                                    name="realName"
                                    value={formData.realName}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-[100%] py-2 border rounded-md shadow-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Universe</label>
                                <input
                                    type="text"
                                    name="universe"
                                    value={formData.universe}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-[100%] px-3 py-2 border rounded-md shadow-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-fit px-4 py-2 bg-red-600 flex justify-center items-center text-white rounded-md hover:bg-red-700"
                            >
                                {editingId ? 'Update Character' : 'Add Character'}
                            </button>
                        </form>
                        {status && (
                            <p className={`mt-3 text-sm ${
                                status.includes('Error') ? 'text-red-600' : 'text-green-600'
                            }`}>
                                {status}
                            </p>
                        )}
                    </div>
                )}

                {/* Characters Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
                    {characters.map(character => (
                        <div key={character.id}
                             className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition">
                            <h3 className="text-3xl font-bold text-center font-avengers">{character.name}</h3>
                            <p className="text-gray-600"><b>Real Name:</b> {character.realName}</p>
                            <p className="text-gray-600"><b>Universe:</b> {character.universe}</p>
                            <div className="mt-3 flex justify-center items-center space-x-2">
                                <button
                                    onClick={() => handleEdit(character)}
                                    className="px-3 py-1 w-fit border-2 rounded hover:bg-blue-600 hover:text-white transiton"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(character.id)}
                                    className="px-3 py-1 bg-red-500 text-white text-sm w-fit rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>




        </div>
    );
};

export default CharacterList;