let accessToken = localStorage.getItem('accessToken') || null;
export const setAccessToken = (token) => { accessToken = token; if (token) localStorage.setItem('accessToken', token); else localStorage.removeItem('accessToken'); };
export const getAccessToken = () => accessToken || localStorage.getItem('accessToken');
export const clearAccessToken = () => { accessToken = null; localStorage.removeItem('accessToken'); };

