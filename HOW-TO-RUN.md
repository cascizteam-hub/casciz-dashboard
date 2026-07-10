# How to Run Casciz Commerce OS

## One Command Start

```bash
bash start.sh
```

Then open: http://localhost

## Manual Steps

```bash
# 1. Start databases
docker compose up -d postgres redis

# 2. Wait 15 seconds
sleep 15

# 3. Build and start everything
docker compose up --build
```

## First Time Setup

1. Go to http://localhost/register
2. Create your account
3. Check email verification:

```bash
docker exec -it casciz-postgres psql -U casciz_user -d casciz_commerce \
  -c "UPDATE users SET email_verified = true WHERE email = 'your@email.com';"
```

4. Login at http://localhost/login

## URLs

- App: http://localhost
- API: http://localhost:8080
- API Docs: http://localhost:8080/swagger-ui.html

## Stop

```bash
docker compose down
```

## Reset Everything

```bash
docker compose down -v
docker compose up --build
```
