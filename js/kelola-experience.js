document.addEventListener('DOMContentLoaded', () => {

    // --- PENGECEKAN STATUS LOGIN ---
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {
        alert('Anda harus login terlebih dahulu!');
        window.location.href = '../index.html';
        return; // Hentikan eksekusi jika belum login
    }

    // --- KONFIGURASI ---
    const BASE_URL = 'https://be-portfolio-shinta.vercel.app/api/experience';
    const API_WILAYAH_URL = 'https://www.emsifa.com/api-wilayah-indonesia/api';

    // --- ELEMEN DOM ---
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');
    const logoutBtn = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logoutConfirmModal');
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
    const experienceTableBody = document.querySelector('#experienceTable tbody');
    const experienceModal = document.getElementById('experienceModal');
    const modalTitle = document.getElementById('modalTitle');
    const experienceForm = document.getElementById('experienceForm');
    const experienceIdInput = document.getElementById('id_experience');
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const addExperienceBtn = document.getElementById('addExperienceBtn');
    const closeModalBtn = document.querySelector('.experience-close');
    const provinsiSelect = document.getElementById('provinsi');
    const kabupatenSelect = document.getElementById('kabupaten');
    const kecamatanSelect = document.getElementById('kecamatan');
    const kelurahanSelect = document.getElementById('kelurahan');
    let idToDelete = null;

    // --- FUNGSI-FUNGSI ---

    // Fungsi Navigasi Mobile
    const navSlide = () => {
        burger.addEventListener('click', () => {
            nav.classList.toggle('nav-active');
            navLinks.forEach((link, index) => {
                link.style.animation = link.style.animation ? '' : `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            });
            burger.classList.toggle('toggle');
        });
    };

    // Fungsi untuk mengambil data wilayah
    async function fetchAndPopulate(url, selectElement, placeholder, selectedValue = null) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Gagal mengambil data wilayah.');
            const data = await response.json();
            selectElement.innerHTML = `<option value="">${placeholder}</option>`;
            data.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = item.nama;
                selectElement.appendChild(option);
            });
            if (selectedValue) {
                selectElement.value = selectedValue;
            }
        } catch (error) {
            console.error('Error fetching wilayah:', error);
            selectElement.innerHTML = `<option value="">Gagal memuat</option>`;
        }
    }

    // Fungsi untuk mengambil dan menampilkan data experience
    const getExperiences = async () => {
        try {
            const response = await fetch(BASE_URL);
            if (!response.ok) throw new Error(`Gagal mengambil data. Status: ${response.status}`);
            const experiences = await response.json();
            experienceTableBody.innerHTML = '';
            for (const exp of experiences) {
                const masaKerja = (exp.tahun_keluar && exp.tahun_keluar !== 'Sekarang')
                    ? `${exp.tahun_masuk} - ${exp.tahun_keluar}`
                    : `${exp.tahun_masuk} - Sekarang`;

                const row = `
                    <tr>
                        <td>${exp.bidang_pekerjaan}</td>
                        <td>${exp.nama_perusahaan}</td>
                        <td>${exp.alamat_perusahaan}</td>
                        <td>${masaKerja}</td>
                        <td>${exp.deskripsi_experience.substring(0, 50)}...</td>
                        <td class="action-btns">
                            <button class="edit-btn" onclick="editExperience('${exp.id_experience}')"><i class="fas fa-edit"></i></button>
                            <button class="delete-btn" onclick="showDeleteConfirmation('${exp.id_experience}')"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
                experienceTableBody.innerHTML += row;
            }
        } catch (error) {
            console.error('Error fetching experiences:', error);
            experienceTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Gagal memuat data: ${error.message}</td></tr>`;
        }
    };

    // Fungsi untuk membuka dan menutup modal
    const toggleModal = (modalElement, show) => {
        if (show) {
            document.body.classList.add('modal-open');
            modalElement.style.display = 'block';
        } else {
            document.body.classList.remove('modal-open');
            modalElement.style.display = 'none';
        }
    };

    // Fungsi untuk setup modal experience
    const setupExperienceModal = async (mode = 'add', data = null) => {
        experienceForm.reset();
        experienceIdInput.value = '';
        kabupatenSelect.innerHTML = '<option value="">Pilih Kota/Kabupaten...</option>';
        kecamatanSelect.innerHTML = '<option value="">Pilih Kecamatan...</option>';
        kelurahanSelect.innerHTML = '<option value="">Pilih Kelurahan/Desa...</option>';

        if (mode === 'add') {
            modalTitle.textContent = 'Tambah Experience';
            await fetchAndPopulate(`${API_WILAYAH_URL}/provinces.json`, provinsiSelect, 'Pilih Provinsi...');
        } else if (mode === 'edit' && data) {
            modalTitle.textContent = 'Edit Experience';
            experienceIdInput.value = data.id_experience;
            document.getElementById('bidang_pekerjaan').value = data.bidang_pekerjaan;
            document.getElementById('nama_perusahaan').value = data.nama_perusahaan;
            document.getElementById('tahun_masuk').value = data.tahun_masuk;
            document.getElementById('tahun_keluar').value = (data.tahun_keluar === 'Sekarang') ? '' : data.tahun_keluar;
            document.getElementById('deskripsi_experience').value = data.deskripsi_experience;

            // Mem-parsing alamat
            const alamatParts = data.alamat_perusahaan.split(',').map(part => part.trim());
            const detailAlamat = alamatParts[0] || '';
            const kelurahanNama = alamatParts[1] || '';
            const kecamatanNama = alamatParts[2] || '';
            const kabupatenNama = alamatParts[3] || '';
            const provinsiNama = alamatParts[4] || '';

            document.getElementById('detail_alamat').value = detailAlamat;

            // Mengambil dan mengisi data wilayah
            await fetchAndPopulate(`${API_WILAYAH_URL}/provinces.json`, provinsiSelect, 'Pilih Provinsi...');
            const provinsiResponse = await fetch(`${API_WILAYAH_URL}/provinces.json`);
            const provinsiData = await provinsiResponse.json();
            const provinsi = provinsiData.find(p => p.nama === provinsiNama);
            if (provinsi) {
                provinsiSelect.value = provinsi.id;
                await fetchAndPopulate(`${API_WILAYAH_URL}/regencies/${provinsi.id}.json`, kabupatenSelect, 'Pilih Kota/Kabupaten...');
                const kabupatenResponse = await fetch(`${API_WILAYAH_URL}/regencies/${provinsi.id}.json`);
                const kabupatenData = await kabupatenResponse.json();
                const kabupaten = kabupatenData.find(k => k.nama === kabupatenNama);
                if (kabupaten) {
                    kabupatenSelect.value = kabupaten.id;
                    await fetchAndPopulate(`${API_WILAYAH_URL}/districts/${kabupaten.id}.json`, kecamatanSelect, 'Pilih Kecamatan...');
                    const kecamatanResponse = await fetch(`${API_WILAYAH_URL}/districts/${kabupaten.id}.json`);
                    const kecamatanData = await kecamatanResponse.json();
                    const kecamatan = kecamatanData.find(k => k.nama === kecamatanNama);
                    if (kecamatan) {
                        kecamatanSelect.value = kecamatan.id;
                        await fetchAndPopulate(`${API_WILAYAH_URL}/villages/${kecamatan.id}.json`, kelurahanSelect, 'Pilih Kelurahan/Desa...');
                        const kelurahanResponse = await fetch(`${API_WILAYAH_URL}/villages/${kecamatan.id}.json`);
                        const kelurahanData = await kelurahanResponse.json();
                        const kelurahan = kelurahanData.find(k => k.nama === kelurahanNama);
                        if(kelurahan) {
                            kelurahanSelect.value = kelurahan.id
                        }
                    }
                }
            }
        }
        toggleModal(experienceModal, true);
    };

    // Fungsi untuk membuka mode edit (dibuat global agar bisa dipanggil dari HTML)
    window.editExperience = async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/${id}`);
            if (!response.ok) throw new Error('Gagal mengambil detail data');
            const experience = await response.json();
            await setupExperienceModal('edit', experience);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    // Fungsi untuk konfirmasi hapus (dibuat global)
    window.showDeleteConfirmation = (id) => {
        idToDelete = id;
        toggleModal(deleteConfirmModal, true);
    };


    // --- EVENT LISTENERS ---

    // Alamat
    provinsiSelect.addEventListener('change', () => {
        const provId = provinsiSelect.value;
        kabupatenSelect.innerHTML = '<option value="">Pilih Kota/Kabupaten...</option>';
        kecamatanSelect.innerHTML = '<option value="">Pilih Kecamatan...</option>';
        kelurahanSelect.innerHTML = '<option value="">Pilih Kelurahan/Desa...</option>';
        if (provId) fetchAndPopulate(`${API_WILAYAH_URL}/regencies/${provId}.json`, kabupatenSelect, 'Pilih Kota/Kabupaten...');
    });
    kabupatenSelect.addEventListener('change', () => {
        const kabId = kabupatenSelect.value;
        kecamatanSelect.innerHTML = '<option value="">Pilih Kecamatan...</option>';
        kelurahanSelect.innerHTML = '<option value="">Pilih Kelurahan/Desa...</option>';
        if (kabId) fetchAndPopulate(`${API_WILAYAH_URL}/districts/${kabId}.json`, kecamatanSelect, 'Pilih Kecamatan...');
    });
    kecamatanSelect.addEventListener('change', () => {
        const kecId = kecamatanSelect.value;
        kelurahanSelect.innerHTML = '<option value="">Pilih Kelurahan/Desa...</option>';
        if (kecId) fetchAndPopulate(`${API_WILAYAH_URL}/villages/${kecId}.json`, kelurahanSelect, 'Pilih Kelurahan/Desa...');
    });

    // Tombol-tombol modal
    addExperienceBtn.addEventListener('click', () => setupExperienceModal('add'));
    closeModalBtn.addEventListener('click', () => toggleModal(experienceModal, false));
    cancelLogoutBtn.addEventListener('click', () => toggleModal(logoutModal, false));
    cancelDeleteBtn.addEventListener('click', () => toggleModal(deleteConfirmModal, false));
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleModal(logoutModal, true);
    });

    // Klik di luar area modal untuk menutup
    window.addEventListener('click', (event) => {
        if (event.target == experienceModal) toggleModal(experienceModal, false);
        if (event.target == logoutModal) toggleModal(logoutModal, false);
        if (event.target == deleteConfirmModal) toggleModal(deleteConfirmModal, false);
    });

    // Submit Form
    experienceForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validasi Tahun
        const tahunMasuk = parseInt(document.getElementById('tahun_masuk').value, 10);
        const tahunKeluarValue = document.getElementById('tahun_keluar').value;
        const tahunKeluar = tahunKeluarValue ? parseInt(tahunKeluarValue, 10) : null;
        if (isNaN(tahunMasuk) || tahunMasuk < 1800 || tahunMasuk > 9999) {
            alert('Tahun masuk tidak valid. Harap masukkan angka 4 digit.');
            return;
        }
        if (tahunKeluar && (isNaN(tahunKeluar) || tahunKeluar < 1800 || tahunKeluar > 9999)) {
            alert('Tahun keluar tidak valid. Harap masukkan angka 4 digit.');
            return;
        }
        if (tahunKeluar && tahunKeluar < tahunMasuk) {
            alert('Tahun keluar tidak boleh kurang dari tahun masuk.');
            return;
        }

        // Membuat String Alamat Lengkap
        const provText = provinsiSelect.options[provinsiSelect.selectedIndex].text;
        const kabText = kabupatenSelect.options[kabupatenSelect.selectedIndex].text;
        const kecText = kecamatanSelect.options[kecamatanSelect.selectedIndex].text;
        const kelText = kelurahanSelect.options[kelurahanSelect.selectedIndex].text;
        const detailAlamat = document.getElementById('detail_alamat').value;

        if (provinsiSelect.value === "" || kabupatenSelect.value === "" || kecamatanSelect.value === "" || kelurahanSelect.value === "" || !detailAlamat.trim()) {
            alert("Harap lengkapi semua field alamat.");
            return;
        }

        const alamatLengkap = `${detailAlamat}, ${kelText}, ${kecText}, ${kabText}, ${provText}`;

        const id = experienceIdInput.value;
        const isEdit = !!id;
        const data = {
            bidang_pekerjaan: document.getElementById('bidang_pekerjaan').value,
            nama_perusahaan: document.getElementById('nama_perusahaan').value,
            alamat_perusahaan: alamatLengkap,
            tahun_masuk: tahunMasuk,
            tahun_keluar: tahunKeluarValue || 'Sekarang',
            deskripsi_experience: document.getElementById('deskripsi_experience').value,
        };

        const url = isEdit ? `${BASE_URL}/${id}` : BASE_URL;
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gagal menyimpan data. Server: ${errorText}`);
            }
            toggleModal(experienceModal, false);
            getExperiences();
        } catch (error) {
            console.error('Error saving experience:', error);
            alert(`Error: ${error.message}`);
        }
    });

    // Hapus
    confirmDeleteBtn.addEventListener('click', async () => {
        if (!idToDelete) return;
        try {
            const response = await fetch(`${BASE_URL}/${idToDelete}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(`Gagal menghapus data. Status: ${response.status}`);
            toggleModal(deleteConfirmModal, false);
            getExperiences();
        } catch (error) {
            console.error('Error deleting experience:', error);
            alert(`Error: ${error.message}`);
        }
        idToDelete = null;
    });

    // Logout
    confirmLogoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('isLoggedIn');
        window.location.href = '../index.html';
    });


    // --- INISIALISASI ---
    navSlide();
    getExperiences();
});
