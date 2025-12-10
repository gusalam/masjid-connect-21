import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  type: 'approval' | 'donation' | 'announcement';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const setupNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Listen for donation status changes
      const donationChannel = supabase
        .channel('notification-donations')
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'donations',
          filter: `donor_id=eq.${user.id}`
        }, (payload) => {
          const newStatus = payload.new.status;
          const oldStatus = payload.old.status;
          
          if (newStatus !== oldStatus) {
            const statusMessage = newStatus === 'verified' 
              ? 'Donasi Anda telah diverifikasi!' 
              : newStatus === 'rejected'
              ? 'Donasi Anda ditolak. Hubungi admin untuk info lebih lanjut.'
              : '';
            
            if (statusMessage) {
              toast({
                title: newStatus === 'verified' ? "✅ Donasi Terverifikasi" : "❌ Donasi Ditolak",
                description: statusMessage
              });
              
              addNotification({
                type: 'donation',
                title: newStatus === 'verified' ? 'Donasi Terverifikasi' : 'Donasi Ditolak',
                message: statusMessage
              });
            }
          }
        })
        .subscribe();

      // Listen for profile status changes (approval)
      const profileChannel = supabase
        .channel('notification-profile')
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${user.id}`
        }, (payload) => {
          const newStatus = payload.new.status;
          const oldStatus = payload.old.status;
          
          if (newStatus !== oldStatus && newStatus === 'approved') {
            toast({
              title: "🎉 Akun Disetujui!",
              description: "Selamat! Akun Anda telah disetujui oleh admin."
            });
            
            addNotification({
              type: 'approval',
              title: 'Akun Disetujui',
              message: 'Selamat! Akun Anda telah disetujui oleh admin.'
            });
          }
        })
        .subscribe();

      // Listen for new announcements
      const announcementChannel = supabase
        .channel('notification-announcements')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'announcements'
        }, (payload) => {
          if (payload.new.is_active) {
            toast({
              title: "📢 Pengumuman Baru",
              description: payload.new.title
            });
            
            addNotification({
              type: 'announcement',
              title: 'Pengumuman Baru',
              message: payload.new.title
            });
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(donationChannel);
        supabase.removeChannel(profileChannel);
        supabase.removeChannel(announcementChannel);
      };
    };

    setupNotifications();
  }, [toast]);

  const addNotification = (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications
  };
}
