module.exports = async (req, res) => {
  return res.status(200).json({ status: 'Serverless function running', timestamp: new Date() });
};
