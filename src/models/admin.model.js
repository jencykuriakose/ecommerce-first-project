
  const orderModel = require("../models/order.model");
 const productDatabase=require("../schema/product.schema");
const orderDatabase=require("../schema/order.schema");
const categoryDatabase=require("../schema/category.schema");


class adminModel{
    constructor(){}

    async getStartOfYear() {
      const now = new Date();
      return new Date(now.getFullYear(), 0, 1);
    }
    
    async getCurrentDate() {
      return new Date();
    }

async graphData(){
  try {
    const currentDate =  await this.getCurrentDate();
    const startOfYear = await this.getStartOfYear();

    const sales = await orderDatabase.aggregate([
      {
        $match: {
          date: { $gte: startOfYear, $lte: currentDate },
          status: { $in: ['processing', 'shipped', 'delivered'] },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            year: { $year: '$date' },
          },
          totalSales: { $sum: '$total' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    const products = await productDatabase.aggregate([
      {
        $match: { createdAt: { $gte: startOfYear, $lte: currentDate } },
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    const labels = [];
    const salesData = [];
    const productsData = [];
    let currentMonth = startOfYear.getMonth();
    let currentYear = startOfYear.getFullYear();

    for (const sale of sales) {
      const { month, year } = sale._id;

      while (currentYear < year || (currentYear === year && currentMonth <= month)) {
        labels.push(`${currentMonth + 1}/${currentYear}`);
        salesData.push(0);
        productsData.push(0);

        if (currentMonth === 11) {
          currentMonth = 0;
          currentYear++;
        } else {
          currentMonth++;
        }
      }

      const index = labels.findIndex((label) => {
        const [m, y] = label.split('/');
        return parseInt(m, 10) === month && parseInt(y, 10) === year;
      });

      salesData[index] = sale.totalSales;
    }

    for (const product of products) {
      const { month, year } = product._id;

      const index = labels.findIndex((label) => {
        const [m, y] = label.split('/');
        return parseInt(m, 10) === month && parseInt(y, 10) === year;
      });

      productsData[index] = product.count;
    }
    // console.log("Start of productData");
    // console.log(productsData)
    // console.log("End of productData");
    // console.log(salesData)
    // console.log("End of salesData");


    return {
      status: true,
      labels,
      salesData,
      productsData,
      message: 'Data found successfully',
    };
  } catch (error) {
    throw new Error(`Error fetching graph data: ${error.message}`);
  }
}


async ChartData(){
  const popularProducts = await orderDatabase.aggregate([
    {
      $unwind: '$items',
    },
    {
      $group: {
        _id: '$items.product',
        totalOrders: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    {
      $unwind: '$product',
    },
    {
      $sort: { totalOrders: -1 },
    },
    {
      $limit: 5,
    },
    {
      $project: {
        _id: 0,
        productName: '$product.productName',
        totalOrders: 1,
        stocks: '$product.stocks',
      },
    },
  ]);

  return { status: true, popularProducts };
} catch (error) {
  throw new Error(`Error fetching chart data: ${error.message}`);
}




async getDashboardData(){
    const[
        totalRevenue,
      totalOrdersCount,
      totalProductsCount,
      totalCategoriesCount,
      currentMonthEarnings,
    ] = await Promise.all([
     this.calculateTotalRevenue(),
      this.calculateTotalOrdersCount(),
      this.calculateTotalProductsCount(),
      this.calculateTotalCategoriesCount(),
      this.calculateCurrentMonthEarnings(),
     ]);
  
    return {
        totalRevenue,
        totalOrdersCount,
        totalProductsCount,
        totalCategoriesCount,
        currentMonthEarnings,
      };

    
}
async calculateTotalRevenue() {
  try {
    const totalRevenue = await orderDatabase.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    if (totalRevenue.length > 0) {
      return totalRevenue[0].total;
    } else {
      return 0;
    }
  } catch (error) {
    throw new Error(`Error calculating total revenue: ${error.message}`);
  }
}

async calculateTotalOrdersCount() {
  try {
    const totalOrdersCount = await orderDatabase
      .find({ status: { $in: ['shipped', 'processing'] } })
      .countDocuments();
    return totalOrdersCount;
  } catch (error) {
    throw new Error(`Error calculating total orders count: ${error.message}`);
  }
}

async  calculateTotalProductsCount() {
  try {
    const totalProductsCount = await productDatabase.countDocuments();
    return totalProductsCount;
  } catch (error) {
    throw new Error(`Error calculating total products count: ${error.message}`);
  }
}

async  calculateTotalCategoriesCount() {
  try {
    const totalCategoriesCount = await categoryDatabase.countDocuments();
    return totalCategoriesCount;
  } catch (error) {
    throw new Error(`Error calculating total categories count: ${error.message}`);
  }
}

async  calculateCurrentMonthEarnings() {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const currentMonthEarnings = await orderDatabase.aggregate([
      {
        $match: {
          status: 'delivered',
          date: {
            $gte: new Date(currentYear, currentMonth - 1, 1),
            $lt: new Date(currentYear, currentMonth, 1),
          },
        },
      },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    if (currentMonthEarnings.length > 0) {
      return currentMonthEarnings[0].total;
    } else {
      return 0;
    }
  } catch (error) {
    throw new Error(`Error calculating current month earnings: ${error.message}`);
  }

}




}
module.exports=adminModel;




