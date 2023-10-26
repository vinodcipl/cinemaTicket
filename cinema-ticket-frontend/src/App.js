import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateCinema from './components/CreateCinema';
import PurchaseSeats from './components/PurchaseSeats';

function App() {
  const [cinemas, setCinemas] = useState([]);
  const fetchCinemas = async () => {
    try {
      const response = await axios.get('http://localhost:3000/cinemas');
      setCinemas(response.data);
    } catch (err) {
      console.error("Error fetching cinemas", err);
    }
  };
  useEffect(() => {
    fetchCinemas();
  }, []);
  return (
    <div style={{ textAlign: "center" }}>
      <h1>Cinema Ticket Purchasing</h1>
      <CreateCinema setCinemas={setCinemas} />
      <PurchaseSeats cinemas={cinemas} setCinemas={setCinemas} />
    </div>
  );
}

export default App;
