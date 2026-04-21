# Postman Test Senaryolari

## 1) Register
- Method: POST
- URL: http://localhost:8080/auth/register
- Body (JSON):
```json
{
  "name": "Ali Veli",
  "email": "ali@example.com",
  "password": "123456"
}
```
- Beklenen: 200 OK, `accessToken` + `refreshToken` doner.

## 2) Login
- Method: POST
- URL: http://localhost:8080/auth/login
- Body (JSON):
```json
{
  "email": "ali@example.com",
  "password": "123456"
}
```
- Beklenen: 200 OK, yeni `accessToken` + `refreshToken` doner.

## 3) Secure endpoint testi
- Method: GET
- URL: http://localhost:8080/demo/secure
- Header: Authorization: Bearer <accessToken>
- Beklenen: 200 OK, kullaniciya ozel mesaj.

## 4) Refresh
- Method: POST
- URL: http://localhost:8080/auth/refresh
- Body (JSON):
```json
{
  "refreshToken": "<login/register response refreshToken>"
}
```
- Beklenen: 200 OK, yeni `accessToken` doner.

## 5) Logout
- Method: POST
- URL: http://localhost:8080/auth/logout
- Body (JSON):
```json
{
  "refreshToken": "<aktif refreshToken>"
}
```
- Beklenen: 200 OK, token invalid edilir.

## 6) Logout sonrasi refresh denemesi
- Method: POST
- URL: http://localhost:8080/auth/refresh
- Body: ayni refresh token
- Beklenen: 401 Unauthorized (`Refresh token not found`).

## 7) Expired refresh token testi
- `app.jwt.refresh-token-expiration-ms` degerini kisa yap (ornegin 5000).
- Login olup 5+ saniye bekle.
- `/auth/refresh` cagir.
- Beklenen: 401 Unauthorized (`Refresh token expired, login again`).
