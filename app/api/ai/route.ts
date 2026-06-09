import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type } = body;
    const apiKey = process.env.GROQ_API_KEY;

    const isMock = !apiKey || apiKey.includes('placeholder') || apiKey.includes('random');

    if (type === 'analyze-activity') {
      const { activityName } = body;
      if (!activityName || !activityName.trim()) {
        return NextResponse.json({ error: 'Nama aktivitas wajib diisi.' }, { status: 400 });
      }

      if (isMock) {
        const query = activityName.toLowerCase();
        let calories = 300;
        let risks = ["Kelelahan berlebihan (overtraining syndrome)", "Cedera otot atau sendi karena kurang pemanasan", "Dehidrasi"];
        let stdName = activityName;

        if (query.includes('lari') || query.includes('jog')) {
          stdName = 'Lari / Jogging'; calories = 480; risks = ["Cedera sendi lutut dan kaki", "Dehidrasi berat akibat kurang minum", "Kram otot betis"];
        } else if (query.includes('sepeda')) {
          stdName = 'Bersepeda'; calories = 400; risks = ["Ketegangan otot punggung bawah", "Kelelahan fisik berlebih", "Nyeri sendi lutut"];
        } else if (query.includes('renang') || query.includes('berenang')) {
          stdName = 'Berenang'; calories = 550; risks = ["Kram otot mendadak saat di air", "Kelelahan otot bahu", "Iritasi mata akibat kaporit"];
        } else if (query.includes('gym') || query.includes('angkat') || query.includes('beban')) {
          stdName = 'Angkat Beban / Gym'; calories = 350; risks = ["Robeknya jaringan otot (strain/sprain)", "Cedera tulang belakang karena postur salah", "Hipertensi mendadak saat mengejan"];
        }

        return NextResponse.json({
          success: true,
          data: { activityName: stdName, calories, risks },
          note: 'Mode demo (API Key Groq belum diatur)'
        });
      }

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a fitness and health AI assistant. Analyze the given physical activity and estimate the calories burned per hour for a typical person. Also, list 3 specific health/safety risks if a person performs this activity excessively. You must respond in Indonesian. Return a valid JSON object matching this schema: {"activityName": "Standardized Name in Indonesian", "calories": number, "risks": ["risk 1", "risk 2", "risk 3"]}. Do not write any text outside the JSON object.'
            },
            {
              role: 'user',
              content: `Aktivitas: ${activityName}`
            }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!res.ok) {
        throw new Error(`Groq API returned status ${res.status}`);
      }

      const resData = await res.json();
      const aiContent = resData.choices?.[0]?.message?.content;
      return NextResponse.json({ success: true, data: JSON.parse(aiContent) });
    }

    if (type === 'analyze-food') {
      const { foodName } = body;
      if (!foodName || !foodName.trim()) {
        return NextResponse.json({ error: 'Nama makanan wajib diisi.' }, { status: 400 });
      }

      if (isMock) {
        const query = foodName.toLowerCase();
        let calories = 250;
        let protein = 6;
        let carbs = 35;
        let fat = 8;
        let fiber = 1.5;
        let portion = '1 porsi standar (100g)';
        let stdName = foodName;

        if (query.includes('nasi goreng')) {
          stdName = 'Nasi Goreng'; portion = '1 piring (250g)'; calories = 450; protein = 11; carbs = 58; fat = 17; fiber = 1.8;
        } else if (query.includes('telur')) {
          stdName = 'Telur Dadar'; portion = '1 butir (55g)'; calories = 90; protein = 7; carbs = 0.8; fat = 6.5; fiber = 0;
        } else if (query.includes('ayam goreng')) {
          stdName = 'Ayam Goreng'; portion = '1 potong (80g)'; calories = 220; protein = 18; carbs = 5; fat = 14; fiber = 0.2;
        } else if (query.includes('apel') || query.includes('buah')) {
          stdName = 'Apel Merah'; portion = '1 buah sedang (150g)'; calories = 80; protein = 0.5; carbs = 20; fat = 0.2; fiber = 4;
        }

        return NextResponse.json({
          success: true,
          data: { foodName: stdName, portion, calories, protein, carbs, fat, fiber },
          note: 'Mode demo (API Key Groq belum diatur)'
        });
      }

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a nutrition AI assistant. Analyze the given food item and estimate its nutritional breakdown for a typical single serving size. You must respond in Indonesian. Return a valid JSON object matching this schema: {"foodName": "Standardized Name in Indonesian", "portion": "portion description", "calories": number, "protein": number, "carbs": number, "fat": number, "fiber": number}. All nutrient values must be numbers in grams. Do not write any text outside the JSON object.'
            },
            {
              role: 'user',
              content: `Makanan: ${foodName}`
            }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!res.ok) {
        throw new Error(`Groq API returned status ${res.status}`);
      }

      const resData = await res.json();
      const aiContent = resData.choices?.[0]?.message?.content;
      return NextResponse.json({ success: true, data: JSON.parse(aiContent) });
    }

    if (type === 'chat') {
      const { messages } = body;
      if (!messages || !Array.isArray(messages)) {
        return NextResponse.json({ error: 'Pesan wajib diisi.' }, { status: 400 });
      }

      if (isMock) {
        const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
        let reply = "Halo! Saya MacraAI, asisten kesehatan pribadi Anda. Untuk mengaktifkan mode AI sepenuhnya menggunakan model Meta Llama di Groq, mohon atur `GROQ_API_KEY` Anda pada file `.env.local` terlebih dahulu.";

        if (lastMsg.includes('halo') || lastMsg.includes('hi') || lastMsg.includes('pagi') || lastMsg.includes('siang') || lastMsg.includes('sore') || lastMsg.includes('tanya')) {
          reply = "Halo! Ada yang bisa MacraAI bantu hari ini mengenai kesehatan, kalori, atau makanan Anda? 😊 (Catatan: Saat ini menggunakan mode demo sebelum API Key aktif).";
        } else if (lastMsg.includes('diet') || lastMsg.includes('berat badan') || lastMsg.includes('langsing')) {
          reply = "Untuk diet sehat, pastikan kalori harian terkontrol (defisit kalori untuk menurunkan berat badan), penuhi kebutuhan protein untuk menjaga massa otot, dan kurangi asupan makanan manis/olahan. Jangan lupa imbangi dengan olahraga sedang minimal 150 menit per minggu ya! 😉";
        } else if (lastMsg.includes('olahraga') || lastMsg.includes('aktivitas') || lastMsg.includes('gerak')) {
          reply = "Olahraga secara teratur sangat baik bagi metabolisme dan stamina. Lakukan pemanasan minimal 5 menit agar tidak cedera. Jika baru mulai, bisa coba jalan cepat, berenang, atau bersepeda santai.";
        }

        return NextResponse.json({
          success: true,
          choices: [{ message: { role: 'assistant', content: reply } }]
        });
      }

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'Nama kamu adalah MacraAI, asisten kesehatan, olahraga, nutrisi, dan makanan pintar yang ramah. Bantu pengguna menjawab pertanyaan seputar kesehatan umum, pola makan, rekomendasi kalori harian, olahraga, dll. Responlah dalam Bahasa Indonesia yang santai, ramah, edukatif, dan ringkas.'
            },
            ...messages
          ]
        })
      });

      if (!res.ok) {
        throw new Error(`Groq API returned status ${res.status}`);
      }

      const resData = await res.json();
      return NextResponse.json({ success: true, choices: resData.choices });
    }

    return NextResponse.json({ error: 'Tipe request tidak didukung.' }, { status: 400 });

  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({
      error: 'Terjadi kesalahan sistem saat menghubungi server AI.',
      details: err.message
    }, { status: 500 });
  }
}
