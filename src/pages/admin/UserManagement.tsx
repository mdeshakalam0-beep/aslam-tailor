import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const UserManagement: React.FC = () => {
  // Placeholder data for users
  const users = [
    { id: 'USR001', name: 'John Doe', email: 'john.doe@example.com', role: 'user', status: 'active' },
    { id: 'USR002', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'user', status: 'active' },
    { id: 'USR003', name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active' },
    { id: 'USR004', name: 'Guest User', email: 'guest@example.com', role: 'user', status: 'inactive' },
  ];

  const getRoleBadgeVariant = (role: string) => {
    return role === 'admin' ? 'default' : 'secondary';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-foreground">User Management</h2>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.status}</TableCell>
                    <TableCell className="text-right">
                      {/* Add action buttons here, e.g., Edit Role, Deactivate */}
                      <span className="text-muted-foreground text-sm">Edit / Deactivate</span>
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

export default UserManagement;