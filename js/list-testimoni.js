document.addEventListener('DOMContentLoaded', () => {

    // --- PENGECEKAN STATUS LOGIN ---
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {
        alert('Anda harus login terlebih dahulu!');
        window.location.href = '../index.html';
        return;
    }

    const BASE_URL = 'https://be-portfolio-shinta.vercel.app/api/testimoni';

    // --- ELEMEN DOM ---
    const testimoniTableBody = document.querySelector('#testimoniTable tbody');
    const viewModal = document.getElementById('viewTestimoniModal');
    const viewModalTitle = document.getElementById('viewModalTitle');
    const closeModalBtn = document.querySelector('.view-close');
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    let idToDelete = null;

    // --- FUNGSI-FUNGSI ---

    // Fungsi untuk memformat tanggal
    const formatTanggal = (tanggal) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(tanggal).toLocaleDateString('id-ID', options);
    };

    // Fungsi untuk mengambil dan menampilkan semua testimoni
    const getTestimoni = async () => {
        try {
            const response = await fetch(BASE_URL);
            if (!response.ok) throw new Error('Gagal mengambil data testimoni.');

            const testimoniList = await response.json();
            testimoniTableBody.innerHTML = '';
            testimoniList.forEach(testimoni => {
                const row = `
                    <tr>
                        <td>${testimoni.nama_pengirim}</td>
                        <td>${testimoni.isi_testimoni.substring(0, 50)}...</td>
                        <td>${formatTanggal(testimoni.tanggal_dikirim)}</td>
                        <td class="action-btns">
                            <button class="edit-btn" onclick="viewTestimoni('${testimoni.id_testimoni}')"><i class="fas fa-eye"></i></button>
                            <button class="delete-btn" onclick="showDeleteConfirmation('${testimoni.id_testimoni}')"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
                testimoniTableBody.innerHTML += row;
            });
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            testimoniTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Gagal memuat data.</td></tr>`;
        }
    };

    // Fungsi untuk menampilkan detail testimoni
    window.viewTestimoni = async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/${id}`);
            if (!response.ok) throw new Error('Gagal mengambil detail testimoni.');

            const testimoni = await response.json();
            document.getElementById('detailNama').textContent = testimoni.nama_pengirim;
            document.getElementById('detailTanggal').textContent = formatTanggal(testimoni.tanggal_dikirim);
            document.getElementById('detailIsi').textContent = testimoni.isi_testimoni;
            viewModal.style.display = 'block';
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    // Fungsi untuk menampilkan konfirmasi hapus
    window.showDeleteConfirmation = (id) => {
        idToDelete = id;
        deleteConfirmModal.style.display = 'block';
    };

    // --- EVENT LISTENERS ---

    // Menutup modal detail
    closeModalBtn.onclick = () => {
        viewModal.style.display = 'none';
    };

    // Menutup modal konfirmasi hapus
    cancelDeleteBtn.addEventListener('click', () => {
        deleteConfirmModal.style.display = 'none';
        idToDelete = null;
    });

    // Proses penghapusan
    confirmDeleteBtn.addEventListener('click', async () => {
        if (!idToDelete) return;
        try {
            const response = await fetch(`${BASE_URL}/${idToDelete}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Gagal menghapus data.');

            deleteConfirmModal.style.display = 'none';
            getTestimoni(); // Muat ulang data setelah berhasil menghapus
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
        idToDelete = null;
    });

    // Menutup modal jika klik di luar area modal
    window.addEventListener('click', (event) => {
        if (event.target == viewModal) {
            viewModal.style.display = 'none';
        }
        if (event.target == deleteConfirmModal) {
            deleteConfirmModal.style.display = 'none';
        }
    });

    // --- Fungsionalitas Navbar & Logout (Sama seperti halaman lain) ---
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    const navSlide = () => {
        burger.addEventListener('click', () => {
            nav.classList.toggle('nav-active');
            navLinks.forEach((link, index) => {
                link.style.animation = link.style.animation ? '' : `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            });
            burger.classList.toggle('toggle');
        });
    };

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
        sessionStorage.removeItem('isLoggedIn');
        window.location.href = '../index.html';
    });

    // --- INISIALISASI ---
    navSlide();
    getTestimoni();
});