# Пример использования Yandex Tracker API в Google Apps Script

Получение и храннеие токена должно быть реализовано самостоятельно. См. `App.yandexIamToken`

## Примеры

### Инициализация

```js
const yandexTracker = new YandexTracker({
  iamToken,
  xOrgID,
});
```

### Получение списка проектов

```js
yandexTracker.v2Projects().forEach((project) => {
  console.log(project.name);
});
```
