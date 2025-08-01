document.addEventListener('DOMContentLoaded', () => {

    if (sessionStorage.getItem('isLoggedIn') !== 'true') {
        alert('Anda harus login terlebih dahulu!');
        window.location.href = '../index.html';
        return;
    }

    const BASE_URL = 'https://be-portfolio-shinta.vercel.app/api/skill';

    // --- ELEMEN DOM ---
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');
    const logoutBtn = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logoutConfirmModal');
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
    const skillTableBody = document.querySelector('#skillTable tbody');
    const skillModal = document.getElementById('skillModal');
    const modalTitle = document.getElementById('modalTitle');
    const skillForm = document.getElementById('skillForm');
    const skillIdInput = document.getElementById('id_skill');
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const addSkillBtn = document.getElementById('addSkillBtn');
    const closeModalBtn = document.querySelector('.skill-close');
    const persentaseSlider = document.getElementById('persentase_keahlian'); // Slider
    const skillValueDisplay = document.getElementById('skillValue'); // Tampilan angka persen
    let idToDelete = null;

    // --- FUNGSI ---
    const navSlide = () => {
        burger.addEventListener('click', () => {
            nav.classList.toggle('nav-active');
            navLinks.forEach((link, index) => {
                link.style.animation = link.style.animation ? '' : `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            });
            burger.classList.toggle('toggle');
        });
    };

    const getSkills = async () => {
        try {
            const response = await fetch(BASE_URL);
            if (!response.ok) throw new Error(`Gagal mengambil data.`);
            const skills = await response.json();
            skillTableBody.innerHTML = '';
            skills.forEach(skill => {
                const row = `
                    <tr>
                        <td>${skill.nama_skill}</td>
                        <td>${skill.persentase_keahlian}%</td> <td class="action-btns">
                            <button class="edit-btn" onclick="editSkill('${skill.id_skill}')"><i class="fas fa-edit"></i></button>
                            <button class="delete-btn" onclick="showDeleteConfirmation('${skill.id_skill}')"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `;
                skillTableBody.innerHTML += row;
            });
        } catch (error) {
            skillTableBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Gagal memuat data.</td></tr>`;
        }
    };

    const toggleModal = (modalElement, show) => {
        modalElement.style.display = show ? 'block' : 'none';
        document.body.classList.toggle('modal-open', show);
    };

    const setupSkillModal = (mode = 'add', data = null) => {
        skillForm.reset();
        skillIdInput.value = '';
        persentaseSlider.value = 50; // Reset slider ke nilai default
        skillValueDisplay.textContent = 50; // Reset tampilan persen

        if (mode === 'add') {
            modalTitle.textContent = 'Tambah Skill';
        } else if (mode === 'edit' && data) {
            modalTitle.textContent = 'Edit Skill';
            skillIdInput.value = data.id_skill;
            document.getElementById('nama_skill').value = data.nama_skill;
            persentaseSlider.value = data.persentase_keahlian;
            skillValueDisplay.textContent = data.persentase_keahlian;
        }
        toggleModal(skillModal, true);
    };

    window.editSkill = async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/${id}`);
            if (!response.ok) throw new Error('Gagal mengambil detail data');
            const skill = await response.json();
            setupSkillModal('edit', skill);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    window.showDeleteConfirmation = (id) => {
        idToDelete = id;
        toggleModal(deleteConfirmModal, true);
    };

    // --- EVENT LISTENERS ---
    persentaseSlider.addEventListener('input', (event) => {
        skillValueDisplay.textContent = event.target.value;
    });

    addSkillBtn.addEventListener('click', () => setupSkillModal('add'));
    closeModalBtn.addEventListener('click', () => toggleModal(skillModal, false));
    cancelLogoutBtn.addEventListener('click', () => toggleModal(logoutModal, false));
    cancelDeleteBtn.addEventListener('click', () => toggleModal(deleteConfirmModal, false));
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleModal(logoutModal, true);
    });

    window.addEventListener('click', (event) => {
        if (event.target == skillModal) toggleModal(skillModal, false);
        if (event.target == logoutModal) toggleModal(logoutModal, false);
        if (event.target == deleteConfirmModal) toggleModal(deleteConfirmModal, false);
    });

    skillForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = skillIdInput.value;
        const isEdit = !!id;
        const data = {
            nama_skill: document.getElementById('nama_skill').value,
            persentase_keahlian: parseInt(persentaseSlider.value, 10), // DIUBAH
        };

        const url = isEdit ? `${BASE_URL}/${id}` : BASE_URL;
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(await response.json().then(err => err.msg));
            toggleModal(skillModal, false);
            getSkills();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });

    confirmDeleteBtn.addEventListener('click', async () => {
        if (!idToDelete) return;
        try {
            const response = await fetch(`${BASE_URL}/${idToDelete}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(`Gagal menghapus data.`);
            toggleModal(deleteConfirmModal, false);
            getSkills();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
        idToDelete = null;
    });

    confirmLogoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('isLoggedIn');
        window.location.href = '../index.html';
    });

    // --- INISIALISASI ---
    navSlide();
    getSkills();
});