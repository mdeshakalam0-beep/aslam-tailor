import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getNotifications, createNotification, deleteNotification, Notification } from '@/utils/notifications';
import { showError } from '@/utils/toast';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const NotificationManagement: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sendToAll, setSendToAll] = useState(true);
  const [targetUserId, setTargetUserId] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);

  const fetchNotifications = async () => {
    setLoading(true);
    const fetchedNotifications = await getNotifications(null); 
    setNotifications(fetchedNotifications);
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name');
      
      if (error) throw error;

      const usersWithEmails = data.map(profile => ({
        ...profile,
        email: `user_${profile.id.substring(0, 4)}@example.com`,
      }));
      setUsers(usersWithEmails);
    } catch (error) {
      console.error('Error fetching users for targeted notifications:', error);
      showError('Failed to load users for targeted notifications.');
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  const handleSendNotification = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormLoading(true);
    try {
      const userId = sendToAll ? null : (targetUserId || null);
      if (!message.trim()) {
        showError('Notification message cannot be empty.');
        setFormLoading(false);
        return;
      }
      if (!sendToAll && !targetUserId) {
        showError('Please select a user or choose to send to all users.');
        setFormLoading(false);
        return;
      }

      const newNotification = await createNotification(message, userId);
      if (newNotification) {
        fetchNotifications();
        setIsFormOpen(false);
        setMessage('');
        setTargetUserId('');
        setSendToAll(true);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      showError('Failed to send notification.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (notificationId: string) => {
    setNotificationToDelete(notificationId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteNotification = async () => {
    if (notificationToDelete) {
      const success = await deleteNotification(notificationToDelete);
      if (success) {
        fetchNotifications();
      }
      setNotificationToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const getRecipientName = (notification: Notification) => {
    if (notification.user_id === null) {
      return 'All Users';
    }
    const user = users.find(u => u.id === notification.user_id);
    return user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || `User ID: ${notification.user_id.substring(0, 8)}` : `User ID: ${notification.user_id.substring(0, 8)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-text-primary-heading">Notification Management</h2>
        <Button onClick={() => setIsFormOpen(true)} className="bg-accent-rose text-white hover:bg-accent-dark rounded-small">
          <PlusCircle className="h-5 w-5 mr-2" /> Send New Notification
        </Button>
      </div>

      <Card className="shadow-elev border border-card-border rounded-default">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-text-primary-heading">All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-text-secondary-body">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p className="text-center text-text-secondary-body">No notifications sent yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-text-primary-heading">Message</TableHead>
                    <TableHead className="text-text-primary-heading">Recipient</TableHead>
                    <TableHead className="text-text-primary-heading">Sent At</TableHead>
                    <TableHead className="text-text-primary-heading">Read</TableHead>
                    <TableHead className="text-right text-text-primary-heading">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="max-w-[300px] truncate text-text-secondary-body">{notification.message}</TableCell>
                      <TableCell className="text-text-secondary-body">{getRecipientName(notification)}</TableCell>
                      <TableCell className="text-text-secondary-body">{format(new Date(notification.created_at), 'PPP p')}</TableCell>
                      <TableCell className="text-text-secondary-body">{notification.is_read ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" onClick={() => handleDeleteClick(notification.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Notification Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-default shadow-elev border border-card-border" aria-labelledby="notification-form-title">
          <DialogHeader>
            <DialogTitle id="notification-form-title" className="text-text-primary-heading">Send New Notification</DialogTitle>
            <DialogDescription className="text-text-secondary-body">
              Compose and send a notification to users.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendNotification} className="space-y-4 py-4">
            <div>
              <Label htmlFor="message">Notification Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your notification message here..."
                rows={4}
                required
                className="border border-card-border rounded-small focus:ring-accent-rose"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendToAll"
                checked={sendToAll}
                onCheckedChange={(checked) => {
                  setSendToAll(!!checked);
                  if (checked) setTargetUserId('');
                }}
              />
              <Label htmlFor="sendToAll" className="text-text-secondary-body">Send to All Users</Label>
            </div>
            {!sendToAll && (
              <div>
                <Label htmlFor="targetUser">Target Specific User (User ID)</Label>
                <Input
                  id="targetUser"
                  type="text"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  placeholder="Enter user ID (e.g., from User Management)"
                  required={!sendToAll}
                  className="border border-card-border rounded-small focus:ring-accent-rose"
                />
                <p className="text-sm text-text-secondary-body mt-1">
                  You can find user IDs in the User Management section.
                </p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsFormOpen(false)} type="button" className="rounded-small border-card-border">Cancel</Button>
              <Button type="submit" disabled={formLoading} className="bg-accent-rose text-white hover:bg-accent-dark rounded-small">
                {formLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Notification'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rounded-default shadow-elev border border-card-border" aria-labelledby="notification-delete-title">
          <DialogHeader>
            <DialogTitle id="notification-delete-title" className="text-text-primary-heading">Are you absolutely sure?</DialogTitle>
            <DialogDescription className="text-text-secondary-body">
              This action cannot be undone. This will permanently delete the notification.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-small border-card-border">Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteNotification} className="bg-destructive text-white hover:bg-destructive/90 rounded-small">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationManagement;