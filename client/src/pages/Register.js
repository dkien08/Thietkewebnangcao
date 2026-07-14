// import React, { useState } from 'react';
// import { Form, Input, Button, Card, message } from 'antd';
// import { UserOutlined, LockOutlined } from '@ant-design/icons';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// export default function Register() {
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const onFinish = async (values) => {
//     setLoading(true);
//     try {
//       await axios.post('http://localhost:3000/api/auth/register', {
//         username: values.username,
//         password: values.password
//       });
//       message.success('🎉 Đăng ký tài khoản thành công!');
//       navigate('/login');
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || 'Tài khoản đã tồn tại hoặc xảy ra lỗi!';
//       message.error('❌ Đăng ký thất bại: ' + errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
//       <Card title="📝 ĐĂNG KÝ THÀNH VIÊN" style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
//         <Form layout="vertical" onFinish={onFinish}>
//           <Form.Item label="Tên tài khoản" name="username" rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản!' }]}>
//             <Input prefix={<UserOutlined />} placeholder="Nhập username..." />
//           </Form.Item>
//           <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
//             <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu..." />
//           </Form.Item>
//           <Form.Item>
//             <Button type="primary" htmlType="submit" loading={loading} block style={{ height: '40px', fontWeight: 'bold' }}>
//               Đăng Ký Ngay
//             </Button>
//           </Form.Item>
//         </Form>
//       </Card>
//     </div>
//   );
// }