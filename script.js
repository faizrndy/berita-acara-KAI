/* ===============================
   HELPER
================================ */
const el = id => document.getElementById(id);

/* ===============================
   FORMAT TANGGAL & JAM
================================ */
function formatTanggalIndo(d) {
  if (!d) return "-";
  const b = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];
  const x = new Date(d);
  return `${x.getDate()} ${b[x.getMonth()]} ${x.getFullYear()}`;
}
const formatJam = j => j ? j.replace(":", ".") : "-";

/* ===============================
   MIRROR PERMINTAAN LAYANAN
================================ */
el("nama").addEventListener("input", e => el("pNama").innerText = e.target.value || "-");
el("unit").addEventListener("change", e => {
    const val = e.target.value || "-";
    el("pUnit").innerText = val;
    el("pUnitPernyataan").innerText = val;
  });
  
el("kontak").addEventListener("input", e => el("pKontak").innerText = e.target.value || "-");

/* ===============================
   WAKTU PENGERJAAN
================================ */
["tglMulai","jamMulai","tglSelesai","jamSelesai"].forEach(id => {
  el(id).addEventListener("change", () => {
    if (tglMulai.value && jamMulai.value && tglSelesai.value && jamSelesai.value) {
      el("pWaktu").innerHTML =
        `Tanggal : ${formatTanggalIndo(tglMulai.value)} Pukul : ${formatJam(jamMulai.value)}
         &nbsp;&nbsp;s.d&nbsp;&nbsp;
         Tanggal : ${formatTanggalIndo(tglSelesai.value)} Pukul : ${formatJam(jamSelesai.value)}`;
    } else {
      el("pWaktu").innerText = "-";
    }
  });
});

/* ===============================
   MASTER DATA
================================ */
const layananMap = {
  troubleshooting: [
    "Aplikasi","Jaringan","PC / Laptop","Printer","Lainnya : PIDS"
  ],
  instalasi: [
    "Aplikasi","Sistem Operasi","Jaringan","PC / Laptop","Printer","Lainnya"
  ]
};

/* ===============================
   GROUP DATA
================================ */
const groups = {
  troubleshooting: { label: "Troubleshooting", code: 1, items: [] },
  instalasi: { label: "Instalasi", code: 2, items: [] }
};

/* ===============================
   POPULATE JENIS
================================ */
el("kategoriLayanan").addEventListener("change", e => {
  el("jenisLayanan").innerHTML = `<option value="">-- Pilih --</option>`;
  (layananMap[e.target.value] || []).forEach(j => {
    const o = document.createElement("option");
    o.value = o.textContent = j;
    el("jenisLayanan").appendChild(o);
  });
});

/* ===============================
   TAMBAH BARIS
================================ */
el("addRow").addEventListener("click", () => {
  const key = el("kategoriLayanan").value;
  if (!key) return alert("Pilih kategori layanan terlebih dahulu");

  groups[key].items.push({
    jenis: el("jenisLayanan").value || "-",
    detail: el("detailPekerjaan").value || "-",
    status: el("statusLayanan").value || "-",
    ket: el("keterangan").value || "-"
  });

  el("detailPekerjaan").value = "";
  el("statusLayanan").value = "";
  el("keterangan").value = "";

  renderTable();
});

/* ===============================
   HAPUS BARIS TERAKHIR (PER KATEGORI)
================================ */
el("removeRow").addEventListener("click", () => {
  const key = el("kategoriLayanan").value;
  if (!key) return alert("Pilih kategori layanan dulu");

  if (groups[key].items.length === 0) {
    alert("Tidak ada baris yang bisa dihapus");
    return;
  }

  groups[key].items.pop();
  renderTable();
});

/* ===============================
   RENDER TABLE (FINAL & RAPI)
================================ */
function renderTable() {
  const tbody = el("layananBody");
  tbody.innerHTML = "";
  let no = 1;

  Object.values(groups).forEach(group => {
    group.items.forEach((item, index) => {
      const nomorJenis = `${group.code}.${index + 1}`;

      tbody.innerHTML += `
        <tr>
          ${
            index === 0
              ? `<td rowspan="${group.items.length}">${no}</td>
                 <td rowspan="${group.items.length}">${group.label}</td>`
              : ""
          }
          <td>${nomorJenis} &nbsp;|&nbsp; ${item.jenis}</td>
          <td>${item.detail}</td>
          <td style="text-align:center">${item.status}</td>
          <td>${item.ket}</td>
        </tr>
      `;
    });

    if (group.items.length > 0) no++;
  });
}
