/* ===============================
   HELPER
================================ */
const el = id => document.getElementById(id);

/* ===============================
   TEMPLATE ELEMENTS
================================ */
const templateSelect    = el("templateSelect");
const templateBA        = el("template-ba-it");
const templateChecklist = el("template-checklist");

const previewBA         = el("preview-ba-it");
const previewChecklist  = el("preview-checklist");

/* ===============================
   TEMPLATE STATE
================================ */
let activeTemplate = null;

/* ===============================
   TEMPLATE SWITCHER
================================ */
templateSelect.addEventListener("change", e => {
  activeTemplate = e.target.value;

  templateBA.style.display = "none";
  templateChecklist.style.display = "none";
  previewBA.style.display = "none";
  previewChecklist.style.display = "none";

  if (activeTemplate === "ba-it") {
    templateBA.style.display = "block";
    previewBA.style.display = "block";
  }

  if (activeTemplate === "checklist") {
    templateChecklist.style.display = "block";
    previewChecklist.style.display = "block";
  }
});

/* ===============================
   GUARD (ONLY BA IT)
================================ */
function guardBA() {
  return activeTemplate === "ba-it";
}

/* ===============================
   GUARD (ONLY CHECKLIST)
================================ */
function guardChecklist() {
  return activeTemplate === "checklist";
}


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
   MIRROR INPUT → PREVIEW
================================ */
["nama","kontak"].forEach(id => {
  el(id)?.addEventListener("input", e => {
    if (!guardBA()) return;
    el("p" + id.charAt(0).toUpperCase() + id.slice(1)).innerText =
      e.target.value || "-";
  });
});

el("unit")?.addEventListener("change", e => {
  if (!guardBA()) return;
  const v = e.target.value || "-";
  el("pUnit").innerText = v;
  el("pUnitPernyataan").innerText = v;
});

/* ===============================
   WAKTU PENGERJAAN
================================ */
["tglMulai","jamMulai","tglSelesai","jamSelesai"].forEach(id => {
  el(id)?.addEventListener("change", () => {
    if (!guardBA()) return;

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
   ENGINE TTD (WAJIB ADA)
================================ */
function setupTTD(canvasId, imgId, clearBtnId, lockBtnId) {
  const canvas = el(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const img = el(imgId);
  const clearBtn = el(clearBtnId);
  const lockBtn = el(lockBtnId);

  let drawing = false;
  let locked = false;
  let lastX = 0, lastY = 0;

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
    if (locked || !guardBA()) return;
    drawing = true;
    const p = getPos(e);
    lastX = p.x;
    lastY = p.y;
    e.preventDefault();
  };

  const move = e => {
    if (!drawing || locked) return;
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastX = p.x;
    lastY = p.y;
    e.preventDefault();
  };

  const stop = () => {
    if (!drawing) return;
    drawing = false;
    img.src = canvas.toDataURL("image/png");
  };

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
setupTTD("canvasMengetahui", "imgTtdMengetahui", "clearMengetahui", "lockMengetahui");

/* ===============================
   PRINT
================================ */
function printDokumen() {
  if (!guardBA()) {
    alert("Pilih template Berita Acara IT terlebih dahulu");
    return;
  }
  previewBA.style.display = "block";
  previewChecklist.style.display = "none";
  window.print();
}

/* ===============================
   DOWNLOAD PDF
================================ */
function downloadPDF() {
  if (!guardBA()) {
    alert("Pilih template Berita Acara IT terlebih dahulu");
    return;
  }

  if (!el("imgTtdStafIT").src) return alert("TTD Staf IT belum diisi");
  if (!el("imgTtdUser").src) return alert("TTD User belum diisi");
  if (!el("imgTtdMengetahui").src) return alert("TTD Mengetahui belum diisi");

  const element = document.querySelector("#preview-ba-it .page");

  html2pdf().set({
    margin: 0,
    filename: "Berita_Acara_IT.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["avoid-all"] }
  }).from(element).save();
}

/* ===============================
   MASTER DATA LAYANAN
================================ */
const layananMap = {
  troubleshooting: ["Aplikasi","Jaringan","PC / Laptop","Printer","Lainnya"],
  instalasi: ["Aplikasi","Sistem Operasi","Jaringan","PC / Laptop","Printer","Lainnya"]
};

const groups = {
  troubleshooting: { label: "Troubleshooting", code: 1, items: [] },
  instalasi: { label: "Instalasi", code: 2, items: [] }
};

/* ===============================
   POPULATE JENIS LAYANAN
================================ */
el("kategoriLayanan")?.addEventListener("change", e => {
  if (!guardBA()) return;

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
el("addRow")?.addEventListener("click", () => {
  if (!guardBA()) return;

  const key = el("kategoriLayanan").value;
  if (!key) return alert("Pilih kategori layanan terlebih dahulu");

  groups[key].items.push({
    jenis: el("jenisLayanan").value || "-",
    detail: el("detailPekerjaan").value || "-",
    status: el("statusLayanan").value || "-",
    ket: el("keterangan").value || "-"
  });

  el("detailPekerjaan").value = "";
  el("keterangan").value = "";

  renderTable();
});

el("removeRow")?.addEventListener("click", () => {
  if (!guardBA()) return;

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
         <td>
  <span class="jenis-prefix">${group.code}.${i + 1} |</span>
  <span class="jenis-text">${item.jenis}</span>
</td>

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
   MIRROR NAMA & NIPP
================================ */
["StafIT","User"].forEach(role => {
  el(`nama${role}`)?.addEventListener("input", e => {
    if (!guardBA()) return;
    el(`pNama${role}`).innerText = e.target.value || "-";
  });

  el(`nipp${role}`)?.addEventListener("input", e => {
    if (!guardBA()) return;
    el(`pNipp${role}`).innerText = e.target.value || "-";
  });
});


/* ===============================
   MIRROR CHECKLIST → PREVIEW
================================ */
const bindChecklist = (inputId, previewId) => {
  el(inputId)?.addEventListener("input", e => {
    if (!guardChecklist()) return;
    el(previewId).innerText = e.target.value || "-";
  });
};

// Tanggal Pemeriksaan
el("cTanggal")?.addEventListener("change", e => {
  if (!guardChecklist()) return;
  el("pCTanggal").innerText = formatTanggalIndo(e.target.value);
});

// Text input
bindChecklist("cPetugas", "pCPetugas");
bindChecklist("cPengguna", "pCPengguna");
bindChecklist("cInventaris", "pCInventaris");
bindChecklist("cMerk", "pCMerk");
bindChecklist("cSerial", "pCSerial");

// Dropdown Unit
el("cUnit")?.addEventListener("change", e => {
  if (!guardChecklist()) return;
  el("pCUnit").innerText = e.target.value || "-";
});

/* ===============================
   CHECKLIST TABLE DATA
================================ */
const checklistItems = [];


/* ===============================
   ADD ROW (CHECKLIST)
================================ */
/* ===============================
   ADD ROW (CHECKLIST) - FINAL
================================ */
el("addChecklistRow")?.addEventListener("click", () => {
  if (!guardChecklist()) return;

  // === VALIDASI PILIH APLIKASI ===
  if (!el("cApp").value) {
    alert("Pilih Aplikasi / Sistem");
    return;
  }

  let statusValue = "-";
  let appLabel = el("cApp").options[el("cApp").selectedIndex].text;

  /* ===============================
     KHUSUS SISTEM OPERASI
  ================================ */
  if (el("cApp").value === "os") {
    const os = [];
    if (el("osW").checked) os.push("W");
    if (el("osL").checked) os.push("L");
    if (el("osM").checked) os.push("M");

    if (os.length !== 1) {
      alert("Pilih tepat satu Sistem Operasi (W / L / M)");
      return;
    }

    statusValue = os[0]; // W / L / M
  }

  /* ===============================
     KHUSUS LAINNYA (INPUT MANUAL)
  ================================ */
  else if (el("cApp").value === "other") {
    if (!el("cAppOther").value.trim()) {
      alert("Isi nama aplikasi / sistem");
      return;
    }

    appLabel = el("cAppOther").value.trim();
    statusValue = el("cStatus").checked ? "✓" : "-";
  }

  /* ===============================
     SELAIN OS & LAINNYA
  ================================ */
  else {
    statusValue = el("cStatus").checked ? "✓" : "-";
  }

  /* ===============================
     PUSH KE TABLE
  ================================ */
  checklistItems.push({
    app: appLabel,
    status: statusValue,
    serial: el("cSerialApp").value || "-",
    versi: el("cVersi").value || "-",
    ket: el("cKet").value || "-"
  });

  /* ===============================
     RESET INPUT
  ================================ */
  el("cApp").value = "";
  el("cAppOther").value = "";
  el("cAppOtherWrap").style.display = "none";
  el("cStatus").checked = false;
  el("cSerialApp").value = "";
  el("cVersi").value = "";
  el("cKet").value = "";
  ["osW", "osL", "osM"].forEach(id => el(id).checked = false);

  renderChecklist();
});



/* ===============================
   REMOVE ROW
================================ */
el("removeChecklistRow")?.addEventListener("click", () => {
  if (!guardChecklist()) return;
  if (!checklistItems.length) return;
  checklistItems.pop();
  renderChecklist();
});

/* ===============================
   RENDER CHECKLIST TABLE
================================ */
/* ===============================
   RENDER CHECKLIST TABLE
================================ */
/* ===============================
   RENDER CHECKLIST TABLE
================================ */
function renderChecklist() {
  const tbody = el("checklistBody");
  tbody.innerHTML = "";

  checklistItems.forEach((item, i) => {

    let statusView = item.status;

    // === KHUSUS SISTEM OPERASI ===
    if (item.app.includes("Sistem Operasi")) {
      statusView = `
        <span class="os-check">
          <span class="box">☑</span>
          <span class="os-code">${item.status}</span>
        </span>
      `;
    }

    tbody.innerHTML += `
      <tr>
        <td style="text-align:center">${i + 1}</td>
        <td>${item.app}</td>
        <td style="text-align:center">${statusView}</td>
        <td>${item.serial}</td>
        <td>${item.versi}</td>
        <td>${item.ket}</td>
      </tr>
    `;
  });
}



/* ===============================
   STATUS TOGGLE (OS ONLY)
================================ */
/* ===============================
   STATUS TOGGLE (OS ONLY)
================================ */
el("cApp")?.addEventListener("change", e => {
  if (!guardChecklist()) return;

  const isOS = e.target.value === "os";

  el("statusNormal").style.display = isOS ? "none" : "block";
  el("statusOS").style.display = isOS ? "flex" : "none";

  // reset checkbox
  el("cStatus").checked = false;
  ["osW","osL","osM"].forEach(id => el(id).checked = false);
});

/* ===============================
   TOGGLE APP LAINNYA
================================ */
el("cApp")?.addEventListener("change", e => {
  if (!guardChecklist()) return;

  const isOther = e.target.value === "other";

  el("cAppOtherWrap").style.display = isOther ? "block" : "none";

  if (!isOther) {
    el("cAppOther").value = "";
  }
});

/* ===============================
   CHECKLIST ITEM DATA
================================ */
const itemChecklist = [];

/* ===============================
   ADD ITEM ROW
================================ */
el("addItemRow")?.addEventListener("click", () => {
  if (!guardChecklist()) return;

  if (!el("cItem").value) {
    alert("Pilih Item");
    return;
  }

  itemChecklist.push({
    item: el("cItem").value,
    status: el("cItemStatus").checked ? "☑ Ya" : "☐ Tidak",
    ket: el("cItemKet").value || "-"
  });

  // reset
  el("cItem").value = "";
  el("cItemStatus").checked = false;
  el("cItemKet").value = "";

  renderItemChecklist();
});

/* ===============================
   REMOVE ITEM ROW
================================ */
el("removeItemRow")?.addEventListener("click", () => {
  if (!guardChecklist()) return;
  if (!itemChecklist.length) return;

  itemChecklist.pop();
  renderItemChecklist();
});

/* ===============================
   RENDER ITEM CHECKLIST
================================ */
function renderItemChecklist() {
  const tbody = el("itemChecklistBody");
  tbody.innerHTML = "";

  itemChecklist.forEach((row, i) => {
    tbody.innerHTML += `
      <tr>
        <td style="text-align:center">${i + 1}</td>
        <td>${row.item}</td>
        <td style="text-align:center">${row.status}</td>
        <td>${row.ket}</td>
      </tr>
    `;
  });
}

/* ===============================
   CATATAN CHECKLIST → PREVIEW
================================ */
el("cCatatan")?.addEventListener("input", e => {
  if (!guardChecklist()) return;
  el("pCatatanChecklist").innerText = e.target.value.trim() || "-";
});
/* ===============================
   MIRROR KEPUTUSAN (DITERIMA / DITOLAK)
================================ */
el("keputusan")?.addEventListener("change", e => {
  if (!guardBA()) return;

  const val = e.target.value;
  el("pKeputusan").innerText = val
    ? `Selanjutnya, ${val}`
    : "Selanjutnya, -";
});


/* ===============================
   CHECKLIST TTD MIRROR (FINAL)
================================ */

// Tanggal Pemeriksaan → Tanggal TTD
el("cTanggal")?.addEventListener("change", e => {
  if (!guardChecklist()) return;
  el("pCTanggalTTD").innerText = formatTanggalIndo(e.target.value);
});

// Helper bind input → preview
const bindChecklistTTD = (inputId, previewId) => {
  el(inputId)?.addEventListener("input", e => {
    if (!guardChecklist()) return;
    el(previewId).innerText = e.target.value || "-";
  });
};

// Nama & NIPP
bindChecklistTTD("cNamaPetugas", "pCNamaPetugas");
bindChecklistTTD("cNippPetugas", "pCNippPetugas");
bindChecklistTTD("cNamaPengguna", "pCNamaPengguna");
bindChecklistTTD("cNippPengguna", "pCNippPengguna");

/* ===============================
   INIT TTD CHECKLIST
================================ */

function setupChecklistTTD(canvasId, imgId, clearBtnId, lockBtnId) {
  const canvas = el(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const img = el(imgId);
  const clearBtn = el(clearBtnId);
  const lockBtn = el(lockBtnId);

  let drawing = false;
  let locked = false;
  let lastX = 0, lastY = 0;

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
    if (locked || !guardChecklist()) return;
    drawing = true;
    const p = getPos(e);
    lastX = p.x;
    lastY = p.y;
    e.preventDefault();
  };

  const move = e => {
    if (!drawing || locked) return;
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastX = p.x;
    lastY = p.y;
    e.preventDefault();
  };

  const stop = () => {
    if (!drawing) return;
    drawing = false;
    img.src = canvas.toDataURL("image/png");
  };

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
   ACTIVATE CHECKLIST TTD
================================ */
setupChecklistTTD(
  "canvasChecklistPetugas",
  "imgChecklistPetugas",
  "clearChecklistPetugas",
  "lockChecklistPetugas"
);

setupChecklistTTD(
  "canvasChecklistPengguna",
  "imgChecklistPengguna",
  "clearChecklistPengguna",
  "lockChecklistPengguna"
);

function printChecklist() {
  const original = document.body.innerHTML;
  const content = document.getElementById("preview-checklist").outerHTML;

  document.body.innerHTML = content;
  window.print();
  document.body.innerHTML = original;
  location.reload();
}

function downloadChecklistPDF() {
  const element = document.getElementById("preview-checklist");

  const opt = {
    margin: 0,
    filename: 'Formulir_Checklist_Kesesuaian_IT.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    }
  };

  html2pdf().set(opt).from(element).save();
}

const cTanggal = document.getElementById("cTanggal");
const pCTanggal = document.getElementById("pCTanggal");
const pCTanggalTTD = document.getElementById("pCTanggalTTD");

const hari = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu"
];

const bulan = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember"
];

cTanggal.addEventListener("change", () => {
  if (!cTanggal.value) return;

  const d = new Date(cTanggal.value);
  const teksTanggal =
    `${hari[d.getDay()]}, ${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;

  // tampil di informasi umum
  pCTanggal.textContent = teksTanggal;

  // tampil di atas TTD
  pCTanggalTTD.textContent = teksTanggal;
});
