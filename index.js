const express = require('express');
const { resolve } = require('path');
let { sequelize } = require('./lib/index');

const app = express();

let { ticket } = require('./models/ticket.model');
let { customer } = require('./models/customer.model');
let { agent } = require('./models/agent.model');
let { ticketCustomer } = require('./models/ticketCustomer.model');
let { ticketAgent } = require('./models/ticketAgent.model');
let { Op } = require('@sequelize/core');
const { where } = require('sequelize');

app.use(express.json());

app.get('/seed_db', async (req, res) => {
  await sequelize.sync({ force: true });

  let tickets = await ticket.bulkCreate([
    {
      ticketId: 1,
      title: 'Login Issue',
      description: 'Cannot login to account',
      status: 'open',
      priority: 1,
      customerId: 1,
      agentId: 1,
    },
    {
      ticketId: 2,
      title: 'Payment Failure',
      description: 'Payment not processed',
      status: 'closed',
      priority: 2,
      customerId: 2,
      agentId: 2,
    },
    {
      ticketId: 3,
      title: 'Bug Report',
      description: 'Found a bug in the system',
      status: 'open',
      priority: 3,
      customerId: 1,
      agentId: 1,
    },
  ]);

  let customers = await customer.bulkCreate([
    { customerId: 1, name: 'Alice', email: 'alice@example.com' },
    { customerId: 2, name: 'Bob', email: 'bob@example.com' },
  ]);

  let agents = await agent.bulkCreate([
    { agentId: 1, name: 'Charlie', email: 'charlie@example.com' },
    { agentId: 2, name: 'Dave', email: 'dave@example.com' },
  ]);

  await ticketCustomer.bulkCreate([
    { ticketId: tickets[0].id, customerId: customers[0].id },
    { ticketId: tickets[2].id, customerId: customers[0].id },
    { ticketId: tickets[1].id, customerId: customers[1].id },
  ]);

  await ticketAgent.bulkCreate([
    { ticketId: tickets[0].id, agentId: agents[0].id },
    { ticketId: tickets[2].id, agentId: agents[0].id },
    { ticketId: tickets[1].id, agentId: agents[1].id },
  ]);

  return res.json({ message: 'Database seeded successfully' });
});

// Helper function to get ticket's associated customers
async function getTicketCustomers(ticketId) {
  const ticketCustomers = await ticketCustomer.findAll({
    where: { ticketId },
  });

  let customerData;
  for (let cus of ticketCustomers) {
    customerData = await customer.findOne({
      where: { customerId: cus.customerId },
    });
  }

  return customerData;
}

//Helper function to get ticket's associated agents
async function getTicketAgents(ticketId) {
  const ticketAgents = await ticketAgent.findAll({
    where: { ticketId },
  });

  let agentData;
  for (let ag of ticketAgents) {
    agentData = await agent.findOne({ where: { agentId: ag.agentId } });
  }

  return agentData;
}

// Helper function to get ticket details with associated customers and agents
async function getTicketDetails(ticketData) {
  const customer = await getTicketCustomers(ticketData.id);
  const agent = await getTicketAgents(ticketData.id);

  return {
    ...ticketData.dataValues,
    customer,
    agent,
  };
}

//Endpoint 1: Get All Tickets
app.get('/tickets', async (req, res) => {
  try {
    let tickets = await ticket.findAll();
    console.log(tickets);
    let ticketDetails = [];
    for (let t of tickets) {
      ticketDetails.push(await getTicketDetails(t));
    }

    if (ticketDetails.length === 0) {
      return res.status(404).json({ message: 'No tickets found' });
    }

    return res.status(200).json({ tickets: ticketDetails });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//Endpoint 2: Get Ticket by ID
app.get('/tickets/details/:id', async (req, res) => {
  try {
    let ticketId = req.params.id;
    let ticketFound = await ticket.findOne({ where: { ticketId } });

    if (!ticketFound) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    let ticketDetails = await getTicketDetails(ticketFound);

    return res.status(200).json({ ticket: ticketDetails });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//Endpoint 3: Get Tickets by Status
app.get('/tickets/status/:status', async (req, res) => {
  try {
    let status = req.params.status;
    let tickets = await ticket.findAll({ where: { status } });

    if (tickets.length === 0) {
      return res.status(404).json({ message: 'No tickets found' });
    }

    let ticketDetails = [];
    for (let t of tickets) {
      ticketDetails.push(await getTicketDetails(t));
    }

    return res.status(200).json({ tickets: ticketDetails });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//Endpoint 4: Get Tickets sorted by Priority
app.get('/tickets/sort-by-priority', async (req, res) => {
  try {
    let tickets = await ticket.findAll({
      order: [['priority', 'ASC']],
    });

    let ticketDetails = [];
    for (let t of tickets) {
      ticketDetails.push(await getTicketDetails(t));
    }

    return res.status(200).json({ tickets: ticketDetails });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//Function to create new ticket
async function addTicket(ticketData) {
  let newTicket = await ticket.create(ticketData);

  return newTicket;
}

//Endpoint 5: Add a New Ticket
app.post('/tickets/new', async (req, res) => {
  try {
    let ticketData = req.body;
    let newTicket = await addTicket(ticketData);

    let ticketDetails = await getTicketDetails(newTicket);

    return res.status(201).json({ ticket: ticketDetails });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//Endpoint 6: Update Ticket Details
app.post('/tickets/update/:id', async (req, res) => {
  try {
    let ticketId = req.params.id;
    let ticketData = req.body;
    let ticketFound = await ticket.findOne({ where: { ticketId } });

    if (!ticketFound) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticketData.title) ticketFound.title = ticketData.title;
    if (ticketData.description)
      ticketFound.description = ticketData.description;
    if (ticketData.status) ticketFound.status = ticketData.status;
    if (ticketData.priority !== undefined)
      ticketFound.priority = ticketData.priority;

    if (ticketData.customerId !== undefined) {
      await ticketCustomer.destroy({ where: { ticketId } });

      await ticketCustomer.create({
        ticketId,
        customerId: ticketData.customerId,
      });

      ticketFound.customerId = ticketData.customerId;
    }

    if (ticketData.agentId !== undefined) {
      await ticketAgent.destroy({ where: { ticketId } });

      await ticketAgent.create({ ticketId, agentId: ticketData.agentId });

      ticketFound.agentId = ticketData.agentId;
    }

    await ticketFound.save();

    let ticketDetails = await getTicketDetails(ticketFound);

    return res.status(200).json({ ticket: ticketDetails });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//Endpoint 7: Delete a Ticket
app.post('/ticket/delete', async (req, res) => {
  try {
    let id = req.body.id;
    let ticketFound = await ticket.findOne({ where: { ticketId: id } });
    if (!ticketFound) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    await ticketFound.destroy();
    await ticketCustomer.destroy({ where: { ticketId: id } });
    await ticketAgent.destroy({ where: { ticketId: id } });

    return res.status(200).json({
      message: 'Ticket with ID ' + ticketId + ' deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
