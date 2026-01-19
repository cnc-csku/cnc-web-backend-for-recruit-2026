# CNC Recruite Backend API

## Running the Project

### Development Mode

Starts Mongo in replicas mode in the background in the background and runs the app locally with Bun.

```bash
make dev
```

### Production Mode

Runs everything using Docker in detached mode. Ready for production

```bash
make prod
```

### Cleaning Up

To clean up or restart mongo 

⚠️ all mongo data will be deleted !!

```bash
make clearprod
or
make cleardev
```
