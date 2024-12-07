const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  User,
  Train,
  SeatAvailability,
  Booking,
  sequelize,
} = require("./models");

const registerUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword,
      role,
    });
    res.status(201).json({ message: "User registered", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ message: "Invalid email" });
    if (!(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Invalid password" });
    
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addTrain = async (req, res) => {
  try {
    const { name, source, destination, total_seats } = req.body;
    const train = await Train.create({
      name,
      source,
      destination,
      total_seats,
    });
    await SeatAvailability.create({
      train_id: train.id,
      available_seats: total_seats,
    });
    res.status(201).json({ message: "Train added", train });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSeatAvailability = async (req, res) => {
  try {
    const { source, destination } = req.query;
    const trains = await Train.findAll({
      where: { source, destination },
      include: [{ model: SeatAvailability, attributes: ["available_seats"] }],
    });
    res.status(200).json({ trains });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bookSeat = async (req, res) => {
  try {
    const { train_id } = req.body;
    const userId = req.user.id;

    await sequelize.transaction(async (transaction) => {
      const seatAvailability = await SeatAvailability.findOne(
        { where: { train_id } },
        { transaction }
      );
      if (seatAvailability.available_seats <= 0)
        throw new Error("No seats available");

      seatAvailability.available_seats -= 1;
      await seatAvailability.save({ transaction });

      await Booking.create({ user_id: userId, train_id }, { transaction });
    });

    res.status(200).json({ message: "Seat booked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findOne({ where: { id, user_id: userId } });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json({ booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  addTrain,
  getSeatAvailability,
  bookSeat,
  getBookingDetails,
};
