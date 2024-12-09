let { DataTypes, sequelize } = require('./../lib/index');

const { customer } = require('./customer.model');
const { ticket } = require('./ticket.model');

let ticketCustomer = sequelize.define('ticketCustomer', {
  ticketId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'ticket',
      key: 'ticketId',
    },
  },
  customerId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'customer',
      key: 'customerId',
    },
  },
});

ticket.belongsToMany(customer, { through: ticketCustomer });
customer.belongsTo(ticket, { through: ticketCustomer });

module.exports = { ticketCustomer };
