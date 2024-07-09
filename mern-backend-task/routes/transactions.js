const express = require('express');
const {
    initDatabase,
    listTransactions,
    getStatistics,
    getBarChartData,
    getPieChartData,
    getCombinedData
} = require('../controllers/transactionController');

const router = express.Router();

router.get('/init', initDatabase);
router.get('/', listTransactions);
router.get('/statistics', getStatistics);
router.get('/bar-chart', getBarChartData);
router.get('/pie-chart', getPieChartData);
router.get('/combined-data', getCombinedData);

module.exports = router;
