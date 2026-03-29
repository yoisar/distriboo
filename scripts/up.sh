#!/bin/bash
echo ">> Levantando Distriboo..."
docker compose up -d
echo ">> Servicios activos:"
docker compose ps
