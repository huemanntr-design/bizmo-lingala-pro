import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Bot auto-reply commands
const BOT_COMMANDS: Record<string, (body: string) => string> = {
  'AIDE': () => `🤖 *COMMANDES DISPONIBLES*\n━━━━━━━━━━━━━━━\n📋 *CATALOGUE* — Voir nos produits\n💳 *SOLDE* — Votre solde crédit\n🧾 *FACTURE* — Dernière facture\n📞 *CONTACT* — Nous joindre\n📍 *LOCALISATION* — Notre adresse\n🔄 *COMMANDE* [produit] — Commander\n\nTapez une commande pour commencer! 🇨🇩`,
  'HELP': () => `🤖 *AVAILABLE COMMANDS*\n━━━━━━━━━━━━━━━\n📋 *CATALOGUE* — View products\n💳 *BALANCE* — Credit balance\n🧾 *INVOICE* — Last invoice\n📞 *CONTACT* — Reach us\n📍 *LOCATION* — Our address\n🔄 *ORDER* [product] — Place order\n\nType a command to start! 🇨🇩`,
  'CATALOGUE': () => `📦 *NOS PRODUITS*\n━━━━━━━━━━━━━━━\n💧 Eau Minérale 1.5L — $1.50\n🍺 Bière Primus 65cl — $2.00\n🌾 Sac de Riz 25kg — $22.00\n🫙 Huile Végétale 5L — $8.50\n🧼 Savon Monganga — $0.75\n🥣 Farine Manioc 10kg — $6.00\n\nTapez *COMMANDE [produit]* pour commander!\n_Mukendi Enterprises_ 🇨🇩`,
  'CONTACT': () => `📞 *NOUS CONTACTER*\n━━━━━━━━━━━━━━━\n📱 +243 812 000 001\n📧 contact@mukendi.cd\n🏢 Gombe, Kinshasa\n⏰ Lun-Sam: 8h-18h\n\n_Mukendi Enterprises_ 🇨🇩`,
  'LOCALISATION': () => `📍 *NOTRE ADRESSE*\n━━━━━━━━━━━━━━━\n🏢 Avenue du Commerce, N°42\nGombe, Kinshasa\nRD Congo 🇨🇩\n\n⏰ Ouvert: Lun-Sam 8h-18h`,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_WHATSAPP_NUMBER = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
      return new Response('Twilio credentials not configured', { status: 500, headers: corsHeaders });
    }

    // Parse Twilio webhook (application/x-www-form-urlencoded)
    const formData = await req.formData();
    const from = formData.get('From') as string; // whatsapp:+243...
    const body = (formData.get('Body') as string || '').trim();
    const messageSid = formData.get('MessageSid') as string;

    console.log(`Incoming WhatsApp from ${from}: ${body}`);

    // Determine bot reply
    const cmd = body.toUpperCase().split(' ')[0];
    let reply = BOT_COMMANDS[cmd]?.(body);

    if (!reply) {
      // Default greeting for unknown commands
      reply = `👋 Bonjour! Je suis le bot de *Mukendi Enterprises*.\n\nTapez *AIDE* pour voir les commandes disponibles.\n\n_Réponse automatique_ 🤖`;
    }

    // Send reply via Twilio
    const fromNumber = TWILIO_WHATSAPP_NUMBER.startsWith('whatsapp:')
      ? TWILIO_WHATSAPP_NUMBER
      : `whatsapp:${TWILIO_WHATSAPP_NUMBER}`;

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    const replyBody = new URLSearchParams({
      From: fromNumber,
      To: from,
      Body: reply,
    });

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: replyBody.toString(),
    });

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('Twilio reply error:', JSON.stringify(twilioData));
    } else {
      console.log(`Bot replied to ${from}: ${reply.substring(0, 50)}...`);
    }

    // Return TwiML empty response (Twilio expects this)
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/xml' },
      }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { status: 200, headers: { 'Content-Type': 'text/xml' } }
    );
  }
});
