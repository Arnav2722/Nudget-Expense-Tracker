// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { 
//   TrendingUp, 
//   TrendingDown, 
//   Wallet, 
//   Target,
//   PieChart,
//   BarChart3,
//   Plus,
//   Calendar
// } from 'lucide-react';
// import { 
//   LineChart, 
//   Line, 
//   XAxis, 
//   YAxis, 
//   CartesianGrid, 
//   Tooltip, 
//   ResponsiveContainer,
//   PieChart as RechartsPieChart,
//   Cell,
//   BarChart,
//   Bar
// } from 'recharts';
// import { supabase } from '../lib/supabase';
// import { useAuth } from '../contexts/AuthContext';
// import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

// interface DashboardStats {
//   totalIncome: number;
//   totalExpenses: number;
//   balance: number;
//   monthlyBudget: number;
//   budgetUsed: number;
// }

// interface Transaction {
//   id: string;
//   amount: number;
//   description: string;
//   date: string;
//   type: 'income' | 'expense';
//   category: {
//     name: string;
//     color: string;
//   };
// }

// const Dashboard: React.FC = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [stats, setStats] = useState<DashboardStats>({
//     totalIncome: 0,
//     totalExpenses: 0,
//     balance: 0,
//     monthlyBudget: 0,
//     budgetUsed: 0,
//   });
//   const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
//   const [chartData, setChartData] = useState<any[]>([]);
//   const [categoryData, setCategoryData] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

//   useEffect(() => {
//     if (user) {
//       fetchDashboardData();
//     }
//   }, [user]);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//       const now = new Date();
//       const monthStart = startOfMonth(now);
//       const monthEnd = endOfMonth(now);

//       // Fetch transactions for current month
//       const { data: transactions, error: transactionsError } = await supabase
//         .from('transactions')
//         .select(`
//           *,
//           categories (name, color)
//         `)
//         .eq('user_id', user?.id)
//         .gte('date', monthStart.toISOString())
//         .lte('date', monthEnd.toISOString())
//         .order('date', { ascending: false });

//       if (transactionsError) throw transactionsError;

//       // Calculate stats
//       const income = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
//       const expenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;

//       // Fetch budgets
//       const { data: budgets, error: budgetsError } = await supabase
//         .from('budgets')
//         .select('amount')
//         .eq('user_id', user?.id)
//         .eq('period', 'monthly');

//       if (budgetsError) throw budgetsError;

//       const totalBudget = budgets?.reduce((sum, b) => sum + b.amount, 0) || 0;

//       setStats({
//         totalIncome: income,
//         totalExpenses: expenses,
//         balance: income - expenses,
//         monthlyBudget: totalBudget,
//         budgetUsed: totalBudget > 0 ? (expenses / totalBudget) * 100 : 0,
//       });

//       // Set recent transactions
//       setRecentTransactions(transactions?.slice(0, 5) || []);

//       // Generate chart data for last 7 days
//       const last7Days = Array.from({ length: 7 }, (_, i) => {
//         const date = subDays(now, 6 - i);
//         const dayTransactions = transactions?.filter(t => 
//           format(new Date(t.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
//         ) || [];
        
//         const dayIncome = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
//         const dayExpenses = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

//         return {
//           date: format(date, 'MMM dd'),
//           income: dayIncome,
//           expenses: dayExpenses,
//         };
//       });

//       setChartData(last7Days);

//       // Generate category data
//       const expensesByCategory = transactions?.filter(t => t.type === 'expense').reduce((acc, t) => {
//         const categoryName = t.categories?.name || 'Other';
//         const categoryColor = t.categories?.color || '#6b7280';
        
//         if (!acc[categoryName]) {
//           acc[categoryName] = { name: categoryName, value: 0, color: categoryColor };
//         }
//         acc[categoryName].value += t.amount;
//         return acc;
//       }, {} as Record<string, any>) || {};

//       setCategoryData(Object.values(expensesByCategory));

//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//           className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
//         >
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Balance</p>
//               <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//                 ${stats.balance.toLocaleString()}
//               </p>
//             </div>
//             <Wallet className="h-12 w-12 text-primary-600" />
//           </div>
//         </motion.div>

//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
//         >
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Income</p>
//               <p className="text-2xl font-bold text-green-600">
//                 ${stats.totalIncome.toLocaleString()}
//               </p>
//             </div>
//             <TrendingUp className="h-12 w-12 text-green-600" />
//           </div>
//         </motion.div>

//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3 }}
//           className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
//         >
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Expenses</p>
//               <p className="text-2xl font-bold text-red-600">
//                 ${stats.totalExpenses.toLocaleString()}
//               </p>
//             </div>
//             <TrendingDown className="h-12 w-12 text-red-600" />
//           </div>
//         </motion.div>

//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.4 }}
//           className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
//         >
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Budget Used</p>
//               <p className="text-2xl font-bold text-orange-600">
//                 {stats.budgetUsed.toFixed(1)}%
//               </p>
//               <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
//                 <div 
//                   className="bg-orange-600 h-2 rounded-full transition-all duration-300"
//                   style={{ width: `${Math.min(stats.budgetUsed, 100)}%` }}
//                 ></div>
//               </div>
//             </div>
//             <Target className="h-12 w-12 text-orange-600" />
//           </div>
//         </motion.div>
//       </div>

//       {/* Charts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Income vs Expenses Chart */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.5 }}
//           className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
//         >
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//               Income vs Expenses (Last 7 Days)
//             </h3>
//             <BarChart3 className="h-5 w-5 text-gray-400" />
//           </div>
//           <ResponsiveContainer width="100%" height={300}>
//             <LineChart data={chartData}>
//               <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
//               <XAxis dataKey="date" className="text-sm" />
//               <YAxis className="text-sm" />
//               <Tooltip 
//                 contentStyle={{
//                   backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                   border: 'none',
//                   borderRadius: '8px',
//                   boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
//                 }}
//               />
//               <Line 
//                 type="monotone" 
//                 dataKey="income" 
//                 stroke="#10b981" 
//                 strokeWidth={3}
//                 dot={{ fill: '#10b981', strokeWidth: 2 }}
//               />
//               <Line 
//                 type="monotone" 
//                 dataKey="expenses" 
//                 stroke="#ef4444" 
//                 strokeWidth={3}
//                 dot={{ fill: '#ef4444', strokeWidth: 2 }}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </motion.div>

//         {/* Category Breakdown */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.6 }}
//           className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
//         >
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//               Expenses by Category
//             </h3>
//             <PieChart className="h-5 w-5 text-gray-400" />
//           </div>
//           {categoryData.length > 0 ? (
//             <ResponsiveContainer width="100%" height={300}>
//               <RechartsPieChart>
//                 <Pie
//                   data={categoryData}
//                   cx="50%"
//                   cy="50%"
//                   labelLine={false}
//                   label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                   outerRadius={80}
//                   fill="#8884d8"
//                   dataKey="value"
//                 >
//                   {categoryData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip 
//                   formatter={(value: any) => [`$${value.toLocaleString()}`, 'Amount']}
//                 />
//               </RechartsPieChart>
//             </ResponsiveContainer>
//           ) : (
//             <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
//               <p>No expense data available</p>
//             </div>
//           )}
//         </motion.div>
//       </div>

//       {/* Recent Transactions */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.7 }}
//         className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
//       >
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//             Recent Transactions
//           </h3>
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => navigate('/add-transaction')}
//             className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
//           >
//             <Plus size={16} />
//             <span>Add Transaction</span>
//           </motion.button>
//         </div>
        
//         {recentTransactions.length > 0 ? (
//           <div className="space-y-4">
//             {recentTransactions.map((transaction) => (
//               <div
//                 key={transaction.id}
//                 className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
//               >
//                 <div className="flex items-center space-x-4">
//                   <div 
//                     className="w-10 h-10 rounded-full flex items-center justify-center"
//                     style={{ backgroundColor: transaction.category?.color || '#6b7280' }}
//                   >
//                     <Calendar size={16} className="text-white" />
//                   </div>
//                   <div>
//                     <p className="font-medium text-gray-900 dark:text-white">
//                       {transaction.description}
//                     </p>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">
//                       {transaction.category?.name} • {format(new Date(transaction.date), 'MMM dd, yyyy')}
//                     </p>
//                   </div>
//                 </div>
//                 <p className={`font-semibold ${
//                   transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
//                 }`}>
//                   {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
//                 </p>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-12">
//             <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//             <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
//             <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
//               Start by adding your first transaction
//             </p>
//           </div>
//         )}
//       </motion.div>
//     </div>
//   );
// };

// export default Dashboard;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target,
  PieChart,
  BarChart3,
  Plus,
  Calendar
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie // <-- ADDED: Imported Pie component
} from 'recharts';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthlyBudget: number;
  budgetUsed: number;
}

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: 'income' | 'expense';
  category: {
    name: string;
    color: string;
  };
}

// <-- ADDED: Interface for the category data in the Pie chart
interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    monthlyBudget: 0,
    budgetUsed: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  // <-- UPDATED: Explicitly typed the state for category data
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      // Fetch transactions for current month
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (name, color)
        `)
        .eq('user_id', user?.id)
        .gte('date', monthStart.toISOString())
        .lte('date', monthEnd.toISOString())
        .order('date', { ascending: false });

      if (transactionsError) throw transactionsError;

      // Calculate stats
      const income = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
      const expenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;

      // Fetch budgets
      const { data: budgets, error: budgetsError } = await supabase
        .from('budgets')
        .select('amount')
        .eq('user_id', user?.id)
        .eq('period', 'monthly');

      if (budgetsError) throw budgetsError;

      const totalBudget = budgets?.reduce((sum, b) => sum + b.amount, 0) || 0;

      setStats({
        totalIncome: income,
        totalExpenses: expenses,
        balance: income - expenses,
        monthlyBudget: totalBudget,
        budgetUsed: totalBudget > 0 ? (expenses / totalBudget) * 100 : 0,
      });

      // Set recent transactions
      setRecentTransactions(transactions?.slice(0, 5) || []);

      // Generate chart data for last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(now, 6 - i);
        const dayTransactions = transactions?.filter(t => 
          format(new Date(t.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        ) || [];
        
        const dayIncome = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const dayExpenses = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

        return {
          date: format(date, 'MMM dd'),
          income: dayIncome,
          expenses: dayExpenses,
        };
      });

      setChartData(last7Days);

      // Generate category data
      const expensesByCategory = transactions?.filter(t => t.type === 'expense').reduce((acc, t) => {
        const categoryName = t.category?.name || 'Other';
        const categoryColor = t.category?.color || '#6b7280';
        
        if (!acc[categoryName]) {
          acc[categoryName] = { name: categoryName, value: 0, color: categoryColor };
        }
        acc[categoryName].value += t.amount;
        return acc;
      }, {} as Record<string, CategoryData>) || {}; // <-- UPDATED: used new interface

      setCategoryData(Object.values(expensesByCategory));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Balance</p>
              {/* <-- CORRECTED: Use template literal for class string */}
              <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{stats.balance.toLocaleString()}
              </p>
            </div>
            <Wallet className="h-8 w-8 sm:h-12 sm:w-12 text-primary-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Income</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{stats.totalIncome.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                ₹{stats.totalExpenses.toLocaleString()}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 sm:h-12 sm:w-12 text-red-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Budget Used</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.budgetUsed.toFixed(1)}%
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                {/* <-- CORRECTED: Use template literal for style string */}
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(stats.budgetUsed, 100)}%` }}
                ></div>
              </div>
            </div>
            <Target className="h-8 w-8 sm:h-12 sm:w-12 text-orange-600" />
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Income vs Expenses Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Income vs Expenses (Last 7 Days)
            </h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" className="text-sm" />
              <YAxis className="text-sm" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Expenses by Category
            </h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  // <-- CORRECTED: Explicitly type the label function parameters
                  label={(props) => {
                    const { name, percent } = props;
                    if (typeof name !== 'string' || typeof percent !== 'number') return null;
                    return `${name} ${(percent * 100).toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`$${value.toLocaleString()}`, 'Amount']}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <p>No expense data available</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            Recent Transactions
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/add-transaction')}
            className="flex items-center space-x-1 sm:space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </motion.button>
        </div>
        
        {recentTransactions.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div 
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: transaction.category?.color || '#6b7280' }}
                  >
                    <Calendar size={14} className="text-white sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                      {transaction.description}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                      <span className="hidden sm:inline">{transaction.category?.name} • </span>
                      {format(new Date(transaction.date), 'MMM dd')}
                    </p>
                  </div>
                </div>
                {/* <-- CORRECTED: Use template literal for class string */}
                <p className={`font-semibold text-sm sm:text-base flex-shrink-0 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Start by adding your first transaction
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;