 [![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/Wnkn88Yl)
# JWT + Refresh Token Auth (Spring Boot)

Bu proje ogrenci odevi icin **JWT + Refresh Token authentication** altyapisindan yola cikilarak gelistirilen,
**Spring Boot + PostgreSQL** tabanli bir **e-ticaret backend API** projesidir.

## Proje Kapsami

- JWT tabanli authentication
- Access token + refresh token akisi
- Refresh token veritabaninda saklama
- Refresh token sure kontrolu ve logout ile invalidation
- Spring Security ile stateless koruma
- Role-based authorization (USER / ADMIN)
- Product CRUD + pagination
- Cart (create/update/delete/list)
- Order (cart'tan siparis olusturma + status yonetimi)
- Mock Iyzico payment service yapisi
- Swagger/OpenAPI (`/swagger-ui.html`)
- Global exception handler + SLF4J logging
- Unit & integration test ornekleri

## Kullanim

```bash
# Maven kuruluysa:
mvn spring-boot:run

# Not: Bu repoda Maven Wrapper (mvnw) yok. Windows'ta Maven'i PATH'e ekledikten sonra komutlar calisir.
```

## Endpointler

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /demo/secure` (Authorization: Bearer <accessToken>)

### E-Ticaret Endpointleri (ilk iskelet)

- `GET /products` (public)
- `GET /products/{id}` (public)
- `POST /products` (ADMIN)
- `PUT /products/{id}` (ADMIN)
- `DELETE /products/{id}` (ADMIN)

- `GET /cart` (USER/ADMIN)
- `POST /cart/items` (USER/ADMIN)
- `DELETE /cart/items/{productId}` (USER/ADMIN)
- `DELETE /cart` (USER/ADMIN)

- `POST /orders` (USER/ADMIN) cart'tan siparis olusturur
- `GET /orders` (USER/ADMIN)
- `GET /orders/{id}` (USER/ADMIN - sadece kendi siparisi)
- `PATCH /orders/{id}/status` (ADMIN)

- `POST /payments/mock/iyzico/pay/{orderId}?succeed=true|false` (USER/ADMIN)
