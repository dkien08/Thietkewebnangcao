// Thay thế URL này bằng link cổng (3000 hoặc 3001) tương ứng trong tab PORTS của bạn
const API_URL = 'https://glorious-space-fortnight-7vj4jjw5v6r7fx67p-3001.app.github.dev/api/favourites';

// Xử lý sự kiện đóng mở menu trên phiên bản di động
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Gọi API lấy dữ liệu trạng thái phòng yêu thích đổ vào bảng
async function loadFavourites() {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Lỗi hệ thống: ${response.status}`);
        }

        const data = await response.json();
        const tableBody = document.getElementById('table-body');
        
        if (!tableBody) return;
        tableBody.innerHTML = ''; 

        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Chưa có dữ liệu phòng yêu thích.</td></tr>`;
            return;
        }

        // Tạo vòng lặp render dữ liệu
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>User mang mã số ${item.userId}</td>
                <td>Room ID: ${item.roomId}</td>
                <td><span style="color: #26a69a; font-weight: bold;">❤️ Yêu thích</span></td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Lỗi kết nối API:', error);
        const tableBody = document.getElementById('table-body');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; color: #f44336; font-weight: bold;">
                        Không thể kết nối đến Backend NestJS. Hãy kiểm tra trạng thái Public của cổng trong tab CỔNG (PORTS)!
                    </td>
                </tr>
            `;
        }
    }
}

// Chạy hàm ngay khi trang web được tải xong
window.addEventListener('DOMContentLoaded', loadFavourites);