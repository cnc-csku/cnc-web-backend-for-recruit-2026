prod:
	docker compose --env-file .env.prod -f ./prod.docker-compose.yaml up -d --build

dev: 
	docker compose -f ./dev.docker-compose.yaml up -d --build
	bun dev

cleardev:
	docker compose -f ./dev.docker-compose.yaml down -v

clearprod:
	docker compose -f ./prod.docker-compose.yaml down -v
	

