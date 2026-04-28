import axiosInstance from "../utils/axiosInstance";

export const createAchievement = (data) =>
  axiosInstance.post("/achievements", data);

export const getMyAchievements = () =>
  axiosInstance.get("/achievements/my");


export const getTeacherAchievements = () =>
  axiosInstance.get("/achievements/teacher");

export const approveAchievement = (id) =>
  axiosInstance.put(`/achievements/approve/${id}`);

export const rejectAchievement = (id) =>
  axiosInstance.put(`/achievements/reject/${id}`);

export const likeAchievement = (id) =>
  axiosInstance.put(`/achievements/like/${id}`);

export const commentAchievement = (id, text) =>
  axiosInstance.post(`/achievements/comment/${id}`, { text });

export const deleteAchievement = (id) =>
  axiosInstance.delete(`/achievements/delete/${id}`);

export const hideAchievement = (id) =>
  axiosInstance.put(`/achievements/hide/${id}`);

export const getPublicAchievements = (filters = {}) => {
  let query = "/achievements/public?";

  if (filters.class) query += `class=${filters.class}&`;
  if (filters.teacher) query += `teacher=${filters.teacher}&`;
  if (filters.date) query += `date=${filters.date}&`;

  return axiosInstance.get(query);
};