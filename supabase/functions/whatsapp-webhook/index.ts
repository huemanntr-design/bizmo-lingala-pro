import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const SYSTEM_PROMPT = `Tu es BizBot 🤖, l'assistant WhatsApp intelligent de BizPlatform — une plateforme de gestion d'entreprise pour les PME en RD Congo.

Tu parles en français congolais, tu es professionnel mais chaleureux. Utilise des emojis pour rendre les messages lisibles sur WhatsApp.

Tu peux aider les utilisateurs avec :
- 📊 Consulter leurs ventes, revenus, profits
- 📦 Vérifier le stock de produits
- 👥 Gérer les clients (soldes, crédits)
- 💰 Voir les dépenses et la comptabilité
- 📋 Créer des commandes
- 📈 Obtenir des rapports et analyses

Quand l'utilisateur demande des données, utilise les données du contexte fourni.
Formate tes réponses pour WhatsApp: utilise *gras* pour les titres, des lignes ━━━ pour séparer, et des emojis pour les listes.
Garde les réponses concises (max 500 caractères).

Si l'utilisateur envoie START ou COMMENCER, souhaite-lui la bienvenue et montre les commandes disponibles.
Si la commande n'est pas claire, propose des suggestions.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_WHATSAPP_NUMBER = Deno.env.get('TWILIO_WHATSAPP_NUMBER');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
      return new Response('Twilio credentials not configured', { status: 500 });
    }
    if (!LOVABLE_API_KEY) {
      return new Response('LOVABLE_API_KEY not configured', { status: 500 });
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response('Supabase credentials not configured', { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse Twilio webhook (application/x-www-form-urlencoded)
    const formData = await req.formData();
    const from = formData.get('From') as string;
    const body = (formData.get('Body') as string || '').trim();
    const messageSid = formData.get('MessageSid') as string;

    console.log(`Incoming WhatsApp from ${from}: ${body}`);

    // Clean phone number (remove whatsapp: prefix)
    const phone = from.replace('whatsapp:', '');

    // Store inbound message
    await supabase.from('whatsapp_messages').insert({
      phone,
      body,
      direction: 'inbound',
      message_sid: messageSid,
    });

    // Check/register user
    const { data: existingUser } = await supabase
      .from('whatsapp_users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (!existingUser) {
      await supabase.from('whatsapp_users').insert({ phone, name: phone });
    }

    // Update last_message_at
    await supabase.from('whatsapp_users')
      .update({ last_message_at: new Date().toISOString() })
      .eq('phone', phone);

    // Get recent conversation history for context
    const { data: recentMessages } = await supabase
      .from('whatsapp_messages')
      .select('body, direction, created_at')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(10);

    const conversationHistory = (recentMessages || []).reverse().map(m => ({
      role: m.direction === 'inbound' ? 'user' : 'assistant',
      content: m.body,
    }));

    // Build platform context (demo data summary for now)
    const platformContext = `
DONNÉES PLATEFORME (contexte actuel):
- Produits: Eau 1.5L ($1.50, 120u), Bière Primus ($2.00, 8u ⚠️), Riz 25kg ($22, 45u), Huile 5L ($8.50, 3u ⚠️), Savon Monganga ($0.75, 200u), Farine Manioc ($6, 30u)
- Alertes stock: Bière Primus (8u, seuil 15), Huile Végétale (3u, seuil 10)
- Clients VIP: Marie Kabila (crédit $120), Hôtel Memling (crédit $1200)
- Revenu aujourd'hui estimé: ~$753
- Ventes récentes: 10 transactions, profit total ~$291
- Taux USD/CDF: ~2800
`;

    // Call AI Gateway
    const aiResponse = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + '\n\n' + platformContext },
          ...conversationHistory,
          { role: 'user', content: body },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    let reply: string;

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      reply = aiData.choices?.[0]?.message?.content || "🤖 Désolé, je n'ai pas compris. Tapez *AIDE* pour les commandes.";
    } else {
      console.error('AI Gateway error:', aiResponse.status, await aiResponse.text());
      // Fallback to basic command handling
      const cmd = body.toUpperCase().split(' ')[0];
      if (cmd === 'START' || cmd === 'COMMENCER') {
        reply = `👋 Bienvenue sur *BizBot* 🇨🇩!\n\nJe suis votre assistant WhatsApp pour gérer votre entreprise.\n\n📊 *RAPPORT* — Résumé du jour\n📦 *STOCK* — État du stock\n👥 *CLIENTS* — Liste clients\n💰 *VENTES* — Ventes récentes\n❓ *AIDE* — Toutes les commandes\n\nQue voulez-vous faire?`;
      } else if (cmd === 'AIDE' || cmd === 'HELP') {
        reply = `🤖 *COMMANDES DISPONIBLES*\n━━━━━━━━━━━━━━━\n📊 *RAPPORT* — Résumé journalier\n📦 *STOCK* — Vérifier le stock\n👥 *CLIENTS* — Voir les clients\n💰 *VENTES* — Ventes récentes\n💳 *SOLDE* [client] — Solde client\n🔄 *COMMANDE* [produit] — Commander\n\nOu posez simplement votre question! 🇨🇩`;
      } else {
        reply = `👋 Bonjour! Je suis *BizBot* 🤖\n\nTapez *AIDE* pour voir les commandes.\nOu posez directement votre question!\n\n_BizPlatform_ 🇨🇩`;
      }
    }

    // Store outbound message
    await supabase.from('whatsapp_messages').insert({
      phone,
      body: reply,
      direction: 'outbound',
    });

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
      console.log(`BizBot replied to ${from}: ${reply.substring(0, 50)}...`);
    }

    // Return TwiML empty response
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { status: 200, headers: { 'Content-Type': 'text/xml' } }
    );
  }
});
