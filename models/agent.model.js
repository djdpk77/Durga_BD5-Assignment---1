let { DataTypes, sequelize } = require('./../lib/index');

let agent = sequelize.define('agent', {
  agentId: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
});

module.exports = { agent };
