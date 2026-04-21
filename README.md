 [![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/Wnkn88Yl)
# JWT + Refresh Token Auth (Spring Boot)

Bu proje ogrenci odevi icin sade ama dogru mimaride bir JWT + Refresh Token authentication ornegidir.

## Proje Kapsami

- JWT tabanli authentication
- Access token + refresh token akisi
- Refresh token veritabaninda saklama
- Refresh token sure kontrolu ve logout ile invalidation
- Spring Security ile stateless koruma

## Kullanim

```bash
mvn spring-boot:run
```

## Endpointler

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /demo/secure` (Authorization: Bearer <accessToken>)
