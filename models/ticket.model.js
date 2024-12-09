let { DataTypes, sequelize } = require('./../lib/index');

let ticket = sequelize.define('ticket', {
  ticketId: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  priority: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  agentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = { ticket };
