import twilio from 'twilio';

// Değişkenleri alalım
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Hata ayıklama: Değişkenler boşsa terminalde bizi uyaracak
if (!accountSid || !authToken) {
    console.error("❌ HATA: Twilio kimlik bilgileri .env dosyasından okunamadı!");
}

const client = twilio(accountSid, authToken);

export const sendWhatsApp = async (messageBody: string) => {
    try {
        const message = await client.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            body: messageBody,
            to: `whatsapp:${process.env.MY_PHONE_NUMBER}`
        });
        console.log("✅ WhatsApp mesajı gönderildi, SID:", message.sid);
    } catch (error: any) {
        console.error("❌ WhatsApp gönderim hatası:", error.message);
    }
};