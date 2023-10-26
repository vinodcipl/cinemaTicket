import * as express from 'express';
import * as cors from 'cors';
import mongoose, { Document, Schema } from 'mongoose';

const app = express();

// Externalizing configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cinema';
const PORT = process.env.PORT || 8080;

mongoose.connect(MONGODB_URI);

interface ICinema extends Document {
    seats: number;
    purchasedSeats: number[];
}

const CinemaSchema: Schema = new Schema({
    seats: Number,
    purchasedSeats: [Number]
}, { versionKey: '_version' });

const Cinema = mongoose.model<ICinema>('Cinema', CinemaSchema);


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
        // Attempt to find and update the cinema with the given conditions
        const cinema = await Cinema.findOneAndUpdate({
            _id: req.params.id,
            purchasedSeats: { $ne: seatNumber }  // ensures the seat isn't already purchased
        }, {
            $push: { purchasedSeats: seatNumber }
        }, {
            new: true,  // return the updated document
            runValidators: true  // ensures the update respects schema validations
        });

        if (!cinema) {
            return res.status(400).json({ error: 'Seat already purchased or cinema not found' });
        }

        res.json({ cinema, message: 'Seat purchased successfully!' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Route to purchase the first two consecutive free seats
app.post('/cinemas/:id/purchase-consecutive', async (req, res) => {
    try {
        let foundSeats = null;

        const cinema = await Cinema.findById(req.params.id);
        if (!cinema) {
            return res.status(404).json({ error: 'Cinema not found' });
        }

        for (let i = 1; i < cinema.seats; i++) {
            if (!cinema.purchasedSeats.includes(i) && !cinema.purchasedSeats.includes(i + 1)) {
                foundSeats = [i, i + 1];
                break;
            }
        }

        if (!foundSeats) {
            return res.status(400).json({ error: 'No two consecutive seats available' });
        }

        // Ensure atomic update for the two seats
        const updatedCinema = await Cinema.findOneAndUpdate({
            _id: req.params.id,
            purchasedSeats: { $nin: foundSeats }  // ensures neither of the seats are already purchased
        }, {
            $push: { purchasedSeats: { $each: foundSeats } }
        }, {
            new: true,
            runValidators: true
        });

        if (!updatedCinema) {
            return res.status(400).json({ error: 'Seats were purchased before you could complete the transaction' });
        }

        res.json({ cinema: updatedCinema, seats: foundSeats });

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



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});