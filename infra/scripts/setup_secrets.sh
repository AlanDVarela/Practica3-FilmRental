#!/bin/bash

aws secretsmanager create-secret \
    --name filmrentals/rds/host \
    --secret-string "filmrentals-db.cz4kjgc9cf1r.us-east-1.rds.amazonaws.com"

aws secretsmanager create-secret \
    --name filmrentals/rds/credentials \
    --secret-string '{"username":"postgres","password":"Pass123!"}'

echo "Secretos creados en Secrets Manager."