const productService = require('./services/productService');
console.log('Type of getTopStockProducts:', typeof productService.getTopStockProducts);
if (typeof productService.getTopStockProducts === 'function') {
    console.log('Result: SUCCESS');
} else {
    console.log('Result: FAILURE');
}
