import { useEffect, useState } from "react";

export default function CharacterList() {
    const [list, setList] = useState([]);
    const [error, setError] = useState(null);
    const [filteredList, setFilteredList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function fetchCharacterList() {
            try {

                const response = await fetch('/characters.json');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                
                if (!data.results || !Array.isArray(data.results)) {
                    throw new Error('Invalid data format: expected results array');
                }

                const names = data.results.map(character => character.name);
                setList(names);
                setFilteredList(names);
                setError(null);
            }
            catch (error) {
                setError(`Failed to load MCU characters: ${error.message}`);
                console.error('Fetch error:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchCharacterList();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredList(list);
        } else {
            setFilteredList(
                list.filter(character =>
                    character.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }
    }, [searchTerm, list]);

    if (loading) return <div>Loading characters...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="p-4">
            <input
                type="text"
                placeholder="Search characters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4 p-2 border rounded w-full max-w-md"
            />

            {filteredList.length > 0 ? (
                <ul className="space-y-2">
                    {filteredList.map((character, index) => (
                        <li key={index} className="p-2 bg-gray-100 rounded">
                            {character}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No characters found matching your search.</p>
            )}
        </div>
    );
}