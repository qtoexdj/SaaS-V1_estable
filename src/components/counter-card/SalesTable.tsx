import React from 'react';
import './CounterCard.css';

interface SaleItem {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  date: string;
  amount: number;
}

interface SalesTableProps {
  sales: SaleItem[];
}

const SalesTable: React.FC<SalesTableProps> = ({ sales }) => {
  return (
    <div className="sales-table-card">
      <div className="sales-header">
        <h3>Sales</h3>
        <a href="#">See All</a>
      </div>

      <table className="sales-table">
        <thead>
          <tr>
            <th>Post</th>
            <th>Who Purchased</th>
            <th>Date</th>
            <th>Purchased</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td>
                <div className="post-avatar">
                  <img src={sale.user.avatar} alt="" />
                </div>
              </td>
              <td>
                <div className="user-info">
                  <div className="user-name">{sale.user.name}</div>
                  <div className="user-username">@{sale.user.username}</div>
                </div>
              </td>
              <td>{sale.date}</td>
              <td>
                <div className="purchase-amount">
                  <span>{sale.amount}</span>
                  <div className="amount-icon">b</div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;