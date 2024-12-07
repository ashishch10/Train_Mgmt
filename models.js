const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
  }
);

// Models
const User = sequelize.define("User", {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: "user" }, // 'admin' or 'user'
});

const Train = sequelize.define("Train", {
  name: { type: DataTypes.STRING, allowNull: false },
  source: { type: DataTypes.STRING, allowNull: false },
  destination: { type: DataTypes.STRING, allowNull: false },
  total_seats: { type: DataTypes.INTEGER, allowNull: false },
});

const SeatAvailability = sequelize.define("SeatAvailability", {
  train_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Train, key: "id" },
  },
  available_seats: { type: DataTypes.INTEGER, allowNull: false },
});

const Booking = sequelize.define("Booking", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: "id" },
  },
  train_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Train, key: "id" },
  },
});

// Relationships
Train.hasOne(SeatAvailability, { foreignKey: "train_id" });
SeatAvailability.belongsTo(Train, { foreignKey: "train_id" });

User.hasMany(Booking, { foreignKey: "user_id" });
Booking.belongsTo(User, { foreignKey: "user_id" });

Train.hasMany(Booking, { foreignKey: "train_id" });
Booking.belongsTo(Train, { foreignKey: "train_id" });

const initializeModels = () =>
  sequelize.authenticate().then(() => console.log("Database connected"));

module.exports = {
  sequelize,
  User,
  Train,
  SeatAvailability,
  Booking,
  initializeModels,
};
