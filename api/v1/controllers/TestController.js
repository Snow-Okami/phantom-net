const TestController = {
  findAll: async (req, res) => {
    return res.status(200).send({
      message: { type: 'success' },
      data: 'You are connected to Psynapsus Node.js server.'
    });
  }

};

module.exports = TestController;