import React, { useState } from 'react';
import axios from 'axios';

function CreateCinema({ setCinemas }) {
    const [seats, setSeats] = useState(0);

    const handleCinemaCreation = async () => {
        try {
            await axios.post('http://localhost:3000/cinemas', { seats });
            alert('Cinema created successfully!');
            const response = await axios.get('http://localhost:3000/cinemas');
            setCinemas(response.data);
            setSeats(0)
        } catch (err) {
            alert('Error creating cinema.');
        }
    };

    return (
        <div>
            <h2>Create Cinema</h2>
            <input
                type="text"
                placeholder="Enter total seats to create"
                value={seats ? seats : ''}
                onChange={(e) => setSeats(e.target.value)}
            />
            <button onClick={handleCinemaCreation}>Create Cinema</button>
        </div>
    );
}

export default CreateCinema;
