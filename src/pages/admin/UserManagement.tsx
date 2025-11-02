import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';
import { format } from 'date-fns'; // Added this import

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string; // Assuming email can be fetched or linked
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
        // Fetch profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, role, updated_at');

        if (profilesError) throw profilesError;

        // Fetch auth.users to get emails (auth.users is not directly queryable via RLS, but we can get user info from session or admin context)
        // For simplicity, we'll assume email can be derived or is part of profile for now,
        // or we'd need a server-side function to fetch auth.users data securely.
        // For this context, I'll simulate fetching emails by assuming they are available or can be linked.
        // In a real admin panel, you'd likely use the Supabase Admin API or an Edge Function.

        // For now, let's just use the profile data and add a placeholder email if not available.
        const usersWithEmails = profilesData.map(profile => ({
          ...profile,
          email: `user_${profile.id.substring(0, 4)}@example.com`, // Placeholder email
        }));
        
        setUsers(usersWithEmails);

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
      <h2 className="text-3xl font-bold text-foreground">User Management</h2>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Loading users...</p>
          ) : error ? (
            <p className="text-center text-destructive">{error}</p>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id.substring(0, 8)}</TableCell>
                      <TableCell>{`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(user.updated_at), 'PPP')}</TableCell>
                      <TableCell className="text-right">
                        {/* Add action buttons here, e.g., Edit Role, Deactivate */}
                        <span className="text-muted-foreground text-sm">Edit / Deactivate</span>
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