// ==========================================
// EzShop - Telegram Webhook Edge Function
// Handles inline button clicks in Telegram and dynamically updates order buttons
// ==========================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TG_BOT_TOKEN = Deno.env.get("TG_BOT_TOKEN") || "8163887643:AAG8HCPOrR3Eo4FNgsELS8qWEzmF5Nq1OD0";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://vsxvbrjfuhzvdyzbpjmn.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "sb_publishable_aGa3JAz9zF_lQA2swDU43A_UA4fKskN";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req: Request) => {
  // CORS & Health check
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const update = await req.json();

    // 1. Обработка нажатий на inline-кнопки
    if (update.callback_query) {
      const cb = update.callback_query;
      const data = String(cb.data || "");
      const chatId = cb.message?.chat?.id;
      const messageId = cb.message?.message_id;

      if (data.startsWith("status:") && chatId && messageId) {
        const parts = data.split(":");
        const orderId = parts[1];
        const newStatus = parts[2];

        // А) Обновляем статус заказа в Supabase базе данных
        const isNumeric = /^\d+$/.test(orderId);
        let updated = false;

        if (isNumeric) {
          const numId = parseInt(orderId, 10);
          const { data: res1 } = await supabase
            .from("orders")
            .update({ status: newStatus })
            .eq("id", numId)
            .select("id");

          if (res1 && res1.length > 0) {
            updated = true;
          } else {
            await supabase
              .from("orders")
              .update({ status: newStatus })
              .eq("user_order_id", numId);
          }
        } else {
          await supabase
            .from("orders")
            .update({ status: newStatus })
            .eq("id", orderId);
        }

        // Б) Убираем часики ожидания на кнопке в Telegram
        await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/answerCallbackQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            callback_query_id: cb.id,
            text: `Статус заказа: ${newStatus}`,
          }),
        }).catch(() => {});

        // В) Отправляем ответное сообщение с новым статусом
        const statusEmoji = newStatus === "В работе" ? "🔨" :
                            (newStatus === "Доставлен" ? "✅" :
                            (newStatus === "Возврат" ? "🔄" : "❌"));

        await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: `${statusEmoji} Статус заказа обновлен: <b>${newStatus}</b>`,
            parse_mode: "HTML",
            reply_to_message_id: messageId,
          }),
        }).catch(() => {});

        // Г) ДИНАМИЧЕСКИ ОБНОВЛЯЕМ КНОПКИ В ИСХОДНОМ СООБЩЕНИИ TELEGRAM
        // - При статусе "В работе" -> [ ✅ Доставлен ] и [ 🔄 Возврат ]
        // - При статусе "Доставлен" -> [ 🔄 Возврат ]
        // - При статусах "Отменен" / "Возврат" -> скрываем кнопки (финал)
        let nextKeyboard: Array<Array<{ text: string; callback_data: string }>> = [];

        if (newStatus === "В работе") {
          nextKeyboard = [
            [
              { text: "✅ Доставлен", callback_data: `status:${orderId}:Доставлен` },
              { text: "🔄 Возврат", callback_data: `status:${orderId}:Возврат` }
            ]
          ];
        } else if (newStatus === "Доставлен") {
          nextKeyboard = [
            [
              { text: "🔄 Возврат", callback_data: `status:${orderId}:Возврат` }
            ]
          ];
        } else {
          nextKeyboard = [];
        }

        await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/editMessageReplyMarkup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            reply_markup: { inline_keyboard: nextKeyboard },
          }),
        }).catch((err) => console.error("editMessageReplyMarkup error:", err));
      }
    }

    // 2. Обработка обычных команд (например, /start)
    if (update.message && update.message.text) {
      const text = update.message.text.trim();
      const chatId = update.message.chat?.id;

      if (text.startsWith("/start") && chatId) {
        await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "👋 <b>EzShop Bot активен</b>\nСюда поступают новые заказы из интернет-магазина с кнопками смены статуса.",
            parse_mode: "HTML",
          }),
        }).catch(() => {});
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: err?.message || "Internal error" }), {
      status: 200, // возвращаем 200, чтобы Telegram не повторял ошибочный запрос бесконечно
      headers: { "Content-Type": "application/json" },
    });
  }
});
