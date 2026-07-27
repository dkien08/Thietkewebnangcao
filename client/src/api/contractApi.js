// client/src/api/contractApi.js
import axiosClient from './axiosClient';

export const contractApi = {
  // F08: Tenant gửi yêu cầu thuê phòng
  createContract: (data) => axiosClient.post('/contracts', data),

  // F09: Tenant xem danh sách hợp đồng của mình
  getTenantContracts: () => axiosClient.get('/contracts/tenant'),

  // F14: Landlord xem danh sách các yêu cầu gửi đến phòng mình
  getLandlordContracts: () => axiosClient.get('/contracts/landlord'),

  // F15: Landlord phê duyệt
  approveContract: (id) => axiosClient.put(`/contracts/${id}/approve`),

  // F15.1: Landlord từ chối
  rejectContract: (id) => axiosClient.put(`/contracts/${id}/reject`),

  // Terminate hợp đồng
  terminateContract: (id) => axiosClient.put(`/contracts/${id}/terminate`),
};