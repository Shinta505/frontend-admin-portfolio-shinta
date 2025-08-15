// --- PENGECEKAN STATUS LOGIN ---
// Kode ini akan dieksekusi pertama kali saat file dimuat.
// Jika status 'isLoggedIn' tidak ada di sessionStorage, alihkan ke halaman login.
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    alert('Anda harus login terlebih dahulu!');
    window.location.href = '../index.html';
}

const BASE_URL = 'https://be-portfolio-shinta.vercel.app/api/portfolio';

// Fungsionalitas Navbar Mobile
const navSlide = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');
        navLinks.forEach((link, index) => {
            link.style.animation = link.style.animation ? '' : `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
        });
        burger.classList.toggle('toggle');
    });
};
navSlide();

// --- LOGOUT LOGIC ---
const logoutBtn = document.getElementById('logout-btn');
const logoutModal = document.getElementById('logoutConfirmModal');
const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');

logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    logoutModal.style.display = 'block';
});

cancelLogoutBtn.addEventListener('click', () => {
    logoutModal.style.display = 'none';
});

confirmLogoutBtn.addEventListener('click', () => {
    // Hapus status login dari sessionStorage saat logout
    sessionStorage.removeItem('isLoggedIn');
    // Arahkan ke halaman login
    window.location.href = '../index.html';
});

// --- CRUD PORTFOLIO LOGIC ---
const portfolioTableBody = document.querySelector('#portfolioTable tbody');
const portfolioModal = document.getElementById('portfolioModal');
const modalTitle = document.getElementById('modalTitle');
const portfolioForm = document.getElementById('portfolioForm');
const portfolioIdInput = document.getElementById('id_portfolio');
const deleteConfirmModal = document.getElementById('deleteConfirmModal');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
let idToDelete = null;

// Fungsi untuk mengambil dan menampilkan data portfolio
const getPortfolios = async () => {
    try {
        const response = await fetch(BASE_URL);
        if (!response.ok) throw new Error(`Gagal mengambil data. Status: ${response.status}`);

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new TypeError("Respons dari server bukan format JSON.");
        }

        const portfolios = await response.json();
        portfolioTableBody.innerHTML = '';
        portfolios.forEach(portfolio => {
            const row = `
                <tr>
                    <td><img src="${portfolio.gambar_portfolio}" alt="${portfolio.judul_portfolio}" width="100"></td>
                    <td>${portfolio.judul_portfolio}</td>
                    <td>${portfolio.deskripsi_portfolio.substring(0, 80)}...</td>
                    <td><a href="${portfolio.link_portfolio}" target="_blank">Proyek</a></td>
                    <td><a href="${portfolio.link_github}" target="_blank">GitHub</a></td>
                    <td class="action-btns">
                        <button class="edit-btn" onclick="editPortfolio('${portfolio.id_portfolio}')"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn" onclick="showDeleteConfirmation('${portfolio.id_portfolio}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
            portfolioTableBody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error fetching portfolios:', error);
        portfolioTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Gagal memuat data: ${error.message}</td></tr>`;
    }
};

// Fungsi untuk membuka modal (tambah/edit)
const openModal = (mode = 'add', data = null) => {
    portfolioForm.reset();
    portfolioIdInput.value = '';
    if (mode === 'add') {
        modalTitle.textContent = 'Tambah Portfolio';
    } else if (mode === 'edit' && data) {
        modalTitle.textContent = 'Edit Portfolio';
        portfolioIdInput.value = data.id_portfolio;
        document.getElementById('judul_portfolio').value = data.judul_portfolio;
        document.getElementById('deskripsi_portfolio').value = data.deskripsi_portfolio;
        document.getElementById('link_portfolio').value = data.link_portfolio;
        document.getElementById('link_github').value = data.link_github;
        document.getElementById('gambar_portfolio_url').value = data.gambar_portfolio;
    }
    portfolioModal.style.display = 'block';
};

// Event listener untuk menutup modal
document.querySelector('.portfolio-close').onclick = () => portfolioModal.style.display = 'none';
window.addEventListener('click', (event) => {
    if (event.target == portfolioModal) portfolioModal.style.display = 'none';
    if (event.target == logoutModal) logoutModal.style.display = 'none';
    if (event.target == deleteConfirmModal) deleteConfirmModal.style.display = 'none';
});

document.getElementById('addPortfolioBtn').addEventListener('click', () => openModal('add'));

// Handle submit form (Tambah & Edit)
portfolioForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = portfolioIdInput.value;
    const isEdit = !!id;

    const formData = new FormData();
    formData.set('judul_portfolio', document.getElementById('judul_portfolio').value);
    formData.set('deskripsi_portfolio', document.getElementById('deskripsi_portfolio').value);
    formData.set('link_portfolio', document.getElementById('link_portfolio').value);
    formData.set('link_github', document.getElementById('link_github').value);

    const imageUrl = document.getElementById('gambar_portfolio_url').value;
    const imageFile = document.getElementById('gambar_portfolio').files[0];

    if (imageUrl) {
        formData.set('gambar_portfolio', imageUrl);
    } else if (imageFile) {
        formData.append('gambar_portfolio', imageFile);
    }

    const url = isEdit ? `${BASE_URL}/${id}` : BASE_URL;
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, { method, body: formData });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gagal menyimpan data. Server: ${errorText}`);
        }
        portfolioModal.style.display = 'none';
        getPortfolios();
    } catch (error) {
        console.error('Error saving portfolio:', error);
        alert(`Error: ${error.message}`);
    }
});

// Fungsi untuk membuka mode edit
window.editPortfolio = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/${id}`);
        if (!response.ok) throw new Error('Gagal mengambil detail data');
        const portfolio = await response.json();
        openModal('edit', portfolio);
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
};

// --- DELETE LOGIC ---
window.showDeleteConfirmation = (id) => {
    idToDelete = id;
    deleteConfirmModal.style.display = 'block';
};

cancelDeleteBtn.addEventListener('click', () => {
    deleteConfirmModal.style.display = 'none';
    idToDelete = null;
});

confirmDeleteBtn.addEventListener('click', async () => {
    if (!idToDelete) return;
    try {
        const response = await fetch(`${BASE_URL}/${idToDelete}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`Gagal menghapus data. Status: ${response.status}`);
        deleteConfirmModal.style.display = 'none';
        getPortfolios();
    } catch (error) {
        console.error('Error deleting portfolio:', error);
        alert(`Error: ${error.message}`);
    }
    idToDelete = null;
});

// Muat data portfolio saat halaman pertama kali dibuka, setelah pengecekan login
document.addEventListener('DOMContentLoaded', getPortfolios);
