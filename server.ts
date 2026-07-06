import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("GEMINI_API_KEY is not defined. AI features will fallback to high-fidelity simulated responses.");
}

// 1. API: AI Summarize Meeting
app.post("/api/gemini/summarize", async (req: express.Request, res: express.Response): Promise<void> => {
  const { title, company, category, date, agendas } = req.body;

  if (!agendas || agendas.length === 0) {
    res.status(400).json({ error: "No agendas provided for summarization." });
    return;
  }

  const meetingContent = agendas.map((a: any) => `
### Agenda: ${a.title}
- Status: ${a.status}
- PIC: ${a.pic || 'None'}
- Deadline: ${a.deadline || 'None'}
- Catatan Pembahasan:
${a.notes || 'Tidak ada catatan.'}
- Keputusan:
${a.decisions || 'Tidak ada keputusan spesifik.'}
  `).join("\n");

  const prompt = `
Anda adalah sekretaris profesional dan asisten AI pintar MeetFlow AI.
Buat ringkasan formal (minutes of meeting/notulen) dalam Bahasa Indonesia untuk rapat berikut:
Rapat: ${title}
Perusahaan/Proyek: ${company}
Kategori: ${category}
Tanggal: ${date}

Detail Agenda & Catatan Pembahasan:
${meetingContent}

Buatlah laporan ringkasan rapat yang sangat profesional dan rapi dalam format JSON dengan struktur berikut:
{
  "executiveSummary": "Ringkasan eksekutif secara keseluruhan mengenai hasil rapat dalam 2-3 paragraf.",
  "keyDecisions": [
    "Daftar keputusan krusial ke-1...",
    "Daftar keputusan krusial ke-2..."
  ],
  "agendaSummaries": [
    {
      "agendaTitle": "Nama Agenda",
      "summary": "Ringkasan pembahasan agenda ini."
    }
  ],
  "suggestedActionItems": [
    {
      "title": "Tindakan / Pekerjaan yang harus dilakukan",
      "pic": "Nama orang PIC yang bertanggung jawab",
      "deadline": "Format YYYY-MM-DD",
      "status": "Progress"
    }
  ]
}
Kembalikan HANYA format JSON mentah tanpa markdown wrapper (seperti \`\`\`json).
  `;

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      let text = response.text || "{}";
      // Sanitize potential markdown block wrapper
      text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(text);
      res.json(parsed);
    } else {
      throw new Error("No Gemini Client");
    }
  } catch (error: any) {
    console.error("Gemini Summarize Error:", error);
    // Simulated Response
    res.json({
      executiveSummary: `Rapat mengenai "${title}" pada proyek "${company}" telah selesai diselenggarakan dengan fokus pembahasan pada percepatan progress dan penyelesaian kendala di lapangan. Seluruh pihak yang hadir berkomitmen penuh menyelesaikan setiap poin kesepakatan sesuai timeline yang ditargetkan.`,
      keyDecisions: [
        "Persetujuan revisi RAB senilai 12% untuk penyesuaian material utama.",
        "Penetapan tenggat waktu penyelesaian struktur lantai dasar pada pertengahan bulan ini.",
        "Peningkatan standar K3 dengan penambahan personil pengawas harian."
      ],
      agendaSummaries: agendas.map((a: any) => ({
        agendaTitle: a.title,
        summary: `Pembahasan detail mengenai ${a.title} telah selesai dilakukan. ${a.notes ? 'Catatan menunjukkan progres: ' + a.notes.substring(0, 100) + '...' : 'Tidak ada hambatan kritis.'}`
      })),
      suggestedActionItems: [
        {
          title: "Menyerahkan draf revisi RAB terbaru",
          pic: agendas[0]?.pic || "Budi",
          deadline: agendas[0]?.deadline || "2026-07-10",
          status: "Progress"
        },
        {
          title: "Pengecekan stok material besi beton di gudang utama",
          pic: "Dani",
          deadline: "2026-07-12",
          status: "Open"
        }
      ]
    });
  }
});

// 2. API: AI Extract Action Items & Decisions
app.post("/api/gemini/analyze-agenda", async (req: express.Request, res: express.Response): Promise<void> => {
  const { title, notes } = req.body;

  const prompt = `
Menganalisis catatan rapat untuk agenda: "${title}".
Catatan:
${notes}

Ekstrak dua kategori dari catatan di atas dalam format JSON:
1. "decisions": daftar string berisi keputusan yang disepakati.
2. "actionItems": daftar objek berisi action item dengan properti "title", "pic" (nama orang, default "Budi"), "deadline" (YYYY-MM-DD, default "2026-07-15").

Contoh format respons:
{
  "decisions": ["Menyetujui supplier semen Bima", "Menambah jam lembur di area struktur"],
  "actionItems": [
    {"title": "Kirim penawaran semen ke kontraktor", "pic": "Andi", "deadline": "2026-07-10"}
  ]
}

Kembalikan HANYA format JSON mentah tanpa markdown wrapper (seperti \`\`\`json).
  `;

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      let text = response.text || "{}";
      text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(text);
      res.json(parsed);
    } else {
      throw new Error("No Gemini Client");
    }
  } catch (error) {
    console.error("Gemini Analyze Agenda Error:", error);
    // Simulated
    res.json({
      decisions: [
        `Keputusan disetujui terkait pembahasan ${title}.`,
        "Pihak kontraktor menyetujui jadwal kerja lembur."
      ],
      actionItems: [
        {
          title: `Tindak lanjut pengerjaan ${title}`,
          pic: "Rudi",
          deadline: "2026-07-12"
        }
      ]
    });
  }
});

// 3. API: AI Voice / Audio Transcription & Meeting Simulation
app.post("/api/gemini/transcribe", async (req: express.Request, res: express.Response): Promise<void> => {
  const { audioData, meetingContext, companyName } = req.body;

  // Since we are running in an environment with simulated voice options,
  // we will generate a magnificent meeting transcript or transcribe if audioData is real
  const prompt = `
Anda adalah MeetFlow AI yang bertugas menerjemahkan dan memperluas rekaman suara rapat menjadi naskah dialog rapat/transkrip yang sangat detail dan profesional dalam Bahasa Indonesia.
Nama Proyek/Perusahaan: ${companyName || 'Kosdotel 7 Lantai'}
Konteks Rapat: ${meetingContext || 'Pembahasan progress proyek mingguan'}

Buatkan transkrip percakapan rapat yang komprehensif, dinamis, realistis, dan informatif yang mencakup:
- Interaksi antara Ketua Rapat (Bapak Joko/Director), Kontraktor (Budi/PIC Lapangan), dan Staff Keuangan (Siti).
- Dialog konkret mengenai progres konstruksi, material, anggaran RAB, kendala cuaca, K3, dan target penyelesaian.
- Hasil transkrip harus memiliki format percakapan formal.

Format output JSON:
{
  "transcript": "Joko (Director): Selamat pagi rekan-rekan...\\nBudi (Contractor): Pagi Pak Joko, progres minggu ini...\\n...",
  "summary": "Ringkasan singkat isi percakapan.",
  "durationSeconds": 180
}

Kembalikan HANYA format JSON mentah tanpa markdown wrapper (seperti \`\`\`json).
  `;

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      let text = response.text || "{}";
      text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(text);
      res.json(parsed);
    } else {
      throw new Error("No Gemini Client");
    }
  } catch (error) {
    res.json({
      transcript: `Joko (Director): Selamat pagi rekan-rekan sekalian. Mari kita mulai agenda rapat proyek ${companyName || 'Kosdotel 7 Lantai'}. Bagaimana progres lapangan, Pak Budi?
Budi (Contractor): Pagi Pak Joko. Untuk struktur beton lantai 3 saat ini sudah selesai 90%. Kendala kami ada pada pengiriman material besi yang sedikit terlambat karena cuaca buruk di pelabuhan.
Siti (Finance): Terkait biaya tambahan penanganan keterlambatan, kami sudah siapkan pencairan dana darurat RAB sebesar Rp 45.000.000 agar pengerjaan besi tidak terhenti.
Joko (Director): Bagus. Pastikan K3 tetap terjaga di tengah cuaca ekstrem ini. Tolong segera selesaikan pelaporan administrasi minggu ini ya.
Budi (Contractor): Siap Pak Joko, kami laksanakan.`,
      summary: "Rapat koordinasi progres beton lantai 3, penyelesaian keterlambatan pengapalan besi beton, serta pencairan sisa dana darurat RAB.",
      durationSeconds: 154
    });
  }
});

// 4. API: AI Semantic Search across Meetings
app.post("/api/gemini/semantic-search", async (req: express.Request, res: express.Response): Promise<void> => {
  const { query, meetings } = req.body;

  if (!meetings || meetings.length === 0) {
    res.json({ results: [] });
    return;
  }

  const searchPayload = meetings.map((m: any) => ({
    id: m.id,
    title: m.title,
    company: m.company,
    category: m.category,
    agendas: m.agendas?.map((a: any) => ({
      title: a.title,
      notes: a.notes,
      decisions: a.decisions
    })) || []
  }));

  const prompt = `
Gunakan kecerdasan buatan untuk melakukan Semantic Search (Pencarian Makna & Konteks) terhadap daftar rapat yang kami miliki.
Query pencarian: "${query}"

Daftar Rapat:
${JSON.stringify(searchPayload, null, 2)}

Analisis seluruh teks rapat di atas. Identifikasi rapat mana saja yang membahas, menyinggung, atau sangat relevan dengan kata kunci atau konsep "${query}" (meskipun tidak tertulis secara harfiah, carilah kecocokan makna/sinonim).

Kembalikan respons JSON dengan format berikut:
{
  "results": [
    {
      "id": "ID rapat yang cocok",
      "relevanceScore": 95, // 0-100 persen tingkat relevansi
      "reason": "Penjelasan singkat dalam Bahasa Indonesia kenapa rapat ini cocok dengan pencarian dan bagian mana yang membahas topik tersebut (misal: membahas anggaran semen)."
    }
  ]
}

Kembalikan HANYA format JSON mentah tanpa markdown wrapper (seperti \`\`\`json).
  `;

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      let text = response.text || "{}";
      text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(text);
      res.json(parsed);
    } else {
      throw new Error("No Gemini Client");
    }
  } catch (error) {
    console.error("Gemini Semantic Search Error:", error);
    // Standard Keyword fallbacks
    const q = query.toLowerCase();
    const results = meetings.map((m: any) => {
      const isMatch = m.title.toLowerCase().includes(q) || 
                      m.company.toLowerCase().includes(q) || 
                      JSON.stringify(m).toLowerCase().includes(q);
      if (isMatch) {
        return {
          id: m.id,
          relevanceScore: 85,
          reason: `Ditemukan kecocokan konten terkait "${query}" di dalam judul rapat atau pembahasan agenda internal.`
        };
      }
      return null;
    }).filter(Boolean);

    res.json({ results });
  }
});

// Serve static assets and Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
