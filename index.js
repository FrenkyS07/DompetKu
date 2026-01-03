var selectedRow = null;

// 1. Panggil showData saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', function () {
    showData();
    updateDashboard();
});

const inputUang = document.getElementById('jumlahUang');
inputUang.addEventListener('keyup', function (e) {
    let value = this.value.replace(/\./g, '');

    if (value) {
        let format = parseInt(value).toLocaleString('id-ID');
        this.value = format;
    } else {
        this.value = '';
    }
});

function onFormSubmit() {
    var formData = readFormData();

    if (formData.namaTransaksi === "" || formData.jumlahUang === "" || formData.jenisTransaksi === "" || formData.kategoriTransaksi === "") {
        alert("Mohon lengkapi semua field sebelum submit.");
        return;
    }

    if (selectedRow == null)
        insertNewRecord(formData);
    else
        updateRecord(formData);

    resetForm();
    saveData();
}

function readFormData() {
    var formData = {};
    formData["namaTransaksi"] = document.getElementById("namaTransaksi").value;

    var formatUang = document.getElementById("jumlahUang").value;
    formatUang = formatUang.replace(/\./g, '');
    formData["jumlahUang"] = formatUang;
    formData["jenisTransaksi"] = document.querySelector('select[name="jenis"]').value;
    formData["kategoriTransaksi"] = document.querySelector('select[name="kategori"]').value;
    return formData;
}

function insertNewRecord(data) {
    var table = document.getElementById("tableTransaksi").getElementsByTagName('tbody')[0];
    var newRow = table.insertRow(table.length);

    //Nama
    var cell1 = newRow.insertCell(0);
    cell1.innerHTML = data.namaTransaksi;
    cell1.classList.add("font-bold");

    //Jumlah
    var cell2 = newRow.insertCell(1);
    if (data.jenisTransaksi === "pemasukan") {
        cell2.innerHTML = "+ Rp " + data.jumlahUang;
        cell2.className = "text-green";
    } else if (data.jenisTransaksi === "pengeluaran") {
        cell2.innerHTML = "- Rp " + data.jumlahUang;
        cell2.className = "text-red";
    }

    if (data.jenisTransaksi.toLowerCase() === "pemasukan") {
        newRow.classList.add("bg-green-row"); // Tambah class Hijau ke BARIS
    } else {
        newRow.classList.add("bg-red-row");   // Tambah class Merah ke BARIS
    }

    //Kategori
    var cell3 = newRow.insertCell(2);
    cell3.innerHTML = data.kategoriTransaksi;
    cell3.className = "desktop-only";

    //Jenis
    var cell4 = newRow.insertCell(3);
    cell4.innerHTML = data.jenisTransaksi;
    cell4.className = "desktop-only";

    //Tombol Aksi
    var cell5 = newRow.insertCell(4);
    cell5.innerHTML = `<a onclick="onEdit(this)" class="action-btn edit-btn" style="background:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; font-weight:bold;">Edit</a>
                       <a onclick="onDelete(this)" class="action-btn delete-btn" style="background:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; font-weight:bold; color:red;">Delete</a>`;
}

function resetForm() {
    document.getElementById("namaTransaksi").value = "";
    document.getElementById("jumlahUang").value = "";
    document.querySelector('select[name="jenis"]').value = "";
    document.querySelector('select[name="kategori"]').value = "";
    selectedRow = null;
}

function onEdit(td) {
    selectedRow = td.parentElement.parentElement;

    // Ambil data dari tabel ke form
    document.getElementById("namaTransaksi").value = selectedRow.cells[0].innerHTML;

    // Bersihkan format "Rp", "+", "-" agar jadi angka murni
    var uangText = selectedRow.cells[1].innerHTML;
    var uangBersih = uangText.replace(/[^0-9]/g, '');
    document.getElementById("jumlahUang").value = parseInt(uangBersih).toLocaleString('id-ID');

    document.getElementById("kategori").value = selectedRow.cells[2].innerHTML;
    document.getElementById("jenis").value = selectedRow.cells[3].innerHTML;
}

function onDelete(td) {
    if (confirm('Yakin ingin menghapus data ini?')) {
        var row = td.parentElement.parentElement;
        row.parentElement.removeChild(row);
        resetForm();
        saveData();
    }
}

function updateRecord(formData) {
    selectedRow.cells[0].innerHTML = formData.namaTransaksi;

    if (formData.jenisTransaksi.toLowerCase() === "pemasukan") {
        selectedRow.cells[1].innerHTML = "+ Rp " + formData.jumlahUang;
        selectedRow.cells[1].className = "text-green";
    } else {
        selectedRow.cells[1].innerHTML = "- Rp " + formData.jumlahUang;
        selectedRow.cells[1].className = "text-red";
    }

    selectedRow.cells[2].innerHTML = formData.kategoriTransaksi;
    selectedRow.cells[3].innerHTML = formData.jenisTransaksi;

    saveData(); // Simpan perubahan setelah edit
}

function saveData() {
    var table = document.getElementById("tableTransaksi").getElementsByTagName('tbody')[0];
    var data = [];

    // Loop baris tabel
    for (var i = 0; i < table.rows.length; i++) {
        var row = table.rows[i];

        // Bersihkan angka dari simbol sebelum disimpan
        var rawUang = row.cells[1].innerText.replace(/[^0-9]/g, '');

        var rowData = {
            namaTransaksi: row.cells[0].innerHTML,
            jumlahUang: rawUang,
            kategoriTransaksi: row.cells[2].innerHTML,
            jenisTransaksi: row.cells[3].innerHTML
        };
        data.push(rowData);
    }
    // Simpan ke LocalStorage
    localStorage.setItem('data', JSON.stringify(data));

    updateDashboard();
}

function showData() {
    var data = JSON.parse(localStorage.getItem('data')) || [];

    var table = document.getElementById("tableTransaksi").getElementsByTagName('tbody')[0];
    table.innerHTML = "";

    data.forEach(function (item) {
        insertNewRecord(item);
    });
}

function updateDashboard() {
    var data = JSON.parse(localStorage.getItem('data')) || [];
    var totalPemasukan = 0;
    var totalPengeluaran = 0;

    data.forEach(function (item) {
        var angka = parseInt(item.jumlahUang);
        if (item.jenisTransaksi === "pemasukan") {
            totalPemasukan += angka;
        } else if (item.jenisTransaksi === "pengeluaran") {
            totalPengeluaran += angka;
        }
    });

    var saldoAkhir = totalPemasukan - totalPengeluaran;

    document.getElementById("totalPemasukan").innerText = "Rp " + totalPemasukan.toLocaleString('id-ID');
    document.getElementById("totalPengeluaran").innerText = "Rp " + totalPengeluaran.toLocaleString('id-ID');
    document.getElementById("saldoAwal").innerText = "Rp " + saldoAkhir.toLocaleString('id-ID');
}