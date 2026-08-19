import os

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
Application,
CommandHandler,
CallbackQueryHandler,
MessageHandler,
ConversationHandler,
ContextTypes,
filters,
)

NAME, PERSON, DESCRIPTION, TARIFF = range(4)

ADMIN_ID = 8674985483


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
keyboard = [
[InlineKeyboardButton("🎤 Заказать песню", callback_data="order")],
[InlineKeyboardButton("💰 Цены", callback_data="prices")],
]

await update.message.reply_text(
"🎵 SONGHUB\n\n"
"Создадим персональную песню специально для тебя!",
reply_markup=InlineKeyboardMarkup(keyboard),
)


async def prices(update: Update, context: ContextTypes.DEFAULT_TYPE):
query = update.callback_query
await query.answer()

await query.message.reply_text(
"💰 ЦЕНЫ SONGHUB\n\n"
"🎵 Обычная песня — 200 грн\n"
"⭐ Premium — 500 грн",
reply_markup=InlineKeyboardMarkup([
[InlineKeyboardButton("🎤 Заказать", callback_data="order")]
]),
)


async def order_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
query = update.callback_query
await query.answer()

await query.message.reply_text("👤 Как тебя зовут?")
return NAME


async def get_name(update: Update, context: ContextTypes.DEFAULT_TYPE):
context.user_data["name"] = update.message.text
await update.message.reply_text("❤️ Для кого создаём песню?")
return PERSON


async def get_person(update: Update, context: ContextTypes.DEFAULT_TYPE):
context.user_data["person"] = update.message.text
await update.message.reply_text("📝 Расскажи, о чём должна быть песня.")
return DESCRIPTION


async def get_description(update: Update, context: ContextTypes.DEFAULT_TYPE):
context.user_data["description"] = update.message.text

keyboard = [
[InlineKeyboardButton("🎵 Обычная — 200 грн", callback_data="tariff_200")],
[InlineKeyboardButton("⭐ Premium — 500 грн", callback_data="tariff_500")],
]

await update.message.reply_text(
"💳 Выбери тариф:",
reply_markup=InlineKeyboardMarkup(keyboard),
)

return TARIFF


async def get_tariff(update: Update, context: ContextTypes.DEFAULT_TYPE):
query = update.callback_query
await query.answer()

tariff = "Обычная — 200 грн"

if query.data == "tariff_500":
tariff = "Premium — 500 грн"

text = (
"🎵 НОВЫЙ ЗАКАЗ SONGHUB\n\n"
f"👤 Имя: {context.user_data['name']}\n"
f"❤️ Для кого: {context.user_data['person']}\n"
f"📝 Описание: {context.user_data['description']}\n"
f"💳 Тариф: {tariff}\n"
f"🆔 Telegram ID: {query.from_user.id}"
)

await context.bot.send_message(
chat_id=ADMIN_ID,
text=text,
)

await query.message.reply_text(
"✅ Заказ принят!\n\n"
f"Выбран тариф: {tariff}\n"
"Мы свяжемся с тобой для дальнейшего оформления."
)

return ConversationHandler.END


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
await update.message.reply_text("❌ Заказ отменён.")
return ConversationHandler.END


def main():
token = os.environ.get("BOT_TOKEN")

if not token:
print("ОШИБКА: переменная BOT_TOKEN не найдена.")
print("Нужно добавить токен перед запуском бота.")
return

application = Application.builder().token(token).build()

conversation = ConversationHandler(
entry_points=[
CallbackQueryHandler(order_start, pattern="^order$")
],
states={
NAME: [
MessageHandler(filters.TEXT & ~filters.COMMAND, get_name)
],
PERSON: [
MessageHandler(filters.TEXT & ~filters.COMMAND, get_person)
],
DESCRIPTION: [
MessageHandler(filters.TEXT & ~filters.COMMAND, get_description)
],
TARIFF: [
CallbackQueryHandler(
get_tariff,
pattern="^tariff_(200|500)$"
)
],
},
fallbacks=[
CommandHandler("cancel", cancel)
],
)

application.add_handler(CommandHandler("start", start))
application.add_handler(
CallbackQueryHandler(prices, pattern="^prices$")
)
application.add_handler(conversation)

print("🎵 SongHub запущен!")
application.run_polling()


if __name__ == "__main__":
main()
