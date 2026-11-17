var selectedRow = null;

document.addEventListener('DOMContentLoaded', function () {
    showData();
    updateDashboard();
});

const inputUang = document.getElementById('jumlahUang');
inputUang.addEventListener('keyup', function () {
    let value = this.value.replace(/[^0-9]/g, '');

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

    if (selectedRow == null) {
        insertNewRecord(formData);
    } else {
        updateRecord(formData);
    }

    resetForm();
    saveData();
}

function readFormData() {
    var formData = {};
    formData["namaTransaksi"] = document.getElementById("namaTransaksi").value.trim();

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

    var nominalFormatted = parseInt(data.jumlahUang).toLocaleString('id-ID');

    // Nama
    var cell1 = newRow.insertCell(0);
    cell1.innerHTML = data.namaTransaksi;
    cell1.classList.add("font-bold");

    // Jumlah & Warna Baris
    var cell2 = newRow.insertCell(1);
    if (data.jenisTransaksi.toLowerCase() === "pemasukan") {
        cell2.innerHTML = "+ Rp " + nominalFormatted;
        cell2.className = "text-green";
        newRow.classList.add("bg-green-row");
    } else {
        cell2.innerHTML = "- Rp " + nominalFormatted;
        cell2.className = "text-red";
        newRow.classList.add("bg-red-row");
    }

    // Kategori
    var cell3 = newRow.insertCell(2);
    cell3.innerHTML = data.kategoriTransaksi;
    cell3.className = "desktop-only";

    // Jenis
    var cell4 = newRow.insertCell(3);
    cell4.innerHTML = data.jenisTransaksi;
    cell4.className = "desktop-only";

    // Tombol Aksi
    var cell5 = newRow.insertCell(4);
    cell5.innerHTML = `<div class="action-group">
                           <button type="button" onclick="onEdit(this)" class="action-btn edit-btn">Edit</button>
                           <button type="button" onclick="onDelete(this)" class="action-btn delete-btn">Hapus</button>
                       </div>`;
}

function resetForm() {
    document.getElementById("namaTransaksi").value = "";
    document.getElementById("jumlahUang").value = "";
    document.querySelector('select[name="jenis"]').value = "";
    document.querySelector('select[name="kategori"]').value = "";
    selectedRow = null;
}

function onEdit(btn) {
    selectedRow = btn.closest('tr');

    document.getElementById("namaTransaksi").value = selectedRow.cells[0].innerHTML;

    var uangText = selectedRow.cells[1].innerHTML;
    var uangBersih = uangText.replace(/[^0-9]/g, '');
    document.getElementById("jumlahUang").value = parseInt(uangBersih).toLocaleString('id-ID');

    document.getElementById("kategori").value = selectedRow.cells[2].innerHTML;
    document.getElementById("jenis").value = selectedRow.cells[3].innerHTML;
}

function onDelete(btn) {
    if (confirm('Yakin ingin menghapus transaksi ini?')) {
        var row = btn.closest('tr');
        row.parentElement.removeChild(row);
        resetForm();
        saveData();
    }
}

function updateRecord(formData) {
    var nominalFormatted = parseInt(formData.jumlahUang).toLocaleString('id-ID');

    selectedRow.cells[0].innerHTML = formData.namaTransaksi;
    selectedRow.classList.remove("bg-green-row", "bg-red-row");

    if (formData.jenisTransaksi.toLowerCase() === "pemasukan") {
        selectedRow.cells[1].innerHTML = "+ Rp " + nominalFormatted;
        selectedRow.cells[1].className = "text-green";
        selectedRow.classList.add("bg-green-row");
    } else {
        selectedRow.cells[1].innerHTML = "- Rp " + nominalFormatted;
        selectedRow.cells[1].className = "text-red";
        selectedRow.classList.add("bg-red-row");
    }

    selectedRow.cells[2].innerHTML = formData.kategoriTransaksi;
    selectedRow.cells[3].innerHTML = formData.jenisTransaksi;

    saveData();
}

function saveData() {
    var table = document.getElementById("tableTransaksi").getElementsByTagName('tbody')[0];
    var data = [];

    for (var i = 0; i < table.rows.length; i++) {
        var row = table.rows[i];
        var rawUang = row.cells[1].innerText.replace(/[^0-9]/g, '');

        var rowData = {
            namaTransaksi: row.cells[0].innerHTML,
            jumlahUang: rawUang,
            kategoriTransaksi: row.cells[2].innerHTML,
            jenisTransaksi: row.cells[3].innerHTML
        };
        data.push(rowData);
    }

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
        var angka = parseInt(item.jumlahUang) || 0;
        if (item.jenisTransaksi === "pemasukan") {
            totalPemasukan += angka;
        } else if (item.jenisTransaksi === "pengeluaran") {
            totalPengeluaran += angka;
        }
    });

    var saldoAkhir = totalPemasukan - totalPengeluaran;
    var elemenSaldo = document.getElementById("saldoAwal");

    document.getElementById("totalPemasukan").innerText = "Rp " + totalPemasukan.toLocaleString('id-ID');
    document.getElementById("totalPengeluaran").innerText = "Rp " + totalPengeluaran.toLocaleString('id-ID');
    elemenSaldo.innerText = "Rp " + saldoAkhir.toLocaleString('id-ID');

    if (saldoAkhir < 0) {
        elemenSaldo.style.color = "#F43F5E";
    } else {
        elemenSaldo.style.color = "#FFFFFF";
    }
}