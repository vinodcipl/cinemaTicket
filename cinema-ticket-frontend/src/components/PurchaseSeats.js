import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PurchaseSeats({ cinemas, setCinemas }) {
    const [cinemaId, setCinemaId] = useState('');
    const [seatNumber, setSeatNumber] = useState(0);
    const [availableSeatNumbers, setAvailableSeatNumbers] = useState([]);

    const fetchAvailableSeats = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/cinemas/${cinemaId}/available-seats`);
            setAvailableSeatNumbers(response.data);
            setSeatNumber(response.data[0])
        } catch (err) {
            console.error("Error fetching available seats", err);
        }
    };

    useEffect(() => {
        if (cinemaId) {
            fetchAvailableSeats();
        } else {
            setAvailableSeatNumbers([]);
        }
    }, [cinemaId]);


    const handlePurchase = async () => {
        try {
            const response = await axios.post(`http://localhost:3000/cinemas/${cinemaId}/purchase`, { seatNumber });
            // Check for error in response
            if (response.data.error) {
                alert(response.data.error);
                return;
            }
            const updatedCinema = response.data.cinema;

            // Update the cinemas state with the updated cinema data
            setCinemas(prevCinemas => {
                return prevCinemas.map(cinema => cinema._id === updatedCinema._id ? {
                    ...cinema,
                    availableSeats: updatedCinema.seats - updatedCinema.purchasedSeats.length
                } : cinema);
            });
            setSeatNumber(0);
            fetchAvailableSeats();

            alert(response.data.message);
        } catch (err) {
            console.error("Error purchasing seat", err);
            if (err.response.data.err) {
                alert(`Error: ${err.response.data.error}`);
            } else {
                alert(`Error purchasing seat`);
            }
        }
    };

    const handlePurchaseConsecutive = async () => {
        try {
            const response = await axios.post(`http://localhost:3000/cinemas/${cinemaId}/purchase-consecutive`);

            // Check for error in response
            if (response.data.error) {
                alert(response.data.error);
                return;
            }

            const updatedCinema = response.data.cinema;
            // Update the cinemas state with the updated cinema data
            setCinemas(prevCinemas => {
                return prevCinemas.map(cinema => cinema._id === updatedCinema._id ? {
                    ...cinema,
                    availableSeats: updatedCinema.seats - updatedCinema.purchasedSeats.length
                } : cinema);
            });
            fetchAvailableSeats();

            alert(`Seats ${response.data.seats[0]} and ${response.data.seats[1]} purchased successfully!`);
        } catch (err) {
            console.error("Error purchasing seats", err);
            alert('An error occurred while purchasing the seats.');
        }
    };
    console.log("cinemas", cinemas)
    return (
        <div>
            <h2>Purchase Seats</h2>
            <div>
                <select value={cinemaId} onChange={(e) => setCinemaId(e.target.value)}>
                    <option value="" disabled>Select Cinema</option>
                    {cinemas.map(cinema =>
                        <option key={cinema._id} value={cinema._id}>
                            Cinema ID: {cinema._id} - Available Seats: {cinema.availableSeats}
                        </option>
                    )}
                </select>
                {cinemaId &&
                    <button onClick={handlePurchaseConsecutive}>Purchase Two Consecutive Seats</button>
                }
            </div>
            {cinemaId &&
                <div>
                    <select value={seatNumber} onChange={(e) => setSeatNumber(Number(e.target.value))}>
                        <option value="" disabled>Select Seat Number</option>
                        {availableSeatNumbers.map(seat =>
                            <option key={seat} value={seat}>
                                {seat}
                            </option>
                        )}
                    </select>

                    <button onClick={handlePurchase}>Purchase Seat</button>
                </div>
            }
        </div>
    );
}

export default PurchaseSeats;
