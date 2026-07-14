// import React, { useEffect, useState } from 'react';
// import { List, Card, Badge, Spin, message } from 'antd';
// import axios from 'axios';

// export default function Home() {
//   const [rooms, setRooms] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     axios.get('http://localhost:3000/api/rooms')
//       .then((response) => {
//         setRooms(response.data);
//       })
//       .catch((error) => {
//         message.error('Không thể lấy danh sách phòng trọ từ server!');
//         console.error(error);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, []);

//   if (loading) {
//     return (
//       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
//         <Spin size="large" tip="Đang tải danh sách phòng trọ..." />
//       </div>
//     );
//   }

//   return (
//     <div style={{ padding: '0 20px' }}>
//       <h2 style={{ marginBottom: '20px', color: '#002140' }}>🏠 DANH SÁCH PHÒNG TRỌ ĐANG TRỐNG</h2>
//       <List
//         grid={{ gutter: 20, xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }}
//         dataSource={rooms}
//         renderItem={(room) => (
//           <List.Item>
//             <Card hoverable cover={<img alt="Ảnh" src={room.image || 'https://via.placeholder.com/300x200?text=No+Image'} style={{ height: '200px', objectFit: 'cover' }} />}>
//               <Card.Meta title={room.name || 'Phòng trọ giá rẻ'} description={`📍 Địa chỉ: ${room.address || 'Chưa cập nhật'}`} />
//               <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <span style={{ color: '#8c8c8c' }}>Diện tích: {room.area || 20} m²</span>
//                 <Badge count={`${room.price?.toLocaleString('vi-VN')} VNĐ/tháng`} style={{ backgroundColor: '#52c41a', padding: '0 10px', height: '24px', lineHeight: '24px' }} />
//               </div>
//             </Card>
//           </List.Item>
//         )}
//       />
//     </div>
//   );
// }