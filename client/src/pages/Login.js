// import React, { useState } from 'react';
// import { Form, Input, Button, Card, message } from 'antd';
// import { UserOutlined, LockOutlined } from '@ant-design/icons';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// export default function Login() {
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const onFinish = async (values) => {
//     setLoading(true);
//     try {
//       const response = await axios.post('http://localhost:3000/api/auth/login', {
//         username: values.username,
//         password: values.password
//       });
//       if (response.data && response.data.accessToken) {
//         localStorage.setItem('token', response.data.accessToken);
//         message.success('🔑 Đăng nhập hệ thống thành công!');
//         navigate('/');
//       } else {
//         message.warning('Đăng nhập thành công nhưng không nhận được mã Token!');
//       }
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || 'Sai tài khoản hoặc mật khẩu!';
//       message.error('❌ Đăng nhập thất bại: ' + errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
//       <Card title="🔑 ĐĂNG NHẬP HỆ THỐNG" style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
//         <Form layout="vertical" onFinish={onFinish}>
//           <Form.Item label="Tên tài khoản" name="username" rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}>
//             <Input prefix={<UserOutlined />} placeholder="Username..." />
//           </Form.Item>
//           <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
//             <Input.Password prefix={<LockOutlined />} placeholder="Password..." />
//           </Form.Item>
//           <Form.Item>
//             <Button type="primary" htmlType="submit" loading={loading} block style={{ height: '40px', fontWeight: 'bold' }}>
//               Đăng Nhập
//             </Button>
//           </Form.Item>
//         </Form>
//       </Card>
//     </div>
//   );
// }