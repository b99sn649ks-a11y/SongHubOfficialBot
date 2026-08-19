import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
Application,
CommandHandler,
CallbackQueryHandler,
MessageHandler,
ConversationHandler,
ContextTypes,
filters
)

NAME, PERSON, DESCRIPTION = range(3)

ADMIN_ID = 8674985483


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
keyboard = [
[InlineKeyboardButton("🎤 Заказать песню", callback_data="order")],
[InlineKeyboardButton("💰 Цены", callback_data="prices")],
]

await update.message.reply_text(
"🎵 Добро пожаловать в SongHub!\n\n"
"Создадим персональную песню специально для тебя.",
reply_markup=InlineKeyboardMarkup(keyboard)
)


async def prices(update: Update, context: ContextTypes.DEFAULT_TYPE):
query = update.callback_query
await query.answer()

await query.message.reply_text(
"💰 Цены SongHub:\n\n"
"🎵 Обычная песня — 200 грн\n"
"⭐ Premium — 500 грн"
)


async def order_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
query = update.callback_query
await query.answer()

await query.message.reply_text("🎤 Как тебя зовут?")
return NAME


async def get_name(update: Update, context: ContextTypes.DEFAULT_TYPE):
context.user_data["name"] = update.message.text

await update.message.reply_text("👤 Для кого создаём песню?")
return PERSON


async def get_person(update: Update, context: ContextTypes.DEFAULT_TYPE):
context.user_data["person"] = update.message.text

await update.message.reply_text(
"📝 Расскажи подробнее, какой должна быть песня."
)
return DESCRIPTION


async def get_description(update: Update, context: ContextTypes.DEFAULT_TYPE):
context.user_data["description"] = update.message.text

name = context.user_data["name"]
person = context.user_data["person"]
description = context.user_data["description"]

text = (
"🎵 НОВЫЙ ЗАКАЗ SONGHUB\n\n"
f"👤 Имя: {name}\n"
f"🎯 Для кого: {person}\n"
f"📝 Описание: {description}\n\n"
f"🆔 Telegram ID: {update.effective_user.id}"
)

await context.bot.send_message(
chat_id=ADMIN_ID,
text=text
)

await update.message.reply_text(
"✅ Заказ отправлен!\n\n"
"Мы свяжемся с тобой для уточнения деталей."
)

return ConversationHandler.END


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
await update.message.reply_text("❌ Заказ отменён.")
return ConversationHandler.END


def main():
token = os.environ["BOT_TOKEN"]

app = Application.builder().token(token).build()

conversation = ConversationHandler(
entry_points=[
CallbackQueryHandler(order_start, pattern="^order$")
],
states={
NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_name)],
PERSON: [MessageHandler(filters.TEXT & ~filters.COMMAND, get_person)],
DESCRIPTION: [
MessageHandler(filters.TEXT & ~filters.COMMAND, get_description)
],
},
fallbacks=[
CommandHandler("cancel", cancel)
],
)

app.add_handler(CommandHandler("start", start))
app.add_handler(CallbackQueryHandler(prices, pattern="^prices$"))
app.add_handler(conversation)

app.run_polling()


if __name__ == "__main__":
main()
