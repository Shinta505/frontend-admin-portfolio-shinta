document.addEventListener('DOMContentLoaded', () => {
    // --- PENGECEKAN STATUS LOGIN ---
    if (sessionStorage.getItem('isLoggedIn') !== 'true') {
        alert('Anda harus login terlebih dahulu!');
        window.location.href = '../index.html';
        return;
    }

    // --- KONFIGURASI DAN ELEMEN DOM ---
    const BASE_URL = 'https://be-portfolio-shinta.vercel.app/api/experience';
    const API_WILAYAH_URL = 'https://www.emsifa.com/api-wilayah-indonesia/api';

    const experienceTableBody = document.querySelector('#experienceTable tbody');
    const experienceModal = document.getElementById('experienceModal');
    const modalTitle = document.getElementById('modalTitle');
    const experienceForm = document.getElementById('experienceForm');
    const experienceIdInput = document.getElementById('id_experience');
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const alamatContainer = document.getElementById('alamat-container');
    const tahunMasukInput = document.getElementById('tahun_masuk');
    const tahunKeluarInput = document.getElementById('tahun_keluar');
    const errorTahunMasuk = document.getElementById('error_tahun_masuk');
    const errorTahunKeluar = document.getElementById('error_tahun_keluar');
    let idToDelete = null;

    // --- FUNGSI-FUNGSI ---

    const getExperiences = async () => {
        try {
            const response = await fetch(BASE_URL);
            if (!response.ok) throw new Error('Gagal mengambil data.');
            const experiences = await response.json();
            experienceTableBody.innerHTML = '';
            experiences.forEach(exp => {
                const row = `
                    <tr>
                        <td>${exp.bidang_pekerjaan}</td>
                        <td>${exp.nama_perusahaan}</td>
                        <td>${exp.tahun_masuk} - ${exp.tahun_keluar}</td>
                        <td>${exp.alamat_perusahaan}</td>
                        <td>${exp.deskripsi_experience.substring(0, 50)}...</td>
                        <td class="action-btns">
                            <button class="edit-btn" onclick="editExperience('${exp.id_experience}')"><i class="fas fa-edit"></i></button>
                            <button class="delete-btn" onclick="showDeleteConfirmation('${exp.id_experience}')"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
                experienceTableBody.innerHTML += row;
            });
        } catch (error) {
            console.error(error);
            experienceTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Gagal memuat data.</td></tr>`;
        }
    };

    const toggleModal = (modalElement, show) => {
        modalElement.style.display = show ? 'block' : 'none';
        document.body.classList.toggle('modal-open', show);
    };

    const clearYearErrors = () => {
        errorTahunMasuk.textContent = '';
        errorTahunKeluar.textContent = '';
        tahunMasukInput.classList.remove('input-error');
        tahunKeluarInput.classList.remove('input-error');
    };

    const openExperienceModal = (mode = 'add', data = null) => {
        experienceForm.reset();
        experienceIdInput.value = '';
        clearYearErrors();
        initAddressForm();

        if (mode === 'edit' && data) {
            modalTitle.textContent = 'Edit Experience';
            experienceIdInput.value = data.id_experience;
            document.getElementById('bidang_pekerjaan').value = data.bidang_pekerjaan;
            document.getElementById('nama_perusahaan').value = data.nama_perusahaan;
            tahunMasukInput.value = data.tahun_masuk;
            tahunKeluarInput.value = data.tahun_keluar;
            document.getElementById('deskripsi_experience').value = data.deskripsi_experience;
            document.getElementById('alamat_detail').value = data.alamat_perusahaan;
        } else {
            modalTitle.textContent = 'Tambah Experience';
        }

        toggleModal(experienceModal, true);
    };

    // --- VALIDASI TAHUN ---
    const validateYearInputs = () => {
        clearYearErrors();
        const tahunMasuk = tahunMasukInput.value;
        const tahunKeluar = tahunKeluarInput.value;
        const currentYear = new Date().getFullYear();
        let isValid = true;

        // Validasi Tahun Masuk
        if (!/^\d{4}$/.test(tahunMasuk)) {
            errorTahunMasuk.textContent = 'Format tahun harus 4 digit angka.';
            tahunMasukInput.classList.add('input-error');
            isValid = false;
        } else if (parseInt(tahunMasuk) > currentYear) {
            errorTahunMasuk.textContent = `Tahun masuk tidak boleh lebih dari ${currentYear}.`;
            tahunMasukInput.classList.add('input-error');
            isValid = false;
        }

        // Validasi Tahun Keluar
        if (tahunKeluar.toLowerCase() !== 'sekarang' && !/^\d{4}$/.test(tahunKeluar)) {
            errorTahunKeluar.textContent = 'Format tahun harus 4 digit atau "Sekarang".';
            tahunKeluarInput.classList.add('input-error');
            isValid = false;
        } else if (/^\d{4}$/.test(tahunKeluar)) {
            const tahunKeluarNum = parseInt(tahunKeluar);
            if (tahunKeluarNum > currentYear) {
                errorTahunKeluar.textContent = `Tahun keluar tidak boleh lebih dari ${currentYear}.`;
                tahunKeluarInput.classList.add('input-error');
                isValid = false;
            }
            if (/^\d{4}$/.test(tahunMasuk) && tahunKeluarNum < parseInt(tahunMasuk)) {
                errorTahunKeluar.textContent = 'Tahun keluar tidak boleh kurang dari tahun masuk.';
                tahunKeluarInput.classList.add('input-error');
                isValid = false;
            }
        }

        return isValid;
    };

    window.editExperience = async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/${id}`);
            if (!response.ok) throw new Error('Gagal mengambil detail data');
            const experience = await response.json();
            openExperienceModal('edit', experience);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    window.showDeleteConfirmation = (id) => {
        idToDelete = id;
        toggleModal(deleteConfirmModal, true);
    };

    // (Sisa kode untuk initAddressForm tetap sama)
    const createSelectElement = (id, label) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-group-row';

        const labelEl = document.createElement('label');
        labelEl.htmlFor = id;
        labelEl.textContent = label;

        const selectEl = document.createElement('select');
        selectEl.id = id;
        selectEl.disabled = true;

        wrapper.appendChild(labelEl);
        wrapper.appendChild(selectEl);

        return { wrapper, selectEl };
    };

    const initAddressForm = async () => {
        alamatContainer.innerHTML = '';

        const { wrapper: provinsiWrapper, selectEl: provinsiSelect } = createSelectElement('provinsi', 'Provinsi');
        const { wrapper: kotaWrapper, selectEl: kotaSelect } = createSelectElement('kota', 'Kota/Kabupaten');
        const { wrapper: kecamatanWrapper, selectEl: kecamatanSelect } = createSelectElement('kecamatan', 'Kecamatan');
        const { wrapper: kelurahanWrapper, selectEl: kelurahanSelect } = createSelectElement('kelurahan', 'Kelurahan/Desa');

        alamatContainer.append(provinsiWrapper, kotaWrapper, kecamatanWrapper, kelurahanWrapper);

        const resetSelect = (select, defaultOptionText) => {
            select.innerHTML = `<option value="">${defaultOptionText}</option>`;
            select.disabled = true;
        };

        resetSelect(kotaSelect, 'Pilih Kota/Kabupaten...');
        resetSelect(kecamatanSelect, 'Pilih Kecamatan...');
        resetSelect(kelurahanSelect, 'Pilih Kelurahan/Desa...');

        try {
            const response = await fetch(`${API_WILAYAH_URL}/provinces.json`);
            const provinces = await response.json();
            provinsiSelect.innerHTML = '<option value="">Pilih Provinsi...</option>';
            provinces.forEach(p => {
                provinsiSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`;
            });
            provinsiSelect.disabled = false;
        } catch (error) {
            console.error('Gagal memuat provinsi:', error);
        }

        provinsiSelect.addEventListener('change', async () => {
            const provId = provinsiSelect.value;
            resetSelect(kotaSelect, 'Pilih Kota/Kabupaten...');
            resetSelect(kecamatanSelect, 'Pilih Kecamatan...');
            resetSelect(kelurahanSelect, 'Pilih Kelurahan/Desa...');
            if (!provId) return;
            const response = await fetch(`${API_WILAYAH_URL}/regencies/${provId}.json`);
            const cities = await response.json();
            cities.forEach(c => kotaSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`);
            kotaSelect.disabled = false;
        });

        kotaSelect.addEventListener('change', async () => {
            const cityId = kotaSelect.value;
            resetSelect(kecamatanSelect, 'Pilih Kecamatan...');
            resetSelect(kelurahanSelect, 'Pilih Kelurahan/Desa...');
            if (!cityId) return;
            const response = await fetch(`${API_WILAYAH_URL}/districts/${cityId}.json`);
            const districts = await response.json();
            districts.forEach(d => kecamatanSelect.innerHTML += `<option value="${d.id}">${d.name}</option>`);
            kecamatanSelect.disabled = false;
        });

        kecamatanSelect.addEventListener('change', async () => {
            const districtId = kecamatanSelect.value;
            resetSelect(kelurahanSelect, 'Pilih Kelurahan/Desa...');
            if (!districtId) return;
            const response = await fetch(`${API_WILAYAH_URL}/villages/${districtId}.json`);
            const villages = await response.json();
            villages.forEach(v => kelurahanSelect.innerHTML += `<option value="${v.id}">${v.name}</option>`);
            kelurahanSelect.disabled = false;
        });
    };

    // --- EVENT LISTENERS ---

    document.getElementById('addExperienceBtn').addEventListener('click', () => openExperienceModal('add'));
    document.querySelector('.experience-close').addEventListener('click', () => toggleModal(experienceModal, false));
    cancelDeleteBtn.addEventListener('click', () => {
        toggleModal(deleteConfirmModal, false);
        idToDelete = null;
    });

    experienceForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateYearInputs()) {
            return; // Hentikan proses submit jika validasi gagal
        }

        const id = experienceIdInput.value;
        const isEdit = !!id;

        const detail = document.getElementById('alamat_detail').value;
        const kelurahan = document.getElementById('kelurahan')?.selectedOptions[0]?.text || '';
        const kecamatan = document.getElementById('kecamatan')?.selectedOptions[0]?.text || '';
        const kota = document.getElementById('kota')?.selectedOptions[0]?.text || '';
        const provinsi = document.getElementById('provinsi')?.selectedOptions[0]?.text || '';

        let alamatLengkap;
        if (isEdit && !provinsi) {
            alamatLengkap = detail;
        } else {
            alamatLengkap = [detail, kelurahan, kecamatan, kota, provinsi].filter(Boolean).join(', ');
        }

        const data = {
            bidang_pekerjaan: document.getElementById('bidang_pekerjaan').value,
            nama_perusahaan: document.getElementById('nama_perusahaan').value,
            tahun_masuk: tahunMasukInput.value,
            tahun_keluar: tahunKeluarInput.value,
            alamat_perusahaan: alamatLengkap,
            deskripsi_experience: document.getElementById('deskripsi_experience').value,
        };

        if (!data.alamat_perusahaan) {
            alert('Alamat perusahaan harus diisi dengan lengkap.');
            return;
        }

        const url = isEdit ? `${BASE_URL}/${id}` : BASE_URL;
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.msg || 'Gagal menyimpan data.');
            }
            toggleModal(experienceModal, false);
            getExperiences();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });

    tahunMasukInput.addEventListener('input', validateYearInputs);
    tahunKeluarInput.addEventListener('input', validateYearInputs);

    confirmDeleteBtn.addEventListener('click', async () => {
        if (!idToDelete) return;
        try {
            const response = await fetch(`${BASE_URL}/${idToDelete}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Gagal menghapus data.');
            toggleModal(deleteConfirmModal, false);
            getExperiences();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
        idToDelete = null;
    });

    // (Sisa kode untuk Navbar & Logout tetap sama)
    const navSlide = () => {
        const burger = document.querySelector('.burger');
        const nav = document.querySelector('.nav-links');
        burger.addEventListener('click', () => {
            nav.classList.toggle('nav-active');
            burger.classList.toggle('toggle');
        });
    };

    const logoutBtn = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logoutConfirmModal');
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleModal(logoutModal, true);
    });

    cancelLogoutBtn.addEventListener('click', () => toggleModal(logoutModal, false));

    confirmLogoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('isLoggedIn');
        window.location.href = '../index.html';
    });

    window.addEventListener('click', (event) => {
        if (event.target == experienceModal || event.target == deleteConfirmModal || event.target == logoutModal) {
            toggleModal(event.target, false);
        }
    });

    // --- INISIALISASI ---
    navSlide();
    getExperiences();
});
