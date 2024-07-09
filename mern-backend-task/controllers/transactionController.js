const axios = require('axios');
const ProductTransaction = require('../models/ProductTransaction');

// Initialize database with seed data
exports.initDatabase = async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const transactions = response.data;

        await ProductTransaction.deleteMany(); // Clear existing data
        await ProductTransaction.insertMany(transactions);

        res.status(200).json({ message: 'Database initialized with seed data' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// List all transactions with search and pagination
exports.listTransactions = async (req, res) => {
    const { search = '', page = 1, perPage = 10 } = req.query;
    const query = {
        $or: [
            { title: new RegExp(search, 'i') },
            { description: new RegExp(search, 'i') },
            { price: new RegExp(search, 'i') }
        ]
    };

    try {
        const transactions = await ProductTransaction.find(query)
            .skip((page - 1) * perPage)
            .limit(parseInt(perPage));
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get statistics for a given month
exports.getStatistics = async (req, res) => {
    const { month } = req.query;
    if (!month || month < 1 || month > 12) {
        return res.status(400).json({ error: 'Month must be between 1 and 12' });
    }

    try {
        const transactions = await ProductTransaction.find({
            dateOfSale: {
                $gte: new Date(new Date().getFullYear(), month - 1, 1),
                $lt: new Date(new Date().getFullYear(), month, 1)
            }
        });

        const totalSaleAmount = transactions.filter(t => t.sold).reduce((acc, t) => acc + t.price, 0);
        const totalSoldItems = transactions.filter(t => t.sold).length;
        const totalNotSoldItems = transactions.filter(t => !t.sold).length;

        res.status(200).json({
            totalSaleAmount,
            totalSoldItems,
            totalNotSoldItems
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get bar chart data for a given month
exports.getBarChartData = async (req, res) => {
    const { month } = req.query;
    if (!month || month < 1 || month > 12) {
        return res.status(400).json({ error: 'Month must be between 1 and 12' });
    }

    const ranges = [
        { label: '0-100', min: 0, max: 100 },
        { label: '101-200', min: 101, max: 200 },
        { label: '201-300', min: 201, max: 300 },
        { label: '301-400', min: 301, max: 400 },
        { label: '401-500', min: 401, max: 500 },
        { label: '501-600', min: 501, max: 600 },
        { label: '601-700', min: 601, max: 700 },
        { label: '701-800', min: 701, max: 800 },
        { label: '801-900', min: 801, max: 900 },
        { label: '901-above', min: 901, max: Infinity }
    ];

    try {
        const transactions = await ProductTransaction.find({
            dateOfSale: {
                $gte: new Date(new Date().getFullYear(), month - 1, 1),
                $lt: new Date(new Date().getFullYear(), month, 1)
            }
        });

        const barChartData = ranges.map(range => ({
            range: range.label,
            count: transactions.filter(t => t.price >= range.min && t.price <= range.max).length
        }));

        res.status(200).json(barChartData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get pie chart data for a given month
exports.getPieChartData = async (req, res) => {
    const { month } = req.query;
    if (!month || month < 1 || month > 12) {
        return res.status(400).json({ error: 'Month must be between 1 and 12' });
    }

    try {
        const transactions = await ProductTransaction.find({
            dateOfSale: {
                $gte: new Date(new Date().getFullYear(), month - 1, 1),
                $lt: new Date(new Date().getFullYear(), month, 1)
            }
        });

        const categories = [...new Set(transactions.map(t => t.title))];
        const pieChartData = categories.map(category => ({
            category,
            count: transactions.filter(t => t.title === category).length
        }));

        res.status(200).json(pieChartData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get combined data for all the charts
exports.getCombinedData = async (req, res) => {
    const { month } = req.query;
    if (!month || month < 1 || month > 12) {
        return res.status(400).json({ error: 'Month must be between 1 and 12' });
    }

    try {
        const statisticsResponse = await exports.getStatistics(req, res);
        const barChartDataResponse = await exports.getBarChartData(req, res);
        const pieChartDataResponse = await exports.getPieChartData(req, res);

        res.status(200).json({
            statistics: statisticsResponse,
            barChartData: barChartDataResponse,
            pieChartData: pieChartDataResponse
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
