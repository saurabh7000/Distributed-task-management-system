import api from 'common/services/api'
export const notificationService = {
  getAll:       async ()   => { const r = await api.get('/notifications');               return r.data.data; },
  markRead:     async (id) => { await api.put(`/notifications/${id}/read`); },
  markAllRead:  async ()   => { await api.put('/notifications/read-all'); },
  getUnreadCount: async () => { const r = await api.get('/notifications/unread-count');  return r.data.data; },
};

