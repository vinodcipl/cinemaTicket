const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

mongoose.connect('mongodb://localhost:27017/cinema', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const CinemaSchema = new mongoose.Schema({
    seats: Number,
    purchasedSeats: [Number]
});

const Cinema = mongoose.model('Cinema', CinemaSchema);

app.use(cors());
app.use(express.json());

// Route to create a cinema
app.post('/cinemas', async (req, res) => {
    try {
        const { seats } = req.body;
        const cinema = new Cinema({ seats, purchasedSeats: [] });
        await cinema.save();
        res.json(cinema);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to fetch all cinemas with remaining seat count
app.get('/cinemas', async (req, res) => {
    try {
        const cinemas = await Cinema.find({}, 'id seats purchasedSeats');
        const cinemasWithAvailableSeats = cinemas.map(cinema => ({
            _id: cinema._id,
            availableSeats: cinema.seats - cinema.purchasedSeats.length
        }));
        res.json(cinemasWithAvailableSeats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to purchase a specific seat
app.post('/cinemas/:id/purchase', async (req, res) => {
    try {
        const { seatNumber } = req.body;
        const cinema = await Cinema.findById(req.params.id);

        if (cinema.purchasedSeats.includes(seatNumber)) {
            return res.status(400).json({ error: 'Seat already purchased' });
        }

        cinema.purchasedSeats.push(seatNumber);
        await cinema.save();
        res.json({ cinema, message: 'Seat purchased successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to purchase the first two consecutive free seats
app.post('/cinemas/:id/purchase-consecutive', async (req, res) => {
    try {
        const cinema = await Cinema.findById(req.params.id);
        let foundSeats = null;

        for (let i = 1; i < cinema.seats; i++) {
            if (!cinema.purchasedSeats.includes(i) && !cinema.purchasedSeats.includes(i + 1)) {
                foundSeats = [i, i + 1];
                break;
            }
        }

        if (!foundSeats) {
            return res.status(400).json({ error: 'No two consecutive seats available' });
        }

        cinema.purchasedSeats.push(...foundSeats);
        await cinema.save();

        res.json({ cinema, seats: foundSeats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to fetch available seats for a cinema
app.get('/cinemas/:id/available-seats', async (req, res) => {
    try {
        const cinema = await Cinema.findById(req.params.id, 'seats purchasedSeats');

        const allSeats = Array.from({ length: cinema.seats }, (_, i) => i + 1);
        const availableSeats = allSeats.filter(seat => !cinema.purchasedSeats.includes(seat));

        res.json(availableSeats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



app.listen(8080, () => {
    console.log('Server running on http://localhost:8080');
});
