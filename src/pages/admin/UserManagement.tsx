import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { format } from 'date-fns';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  updated_at: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, role, updated_at');

        if (profilesError) throw profilesError;
        
        setUsers(profilesData as UserProfile[]);

      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
        showError('Failed to load users.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getRoleBadgeVariant = (role: string) => {
    return role === 'admin' ? 'default' : 'secondary';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-text-primary-heading">User Management</h2>
      <Card className="shadow-elev border border-card-border rounded-default">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-text-primary-heading">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-text-secondary-body">Loading users...</p>
          ) : error ? (
            <p className="text-center text-destructive">{error}</p>
          ) : users.length === 0 ? (
            <p className="text-center text-text-secondary-body">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-text-primary-heading">User ID</TableHead>
                    <TableHead className="text-text-primary-heading">Name</TableHead>
                    <TableHead className="text-text-primary-heading">Email</TableHead>
                    <TableHead className="text-text-primary-heading">Role</TableHead>
                    <TableHead className="text-text-primary-heading">Last Updated</TableHead>
                    <TableHead className="text-right text-text-primary-heading">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium text-text-secondary-body">{user.id.substring(0, 8)}</TableCell>
                      <TableCell className="text-text-secondary-body">{`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A'}</TableCell>
                      <TableCell className="text-text-secondary-body">{user.email || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)} className={
                          user.role === 'admin' ? 'bg-accent-rose text-white' : 'bg-primary-pale-pink text-accent-dark'
                        }>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-text-secondary-body">{format(new Date(user.updated_at), 'PPP')}</TableCell>
                      <TableCell className="text-right">
                        <span className="text-muted-text text-sm">Edit / Deactivate</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;