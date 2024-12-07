require("dotenv").config();
const express = require("express");
const { sequelize, initializeModels } = require("./models");
const controllers = require("./controllers");
const { jwtAuth, adminAuth } = require("./middlewares");

const app = express();
app.use(express.json());

// Initialize Models
initializeModels();

// Routes

app.get("/", (req, res) => res.send("Train Management System"));

app.post("/register", controllers.registerUser);
app.post("/login", controllers.loginUser);

app.post("/admin/add-train", adminAuth, controllers.addTrain);
app.get("/trains/availability", controllers.getSeatAvailability);

app.post("/book-seat", jwtAuth, controllers.bookSeat);
app.get("/booking/:id", jwtAuth, controllers.getBookingDetails);

// Start the server
const PORT = process.env.PORT || 3000;
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
