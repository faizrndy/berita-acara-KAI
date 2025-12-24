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
el("nama").addEventListener("input", e =>
  el("pNama").innerText = e.target.value || "-"
);

el("unit").addEventListener("change", e => {
  const val = e.target.value || "-";
  el("pUnit").innerText = val;
  el("pUnitPernyataan").innerText = val;
});

el("kontak").addEventListener("input", e =>
  el("pKontak").innerText = e.target.value || "-"
);

/* ===============================
   WAKTU PENGERJAAN
================================ */
["tglMulai","jamMulai","tglSelesai","jamSelesai"].forEach(id => {
  el(id).addEventListener("change", () => {
    if (
      el("tglMulai").value &&
      el("jamMulai").value &&
      el("tglSelesai").value &&
      el("jamSelesai").value
    ) {
      el("pWaktu").innerHTML =
        `Tanggal : ${formatTanggalIndo(el("tglMulai").value)} Pukul : ${formatJam(el("jamMulai").value)}
         &nbsp;&nbsp;s.d&nbsp;&nbsp;
         Tanggal : ${formatTanggalIndo(el("tglSelesai").value)} Pukul : ${formatJam(el("jamSelesai").value)}`;
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
   TAMBAH / HAPUS BARIS
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

el("removeRow").addEventListener("click", () => {
  const key = el("kategoriLayanan").value;
  if (!key || groups[key].items.length === 0) return;
  groups[key].items.pop();
  renderTable();
});

/* ===============================
   RENDER TABLE
================================ */
function renderTable() {
  const tbody = el("layananBody");
  tbody.innerHTML = "";
  let no = 1;

  Object.values(groups).forEach(group => {
    group.items.forEach((item, i) => {
      tbody.innerHTML += `
        <tr>
          ${i === 0 ? `
            <td rowspan="${group.items.length}">${no}</td>
            <td rowspan="${group.items.length}">${group.label}</td>
          ` : ""}
          <td>${group.code}.${i + 1} | ${item.jenis}</td>
          <td>${item.detail}</td>
          <td style="text-align:center">${item.status}</td>
          <td>${item.ket}</td>
        </tr>
      `;
    });
    if (group.items.length) no++;
  });
}

/* ===============================
   KEPUTUSAN
================================ */
el("keputusan").addEventListener("change", e => {
  el("pKeputusan").innerText = e.target.value
    ? `Selanjutnya, ${e.target.value}`
    : "Selanjutnya, -";
});

/* ===============================
   MIRROR NAMA & NIPP
================================ */
["StafIT","User"].forEach(role => {
  el(`nama${role}`).addEventListener("input", e =>
    el(`pNama${role}`).innerText = e.target.value || "-"
  );
  el(`nipp${role}`).addEventListener("input", e =>
    el(`pNipp${role}`).innerText = e.target.value || "-"
  );
});

/* ===============================
   ENGINE TTD (UNIVERSAL)
================================ */
function setupTTD(canvasId, imgId, clearBtnId, lockBtnId) {
  const canvas = el(canvasId);
  const ctx = canvas.getContext("2d");
  const img = el(imgId);
  const clearBtn = el(clearBtnId);
  const lockBtn = el(lockBtnId);

  let drawing = false;
  let locked = false;
  let lastX = 0, lastY = 0;

  /* SMOOTH DRAW */
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#000";

  const getPos = e => {
    const r = canvas.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: x - r.left, y: y - r.top };
  };

  const start = e => {
    if (locked) return;
    drawing = true;
    const p = getPos(e);
    lastX = p.x; lastY = p.y;
    e.preventDefault();
  };

  const move = e => {
    if (!drawing || locked) return;
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastX = p.x; lastY = p.y;
    e.preventDefault();
  };

  const stop = () => {
    if (!drawing) return;
    drawing = false;
    img.src = canvas.toDataURL("image/png");
  };

  /* EVENTS */
  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", move);
  canvas.addEventListener("mouseup", stop);
  canvas.addEventListener("mouseleave", stop);

  canvas.addEventListener("touchstart", start);
  canvas.addEventListener("touchmove", move);
  canvas.addEventListener("touchend", stop);

  clearBtn.addEventListener("click", () => {
    if (locked) return alert("TTD terkunci.");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    img.src = "";
  });

  lockBtn.addEventListener("click", () => {
    locked = !locked;
    canvas.classList.toggle("locked", locked);
    lockBtn.innerText = locked ? "🔓 Buka TTD" : "🔒 Kunci TTD";
  });
}

/* ===============================
   INIT TTD (3 ROLE)
================================ */
setupTTD("canvasStafIT", "imgTtdStafIT", "clearStafIT", "lockStafIT");
setupTTD("canvasUser", "imgTtdUser", "clearUser", "lockUser");
setupTTD(
  "canvasMengetahui",
  "imgTtdMengetahui",
  "clearMengetahui",
  "lockMengetahui"
);
/* 👉 nanti tinggal tambah:
setupTTD("canvasMengetahui","imgTtdMengetahui","clearMengetahui","lockMengetahui");
*/
function printDokumen() {
  window.print();
}

function downloadPDF() {

  // VALIDASI TTD
  if (!el("imgTtdStafIT").src) {
    alert("TTD Staf IT belum diisi");
    return;
  }
  if (!el("imgTtdUser").src) {
    alert("TTD User belum diisi");
    return;
  }
  if (!el("imgTtdMengetahui").src) {
    alert("TTD Mengetahui belum diisi");
    return;
  }

  const element = document.querySelector(".page");

  const opt = {
    margin: 10,
    filename: "Berita_Acara_IT.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  html2pdf().set(opt).from(element).save();
}
