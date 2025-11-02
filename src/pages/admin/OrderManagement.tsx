import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const OrderManagement: React.FC = () => {
  // Placeholder data for orders
  const orders = [
    { id: 'ORD001', customer: 'John Doe', amount: 1250, status: 'completed', date: '2023-10-26' },
    { id: 'ORD002', customer: 'Jane Smith', amount: 899, status: 'pending', date: '2023-10-25' },
    { id: 'ORD003', customer: 'Bob Johnson', amount: 2100, status: 'shipped', date: '2023-10-24' },
    { id: 'ORD004', customer: 'Alice Brown', amount: 500, status: 'cancelled', date: '2023-10-23' },
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'shipped': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-foreground">Order Management</h2>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>₹{order.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell className="text-right">
                      {/* Add action buttons here, e.g., View Details, Update Status */}
                      <span className="text-muted-foreground text-sm">View / Edit</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderManagement;