const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf('8674985483:AAEeNTIgeZHs-3SYeDmaAeKZoSg8-UXm2VM');

// =========================
// НАСТРОЙКИ
// =========================

const ADMIN_ID = 2058926927; //

const PAYMENT_DETAILS = `
💳 РЕКВИЗИТЫ ДЛЯ ОПЛАТЫ

Банк: Приват Банк
Карта: 5168 7520 8611 9693
Получатель: Шеханін Ігор Олександрович

После оплаты нажми кнопку «💳 Я оплатил».
`;

// =========================
// ДАННЫЕ
// =========================

const users = new Map();
const orders = new Map();

let orderCounter = 1000;

// =========================
// КНОПКИ
// =========================

const mainMenu = () =>
Markup.inlineKeyboard([
[Markup.button.callback('🎵 Заказать песню', 'new_order')],
[Markup.button.callback('📋 Мои заказы', 'my_orders')],
[Markup.button.callback('ℹ️ О нас', 'about')]
]);

const backButton = () =>
Markup.inlineKeyboard([
[Markup.button.callback('⬅️ Назад', 'back')]
]);

const cancelButton = () =>
Markup.inlineKeyboard([
[Markup.button.callback('❌ Отменить заказ', 'cancel_order')]
]);

const recipientKeyboard = () =>
Markup.inlineKeyboard([
[
Markup.button.callback('👩 Мама', 'recipient_Мама'),
Markup.button.callback('👨 Папа', 'recipient_Папа')
],
[
Markup.button.callback('❤️ Любимый человек', 'recipient_Любимый человек')
],
[
Markup.button.callback('👶 Ребёнок', 'recipient_Ребёнок')
],
[
Markup.button.callback('👤 Друг / подруга', 'recipient_Друг / подруга')
],
[
Markup.button.callback('✏️ Другой вариант', 'recipient_other')
],
[
Markup.button.callback('⬅️ Назад', 'back')
]
]);

const reasonKeyboard = () =>
Markup.inlineKeyboard([
[Markup.button.callback('🎂 День рождения', 'reason_День рождения')],
[Markup.button.callback('❤️ Любовь', 'reason_Любовь')],
[Markup.button.callback('💍 Годовщина', 'reason_Годовщина')],
[Markup.button.callback('💐 Поздравление', 'reason_Поздравление')],
[Markup.button.callback('🙏 Извинение', 'reason_Извинение')],
[Markup.button.callback('🎉 Праздник', 'reason_Праздник')],
[Markup.button.callback('✨ Другое', 'reason_Другое')],
[Markup.button.callback('⬅️ Назад', 'back')]
]);

const languageKeyboard = () =>
Markup.inlineKeyboard([
[
Markup.button.callback('🇺🇦 Українська', 'language_Українська'),
Markup.button.callback('🇷🇺 Русский', 'language_Русский')
],
[
Markup.button.callback('🇬🇧 English', 'language_English')
],
[
Markup.button.callback('⬅️ Назад', 'back')
]
]);

const vocalKeyboard = () =>
Markup.inlineKeyboard([
[Markup.button.callback('👨 Мужской вокал', 'vocal_Мужской')],
[Markup.button.callback('👩 Женский вокал', 'vocal_Женский')],
[Markup.button.callback('⬅️ Назад', 'back')]
]);

const styleKeyboard = () =>
Markup.inlineKeyboard([
[
Markup.button.callback('❤️ Романтика', 'style_Романтика'),
Markup.button.callback('🎸 Рок', 'style_Рок')
],
[
Markup.button.callback('🎤 Поп', 'style_Поп'),
Markup.button.callback('🎧 Рэп', 'style_Рэп')
],
[
Markup.button.callback('💃 Танцевальный', 'style_Танцевальный'),
Markup.button.callback('🎹 Лирический', 'style_Лирический')
],
[
Markup.button.callback('🎶 Другой', 'style_Другой')
],
[
Markup.button.callback('⬅️ Назад', 'back')
]
]);

const tariffKeyboard = () =>
Markup.inlineKeyboard([
[
Markup.button.callback('💿 Обычный — 200 грн', 'tariff_Обычный_200')
],
[
Markup.button.callback('💎 Premium — 500 грн', 'tariff_Premium_500')
],
[
Markup.button.callback('⬅️ Назад', 'back')
]
]);

const paymentKeyboard = () =>
Markup.inlineKeyboard([
[Markup.button.callback('💳 Я оплатил', 'paid')],
[Markup.button.callback('⬅️ Назад', 'back')],
[Markup.button.callback('❌ Отменить заказ', 'cancel_order')]
]);

// =========================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// =========================

function getUser(ctx) {
if (!users.has(ctx.from.id)) {
users.set(ctx.from.id, {
step: null,
order: {}
});
}

return users.get(ctx.from.id);
}

function getOrderText(order) {
return `
🎵 НОВАЯ ЗАЯВКА №${order.id}

👤 Пользователь:
${order.username ? '@' + order.username : 'без username'}

🆔 Telegram ID:
${order.userId}

👥 Получатель:
${order.recipient || '—'}

🎉 Повод:
${order.reason || '—'}

🌐 Язык:
${order.language || '—'}

🎤 Вокал:
${order.vocal || '—'}

🎶 Стиль:
${order.style || '—'}

📖 История:
${order.story || '—'}

💰 Тариф:
${order.tariff || '—'}

📊 Статус:
${order.status || 'Ожидает оплаты'}
`;
}

async function showMainMenu(ctx) {
await ctx.reply(
`🎵 *SongHub*

Создадим для вас персональную песню под любой повод.

Выберите действие ниже 👇`,
{
parse_mode: 'Markdown',
...mainMenu()
}
);
}

// =========================
// START
// =========================

bot.start(async (ctx) => {
const user = getUser(ctx);

user.step = null;
user.order = {};

await showMainMenu(ctx);
});

// =========================
// ГЛАВНОЕ МЕНЮ
// =========================

bot.action('new_order', async (ctx) => {
await ctx.answerCbQuery();

const user = getUser(ctx);

user.order = {
id: ++orderCounter,
userId: ctx.from.id,
username: ctx.from.username || '',
status: 'Заполнение заявки'
};

user.step = 'recipient';

await ctx.editMessageText(
'👥 *Кому посвящена песня?*',
{
parse_mode: 'Markdown',
...recipientKeyboard()
}
);
});

bot.action('my_orders', async (ctx) => {
await ctx.answerCbQuery();

const myOrders = [...orders.values()]
.filter(order => order.userId === ctx.from.id);

if (myOrders.length === 0) {
return ctx.reply(
'📋 У вас пока нет заказов.',
mainMenu()
);
}

let text = '📋 *Ваши заказы:*\n\n';

for (const order of myOrders) {
text +=
`🎵 №${order.id}\n` +
`💰 ${order.tariff || '—'}\n` +
`📊 ${order.status}\n\n`;
}

await ctx.reply(
text,
{
parse_mode: 'Markdown',
...mainMenu()
}
);
});

bot.action('about', async (ctx) => {
await ctx.answerCbQuery();

await ctx.editMessageText(
`🎵 *SongHub*

Создаём персональные песни специально для ваших близких.

❤️ Песня на день рождения
💍 На годовщину
💐 В подарок
🙏 Для извинения
🎉 На праздник
✨ И просто чтобы порадовать любимого человека.`,
{
parse_mode: 'Markdown',
...backButton()
}
);
});

// =========================
// ПОЛУЧАТЕЛЬ
// =========================

bot.action(/^recipient_(.+)$/, async (ctx) => {
await ctx.answerCbQuery();

const value = ctx.match[1];
const user = getUser(ctx);

if (value === 'other') {
user.step = 'recipient_custom';

return ctx.editMessageText(
'✏️ Напишите, кому посвящается песня:',
backButton()
);
}

user.order.recipient = value;
user.step = 'reason';

await ctx.editMessageText(
'🎉 *Какой повод?*',
{
parse_mode: 'Markdown',
...reasonKeyboard()
}
);
});

// =========================
// ПОВОД
// =========================

bot.action(/^reason_(.+)$/, async (ctx) => {
await ctx.answerCbQuery();

const user = getUser(ctx);

user.order.reason = ctx.match[1];
user.step = 'language';

await ctx.editMessageText(
'🌐 *Выберите язык песни:*',
{
parse_mode: 'Markdown',
...languageKeyboard()
}
);
});

// =========================
// ЯЗЫК
// =========================

bot.action(/^language_(.+)$/, async (ctx) => {
await ctx.answerCbQuery();

const user = getUser(ctx);

user.order.language = ctx.match[1];
user.step = 'vocal';

await ctx.editMessageText(
'🎤 *Выберите вокал:*',
{
parse_mode: 'Markdown',
...vocalKeyboard()
}
);
});

// =========================
// ВОКАЛ
// =========================

bot.action(/^vocal_(.+)$/, async (ctx) => {
await ctx.answerCbQuery();

const user = getUser(ctx);

user.order.vocal = ctx.match[1];
user.step = 'style';

await ctx.editMessageText(
'🎶 *Выберите музыкальный стиль:*',
{
parse_mode: 'Markdown',
...styleKeyboard()
}
);
});

// =========================
// СТИЛЬ
// =========================

bot.action(/^style_(.+)$/, async (ctx) => {
await ctx.answerCbQuery();

const user = getUser(ctx);

user.order.style = ctx.match[1];
user.step = 'story';

await ctx.editMessageText(
`📖 *Теперь напишите историю.*

Расскажите всё, что хотите услышать в песне.

Например:
«Познакомились 5 лет назад, у нас двое детей...»

Можно написать подробно ❤️`,
{
parse_mode: 'Markdown',
...cancelButton()
}
);
});

// =========================
// ТАРИФ
// =========================

bot.action(/^tariff_(.+)$/, async (ctx) => {
await ctx.answerCbQuery();

const user = getUser(ctx);

const value = ctx.match[1];

if (value === 'Обычный_200') {
user.order.tariff = 'Обычный — 200 грн';
user.order.price = 200;
}

if (value === 'Premium_500') {
user.order.tariff = 'Premium — 500 грн';
user.order.price = 500;
}

user.order.status = 'Ожидает оплаты';

orders.set(user.order.id, {
...user.order
});

await ctx.editMessageText(
`💰 *Ваш тариф: ${user.order.tariff}*

${PAYMENT_DETAILS}

После оплаты нажмите:
💳 *Я оплатил*`,
{
parse_mode: 'Markdown',
...paymentKeyboard()
}
);
});

// =========================
// ОПЛАТА
// =========================

bot.action('paid', async (ctx) => {
await ctx.answerCbQuery();

const user = getUser(ctx);

if (!user.order || !user.order.id) {
return ctx.reply('❌ Заказ не найден. Нажмите /start');
}

user.step = 'receipt';

await ctx.editMessageText(
`📸 *Отправьте фотографию чека об оплате.*

После отправки чека ваша заявка будет передана администратору.`,
{
parse_mode: 'Markdown',
...cancelButton()
}
);
});

// =========================
// ПРИНЯТЬ / ОТКЛОНИТЬ
// =========================

bot.action(/^approve_(\d+)$/, async (ctx) => {
await ctx.answerCbQuery('Заказ принят');

if (ctx.from.id !== ADMIN_ID) {
return ctx.reply('❌ У вас нет доступа.');
}

const orderId = Number(ctx.match[1]);
const order = orders.get(orderId);

if (!order) {
return ctx.reply('❌ Заказ не найден.');
}

order.status = '✅ Принят';
orders.set(orderId, order);

await ctx.editMessageReplyMarkup({
inline_keyboard: []
});

await ctx.reply(`✅ Заказ №${orderId} принят.`);

try {
await bot.telegram.sendMessage(
order.userId,
`🎉 *Ваш заказ №${orderId} принят!*

Администратор подтвердил вашу оплату.

Мы начинаем работу над вашей песней ❤️`,
{
parse_mode: 'Markdown',
...mainMenu()
}
);
} catch (error) {
console.log('Не удалось отправить уведомление:', error.message);
}
});

bot.action(/^reject_(\d+)$/, async (ctx) => {
await ctx.answerCbQuery('Заказ отклонён');

if (ctx.from.id !== ADMIN_ID) {
return ctx.reply('❌ У вас нет доступа.');
}

const orderId = Number(ctx.match[1]);
const order = orders.get(orderId);

if (!order) {
return ctx.reply('❌ Заказ не найден.');
}

order.status = '❌ Отклонён';
orders.set(orderId, order);

await ctx.editMessageReplyMarkup({
inline_keyboard: []
});

await ctx.reply(`❌ Заказ №${orderId} отклонён.`);

try {
await bot.telegram.sendMessage(
order.userId,
`❌ *Ваш заказ №${orderId} отклонён.*

Пожалуйста, свяжитесь с администратором.`,
{
parse_mode: 'Markdown',
...mainMenu()
}
);
} catch (error) {
console.log('Не удалось отправить уведомление:', error.message);
}
});

// =========================
// НАЗАД
// =========================

bot.action('back', async (ctx) => {
await ctx.answerCbQuery();

const user = getUser(ctx);

switch (user.step) {

case 'recipient':
user.step = null;
user.order = {};

return ctx.editMessageText(
'🎵 Главное меню',
mainMenu()
);

case 'reason':
user.step = 'recipient';

return ctx.editMessageText(
'👥 *Кому посвящена песня?*',
{
parse_mode: 'Markdown',
...recipientKeyboard()
}
);

case 'language':
user.step = 'reason';

return ctx.editMessageText(
'🎉 *Какой повод?*',
{
parse_mode: 'Markdown',
...reasonKeyboard()
}
);

case 'vocal':
user.step = 'language';

return ctx.editMessageText(
'🌐 *Выберите язык песни:*',
{
parse_mode: 'Markdown',
...languageKeyboard()
}
);

case 'style':
user.step = 'vocal';

return ctx.editMessageText(
'🎤 *Выберите вокал:*',
{
parse_mode: 'Markdown',
...vocalKeyboard()
}
);

case 'story':
user.step = 'style';

return ctx.editMessageText(
'🎶 *Выберите музыкальный стиль:*',
{
parse_mode: 'Markdown',
...styleKeyboard()
}
);

case 'tariff':
user.step = 'story';

return ctx.editMessageText(
'📖 Напишите историю:',
{
...cancelButton()
}
);

case 'receipt':
user.step = 'tariff';

return ctx.editMessageText(
'💰 *Выберите тариф:*',
{
parse_mode: 'Markdown',
...tariffKeyboard()
}
);

default:
return showMainMenu(ctx);
}
});

// =========================
// ОТМЕНА
// =========================

bot.action('cancel_order', async (ctx) => {
await ctx.answerCbQuery();

const user = getUser(ctx);

user.step = null;
user.order = {};

await ctx.editMessageText(
'❌ Заказ отменён.\n\nВозвращаемся в главное меню.',
mainMenu()
);
});

bot.command('cancel', async (ctx) => {
const user = getUser(ctx);

user.step = null;
user.order = {};

await ctx.reply(
'❌ Заказ отменён.',
mainMenu()
);
});

// =========================
// ТЕКСТОВЫЕ СООБЩЕНИЯ
// =========================

bot.on('text', async (ctx) => {

const user = getUser(ctx);

if (!user.step) {
return;
}

const text = ctx.message.text.trim();

if (!text) {
return;
}

// Другая категория получателя
if (user.step === 'recipient_custom') {

user.order.recipient = text;
user.step = 'reason';

return ctx.reply(
'🎉 *Какой повод?*',
{
parse_mode: 'Markdown',
...reasonKeyboard()
}
);
}

// История
if (user.step === 'story') {

if (text.length < 5) {
return ctx.reply(
'⚠️ Напишите немного подробнее, минимум несколько слов.'
);
}

user.order.story = text;
user.step = 'tariff';

return ctx.reply(
`💰 *Выберите тариф:*

💿 Обычный — 200 грн
💎 Premium — 500 грн`,
{
parse_mode: 'Markdown',
...tariffKeyboard()
}
);
}
});

// =========================
// ФОТО ЧЕКА
// =========================

bot.on('photo', async (ctx) => {

const user = getUser(ctx);

if (user.step !== 'receipt') {
return;
}

const order = user.order;

if (!order || !order.id) {
return ctx.reply('❌ Заказ не найден. Нажмите /start');
}

const photo = ctx.message.photo[ctx.message.photo.length - 1];

order.receiptFileId = photo.file_id;
order.status = '🟡 Ожидает проверки администратора';

orders.set(order.id, {
...order
});

user.step = null;

const adminText = getOrderText(order);

try {

await bot.telegram.sendPhoto(
ADMIN_ID,
photo.file_id,
{
caption: adminText,
...Markup.inlineKeyboard([
[
Markup.button.callback(
'✅ Принять',
`approve_${order.id}`
),
Markup.button.callback(
'❌ Отклонить',
`reject_${order.id}`
)
]
])
}
);

await ctx.reply(
`✅ *Заявка №${order.id} отправлена!*

Чек получен.

⏳ Ожидайте проверки администратора.`,
{
parse_mode: 'Markdown',
...mainMenu()
}
);

} catch (error) {

console.error(error);

await ctx.reply(
'❌ Не удалось отправить заявку администратору. Попробуйте ещё раз.'
);
}
});

// =========================
// ОШИБКИ
// =========================

bot.catch((error, ctx) => {
console.error('BOT ERROR:', error);

try {
ctx.reply(
'⚠️ Произошла ошибка. Попробуйте ещё раз или нажмите /start.'
);
} catch (e) {
console.error(e);
}
});

// =========================
// ЗАПУСК
// =========================

bot.launch();

console.log('🎵 SongHub запущен!');

// Корректная остановка
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
