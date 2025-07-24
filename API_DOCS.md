# Família Abba API – Documentação para App React Native

## 📱 Informações do App

- **Nome:** Família Abba (API)
- **Stack Backend:** FastAPI + SQLModel (async)
- **Funcionalidades principais:**
  - Cadastro e login de usuários
  - Gerenciamento de filhos (children)
  - Eventos da igreja
  - Check-ins de crianças em eventos
  - Doações
  - Avisos/comunicados
  - Pedidos de oração
  - Diferenciação de permissões: usuário comum e admin

---

## 🔗 Endpoints e Modelos

### Autenticação (`/auth`)
- **POST /auth/register**  
  Criar usuário  
  Request: `UserCreate`  
  Response: `UserRead`
- **POST /auth/login**  
  Login  
  Request: `UserLogin`  
  Response: `Token`

### Usuário (`/users`)
- **GET /users**  
  Listar todos os usuários (admin)  
  Response: `[UserRead]`
- **GET /users/me**  
  Dados do usuário logado  
  Response: `UserRead`
- **PUT /users/me**  
  Atualizar dados do usuário logado  
  Request: `UserCreate` (ideal seria um schema de update)  
  Response: `UserRead`

### Filhos (`/children`)
- **POST /children**  
  Criar filho  
  Request: `ChildCreate`  
  Response: `ChildRead`
- **GET /children/me**  
  Listar filhos do usuário logado  
  Response: `[ChildRead]`
- **GET /children/{child_id}**  
  Detalhe do filho  
  Response: `ChildRead`
- **PUT /children/{child_id}**  
  Atualizar filho  
  Request: `ChildCreate`  
  Response: `ChildRead`
- **DELETE /children/{child_id}**  
  Remover filho

### Eventos (`/events`)
- **POST /events**  
  Criar evento (admin)  
  Request: `EventCreate`  
  Response: `EventRead`
- **GET /events**  
  Listar eventos (filtros: data, categoria)  
  Response: `[EventRead]`
- **GET /events/{event_id}**  
  Detalhe do evento  
  Response: `EventRead`
- **PUT /events/{event_id}**  
  Atualizar evento (admin)  
  Request: `EventCreate`  
  Response: `EventRead`
- **DELETE /events/{event_id}**  
  Remover evento (admin)

### Check-ins (`/checkins`)
- **POST /checkins**  
  Registrar check-in de criança em evento  
  Request: `CheckinCreate`  
  Response: `CheckinRead`
- **GET /checkins/by_child/{child_id}**  
  Listar check-ins por filho  
  Response: `[CheckinRead]`
- **GET /checkins/by_event/{event_id}**  
  Listar check-ins por evento (admin)  
  Response: `[CheckinRead]`

### Avisos/Comunicados (`/announcements`)
- **POST /announcements**  
  Criar aviso (admin)  
  Request: `AnnouncementCreate`  
  Response: `AnnouncementRead`
- **GET /announcements**  
  Listar avisos  
  Response: `[AnnouncementRead]`
- **GET /announcements/{announcement_id}**  
  Detalhe do aviso  
  Response: `AnnouncementRead`
- **PUT /announcements/{announcement_id}**  
  Atualizar aviso (admin)  
  Request: `AnnouncementCreate`  
  Response: `AnnouncementRead`
- **DELETE /announcements/{announcement_id}**  
  Remover aviso (admin)

### Pedidos de Oração (`/prayers`)
- **POST /prayers**  
  Criar pedido de oração  
  Request: `PrayerRequestCreate`  
  Response: `PrayerRequestRead`
- **GET /prayers**  
  Listar pedidos (admin)  
  Response: `[PrayerRequestRead]`
- **PATCH /prayers/{prayer_id}**  
  Atualizar status do pedido (admin)  
  Params: `status` (`pending`, `praying`, `answered`)  
  Response: `PrayerRequestRead`

### Doações (`/donations`)
- **POST /donations**  
  Registrar doação  
  Request: `DonationCreate`  
  Response: `DonationRead`
- **GET /donations/me**  
  Listar doações do usuário  
  Response: `[DonationRead]`
- **GET /donations**  
  Listar todas doações (admin)  
  Response: `[DonationRead]`

---

## 🧩 Modelos de Request/Response

### UserCreate
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```
### UserRead
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "role": "string",
  "is_active": true
}
```
### UserLogin
```json
{
  "email": "string",
  "password": "string"
}
```
### Token
```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```
### ChildCreate
```json
{
  "name": "string",
  "birthdate": "YYYY-MM-DD"
}
```
### ChildRead
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "string",
  "birthdate": "YYYY-MM-DD"
}
```
### EventCreate
```json
{
  "title": "string",
  "date": "YYYY-MM-DD",
  "category": "string",
  "description": "string"
}
```
### EventRead
```json
{
  "id": "uuid",
  "title": "string",
  "date": "YYYY-MM-DD",
  "category": "string",
  "description": "string"
}
```
### CheckinCreate
```json
{
  "child_id": "uuid",
  "event_id": "uuid"
}
```
### CheckinRead
```json
{
  "id": "uuid",
  "child_id": "uuid",
  "event_id": "uuid",
  "timestamp": "YYYY-MM-DDTHH:MM:SS"
}
```
### AnnouncementCreate
```json
{
  "title": "string",
  "content": "string"
}
```
### AnnouncementRead
```json
{
  "id": "uuid",
  "title": "string",
  "content": "string",
  "created_by": "uuid",
  "created_at": "YYYY-MM-DDTHH:MM:SS"
}
```
### PrayerRequestCreate
```json
{
  "content": "string",
  "anonymous": false
}
```
### PrayerRequestRead
```json
{
  "id": "uuid",
  "content": "string",
  "anonymous": false,
  "user_id": "uuid|null",
  "status": "pending|praying|answered",
  "created_at": "YYYY-MM-DDTHH:MM:SS"
}
```
### DonationCreate
```json
{
  "amount": 0.0,
  "category": "string"
}
```
### DonationRead
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "amount": 0.0,
  "category": "string",
  "created_at": "YYYY-MM-DDTHH:MM:SS"
}
```

---

Se precisar de exemplos de requests completos, fluxos de autenticação, ou mais detalhes, só avisar!
